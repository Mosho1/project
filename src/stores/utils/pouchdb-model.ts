import { isStateTreeNode, types, onSnapshot, IStateTreeNode } from "mobx-state-tree"
import { optionalIdentifierType } from "../utils/utils"
import { IModelProperties } from 'mobx-state-tree/dist/types/complex-types/model';
import { throttle, groupBy, mapKeys, mapValues } from 'lodash';

import PouchDBType from 'pouchdb';
let PouchDB: typeof PouchDBType = require('pouchdb');
PouchDB = (PouchDB as any).default || PouchDB;

PouchDB.plugin(require('./upsert.js'));

export class MSTPouch<T extends { mstPouchType: string } = { mstPouchType: string }> {
    db: PouchDB.Database<T> | null;
    updates: { [index: string]: IStateTreeNode } = {};
    finishedLoading = false;
    static enabled = !global.__TEST__;
    dbName?: string;
    static allDbs = (): Promise<string[]> => fetch('all-dbs').then(res => res.json());
    get dbUrl() {
        return `${window.location.origin}/db/${this.dbName}`;
    }
    constructor({ name = 'store', saveDelay = 1000 } = {}) {
        if (!MSTPouch.enabled) {
            this.db = null;
            return;
        }

        this.dbName = name;
        this.db = new PouchDB<T>(name);
        this.queueUpdate = throttle(this.queueUpdate, saveDelay, { leading: false });
        (window as any)['db'] = this.db;
    }

    treeNodeToJSON = (value: any) => {
        if (isStateTreeNode(value)) {
            return (value as any).toJSON();
        }
        return value;
    };

    queueUpdate = () => {
        if (this.db === null) return;
        const updatesCopy: any = mapValues(this.updates, this.treeNodeToJSON);
        this.updates = {};
        console.log('saving...', updatesCopy);
        for (let k in updatesCopy) {
            this.db.upsert(k, doc => Object.assign(doc, updatesCopy[k]));
        }
    };

    update = (id: string, data: any) => {
        if (this.finishedLoading) {
            this.updates[id] = data;
            this.queueUpdate();
        }
    };

    model<T = {}>(name: string, properties?: IModelProperties<T>) {
        type S = T & { _id: string, mstPouchType: string };

        const newProperties = Object.assign({
            _id: optionalIdentifierType,
            mstPouchType: name,
        }, properties as T) as S;
        const model = types.model<S>(name, newProperties);

        if (this.db === null) return model;

        return model.actions(self => {
            let dispose: () => void = () => null;
            const afterCreate = () => {
                this.update(self._id, self);
                dispose = onSnapshot(self, _ => {
                    this.update(self._id, self);
                });
            };
            const removeFromDb = () => {
                this.update(self._id, { _deleted: true });
                dispose();
            };

            return {
                afterCreate,
                beforeDestroy: removeFromDb,
                beforeDetach: removeFromDb
            };
        });
    }

    store<T = {}>(name: string, properties?: IModelProperties<T>) {

        const model = types.model(name, properties);

        if (this.db === null || this.finishedLoading) return model;

        let typeMap: { [index: string]: string } = {};
        for (const k of Object.keys(model.properties)) {
            let propType: any = model.properties[k];
            if (propType.defaultValue) propType = propType.type;
            if (propType.subType) {
                typeMap[propType.subType.name] = k;
            }
        }

        return model
            .actions(self => {
                const setData = (data: any) => {
                    for (const k in data) {
                        (self as any)[k] = data[k];
                    }
                };

                return {
                    setData,
                };
            })
            .actions(self => {

                const getData = () => this.db!.allDocs({ include_docs: true }).then(docs => {
                    const byType = groupBy(docs.rows.map(r => r.doc), doc => doc!.mstPouchType);
                    const data: { [index: string]: any } = {};
                    for (let k in byType) {
                        data[typeMap[k]] = mapKeys(byType[k], v => v!._id);
                    }
                    self.setData(data);
                    this.finishedLoading = true;
                });

                const afterCreate = () => {
                    this.db!.replicate.from(this.dbUrl)
                        .on('complete', _info => {
                            this.db!.sync(this.dbUrl, { live: true }).on('error', console.error);
                            getData();
                        }).on('error', getData);
                };

                return {
                    afterCreate
                };
            });
    }
}

export const pouch = new MSTPouch({
    name: location.pathname.slice(1) || 'store'
});
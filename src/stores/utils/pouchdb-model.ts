import { isStateTreeNode, types, onSnapshot, IStateTreeNode } from "mobx-state-tree"
import { optionalIdentifierType } from "../utils/utils"
import PouchDBType from 'pouchdb';
import { IModelProperties } from 'mobx-state-tree/dist/types/complex-types/model';
import { throttle, groupBy, mapKeys, mapValues } from 'lodash';

let PouchDB: typeof PouchDBType = require('pouchdb');
PouchDB = (PouchDB as any).default || PouchDB;

PouchDB.plugin(require('./upsert.js'));

export class MSTPouch<T extends { type: string } = { type: string }> {
    db: PouchDB.Database<T> | null;
    updates: { [index: string]: IStateTreeNode } = {};
    finishedLoading = false;
    static enabled = true;
    constructor({ name = 'store', saveDelay = 1000 } = {}) {
        if (!MSTPouch.enabled) {
            this.db = null;
        }

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
        type S = T & { _id: string, type: string };

        const newProperties = Object.assign({
            _id: optionalIdentifierType,
            type: name,
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
            const beforeDestroy = () => {
                this.update(self._id, { _deleted: true });
                dispose();
            };

            return {
                afterCreate,
                beforeDestroy
            };
        });
    }

    store<T = {}>(name: string, properties?: IModelProperties<T>) {

        const model = types.model(name, properties);

        if (this.db === null) return model;

        let typeMap: { [index: string]: string } = {};
        for (const k of Object.keys(model.properties)) {
            const propType: any = model.properties[k];
            if (propType.subType) {
                typeMap[propType.subType.name] = k;
            }
        }

        return model
            .actions(self => {
                const setData = (data: any) => {
                    Object.assign(self, data);
                };

                return {
                    setData,
                };
            })
            .actions(self => {
                const afterCreate = () => {
                    this.db!.allDocs({ include_docs: true }).then(docs => {
                        const byType = groupBy(docs.rows.map(r => r.doc), doc => doc!.type);
                        const data: { [index: string]: any } = {};
                        for (let k in byType) {
                            data[typeMap[k]] = mapKeys(byType[k], v => v!._id);
                        }
                        self.setData(data);
                        this.finishedLoading = true;
                    });
                };

                return {
                    afterCreate
                };
            });
    }
}

export const pouch = new MSTPouch();
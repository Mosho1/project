import * as React from 'react';
import { IStore } from '../stores/domain-state';

export class Component<T = any, S = any> extends React.Component<T, S> {
    store: IStore;
    static contextTypes = {
        store: () => null
    };
    constructor(props: T, context: {store: IStore}) {
        super(props, context);
        this.store = context.store;
    }
}

export default Component;
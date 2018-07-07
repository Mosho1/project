import * as React from 'react';
import { store } from '../stores/domain-state';

export class Component<T = any> extends React.Component<T, any> {
    store: typeof store;
    static contextTypes = {
        store: () => null
    };
    constructor(props: T, context: {store: typeof store}) {
        super(props, context);
        this.store = context.store;
    }
}

export default Component;
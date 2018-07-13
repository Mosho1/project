import * as ReactDOM from "react-dom"
import * as React from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"

import { IStore, getStore } from "./stores/domain-state"
import App from "./components/app"
// import syncStoreWithBackend from "./stores/utils/socket"

// const socket = new WebSocket("ws://localhost:4001")

// To support HMR of store, this ref holds the latest loaded store.
const storeInstance = observable.box<IStore | null>(null);

prepareStore();

const render = () => ReactDOM.render(
    React.createElement(observer(() =>
        React.createElement(App, { getStore: storeInstance.get.bind(storeInstance) })
    )),
    document.getElementById("root")
);

render();

function prepareStore(getStoreFn = getStore) {
    const newStore = getStoreFn();
    storeInstance.set(newStore);
    (window as any)['store'] = newStore;
}

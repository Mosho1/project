import * as ReactDOM from "react-dom"
import * as React from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"

import { IStore, getStore } from "./stores/domain-state"
import App from "./components/app"
import syncStoreWithBackend from "./stores/utils/socket"
import { getSnapshot, applySnapshot } from 'mobx-state-tree';

const socket = new WebSocket("ws://localhost:4001")

// To support HMR of store, this ref holds the latest loaded store.
const storeInstance = observable.box<IStore | null>(null);

// prepareStore(store);

const render = () => ReactDOM.render(
    React.createElement(observer(() =>
        React.createElement(App, { getStore: storeInstance.get.bind(storeInstance) })
    )),
    document.getElementById("root"));

render();

function prepareStore(getStoreFn = getStore) {
    const newStore = getStoreFn();
    const oldStore = storeInstance.get();
    if (oldStore) {
        applySnapshot(newStore, getSnapshot(oldStore));
    }
    storeInstance.set(newStore);
    syncStoreWithBackend(socket, newStore);
}

/**
    Replace the storeInstance if a new domain-state is available
*/
if (module.hot) {
    // accept update of dependency
    module.hot.accept("./stores/domain-state", function () {
        // obtain new store
        prepareStore(require('./stores/domain-state').getStore);
        render();
    });
    module.hot.accept("./stores/utils/socket", function () {
        // new socket sync implementation
        require("./stores/utils/socket").default(socket, storeInstance.get())
    });
    module.hot.accept('./components/app', function () {
        render();
    });
}

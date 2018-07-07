import ReactDOM from "react-dom"
import React from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"

import { store } from "./stores/domain-state"
import App from "./components/app"
import syncStoreWithBackend from "./stores/socket"

const socket = new WebSocket("ws://localhost:4001")

// To support HMR of store, this ref holds the latest loaded store.
const storeInstance = observable.box<typeof store | null>(null);

prepareStore(store);

const render = () => ReactDOM.render(
    React.createElement(observer(() =>
        React.createElement(App, { getStore: storeInstance.get.bind(storeInstance) })
    )),
    document.getElementById("root"));

render();

function prepareStore(newStore: typeof store) {
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
        prepareStore(require('./stores/domain-state').store);
        render();
    });
    module.hot.accept("./stores/socket", function () {
        // new socket sync implementation
        require("./stores/socket").default(socket, storeInstance.get())
    });
    module.hot.accept('./components/app', function () {
        render();
        // Root.forceUpdate();
    });
}

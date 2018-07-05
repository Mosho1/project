import ReactDOM from "react-dom"
import React from "react"
import { observable } from "mobx"
import { observer } from "mobx-react"

import {store} from "./stores/domain-state"
import Canvas from "./components/canvas"
import syncStoreWithBackend from "./stores/socket"

const socket = new WebSocket("ws://localhost:4001")

// To support HMR of store, this ref holds the latest loaded store.
const storeInstance = observable.box(null);

prepareStore(store);

const App = observer(() => React.createElement(Canvas, { store: storeInstance.get() }));

const Root: any = ReactDOM.render(React.createElement(App), document.getElementById("root"));

function prepareStore(newStore) {
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
    });
    module.hot.accept("./stores/socket", function () {
        // new socket sync implementation
        require("./stores/socket").default(socket, storeInstance.get())
    });
    module.hot.accept('./components/canvas', function() {
        Root.forceUpdate();
    });
}

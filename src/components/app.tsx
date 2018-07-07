import React, { Component } from "react";
import { observer } from "mobx-react";
import DevTools from "mobx-react-devtools";

import Canvas from './canvas';

class App extends Component<{ getStore: Function }> {
    static childContextTypes = {
        store: () => null
    };

    getChildContext() {
        return { store: this.props.getStore() };
    }

    render() {
        return (<div>
            <DevTools />
            <Canvas />
        </div>
        );
    }
}

export default observer(App);

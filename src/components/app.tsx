import * as React from "react";
import { observer } from "mobx-react";
import DevTools from "mobx-react-devtools";

import Sidebar from "./sidebar";
import TopBar from "./topbar";
import Canvas from './canvas';
import { ContextMenu } from './context-menu';

class App extends React.Component<{ getStore: Function }> {
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
            <TopBar />
            <Sidebar />
            <ContextMenu />
        </div>
        );
    }
}

export default observer(App);

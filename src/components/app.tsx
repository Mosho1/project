import * as React from "react";
import { observer } from "mobx-react";
import Canvas from './canvas';

class App extends React.Component<{ getStore: Function }> {
    static childContextTypes = {
        store: () => null
    };

    getChildContext() {
        return { store: this.props.getStore() };
    }

    render() {
        return (<div>
            <Canvas />
        </div>
        );
    }
}

export default observer(App);

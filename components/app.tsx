import * as React from "react";
import { observer } from "mobx-react";
import Canvas from './canvas';

class App extends React.Component<{ getStore: Function }> {
    render() {
        return (<div>
            <Canvas store={this.props.getStore()} />
        </div>
        );
    }
}

export default observer(App);

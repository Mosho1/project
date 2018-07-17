import * as React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';
import Component from './component';
import { ISocket } from '../stores/models/socket';
import Drawer from '@material-ui/core/Drawer';
import { Checkbox, Input, FormControl, InputLabel, ListItem, FormControlLabel, List, FormHelperText } from '@material-ui/core';
import { IPrimitiveTypes } from '../stores/models/code-block';
import { IBoxValue } from '../stores/models/box';
styles.sidebar;
class Sidebar extends Component {
    sidebar: HTMLDivElement | null = null;
    componentDidMount() {
        if (this.sidebar) this.sidebar.addEventListener('contextmenu', (e: any) => {
            e.stopPropagation();
        });
    }
    onSocketNameChange = (socket: ISocket) => (e: React.ChangeEvent<HTMLInputElement>) => {
        socket.setName(e.target.value);
    };

    getSocketInput = (s: ISocket) => {
        return <input onChange={this.onSocketNameChange(s)} defaultValue={s.name} key={s._id} />;
    };

    onInputChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { selection } = this.store;
        selection[0]!.setValue(name, e.target.value);
    };

    onCheckboxChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { selection } = this.store;
        selection[0]!.setValue(name, e.target.checked);
    };

    onToggleBreakpoint = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.store.selection[0].toggleBreakpoint(e.target.checked);
    }

    renderInput = (v: IBoxValue) => {
        return <FormControl fullWidth>
            <InputLabel htmlFor="adornment-amount">{v.name}</InputLabel>
            <Input
                id="adornment-amount"
                value={v.value}
                onChange={this.onInputChange(v.name)}
            />
            <FormHelperText>{v.validationMessage}</FormHelperText>
        </FormControl>;
    }

    renderCheckbox = (v: IBoxValue) => {
        return <FormControlLabel
            control={
                <Checkbox
                    checked={v.value}
                    onChange={this.onCheckboxChange(v.name)}
                    value={v.value}
                    color="primary"
                />
            }
            label={v.name}
        />;
        return <FormControl fullWidth>
            <InputLabel htmlFor="adornment-amount">{v.name}</InputLabel>
            <Input
                id="adornment-amount"
                value={v.value}
                onChange={this.onInputChange(v.name)}
            />
            <FormHelperText>{v.validationMessage}</FormHelperText>
        </FormControl>;
    }

    renderValue: { [T in IPrimitiveTypes]: (value: IBoxValue) => JSX.Element | null } = {
        number: this.renderInput,
        string: this.renderInput,
        boolean: this.renderCheckbox,
        any: () => null,
        void: () => null
    };

    render() {
        const { selection } = this.store;
        return <div
            ref={ref => this.sidebar = ref}>
            <Drawer
                variant="persistent"
                open={selection.length === 1}
                anchor="right"
            >
                <List className={styles.sidebar}>
                    {selection.length === 1 && <ListItem>
                        <FormControlLabel
                            label="Breakpoint"
                            control={<Checkbox
                                checked={selection[0].breakpoint}
                                onChange={this.onToggleBreakpoint}
                            />}>
                        </FormControlLabel>
                    </ListItem>}
                    {selection.length === 1 && selection[0].values.map((v, i) =>
                        <ListItem key={i}>
                            {this.renderValue[v.type](v)}
                        </ListItem>)}
                </List>
            </Drawer>
        </div>;
    }
}

export default observer(Sidebar)

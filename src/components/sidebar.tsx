import * as React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';
import Component from './component';
import { ISocket } from '../stores/models/socket';
import Drawer from '@material-ui/core/Drawer';
import { Checkbox, Input, FormControl, InputLabel, ListItem, FormControlLabel, List, FormHelperText, FormGroup, Switch } from '@material-ui/core';
import { IBoxValue } from '../stores/models/box';
import { IPrimitiveTypes } from '../stores/models/types';
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

    onInputChange = (v: IBoxValue) => (e: React.ChangeEvent<HTMLInputElement>) => {
        v.setValue(e.target.value);
    };

    onCheckboxChange = (v: IBoxValue) => (e: React.ChangeEvent<HTMLInputElement>) => {
        v.setValue(e.target.checked);
    };

    onInputNameChange = (socket: ISocket) => (e: React.ChangeEvent<HTMLInputElement>) => {
        socket.setName(e.target.value);
    };

    onToggleBreakpoint = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.store.selection[0].toggleBreakpoint(e.target.checked);
    }

    renderName = (v: ISocket) => {
        return <FormControl fullWidth>
            <Input
                id={`value-${v.name}`}
                value={v.name}
                onChange={this.onInputNameChange(v)}
            />
        </FormControl>;
    };

    renderInput = (v: IBoxValue) => {
        return <FormControl fullWidth>
            <InputLabel htmlFor={`value-${v.name}`}>{v.name}</InputLabel>
            <Input
                id={`value-${v.name}`}
                value={v.value}
                onChange={this.onInputChange(v)}
            />
            <FormHelperText>{v.validationMessage}</FormHelperText>
        </FormControl>;
    }

    renderCheckbox = (v: IBoxValue) => {
        return <FormControlLabel
            control={
                <Checkbox
                    checked={v.value}
                    onChange={this.onCheckboxChange(v)}
                    value={v.value}
                    color="primary"
                />
            }
            label={v.name}
        />;
    }

    renderValue: { [T in IPrimitiveTypes]: (value: IBoxValue) => JSX.Element | null } = {
        number: this.renderInput,
        string: this.renderInput,
        boolean: this.renderCheckbox,
        any: () => null,
        void: () => null
    };

    renderValues() {
        const { selection } = this.store;
        if (selection.length !== 1) return null;
        return selection[0].values.map((v, i) =>
            <ListItem key={i}>
                {this.renderValue[v.type](v)}
            </ListItem>);
    }

    renderNames() {
        const { selection } = this.store;
        if (selection.length !== 1) return null;
        return selection[0].inputs.map((v, i) =>
            <ListItem key={i}>
                {this.renderName(v)}
            </ListItem>);
    }

    onChangeContext = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.store.ui.sidebar.setContext(e.target.checked ? 'values' : 'names')
    };

    render() {
        const { selection, ui } = this.store;
        return <div
            ref={ref => this.sidebar = ref}>
            <Drawer
                variant="persistent"
                open={selection.length === 1}
                anchor="right"
            >
                <List className={styles.sidebar}>
                    {selection.length === 1 && <ListItem>
                        <FormGroup>
                            <FormControlLabel
                                label="Breakpoint"
                                control={<Checkbox
                                    checked={selection[0].breakpoint}
                                    onChange={this.onToggleBreakpoint}
                                />}>
                            </FormControlLabel>
                            <FormControlLabel
                                label={ui.sidebar.context === 'values'
                                    ? 'Values'
                                    : 'Names'}
                                control={<Switch
                                    checked={ui.sidebar.context === 'values'}
                                    onChange={this.onChangeContext}
                                />}>
                            </FormControlLabel>
                        </FormGroup>
                    </ListItem>}
                    {ui.sidebar.context === 'values'
                        ? this.renderValues()
                        : this.renderNames()}
                </List>
            </Drawer>
        </div>;
    }
}

export default observer(Sidebar)

import * as React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';
import Component from './component';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
// import IconButton from '@material-ui/core/IconButton';
import Fab from '@material-ui/core/Fab';
import ListIcon from '@material-ui/icons/List';

class ProgramList extends Component {
    sidebar: HTMLDivElement | null = null;
    componentDidMount() {
        if (this.sidebar) this.sidebar.addEventListener('contextmenu', (e: any) => {
            e.stopPropagation();
        });
    }

    render() {
        const { ui, programList } = this.store;
        return <div
            ref={ref => this.sidebar = ref}>
            <Fab>
                <ListIcon/>
            </Fab>
            <Drawer
                variant="persistent"
                open={ui.programList.isOpen}
                anchor="right"
            >
                <List className={styles.sidebar}>
                    {programList.map(p => <ListItem href={`/${p}`}>{p}</ListItem>)}
                </List>
            </Drawer>
        </div>;
    }
}

export default observer(ProgramList);

import * as React from 'react';
import Component from './component';
import { observer } from 'mobx-react';
import * as styles from './styles/context-menu.css';
import { ICodeBlock } from '../stores/models/code-block';

@observer
export class ContextMenu extends Component {
    root: HTMLDivElement | null = null;

    componentDidMount() {
        document.addEventListener('contextmenu', this._handleContextMenu);
        document.addEventListener('click', this._handleClick);
        document.addEventListener('scroll', this._handleScroll);
    };

    componentWillUnmount() {
        document.removeEventListener('contextmenu', this._handleContextMenu);
        document.removeEventListener('click', this._handleClick);
        document.removeEventListener('scroll', this._handleScroll);
    }

    _handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        if (!this.root) this.store.contextMenu!.toggle(true);
        this.store.contextMenu!.handleContextMenu(this.root!, event);
    };

    _handleClick = (event: MouseEvent) => {
        if (!event.target) return;
        const wasOutside = !((event.target as any).contains === this.root!);

        if (wasOutside) this.store.contextMenu!.toggle(false);
    };

    _handleScroll = () => {
        this.store.contextMenu!.toggle(false);
    };

    handleClick = (b: ICodeBlock) => (e: React.MouseEvent) => {
        this.store.addBox(b.name, e.clientX, e.clientY, b);
    };

    render() {
        const { isOpen, position } = this.store.contextMenu!;
        return (isOpen || null) &&
            <div style={{ left: position.left, top: position.top }} ref={ref => { this.root = ref }} className={styles.contextMenu}>
                {(this.store.sortedCodeBlocks.map(b =>
                    <div
                        key={b.name}
                        className={styles.option}
                        onClick={this.handleClick(b)}
                    >
                        {b.name}
                    </div>))}
            </div>
    };
}

export default ContextMenu;
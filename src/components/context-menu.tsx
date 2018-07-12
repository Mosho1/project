import * as React from 'react';
import Component from './component';
import { observer } from 'mobx-react';
import * as styles from './styles/context-menu.css';
import { ICodeBlock } from '../stores/models/code-block';

@observer
export class ContextMenu extends Component {
    input: HTMLInputElement | null = null;

    componentDidMount() {
        document.addEventListener('contextmenu', this._handleContextMenu);
        document.addEventListener('mousedown', this._handleClick);
        document.addEventListener('scroll', this._handleScroll);
    };

    componentWillUnmount() {
        document.removeEventListener('contextmenu', this._handleContextMenu);
        document.removeEventListener('mousedown', this._handleClick);
        document.removeEventListener('scroll', this._handleScroll);
    }

    _handleContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        const { ref } = this.store.contextMenu!;
        if (!ref) {
            this.store.contextMenu!.toggle(true, event.clientX, event.clientY);
            if (this.input) {
                this.input.focus();
            }
        }
    };

    _handleClick = (event: MouseEvent) => {
        const { contextMenu } = this.store;
        if (!event.target || !contextMenu || !contextMenu.ref) return;
        const wasOutside = !(contextMenu.ref.contains(event.target as Node));

        if (wasOutside) this.store.contextMenu!.toggle(false);
    };

    _handleScroll = () => {
        this.store.contextMenu!.toggle(false);
    };

    handleClick = (b: ICodeBlock) => (_e: React.MouseEvent) => {
        const {contextMenu} = this.store;
        if (!contextMenu) return;
        this.store.addBoxAndArrowIfDragged(b.name, contextMenu.position.left, contextMenu.position.top, b);
        contextMenu.toggle(false);
    };

    onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.store.contextMenu!.setFilter(e.target.value);
    }


    onFilterClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    render() {
        const { isOpen, position, filteredCodeBlocks, setRef } = this.store.contextMenu!;
        return (isOpen || null) &&
            <div style={{ left: position.left, top: position.top }} ref={setRef} className={styles.contextMenu}>
                <input ref={ref => { this.input = ref }} onClick={this.onFilterClick} onChange={this.onFilterChange} />
                {(filteredCodeBlocks.map(b =>
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
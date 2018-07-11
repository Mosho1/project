import * as React from 'react';
import Component from './component';
import { observer } from 'mobx-react';
import * as styles from './styles/context-menu.css';
import { ICodeBlock } from '../stores/models/code-block';

@observer
export class ContextMenu extends Component {
    root: HTMLDivElement | null = null;
    input: HTMLInputElement | null = null;

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
        if (!this.root) {
            this.store.contextMenu!.toggle(true);
            if (this.input) {
                this.input.focus();
            }
        }
        this.store.contextMenu!.handleContextMenu(this.root!, event);
    };

    _handleClick = (event: MouseEvent) => {
        if (!event.target || !this.root) return;
        const wasOutside = !(this.root.contains(event.target as Node));

        if (wasOutside) this.store.contextMenu!.toggle(false);
    };

    _handleScroll = () => {
        this.store.contextMenu!.toggle(false);
    };

    handleClick = (b: ICodeBlock) => (e: React.MouseEvent) => {
        this.store.addBox(b.name, e.clientX, e.clientY, b);
        this.store.contextMenu!.toggle(false);
    };

    onFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.store.contextMenu!.setFilter(e.target.value);
    }


    onFilterClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    render() {
        const { isOpen, position, filteredCodeBlocks } = this.store.contextMenu!;
        return (isOpen || null) &&
            <div style={{ left: position.left, top: position.top }} ref={ref => { this.root = ref }} className={styles.contextMenu}>
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
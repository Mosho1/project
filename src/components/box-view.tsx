import React, { Component } from "react"
import { observer } from "mobx-react"
import { DraggableCore } from "react-draggable"
import * as styles from './styles/index.css';

class BoxView extends Component<{box: any, store: any}> {
    render() {
        const { box } = this.props
        return (
            <DraggableCore onDrag={this.handleDrag}>
                <div
                    style={{
                        width: box.width,
                        left: box.x,
                        top: box.y
                    }}
                    onClick={this.handleClick}
                    className={`${styles.box} ${styles.boxSelected}`}
                >
                    {box.name}
                </div>
            </DraggableCore>
        )
    }

    handleClick = e => {
        this.props.store.setSelection(this.props.box.id)
        e.stopPropagation()
    }

    handleDrag = (e, dragInfo) => {
        this.props.box.move(dragInfo.deltaX, dragInfo.deltaY)
    }
}

export default observer(BoxView)

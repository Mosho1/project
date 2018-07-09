import * as React from "react"
import { observer } from "mobx-react"

import * as history from "../stores/time"
import * as styles from "./styles/index.css";

export default observer(() => (
    <div className={styles.funstuff}>
        <button onClick={previous} title="previous state">
            &lt;
        </button>
        <button onClick={next} title="next state">
            &gt;
        </button>
    </div>
))

function previous() {
    history.previousState()
}

function next() {
    history.nextState()
}

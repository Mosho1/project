// eslint-disable-next-line
import {
    onSnapshot,
    applySnapshot,
} from "mobx-state-tree"

let subscription: any;
export default function syncStoreWithBackend(socket: any, store: any) {
    // === SYNC PATCHES (recommended)
    // subscription = onPatch(store, (data) => {
    //     socketSend(data)
    // })

    // onSocketMessage((data) => {
    //     applyPatch(store, data)
    // })

    // === SYNC ACTIONS
    // subscription = onAction(store, data => {
    //     socketSend(data)
    // })

    // onSocketMessage(data => {
    //     applyAction(store, data)
    // })

    // === SYNC SNAPSNOTS
    subscription = onSnapshot(store, (data) => {
        socketSend(data)
    })

    onSocketMessage((data: any) => {
        applySnapshot(store, data)
    })

    let isHandlingMessage = false
    function socketSend(data: any) {
        if (!isHandlingMessage) socket.send(JSON.stringify(data))
    }

    function onSocketMessage(handler: any) {
        socket.onmessage = (event: any) => {
            isHandlingMessage = true
            handler(JSON.parse(event.data))
            isHandlingMessage = false
        }
    }
}

/**
 * Clean up old subscription when switching communication system
 */
if (module.hot) {
    module.hot.dispose(() => {
        subscription();
    })
}

import { runInAction, values } from "mobx"
import { resolvePath, onPatch, types, getSnapshot, applySnapshot, getParent, hasParent } from "mobx-state-tree"

import { randomUuid } from "../utils"

export const Box = types
    .model("Box", {
        id: types.identifier(),
        name: "hal",
        x: 0,
        y: 0
    })
    .views(self => ({
        get width() {
            return self.name.length * 15
        },
        get isSelected() {
            if (!hasParent(self)) return false
            return getParent(self, 2).selection === self
        }
    }))
    .actions(self => ({
        move(dx, dy) {
            self.x += dx
            self.y += dy
        },
        setName(newName) {
            self.name = newName
        }
    }))

export const Arrow = types.model("Arrow", {
    id: types.identifier(),
    from: types.reference(Box),
    to: types.reference(Box)
})

export const Store = types
    .model("Store", {
        boxes: types.map(Box),
        arrows: types.array(Arrow),
        selection: types.maybe(types.reference(Box))
    })
    .actions(self => {
        const addBox = (name, x, y) => {
            const box = Box.create({ name, x, y, id: randomUuid() })
            self.boxes.put(box)
            return box
        };
        const addArrow = (from, to) => {
            self.arrows.push({ id: randomUuid(), from, to })
        };
        const setSelection = (selection) => {
            self.selection = selection
        };
        const createBox = (name, x, y, source) => {
            const box = addBox(name, x, y)
            setSelection(box)
            if (source) addArrow(source.id, box.id)
        };

        return {
            addBox,
            addArrow,
            setSelection,
            createBox
        };
    })

/*
    The store that holds our domain: boxes and arrows
*/

const defaults = {
    boxes: {
        "ce9131ee-f528-4952-a012-543780c5e66d": {
            id: "ce9131ee-f528-4952-a012-543780c5e66d",
            name: "Rotterda",
            x: 100,
            y: 100
        },
        "14194d76-aa31-45c5-a00c-104cc550430f": {
            id: "14194d76-aa31-45c5-a00c-104cc550430f",
            name: "Bratislava",
            x: 650,
            y: 300
        }
    },
    arrows: [
        {
            id: "7b5d33c1-5e12-4278-b1c5-e4ae05c036bd",
            from: "ce9131ee-f528-4952-a012-543780c5e66d",
            to: "14194d76-aa31-45c5-a00c-104cc550430f"
        }
    ],
    selection: null
};

const getStore = (data) => Store.create(data);
export const store = getStore(defaults);

/**
    Save / Restore the state of the store while self module is hot reloaded
*/
if (module.hot) {
    if (module.hot.data && module.hot.data.store) {
        applySnapshot(store, module.hot.data.store)
    }
    module.hot.dispose(data => {
        data.store = getSnapshot(store)
    })
}

import { Dispatcher } from "../../react-reconciler/src/ReactInternalTypes"

const ReactCurrentDispatcher: {current: Dispatcher} = {
    current: null
}

export default ReactCurrentDispatcher
type AllActions = 'setNodeAreaDims';
export interface Dimensions {
    height: number;
    width: number;
}

export interface NavigationState {
    nodeAreaDims: Dimensions;
}

export function navigation(state: NavigationState, action: { type: 'setNodeAreaDims', payload: Dimensions }): NavigationState
export function navigation(state: NavigationState, action: { type: AllActions, payload: Dimensions }): NavigationState {
    switch (action.type) {
        case 'setNodeAreaDims': {
            return {
                ...state,
                nodeAreaDims: action.payload,
            };
        }

        default:
            return state;
    }
}
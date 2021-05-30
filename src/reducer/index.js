
const initialState = {
    vehicles: {},
    fence: {}
}

export const reducer = (state = initialState, action) => {
    switch (action.type) {
        case "UPDATE_FENCE" :
            return {...state, fence: action.payload}
        case "REFRESH_VEHICLES":
            return {...state, vehicles: action.payload}
        default :
            return state
    }
}
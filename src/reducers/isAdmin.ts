import { EventTypes } from '../actions'

export const isAdmin = (state: boolean = false, action: any) => {
    if(action.type === EventTypes.SET_IS_ADMIN) {
        return action.isAdmin;
    } else {
        return state;
    }
}
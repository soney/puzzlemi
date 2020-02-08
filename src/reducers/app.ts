import { IAppStateChangedAction, IAppSelectedStudentForSolutionView } from "../actions/app_actions";
import EventTypes from "../actions/EventTypes";
import update from 'immutability-helper';

export interface IAppState {
    debugMode: boolean,
    websocketLocation: string,
    channel: string,
    postBase: string,
    selectedUserForSolutionsView: string | false
}

export const app = (state: IAppState = { debugMode: false, websocketLocation: '', channel: '', postBase: '', selectedUserForSolutionsView: false }, action: IAppStateChangedAction | IAppSelectedStudentForSolutionView) => {
    const { type } = action;
    if (type === EventTypes.APP_STATE_CHANGED) {
        const { appState } = action as IAppStateChangedAction;
        return appState;
    } else if (type === EventTypes.SELECT_USER_FOR_SOLUTION_VIEW) {
        const { uid } = action as IAppSelectedStudentForSolutionView;
        return update(state, {
            selectedUserForSolutionsView: { $set: uid }
        })
    } else {
        return state;
    }
}
import { IAppStateChangedAction } from "../actions/app_actions";
import EventTypes from "../actions/EventTypes";

export interface IAppState {
    debugMode: boolean,
    websocketLocation: string,
    channel: string,
    postBase: string
}

export const app = (state: IAppState={debugMode: false, websocketLocation: '', channel: '', postBase: ''}, action: IAppStateChangedAction) => {
    const { type } = action;
    if(type === EventTypes.APP_STATE_CHANGED) {
        const { appState } = action as IAppStateChangedAction;
        return appState;
    } else {
        return state;
    }
}
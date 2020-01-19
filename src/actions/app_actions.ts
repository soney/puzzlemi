import EventTypes from "./EventTypes";
import { IAppState } from "../reducers/app";

export interface IAppStateChangedAction {
    type: EventTypes.APP_STATE_CHANGED,
    appState: IAppState
}
export const setAppState = (appState: IAppState): IAppStateChangedAction => ({
    appState, type: EventTypes.APP_STATE_CHANGED
});
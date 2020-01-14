import EventTypes from "./EventTypes";
import { Dispatch } from "redux";
import { IUserInfo } from "../components/App";
import { updateUserMultipleChoiceCorrectness } from "./sharedb_actions";

export const setIsAdmin = (isAdmin: boolean) => ({
    isAdmin, type: EventTypes.SET_IS_ADMIN,
});

export const setUser = (user: IUserInfo) => ({
    user, type: EventTypes.SET_USER
});

export function setUserSelectedOptions(index: number, selectedItems: number[]) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problemInfo = problems[index];
        const problemId = problemInfo.id;

        dispatch({
            problemId,
            selectedItems,
            type: EventTypes.MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED
        });
        updateUserMultipleChoiceCorrectness(index, dispatch, getState);
    };
}

export function deleteUserFile(index: number, name: string) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problemInfo = problems[index];
        const problemId = problemInfo.id;

        dispatch({
            name, problemId, type: EventTypes.DELETE_USER_FILE
        });
    };
}
export function setCode(index: number, code: string) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problemInfo = problems[index];
        const { id } = problemInfo;

        dispatch({
            code, id, modified: true, type: EventTypes.CODE_CHANGED
        });
    };
}
export function resetCode(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problemInfo = problems[index];
        const { id, problem } = problemInfo;
        const { givenCode } = problem;
        dispatch({
            code: givenCode, id, modified: false, type: EventTypes.CODE_CHANGED,
        });
    };
}
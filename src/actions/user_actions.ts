import EventTypes from "./EventTypes";
import { Dispatch } from "redux";
import { updateUserMultipleChoiceCorrectness } from "./sharedb_actions";
import { IUserInfo } from "../reducers/users";
import { IProblem } from "../reducers/problems";

export interface ISetIsAdminAction {
    type: EventTypes.SET_IS_ADMIN,
    isAdmin: boolean
};
export const setIsAdmin = (isAdmin: boolean): ISetIsAdminAction => ({
    isAdmin, type: EventTypes.SET_IS_ADMIN,
});

export interface ISetUserAction {
    type: EventTypes.SET_USER,
    user: IUserInfo
}
export const setUser = (user: IUserInfo): ISetUserAction => ({
    user, type: EventTypes.SET_USER
});

export interface IMultipleChoiceSelectedOptionsChangedAction {
    type: EventTypes.MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED,
    selectedItems: string[],
    problemID: string
}
export function setUserSelectedOptions(problemID: string, selectedItems: string[]) {
    return (dispatch: Dispatch, getState) => {
        dispatch({
            problemID,
            selectedItems,
            type: EventTypes.MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED
        } as IMultipleChoiceSelectedOptionsChangedAction);
        console.log(selectedItems);
        updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
    };
}

export interface IDeleteUserFileAction {
    type: EventTypes.DELETE_USER_FILE,
    problemID: string,
    fileID: string
}
export const deleteUserFile = (problemID: string, fileID: string): IDeleteUserFileAction => ({
    fileID, problemID, type: EventTypes.DELETE_USER_FILE
});

export interface ICodeChangedAction {
    type: EventTypes.CODE_CHANGED,
    code: string,
    problemID: string
}
export const codeChanged = (problem: IProblem, code: string): ICodeChangedAction => ({
    code, problemID: problem.id, type: EventTypes.CODE_CHANGED
});

export interface ITextResponseChangedAction {
    type: EventTypes.TEXT_RESPONSE_CHANGED,
    response: string,
    problemID: string
}
export const setTextResponse = (problemID: string, response: string): ITextResponseChangedAction => ({
    response, problemID, type: EventTypes.TEXT_RESPONSE_CHANGED
});

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
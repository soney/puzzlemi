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

export interface ISetActiveTestAction {
    type: EventTypes.SET_ACTIVE_TEST,
    testID: string,
    problemID: string
}

export const setActiveTest = (testID: string, problemID: string): ISetActiveTestAction => ({
    testID, problemID, type: EventTypes.SET_ACTIVE_TEST
})

export interface IMultipleChoiceSelectedOptionsChangedAction {
    type: EventTypes.MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED,
    selectedItems: string[],
    problemID: string
}
export function setUserSelectedOptions(problemID: string, selectedItems: string[]) {
    return async (dispatch: Dispatch, getState) => {
        dispatch({
            problemID,
            selectedItems,
            type: EventTypes.MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED
        } as IMultipleChoiceSelectedOptionsChangedAction);
        const { shareDBDocs, users } = getState();
        const myuid = users.myuid as string;
        updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
        const aggregateDataDoc = shareDBDocs.aggregateData;
        const aggregateData = aggregateDataDoc.getData();
        const optionSelectedData = aggregateData.userData[problemID].selected;

        for (let optionID in optionSelectedData) {
            if (optionSelectedData.hasOwnProperty(optionID)) {
                const usersWhoSelectedOption = optionSelectedData[optionID];
                const mySelectedOptionIndex = usersWhoSelectedOption.indexOf(myuid);
                const inNewSelectedOptions = selectedItems.indexOf(optionID) >= 0;

                if (mySelectedOptionIndex >= 0 && !inNewSelectedOptions) {
                    await aggregateDataDoc.submitListDeleteOp(['userData', problemID, 'selected', optionID, mySelectedOptionIndex]);
                } else if (mySelectedOptionIndex < 0 && inNewSelectedOptions) {
                    await aggregateDataDoc.submitListPushOp(['userData', problemID, 'selected', optionID], myuid);
                }
            }
        }
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
export interface IUpdateActiveHelpSessionAction {
    type: EventTypes.UPDATE_ACTIVE_HELP_SESSION,
    problemID: string,
    helpID: string
}
export const updateCurrentActiveHelpSession = (problemID: string, helpID: string): IUpdateActiveHelpSessionAction => ({
    problemID, helpID, type: EventTypes.UPDATE_ACTIVE_HELP_SESSION
})

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
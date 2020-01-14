import EventTypes from "./EventTypes";
import { Dispatch } from "redux";
import { IUserInfo } from "../components/App";

export const setIsAdmin = (isAdmin: boolean) => ({
    isAdmin, type: EventTypes.SET_IS_ADMIN,
});

export const setUser = (user: IUserInfo) => ({
    user, type: EventTypes.SET_USER
});

export function deleteUserFile(index: number, name: string) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problem = problems[index];
        const problemId = problem.id;

        dispatch({
            name, problemId, type: EventTypes.DELETE_USER_FILE
        });
    };
}
export function setCode(index: number, code: string) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problem = problems[index];
        const { id } = problem;

        dispatch({
            code, id, modified: true, type: EventTypes.CODE_CHANGED
        });
    };
}
export function updateActiveFailedTestID(problemID, testID) {
    return(dispatch: Dispatch, getState) => {
        dispatch({
            type:EventTypes.UPDATE_ACTIVE_FAILED_TEST_ID,
            problemID,
            testID
        })
    }
}
export function resetCode(index: number) {
    return (dispatch: Dispatch, getState) => {
        const { problems } = getState();
        const problem = problems[index];
        const { id, givenCode } = problem;
        dispatch({
            code: givenCode, id, modified: false, type: EventTypes.CODE_CHANGED,
        });
    };
}
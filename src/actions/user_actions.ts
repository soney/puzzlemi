import EventTypes from "./EventTypes";
import { Dispatch } from "redux";

export const setIsAdmin = (isAdmin: boolean) => ({
    isAdmin, type: EventTypes.SET_IS_ADMIN,
});

// export const setName = (name: string) => ({
//     name, type:EventTypes.SET_NAME,
// });

export function changeTargetID(problemID: string, id: string){
    return (dispatch: Dispatch, getState)=>{
        dispatch({problemID, id, type: EventTypes.CHANGE_TARGET_ID})
    }
}

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
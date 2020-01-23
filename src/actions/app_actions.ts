import EventTypes from "./EventTypes";
import { IAppState } from "../reducers/app";

export interface IAppStateChangedAction {
    type: EventTypes.APP_STATE_CHANGED,
    appState: IAppState
}
export const setAppState = (appState: IAppState): IAppStateChangedAction => ({
    appState, type: EventTypes.APP_STATE_CHANGED
});

export interface IAppSelectedStudentForSolutionView {
    type: EventTypes.SELECT_USER_FOR_SOLUTION_VIEW,
    uid: string|false
};
export const selectUserForSolutionView = (uid: string|false): IAppSelectedStudentForSolutionView => ({
    type: EventTypes.SELECT_USER_FOR_SOLUTION_VIEW, uid
});

export function selectRandomUserForSolutionView(problemID: string) {
    return (dispatch, getState) => {
        const { shareDBDocs } = getState();
        const solutionsDoc = shareDBDocs.solutions;
        const solutionsData = solutionsDoc!.getData();
        const problemSolutions = solutionsData.allSolutions[problemID];

        if(problemSolutions) {
            const users = Object.keys(problemSolutions);
            const randomUser = randomItem(users) || false;

            dispatch(selectUserForSolutionView(randomUser));
        }
    };
}

export function selectRandomCorrectUserForSolutionView(problemID: string) {
    return (dispatch, getState) => {
        const { shareDBDocs } = getState();
        const solutionsDoc = shareDBDocs.solutions;
        const solutionsData = solutionsDoc!.getData();
        const problemSolutions = solutionsData.allSolutions[problemID];

        if(problemSolutions) {
            const aggregateDataDoc = shareDBDocs.aggregateData;
            const aggregateData = aggregateDataDoc!.getData();
            const problemAggregateData = aggregateData.userData[problemID];
            const { completed } = problemAggregateData;

            const users = Object.keys(problemSolutions);
            const correctUsers = users.filter((userID) => ( completed.includes(userID) ))

            const randomUser = randomItem(correctUsers) || false;

            dispatch(selectUserForSolutionView(randomUser));
        }
    };
}

export function selectRandomIncorrectUserForSolutionView(problemID: string) {
    return (dispatch, getState) => {
        const { shareDBDocs } = getState();
        const solutionsDoc = shareDBDocs.solutions;
        const solutionsData = solutionsDoc!.getData();
        const problemSolutions = solutionsData.allSolutions[problemID];

        if(problemSolutions) {
            const aggregateDataDoc = shareDBDocs.aggregateData;
            const aggregateData = aggregateDataDoc!.getData();
            const problemAggregateData = aggregateData.userData[problemID];
            const { completed } = problemAggregateData;

            const users = Object.keys(problemSolutions);
            const incorrectUsers = users.filter((userID) => ( !completed.includes(userID) ))

            const randomUser = randomItem(incorrectUsers) || false;

            dispatch(selectUserForSolutionView(randomUser));
        }
    };
}



function randomItem(items: ReadonlyArray<any>): any {
    return items[Math.floor(Math.random()*items.length)];
}
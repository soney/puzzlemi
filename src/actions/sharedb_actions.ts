import { SDBDoc } from 'sdb-ts';
import { Dispatch } from 'redux';
import uuid from '../utils/uuid';
import EventTypes from './EventTypes';
import sharedb, { ObjectInsertOp, ListDeleteOp, ListInsertOp } from 'sharedb';
import { IProblem, IMultipleChoiceOption, IProblems, ICodeTest, IMultipleChoiceSelectionType, ICodeVariableTest } from '../reducers/problems';
import { IAggregateData } from '../reducers/aggregateData';
import { IUsers } from '../reducers/users';
import { ISolutions } from '../reducers/solutions';
import { IVariable } from '../utils/types';

export interface IProblemAddedAction {
    type: EventTypes.PROBLEM_ADDED,
    problem: IProblem
};
const problemAdded = (problem: IProblem): IProblemAddedAction => ({
    problem, type: EventTypes.PROBLEM_ADDED,
});

// export interface IProblemsFetchedAction {
//     type: EventTypes.PROBLEMS_FETCHED,
//     problems: IProblems
// }
// export const problemsFetched = (problems: IProblems): IProblemsFetchedAction => ({
//     problems, type: EventTypes.PROBLEMS_FETCHED,
// });

export interface IGivenCodeChangedAction {
    type: EventTypes.GIVEN_CODE_CHANGED,
    problemID: string,
    code: string
}
export const givenCodeChanged = (problemID: string, code: string): IGivenCodeChangedAction => ({
    code, problemID, type: EventTypes.GIVEN_CODE_CHANGED,
});

export interface ISetDocAction {
    type: EventTypes.SET_DOC,
    docType: string,
    doc: SDBDoc<any>
}
export const setProblemsDoc = (doc: SDBDoc<IProblems>): ISetDocAction => ({
    doc, docType: 'problems', type: EventTypes.SET_DOC,
});
export const setSolutionsDoc = (doc: SDBDoc<ISolutions>): ISetDocAction => ({
    doc, docType: 'solutions', type: EventTypes.SET_DOC,
});
export const setUsersDoc = (doc: SDBDoc<IUsers>): ISetDocAction => ({
    doc, docType: 'users', type: EventTypes.SET_DOC,
});
export const setAggregateDataDoc = (doc: SDBDoc<IAggregateData>): ISetDocAction => ({
    doc, docType: 'aggregateData', type: EventTypes.SET_DOC,
});

export interface IProblemPassedChangedAction {
    type: EventTypes.PROBLEM_PASSED_CHANGED,
    problemID: string,
    passedAll: boolean
}
export async function updateUserMultipleChoiceCorrectness(problemID, dispatch, getState) {
    const { shareDBDocs, users, solutions } = getState();
    const problemsDoc = shareDBDocs.problems;
    const aggregateDataDoc = shareDBDocs.aggregateData;
    const problem = problemsDoc.getData().allProblems[problemID];
    const { problemDetails } = problem;

    const myuid = users.myuid as string;

    const userSolution = solutions.allSolutions[problemID][myuid];

    if (userSolution) {
        let passedAll: boolean = true;
        if (problemDetails.revealSolution) {
            const { selectedItems } = userSolution;
            const { options } = problemDetails;

            options.forEach((option) => {
                const { id, isCorrect } = option;
                const userSelected = selectedItems.indexOf(id) >= 0;

                if (userSelected !== isCorrect) {
                    passedAll = false;
                }
            });
        } else {
            passedAll = false;
        }
        const { userData } = aggregateDataDoc.getData();
        if (passedAll) {
            if (userData[problemID]) {
                if (userData[problemID].completed.indexOf(myuid) < 0) {
                    await aggregateDataDoc.submitListPushOp(['userData', problemID, 'completed'], myuid);
                }
            } else {
                await aggregateDataDoc.submitObjectInsertOp(['userData', problemID], {
                    completed: [myuid]
                });
            }
        } else {
            if (userData[problemID]) {
                const completedIndex = userData[problemID].completed.indexOf(myuid);

                if (completedIndex >= 0) {
                    await aggregateDataDoc.submitListDeleteOp(['userData', problemID, 'completed', completedIndex]);
                }
            }
        }
        dispatch({
            problemID, passedAll, type: EventTypes.PROBLEM_PASSED_CHANGED
        } as IProblemPassedChangedAction);
    }
}

export interface IMultipleChoiceOptionAddedAction {
    type: EventTypes.OPTION_ADDED,
    option: IMultipleChoiceOption,
    problemID: string,
}
export async function multipleChoiceOptionAdded(problemID: string, option: IMultipleChoiceOption) {
    return async (dispatch: Dispatch, getState) => {
        dispatch({
            problemID, option, type: EventTypes.OPTION_ADDED
        } as IMultipleChoiceOptionAddedAction);
        await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
    };
}
export interface IMultipleChoiceOptionDeletedAction {
    type: EventTypes.OPTION_DELETED,
    option: IMultipleChoiceOption,
    problemID: string,
}
export function multipleChoiceOptionDeleted(problemID: string, option: IMultipleChoiceOption) {
    return async (dispatch: Dispatch, getState) => {
        dispatch({
            problemID, option, type: EventTypes.OPTION_DELETED
        } as IMultipleChoiceOptionDeletedAction);
        await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
    };
}
export function multipleChoiceOptionDescriptionChanged(problemID: string, optionID: string, description: string) {
    return async (dispatch: Dispatch, getState) => {
        dispatch({
            problemID, optionID, description, type: EventTypes.OPTION_DESCRIPTION_CHANGED
        });
        await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
    };
}
export async function multipleChoiceOptionCorrectChanged(problemID: string, optionID: string, isCorrect: boolean, dispatch, getState) {
    dispatch({
        problemID, optionID, isCorrect, type: EventTypes.OPTION_CORRECTNESS_CHANGED
    });
    await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
}

export interface IMultipleChoiceSelectionTypeChangedAction {
    type: EventTypes.MULTIPLE_CHOICE_SELECTION_TYPE_CHANGED,
    problemID: string,
    selectionType: IMultipleChoiceSelectionType
}
export async function multipleChoiceSelectionTypeChanged(problemID: string, selectionType: IMultipleChoiceSelectionType, dispatch, getState) {
    dispatch({
        selectionType, problemID, type: EventTypes.MULTIPLE_CHOICE_SELECTION_TYPE_CHANGED
    } as IMultipleChoiceSelectionTypeChangedAction);
    await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
}
export async function multipleChoiceRevealSolutionChanged(problemID: string, revealSolution: boolean, dispatch, getState) {
    dispatch({
        index: problemID, revealSolution, type: EventTypes.MULTIPLE_CHOICE_REVEAL_SOLUTION_CHANGED
    });
    await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
}

export function addMultipleChoiceOption(problemID: string, optionType: 'fixed' = 'fixed') {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const aggregateDataDoc = shareDBDocs.aggregateData;
        const newOption: IMultipleChoiceOption = {
            id: uuid(), description: '(no description)', optionType, isCorrect: false
        };
        await problemsDoc.submitListPushOp(['allProblems', problemID, 'problemDetails', 'options'], newOption);
        await aggregateDataDoc.submitObjectInsertOp(['userData', problemID, 'selected', newOption.id], []);
    };
}

function getOptionIndex(options: IMultipleChoiceOption[], optionID: string): number {
    for (let i: number = 0, len = options.length; i < len; i++) {
        const option = options[i];
        if (option.id === optionID) {
            return i;
        }
    }
    return -1;
}

export function deleteMultipleChoiceOption(problemID: string, optionID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const aggregateDataDoc = shareDBDocs.aggregateData;
        const p = ['allProblems', problemID, 'problemDetails', 'options'];
        const options = problemsDoc.traverse(p);
        const optionIndex = getOptionIndex(options, optionID);
        if (optionIndex >= 0) {
            await problemsDoc.submitListDeleteOp([...p, optionIndex]);
            await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);

            await aggregateDataDoc.submitObjectDeleteOp(['userData', problemID, 'selected', optionID]);
        }
    };
}

export function setMultipleChoiceOptionCorrect(problemID: string, optionID: string, correct: boolean) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const p = ['allProblems', problemID, 'problemDetails', 'options'];
        const options = problemsDoc.traverse(p);
        const optionIndex = getOptionIndex(options, optionID);
        if (optionIndex >= 0) {
            await problemsDoc.submitObjectReplaceOp([...p, optionIndex, 'isCorrect'], correct);
            await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
        }
    };
}

export function setMultipleChoiceSelectionEnabled(problemID: string, enabled: boolean) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        await problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'selectionType'], enabled ? 'multiple' : 'single');
    };
}

export function setRevealSolution(problemID: number, reveal: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'revealSolution'], reveal);
    };
}

export function replaceProblems(newProblems: IProblems) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const aggregateDataDoc = shareDBDocs.aggregateData;
        for (let problemID in newProblems.allProblems) {
            if (newProblems.allProblems.hasOwnProperty(problemID)) {
                const { problemDetails } = newProblems.allProblems[problemID];
                if (problemDetails.problemType === 'code') {
                    aggregateDataDoc.submitObjectInsertOp(['userData', problemID], {
                        completed: []
                    });
                } else if (problemDetails.problemType === 'multiple-choice') {
                    aggregateDataDoc.submitObjectInsertOp(['userData', problemID], {
                        completed: [],
                        selected: {}
                    });
                } else if (problemDetails.problemType === 'text-response') {
                    aggregateDataDoc.submitObjectInsertOp(['userData', problemID], {});
                }
            }
        }
        problemsDoc.submitObjectReplaceOp([], newProblems);
    };
}

export function addCodeProblem() {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const aggregateDataDoc = shareDBDocs.aggregateData;

        const newProblem: IProblem = {
            id: uuid(),
            visible: true,
            problemDetails: {
                problemType: 'code',
                tests: [],
                givenCode: `# code here`,
                afterCode: '',
                standardCode: `# standard solution`,
                notes: '*no notes*',
                description: '*no description*',
                files: [],
                variables: [],
                variableTests: [],
                sketch: [],
                config: {
                    runTests: false,
                    addTests: false,
                    displayInstructor: false,
                    peerHelp: false,
                    autoVerify: false
                },
            }
        };

        await aggregateDataDoc.submitObjectInsertOp(['userData', newProblem.id], {
            completed: []
        });

        await problemsDoc.submitObjectInsertOp(['allProblems', newProblem.id], newProblem);
        await problemsDoc.submitListPushOp(['order'], newProblem.id);
    };
}

export function addMultipleChoiceProblem() {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const aggregateDataDoc = shareDBDocs.aggregateData;

        const newProblem: IProblem = {
            id: uuid(),
            visible: true,
            problemDetails: {
                problemType: 'multiple-choice',
                description: '*no description*',
                options: [],
                selectionType: 'single',
                revealSolution: false
            }
        };

        await aggregateDataDoc.submitObjectInsertOp(['userData', newProblem.id], {
            completed: [],
            selected: {}
        });
        await problemsDoc.submitObjectInsertOp(['allProblems', newProblem.id], newProblem);
        await problemsDoc.submitListPushOp(['order'], newProblem.id);
    };
}

export function addTextResponseProblem() {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const aggregateDataDoc = shareDBDocs.aggregateData;

        const newProblem: IProblem = {
            id: uuid(),
            visible: true,
            problemDetails: {
                problemType: 'text-response',
                description: '*no description*',
            }
        };

        await aggregateDataDoc.submitObjectInsertOp(['userData', newProblem.id], {});

        await problemsDoc.submitObjectInsertOp(['allProblems', newProblem.id], newProblem);
        await problemsDoc.submitListPushOp(['order'], newProblem.id);
    };
}

export function deleteProblem(problemID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        const problemsData = problemsDoc.getData();
        const { order } = problemsData;
        const index = order.indexOf(problemID);
        if (index >= 0) {
            await problemsDoc.submitListDeleteOp(['order', index]);
        }
        problemsDoc.submitObjectDeleteOp(['allProblems', problemID]);
    };
}

export function updateSketch(problemID: string, sketch: any[]) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'sketch'], sketch);
    };
}

export function addTest(problemID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const aggregateDataDoc = shareDBDocs.aggregateData;

        const newTest: ICodeTest = {
            actual: 'True',
            description: '*no description*',
            expected: 'True',
            id: uuid(),
        };

        await problemsDoc.submitListPushOp(['allProblems', problemID, 'problemDetails', 'tests'], newTest);
        await aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'completed'], []);
    };
}

export interface ITestAddedAction {
    type: EventTypes.TEST_ADDED,
    problemID: string,
    test: ICodeTest
}

export const testAdded = (problemID: string, test: ICodeTest): ITestAddedAction => ({
    type: EventTypes.TEST_ADDED, problemID, test
});

export function addVariable(problemID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        const newVariable: IVariable = {
            type: 'input',
            name: 'x',
            value: '0'
        }

        problemsDoc.submitListPushOp(['allProblems', problemID, 'problemDetails', 'variables'], newVariable);
    }
}

export function deleteVariable(problemID: string, variableIndex: number) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitListDeleteOp(['allProblems', problemID, 'problemDetails', 'variables', variableIndex]);
    }
}

export function changeVariableType(problemID: string, variableIndex: number, newType: 'input' | 'output') {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'variables', variableIndex, 'type'], newType);
    }
}

export function addVariableTest(problemID: string, variableTest: ICodeVariableTest) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitListPushOp(['allProblems', problemID, 'problemDetails', 'variableTests'], variableTest);
    };
}

export function deleteVariableTest(problemID: string, testIndex: number) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitListDeleteOp(['allProblems', problemID, 'problemDetails', 'variableTests', testIndex]);
    }
}

export function changeVariableTestStatus(problemID: string, testIndex: number, status: boolean) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'variableTests', testIndex, 'verified'], status);
    }
}

export function changeProblemConfig(problemID: string, item: string, value: boolean) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'config', item], value);
    }
}

export interface ITestPartChangedAction {
    type: EventTypes.TEST_PART_CHANGED,
    problemID: string,
    test: ICodeTest,
    part: string
}
export const testPartChanged = (problemID: string, test: ICodeTest, part: string): ITestPartChangedAction => ({
    type: EventTypes.TEST_PART_CHANGED, problemID, test, part
});

export function deleteTest(problemID: string, testID: string) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        const testsP = ['allProblems', problemID, 'problemDetails', 'tests'];
        const existingTests = problemsDoc.traverse(testsP);

        for (let i: number = 0, len = existingTests.length; i < len; i++) {
            const eti = existingTests[i];
            if (eti.id === testID) {
                return problemsDoc.submitListDeleteOp([...testsP, i]);
            }
        }
    };
}

export function addFileToProblem(problemID: string) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const newFile = {
            contents: 'file contents',
            id: uuid(),
            name: 'file.txt',
        };
        return problemsDoc.submitListPushOp(['allProblems', problemID, 'problemDetails', 'files'], newFile);
    };
}

export function deleteProblemFile(problemID: string, fileID: string) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        const filesP = ['allProblems', problemID, 'problemDetails', 'files'];
        const existingFiles = problemsDoc.traverse(filesP);

        for (let i: number = 0, len = existingFiles.length; i < len; i++) {
            const efi = existingFiles[i];
            if (efi.id === fileID) {
                return problemsDoc.submitListDeleteOp([...filesP, i]);
            }
        }
    };
}

export function setProblemVisibility(id: string, visible: boolean) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitObjectReplaceOp(['allProblems', id, 'visible'], visible);
    };
}

function isNearBottom(slack: number = 200): boolean {
    return ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight - slack);
}
function scrollToBottom(): void {
    window.scrollTo(0, document.body.scrollHeight);
}

export interface ISDBDocFetchedAction {
    type: EventTypes.SDB_DOC_FETCHED,
    doc: SDBDoc<any>,
    data: any,
    docType: string,
    ops: ReadonlyArray<sharedb.Op>
}
export interface ISDBDocChangedAction {
    type: EventTypes.SDB_DOC_CHANGED,
    doc: SDBDoc<any>,
    docType: string
}
export function beginListeningOnDoc(doc: SDBDoc<any>, docType: string) {
    return (dispatch: Dispatch, getState) => {
        doc.subscribe((type, ops) => {
            if (type === null || type === 'create') {
                dispatch({
                    type: EventTypes.SDB_DOC_FETCHED,
                    doc,
                    data: doc.getData(),
                    docType
                } as ISDBDocFetchedAction);
            } else if (type === 'op') {
                dispatch({
                    type: EventTypes.SDB_DOC_CHANGED,
                    doc,
                    docType,
                    ops
                } as ISDBDocChangedAction);
            }
        });
    };
}
export function beginListeningOnProblemsDoc(doc: SDBDoc<IProblems>) {
    return (dispatch: Dispatch, getState) => {
        doc.subscribe((type, ops) => {
            if (type === null || type === 'create') {
                // dispatch(problemsFetched(doc.getData()));
            } else if (type === 'op') {
                const wasAtBottom = isNearBottom();
                ops!.forEach((op) => {
                    const { p } = op;

                    // console.log(op);
                    if (SDBDoc.matches(p, [])) { // total replacement
                        dispatch({
                            type: EventTypes.SDB_DOC_FETCHED,
                            doc,
                            docType: 'problems'
                        } as ISDBDocFetchedAction);
                    }

                    const addProblemMatches = SDBDoc.matches(p, ['allProblems', true]);
                    if (addProblemMatches) {
                        const { oi } = op as ObjectInsertOp;
                        if (oi) {
                            dispatch(problemAdded(oi))
                        }
                        if (wasAtBottom) {
                            scrollToBottom();
                        }
                    }

                    const visibilityChangeMatches = SDBDoc.matches(p, ['allProblems', true, 'visible'])
                    if (visibilityChangeMatches) {
                        if (wasAtBottom) {
                            scrollToBottom();
                        }
                    }

                    const selectionTypeMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'selectionType'])
                    if (selectionTypeMatches) {
                        const { oi } = op as ObjectInsertOp;
                        const problemID = p[1] as string;
                        multipleChoiceSelectionTypeChanged(problemID, oi, dispatch, getState);
                    }

                    const givenCodeMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'givenCode', true]);
                    if (givenCodeMatches) {
                        const problemID = p[1] as string;
                        const givenCode = doc.traverse(['allProblems', problemID, 'problemDetails', 'givenCode']);
                        dispatch(givenCodeChanged(problemID, givenCode));
                    }

                    const optionCorrectnessMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'options', true, 'isCorrect']);
                    if (optionCorrectnessMatches) {
                        const { oi } = op as ObjectInsertOp;
                        const problemID = p[1] as string;
                        const optionIndex = p[4] as number;
                        const option = doc.traverse(['allProblems', problemID, 'problemDetails', 'options', optionIndex]);
                        multipleChoiceOptionCorrectChanged(problemID, option.id, oi, dispatch, getState);
                    }

                    const revealSolutionMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'revealSolution']);
                    if (revealSolutionMatches) {
                        const problemID = p[1] as string;
                        const { oi } = op as ObjectInsertOp;
                        multipleChoiceRevealSolutionChanged(problemID, oi, dispatch, getState);
                    }

                    const optionDeletedMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'options', true]);
                    if (optionDeletedMatches) {
                        const problemID = p[1] as string;
                        const { ld } = op as ListDeleteOp;
                        multipleChoiceOptionDeleted(problemID, ld);
                    }

                    const changeTestPartMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'tests', true, /actual|expected/, true])
                    if (changeTestPartMatches) {
                        const problemID = p[1] as string;
                        const testPart = p[5] as string;
                        const test = doc.traverse(['allProblems', problemID, 'problemDetails', 'tests', p[4]])
                        dispatch(testPartChanged(problemID, test, testPart));

                        const { shareDBDocs } = getState();
                        const aggregateDataDoc = shareDBDocs.aggregateData;
                        aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'completed'], []);
                    }
                    const addTestMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'tests', true]);
                    if (addTestMatches) {
                        const problemID = p[1] as string;
                        const { li } = op as ListInsertOp;
                        dispatch(testAdded(problemID, li));
                    }
                });
            }
        });
    };
}

export function joinHelpSession(id: string, tuteeID: string, tutorID: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const { userData } = doc.getData();
        const { helpSessions } = userData[id];
        const sessionIndex = helpSessions.findIndex(e => e.tuteeID === tuteeID);
        doc.submitListPushOp(['userData', id, 'helpSessions', sessionIndex, 'tutorIDs'], tutorID);
    }
}

export function quitHelpSession(id: string, sessionIndex: string, uid: string) {
    return (dispatch: Dispatch, getState) => {
        const { doc } = getState();
        const { userData } = doc.getData();
        const { helpSessions } = userData[id];
        const session = helpSessions[sessionIndex];
        if (session.tuteeID === uid) doc.submitListDeleteOp(['userData', id, 'helpSessions', sessionIndex]);
        const tutorIndex = session.tutorIDs.indexOf(uid);
        if (tutorIndex !== -1) doc.submitListDeleteOp(['userData', id, 'helpSessions', sessionIndex, 'tutorIDs', tutorIndex]);
    }
}
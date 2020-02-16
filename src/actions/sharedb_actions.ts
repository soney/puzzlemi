import { SDBDoc } from 'sdb-ts';
import { Dispatch } from 'redux';
import uuid from '../utils/uuid';
import { getTimeStamp } from '../utils/timestamp';
import EventTypes from './EventTypes';
import sharedb, { ObjectInsertOp, ListDeleteOp, ListInsertOp } from 'sharedb';
import { IProblem, IMultipleChoiceOption, IProblems, IMultipleChoiceSelectionType } from '../reducers/problems';
import { IAggregateData, IHelpSession, IMessage, ICodeSolutionAggregate, ICodeTest, CodeTestStatus, CodeTestType } from '../reducers/aggregateData';
import { IUsers } from '../reducers/users';
import { ISolutions, ICodeSolution } from '../reducers/solutions';

export interface IProblemAddedAction {
    type: EventTypes.PROBLEM_ADDED,
    problem: IProblem
};
const problemAdded = (problem: IProblem): IProblemAddedAction => ({
    problem, type: EventTypes.PROBLEM_ADDED,
});

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
export async function multipleChoiceOptionAdded(problemID: string, option: IMultipleChoiceOption, dispatch: Dispatch, getState) {
    dispatch({
        problemID, option, type: EventTypes.OPTION_ADDED
    } as IMultipleChoiceOptionAddedAction);
    await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
    // return async (dispatch: Dispatch, getState) => {
    // };
}
export interface IMultipleChoiceOptionDeletedAction {
    type: EventTypes.OPTION_DELETED,
    option: IMultipleChoiceOption,
    problemID: string,
}
export async function multipleChoiceOptionDeleted(problemID: string, option: IMultipleChoiceOption, dispatch: Dispatch, getState) {
    // return async (dispatch: Dispatch, getState) => {
    dispatch({
        problemID, option, type: EventTypes.OPTION_DELETED
    } as IMultipleChoiceOptionDeletedAction);
    await updateUserMultipleChoiceCorrectness(problemID, dispatch, getState);
    // };
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

export function moveMultipleChoiceOptionUp(problemID: string, optionID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const p = ['allProblems', problemID, 'problemDetails', 'options'];
        const options = problemsDoc.traverse(p);
        const optionIndex = getOptionIndex(options, optionID);
        if (optionIndex > 0) {
            await problemsDoc.submitListMoveOp([...p, optionIndex], optionIndex - 1);
        }
    };
}

export function moveMultipleChoiceOptionDown(problemID: string, optionID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;
        const p = ['allProblems', problemID, 'problemDetails', 'options'];
        const options = problemsDoc.traverse(p);
        const optionIndex = getOptionIndex(options, optionID);
        if (optionIndex >= 0 && optionIndex < options.length - 1) {
            await problemsDoc.submitListMoveOp([...p, optionIndex], optionIndex + 1);
        }
    };
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
                        completed: [],
                        tests: {},
                        helpSessions: []
                    });
                } else if(problemDetails.problemType === 'multiple-choice') {
                    const selected = {};
                    problemDetails.options.forEach((option) => {
                        selected[option.id] = [];
                    });
                    aggregateDataDoc.submitObjectInsertOp(['userData', problemID], {
                        completed: [],
                        selected
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

        const newCodeTest: ICodeTest = {
            id: uuid(),
            name: 'Instructor test',
            author: 'null',
            type: CodeTestType.INSTRUCTOR,
            before: '# given variables',
            after: '# assertions',
            status: CodeTestStatus.PASSED,
            completed: []
        }

        const newProblem: IProblem = {
            id: uuid(),
            visible: true,
            problemDetails: {
                problemType: 'code',
                givenCode: `# code here`,
                standardCode: `# standard solution`,
                liveCode: `# live code demo`,
                notes: '*no notes*',
                description: '*no description*',
                files: [],
                sketch: [],
                config: {
                    disableTest: false,
                    runTests: true,
                    addTests: false,
                    displayInstructor: false,
                    peerHelp: false
                },
                tests: {
                    [newCodeTest.id]: newCodeTest
                }
            }
        };


        const newCodeSolutionAggregate: ICodeSolutionAggregate = {
            completed: [],
            tests: {
                // [newCodeTest.id]: newCodeTest
            },
            helpSessions: {},
            helperLists: {}
        };

        await aggregateDataDoc.submitObjectInsertOp(['userData', newProblem.id], newCodeSolutionAggregate);
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

export function addTest(problemID: string, username: string, isAdmin: boolean, testID?:string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        const problemsDoc = shareDBDocs.problems;

        const newCodeTest: ICodeTest = {
            id: testID?testID:uuid(),
            name: isAdmin ? 'instructor test' : 'student test',
            author: username,
            type: isAdmin ? CodeTestType.INSTRUCTOR : CodeTestType.STUDENT,
            before: '# given variables',
            after: '# assertions',
            status: isAdmin? CodeTestStatus.PASSED: CodeTestStatus.UNVERIFIED,
            completed: []
        }
        if(isAdmin) await problemsDoc.submitObjectInsertOp(['allProblems', problemID, 'problemDetails', 'tests', newCodeTest.id], newCodeTest);
        else await aggregateDataDoc.submitObjectInsertOp(['userData', problemID, 'tests', newCodeTest.id], newCodeTest);
    };
}

export function deleteTest(problemID: string, test: ICodeTest) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        const problemsDoc = shareDBDocs.problems;
        if(test.type===CodeTestType.INSTRUCTOR) problemsDoc.submitObjectDeleteOp(['allProblems', problemID, 'problemDetails', 'tests', test.id]);
        else aggregateDataDoc.submitObjectDeleteOp(['userData', problemID, 'tests', test.id]);
    }
}

export function changeTestStatus(problemID: string, test: ICodeTest, newStatus: CodeTestStatus) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        const problemsDoc = shareDBDocs.problems;
        if(test.type===CodeTestType.INSTRUCTOR) problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails','tests', test.id,'status'], newStatus);
        else aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'tests', test.id, 'status'], newStatus);
    }
}

export function changeHelperLists(problemID: string, sessionID: string, helperID: string){
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'helperLists', helperID], sessionID);
    }
}

export function changeHelpSessionStatus(problemID: string, sessionID: string, newStatus:boolean){
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'helpSessions', sessionID, 'status'], newStatus);
    }
}

export function changeHelpSessionAccessControl(problemID: string, sessionID: string, readOnly: boolean){
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        aggregateDataDoc.submitObjectReplaceOp(['userData', problemID, 'helpSessions', sessionID, 'readOnly'], readOnly);
    }
}


export interface ITestAddedAction {
    type: EventTypes.TEST_ADDED,
    problemID: string,
    test: any
}

export function changeProblemConfig(problemID: string, item: string, value: boolean) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems;

        problemsDoc.submitObjectReplaceOp(['allProblems', problemID, 'problemDetails', 'config', item], value);
    }
}

export function addHelpSession(problemID: string, username: string, userSolution: ICodeSolution, helpID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        const newHelpSession: IHelpSession = {
            id: helpID,
            timestamp: getTimeStamp(),
            status: true,
            tutee: username,
            chatMessages: [],
            title: '**no title**',
            readOnly: false,
            solution: userSolution as ICodeSolution
        }
        aggregateDataDoc.submitObjectInsertOp(['userData', problemID, 'helpSessions', newHelpSession.id], newHelpSession);
    }
}

export function deleteHelpSession(problemID: string, sessionID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        aggregateDataDoc.submitObjectDeleteOp(['userData', problemID, 'helpSessions', sessionID]);
    }
}

export function addMessage(problemID: string, newMessage: IMessage, sessionID: string) {
    return async (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const aggregateDataDoc = shareDBDocs.aggregateData;
        aggregateDataDoc.submitListPushOp(['userData', problemID, 'helpSessions', sessionID, 'chatMessages'], newMessage)
    }
}


export interface ITestPartChangedAction {
    type: EventTypes.TEST_PART_CHANGED,
    problemID: string,
    test: any,
    part: string
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

export function moveProblemUp(id: string) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems as SDBDoc<IProblems>;
        const { order } = problemsDoc.getData();

        const problemIndex = order.indexOf(id);
        if (problemIndex > 0) {
            problemsDoc.submitListMoveOp(['order', problemIndex], problemIndex - 1);
        }
    };
}

export function moveProblemDown(id: string) {
    return (dispatch: Dispatch, getState) => {
        const { shareDBDocs } = getState();
        const problemsDoc = shareDBDocs.problems as SDBDoc<IProblems>;
        const { order } = problemsDoc.getData();

        const problemIndex = order.indexOf(id);
        if (problemIndex >= 0 && problemIndex < order.length - 1) {
            problemsDoc.submitListMoveOp(['order', problemIndex], problemIndex + 1);
        }
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

                    const optionAddedOrDeletedMatches = SDBDoc.matches(p, ['allProblems', true, 'problemDetails', 'options', true]);
                    if (optionAddedOrDeletedMatches) {
                        const problemID = p[1] as string;
                        const { ld } = op as ListDeleteOp;
                        if (ld) {
                            multipleChoiceOptionDeleted(problemID, ld, dispatch, getState);
                        }
                        const { li } = op as ListInsertOp;
                        if (li) {
                            multipleChoiceOptionAdded(problemID, li, dispatch, getState);
                        }
                    }
                });
            }
        });
    };
}
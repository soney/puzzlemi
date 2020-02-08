import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';
import { IProblemAddedAction, IGivenCodeChangedAction, IMultipleChoiceSelectionTypeChangedAction, IMultipleChoiceOptionDeletedAction, ISDBDocFetchedAction } from '../actions/sharedb_actions';
import { IPMState } from '.';
import { IProblem, ICodeProblem, ICodeFile } from './problems';
import { ICodeChangedAction, ITextResponseChangedAction, IDeleteUserFileAction, IMultipleChoiceSelectedOptionsChangedAction } from '../actions/user_actions';
import { IFileWrittenAction } from '../actions/runCode_actions';
import uuid from '../utils/uuid';
import { IAppState } from './app';

export interface ICodeSolution {
    code: string,
    files: ICodeFile[]
}
export interface IMultipleChoiceSolution {
    selectedItems: string[]
}
export interface ITextResponseSolution {
    response: string
}

export type IProblemSolution = ICodeSolution | IMultipleChoiceSolution | ITextResponseSolution;

export interface ISolutions {
    allSolutions: {
        [problemID: string]: {
            [userID: string]: IProblemSolution
        }
    }
}

const solutionSubmissionQueue: { [problemID: string]: IProblemSolution } = {};
const solutionSubmissionDelay: number = 10 * 1000; // 10 seconds
let solutionSubmissionTimer: NodeJS.Timeout | null = null;

function debounceSubmitSolution(problemID: string, solution: IProblemSolution, state: IPMState): void {
    const myuid = state.users.myuid!;
    solutionSubmissionQueue[problemID] = solution;

    if (solutionSubmissionTimer === null) {
        solutionSubmissionTimer = setTimeout(doSubmitSolutions.bind(window, state.app, myuid), solutionSubmissionDelay);
    }
}

function doSubmitSolutions(appState: IAppState, uid: string) {
    const solutionsList: { problemID: string, solution: IProblemSolution }[] = [];

    for (let problemID in solutionSubmissionQueue) {
        if (solutionSubmissionQueue.hasOwnProperty(problemID)) {
            solutionsList.push({ problemID, solution: solutionSubmissionQueue[problemID] });
            delete solutionSubmissionQueue[problemID];
        }
    }
    const postURL = `${appState.postBase}/submitSolutions`;
    fetch(postURL, {
        method: 'POST',
        mode: appState.debugMode ? 'cors' : 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            uid, solutionsList, channel: appState.channel
        })
    });
    solutionSubmissionTimer = null;
}

export const solutions = (state: ISolutions = { allSolutions: {} }, action: IProblemAddedAction) => {
    const { type } = action;
    if (type === EventTypes.PROBLEM_ADDED) {
        const { problem } = action as IProblemAddedAction;
        return update(state, {
            allSolutions: {
                [problem.id]: {

                }
            }
        })
    } else {
        return state;
    }
}

export const crossSliceSolutionsReducer = (state: IPMState, action: IProblemAddedAction | ICodeChangedAction | IGivenCodeChangedAction | ITextResponseChangedAction | IFileWrittenAction | IDeleteUserFileAction | IMultipleChoiceSelectedOptionsChangedAction | IMultipleChoiceSelectionTypeChangedAction | IMultipleChoiceOptionDeletedAction | ISDBDocFetchedAction): IPMState => {
    const { type } = action;
    if (type === EventTypes.PROBLEM_ADDED) {
        const { problem } = action as IProblemAddedAction;
        const myuid = state.users.myuid as string;
        const defaultSolution = getDefaultSolution(problem);
        return update(state, {
            solutions: {
                allSolutions: {
                    [problem.id]: { $set: { [myuid]: defaultSolution } }
                }
            }
        });
    } else if (type === EventTypes.SDB_DOC_FETCHED) {
        const { doc, docType } = action as ISDBDocFetchedAction;
        if (docType === 'problems') {
            const problems = doc.getData();
            const { allProblems } = problems;
            const solutions = {};
            const myuid = state.users.myuid as string;

            const { allSolutions } = state.solutions;
            for (let problemID in allProblems) {
                if (allProblems.hasOwnProperty(problemID)) {
                    const problem = allProblems[problemID];
                    if (!allSolutions.hasOwnProperty(problemID)) {
                        solutions[problemID] = {
                            [myuid]: getDefaultSolution(problem)
                        };
                    }
                }
            }
            const fixedProblemsWithNoSolutions = update(state, {
                solutions: {
                    allSolutions: { $merge: solutions }
                }
            });

            const mySolutions = {};
            for (let problemID in allProblems) {
                if (allProblems.hasOwnProperty(problemID)) {
                    const problem = allProblems[problemID];
                    if (!fixedProblemsWithNoSolutions.solutions.allSolutions[problemID].hasOwnProperty(myuid)) {
                        mySolutions[problemID] = update(fixedProblemsWithNoSolutions.solutions.allSolutions[problemID], {
                            [myuid]: { $set: getDefaultSolution(problem) }
                        });
                    }
                }
            }

            return update(fixedProblemsWithNoSolutions, {
                solutions: {
                    allSolutions: { $merge: mySolutions }
                }
            })
        } else {
            return state;
        }
    } else if (type === EventTypes.CODE_CHANGED) {
        const { problemID, code } = action as ICodeChangedAction;
        const myuid = state.users.myuid as string;
        debounceSubmitSolution(problemID, { code, files: [] }, state);

        return update(state, {
            solutions: {
                allSolutions: {
                    [problemID]: {
                        [myuid]: { $merge: { code } }
                    }
                }
            }
        });
    } else if (type === EventTypes.GIVEN_CODE_CHANGED) {
        const { problemID, code } = action as IGivenCodeChangedAction;
        const myuid = state.users.myuid as string;

        if (state.intermediateUserState.intermediateSolutionState[problemID]!.modified) {
            return state;
        } else {
            return update(state, {
                solutions: {
                    allSolutions: {
                        [problemID]: {
                            [myuid]: {
                                code: { $set: code }
                            }
                        }
                    }
                }
            });
        }
    } else if (type === EventTypes.TEXT_RESPONSE_CHANGED) {
        const { problemID, response } = action as ITextResponseChangedAction;
        const myuid = state.users.myuid as string;

        debounceSubmitSolution(problemID, { response }, state);

        return update(state, {
            solutions: {
                allSolutions: {
                    [problemID]: {
                        $merge: {
                            [myuid]: {
                                response
                            }
                        }
                    }
                }
            }
        });
    } else if (type === EventTypes.DELETE_USER_FILE) {
        const { problemID, fileID } = action as IDeleteUserFileAction;
        const myuid = state.users.myuid as string;

        const solution = state.solutions.allSolutions[problemID][myuid] as ICodeSolution;

        const { files } = solution;
        const fIndex = files.findIndex((f) => f.id === fileID);
        if (fIndex >= 0) {
            return update(state, {
                solutions: {
                    allSolutions: {
                        [problemID]: {
                            [myuid]: {
                                files: { $splice: [[fIndex, 1]] }
                            }
                        }
                    }
                }
            });
        } else {
            return state;
        }
    } else if (type === EventTypes.FILE_WRITTEN) {
        const { problemID, name, contents } = action as IFileWrittenAction;
        const myuid = state.users.myuid as string;

        const solution = state.solutions.allSolutions[problemID][myuid] as ICodeSolution;
        const { files } = solution;
        const fIndex = files.findIndex((f) => f.name === name);
        if (fIndex < 0) {
            return update(state, {
                solutions: {
                    allSolutions: {
                        [problemID]: {
                            [myuid]: {
                                files: {
                                    $push: [{ id: uuid(), name, contents }]
                                }
                            }
                        }
                    }
                }
            });
        } else {
            const existingContents = files[fIndex].contents;
            return update(state, {
                solutions: {
                    allSolutions: {
                        [problemID]: {
                            [myuid]: {
                                files: {
                                    [fIndex]: {
                                        contents: { $set: existingContents + contents }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
    } else if (type === EventTypes.OPTION_DELETED) {
        const { problemID, option } = action as IMultipleChoiceOptionDeletedAction;
        const myuid = state.users.myuid as string;

        const { selectedItems } = state.solutions.allSolutions[problemID][myuid] as IMultipleChoiceSolution;
        const optionIndex = selectedItems.indexOf(option.id);
        if (optionIndex >= 0) {
            return update(state, {
                solutions: {
                    allSolutions: {
                        [problemID]: {
                            [myuid]: {
                                selectedItems: { $splice: [[optionIndex, 1]] }
                            }
                        }
                    }
                }
            });
        } else {
            return state;
        }
    } else if (type === EventTypes.MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED) {
        const { problemID, selectedItems } = action as IMultipleChoiceSelectedOptionsChangedAction;
        const myuid = state.users.myuid as string;

        debounceSubmitSolution(problemID, { selectedItems }, state);

        return update(state, {
            solutions: {
                allSolutions: {
                    [problemID]: {
                        [myuid]: {
                            selectedItems: { $set: selectedItems }
                        }
                    }
                }
            }
        });
    } else if (type === EventTypes.MULTIPLE_CHOICE_SELECTION_TYPE_CHANGED) {
        const { problemID } = action as IMultipleChoiceSelectionTypeChangedAction;
        const myuid = state.users.myuid as string;
        return update(state, {
            solutions: {
                allSolutions: {
                    [problemID]: {
                        [myuid]: {
                            selectedItems: { $set: [] }
                        }
                    }
                }
            }
        });
    }
    return state;
}

function getDefaultSolution(problem: IProblem): IProblemSolution {
    const { problemDetails } = problem;
    const { problemType } = problemDetails;

    if (problemType === 'code') {
        return { code: (problemDetails as ICodeProblem).givenCode, files: [] };
    } else if (problemType === 'multiple-choice') {
        return { selectedItems: [] };
    } else if (problemType === 'text-response') {
        return { response: '' };
    } else {
        throw new Error(`Unknown problem type ${problemType}`);
    }
}

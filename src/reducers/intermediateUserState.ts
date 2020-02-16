import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';
import { ISetIsAdminAction, ICodeChangedAction, IUpdateActiveHelpSessionAction, ISetActiveTestAction } from '../actions/user_actions';
import { IOutputChangedAction, IErrorChangedAction, IDoneRunningCodeAction, IBeginRunningCodeAction, IPassedAddAction, IFailedAddAction } from '../actions/runCode_actions';
import { IProblemAddedAction, ISDBDocFetchedAction, ITestAddedAction, ITestPartChangedAction, IMultipleChoiceOptionAddedAction } from '../actions/sharedb_actions';
import { IProblem, ICodeFile, IMultipleChoiceOption, IProblemType } from './problems';
import { IPMState } from '.';
import { ICodeTest } from './aggregateData';

export enum ElementAwaitingFocus { NONE='none', PROBLEM='problem', OPTION='option', TEST='test', FILE='file' };

export interface IIntermediateUserState {
    isAdmin: boolean;
    awaitingFocus: null | IProblem | IMultipleChoiceOption | ICodeTest;
    intermediateSolutionState: {
        [problemID: string]: ISolutionState
    }
}

export interface ICodeSolutionState {
    modified: boolean,
    files: ICodeFile[],
    passedAll: boolean,
    testResults: ICodeSolutionTestResultsState,
    currentActiveTest: string,
    currentActiveHelpSession: string,
}

export interface ICodeSolutionTestResultsState {
    [testID: string]: ICodeTestResult
}

export enum CodePassedState { PASSED='passed', FAILED='failed', PENDING='pending' };

export interface ICodeTestResult {
    passed: CodePassedState;
    errors: string[];
    output: string
}

export type ISolutionState = ICodeSolutionState | null;

export const intermediateUserState = (state: IIntermediateUserState = { isAdmin: false, awaitingFocus: null, intermediateSolutionState: {} }, action: ISetIsAdminAction | IOutputChangedAction | IErrorChangedAction | IDoneRunningCodeAction | IBeginRunningCodeAction | IProblemAddedAction | ISDBDocFetchedAction | ICodeChangedAction | ITestAddedAction | ITestPartChangedAction | IPassedAddAction | IFailedAddAction | IUpdateActiveHelpSessionAction | ISetActiveTestAction) => {
    const { type } = action;
    if (type === EventTypes.SET_IS_ADMIN) {
        const { isAdmin } = action as ISetIsAdminAction;
        return update(state, { isAdmin: { $set: isAdmin } });
    } else if (type === EventTypes.OUTPUT_CHANGED) {
        const { problemID, output, testID } = action as IOutputChangedAction;

        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    testResults: {
                        [testID]: {
                            output: { $set: output }
                        }
                    }
                }
            }
        });
    } else if (type === EventTypes.ERROR_CHANGED) {
        const { problemID, errors, testID } = action as IErrorChangedAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    testResults: {
                        [testID]: {
                            errors: { $set: errors }
                        }
                    }
                }
            }
        });
    } else if (type === EventTypes.UPDATE_ACTIVE_HELP_SESSION) {
        const { problemID, helpID } = action as IUpdateActiveHelpSessionAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    currentActiveHelpSession: { $set: helpID }
                }
            }
        })
    } else if (type === EventTypes.TEST_ADDED) {
        const { problemID } = action as ITestAddedAction;

        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    passedAll: { $set: false },
                }
            }
        });
    } else if (type === EventTypes.TEST_PART_CHANGED) {
        const { problemID } = action as ITestPartChangedAction;
        state = update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    passedAll: { $set: false },
                }
            }
        });
        return state;
    } else if (type === EventTypes.DONE_RUNNING_CODE) {
        const { problemID, passed, testID } = action as IDoneRunningCodeAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    testResults: {
                        [testID]: {
                            passed: { $set: passed }
                        }
                    }
                }
            }
        });
    } else if (type === EventTypes.SDB_DOC_FETCHED) {
        const { doc, docType } = action as ISDBDocFetchedAction;
        if (docType === 'problems') {
            const { allProblems } = doc.getData();
            const intermediateSolutionStates = {};

            for (let problemID in allProblems) {
                if (allProblems.hasOwnProperty(problemID)) {
                    const problem = allProblems[problemID];
                    if (!intermediateSolutionStates.hasOwnProperty(problemID)) {
                        intermediateSolutionStates[problemID] = getIntermediateSolutionState(problem);
                    }
                }
            }
            return update(state, {
                intermediateSolutionState: { $merge: intermediateSolutionStates }
            });
        } else {
            return state;
        }
    } else if (type === EventTypes.PROBLEM_ADDED) {
        const { problem } = action as IProblemAddedAction;
        const { id } = problem;
        return update(state, {
            intermediateSolutionState: {
                [id]: {
                    $set: getIntermediateSolutionState(problem)
                }
            }
        });
    } else if (type === EventTypes.BEGIN_RUN_CODE) {
        const { problemID, testID } = action as IBeginRunningCodeAction;
        let { testResults } = state.intermediateSolutionState[problemID] as ICodeSolutionState;
        testResults[testID] = { passed: CodePassedState.PENDING, errors: [], output: '' }
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    passedAll: { $set: false },
                    testResults: { $set: testResults },
                }
            }
        }
        );
    } else if (type === EventTypes.SET_ACTIVE_TEST) {
        const { testID, problemID } = action as ISetActiveTestAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    currentActiveTest: { $set: testID }
                }
            }
        })
    } else if (type === EventTypes.CODE_CHANGED) {
        const { problemID } = action as ICodeChangedAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    modified: { $set: true },
                    testResults: { $set: {} }
                }
            }
        });
    } else {
        return state;
    }
}

export const crossSliceIntermediateUserStateReducer = (state: IPMState, action: IProblemAddedAction|ITestAddedAction|IMultipleChoiceOptionAddedAction): IPMState => {
    const { type } = action;
    if (type === EventTypes.PROBLEM_ADDED) {
        const { problem } = action as IProblemAddedAction;
        return update(state, {
            intermediateUserState: {
                awaitingFocus: { $set: problem }
            },
        });
    } else if (type === EventTypes.TEST_ADDED) {
        const { test } = action as ITestAddedAction;
        return update(state, {
            intermediateUserState: {
                awaitingFocus: { $set: test }
            },
        });
    } else if (type === EventTypes.OPTION_ADDED) {
        const { option } = action as IMultipleChoiceOptionAddedAction;
        return update(state, {
            intermediateUserState: {
                awaitingFocus: { $set: option }
            },
        });
    } else {
        return state;
    }
}

function getIntermediateSolutionState(problem: IProblem): ISolutionState {
    const { problemType } = problem.problemDetails;
    if (problemType === IProblemType.Code) {
        return {
            modified: false,
            files: [],
            passedAll: false,
            testResults: {},
            currentActiveTest: '',
            currentActiveHelpSession: '',
        };
    } else {
        // throw new Error(`No way to get solution state object for problem type ${problemType}`)
        return null;
    }
}
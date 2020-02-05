import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';
import { ISetIsAdminAction, ICodeChangedAction, IUpdateActiveHelpSessionAction } from '../actions/user_actions';
import { IOutputChangedAction, IErrorChangedAction, IDoneRunningCodeAction, IBeginRunningCodeAction, IPassedAddAction, IFailedAddAction } from '../actions/runCode_actions';
import { IPMTestResult } from '../pyTests/PMTestSuite';
import { IProblemAddedAction, ISDBDocFetchedAction, ITestAddedAction, ITestPartChangedAction } from '../actions/sharedb_actions';
import { IProblem, ICodeFile } from './problems';

export interface IIntermediateUserState {
    isAdmin: boolean
    intermediateSolutionState: {
        [problemID: string]: ISolutionState
    }
}

export interface ICodeSolutionState {
    modified: boolean,
    errors: string[],
    files: ICodeFile[],
    output: string,
    passedAll: boolean,
    testResults: ICodeSolutionTestResultsState,
    passedVariableTests: string[],
    currentFailedVariableTest: string,
    currentActiveHelpSession: string,
}

export interface ICodeSolutionTestResultsState {
    [testID: string]: IPMTestResult

}

export type ISolutionState = ICodeSolutionState | null;

export const intermediateUserState = (state: IIntermediateUserState={ isAdmin: false, intermediateSolutionState: {} }, action: ISetIsAdminAction|IOutputChangedAction|IErrorChangedAction|IDoneRunningCodeAction|IBeginRunningCodeAction|IProblemAddedAction|ISDBDocFetchedAction|ICodeChangedAction|ITestAddedAction|ITestPartChangedAction|IPassedAddAction|IFailedAddAction|IUpdateActiveHelpSessionAction) => {
    const { type } = action;
    if(type === EventTypes.SET_IS_ADMIN) {
        const { isAdmin } = action as ISetIsAdminAction;
        return update(state, { isAdmin: { $set: isAdmin }});
    } else if(type === EventTypes.OUTPUT_CHANGED) {
        const { problemID, output } = action as IOutputChangedAction;

        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    output: { $set: output }
                }
            }
        });
    } else if(type === EventTypes.ERROR_CHANGED) {
        const { problemID, errors } = action as IErrorChangedAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    errors: { $set: errors }
                }
            }
        });
    } else if(type === EventTypes.ADD_PASSED_TESTS) {
        const {problemID, passedIDs } = action as IPassedAddAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    passedVariableTests: {$set: passedIDs},
                }
            }
        })
    } else if (type === EventTypes.ADD_FAILED_TEST) {
        const {problemID, failedID} = action as IFailedAddAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    currentFailedVariableTest: {$set: failedID}
                }
            }
        })
    } else if (type === EventTypes.UPDATE_ACTIVE_HELP_SESSION) {
        const {problemID, helpID} = action as IUpdateActiveHelpSessionAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    currentActiveHelpSession: {$set: helpID}
                }
            }
        })
    } else if(type === EventTypes.TEST_ADDED) {
        const { problemID } = action as ITestAddedAction;

        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    passedAll: { $set: false },
                }
            }
        });
    } else if(type === EventTypes.TEST_PART_CHANGED) {
        const { problemID } = action as ITestPartChangedAction;
        state = update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    passedAll: { $set: false },
                }
            }
        });
        // state = update(state, {
        //         intermediateSolutionState: {
        //             [problemID]: {
        //                 testResults: {
        //                     [test.id]: {
        //                         passed: { $set: false}
        //                     }
        //                 }
        //             }
        //         }
        //     });
        return state;
    } else if(type === EventTypes.DONE_RUNNING_CODE) {
        const { problemID, passedAll, testResults } = action as IDoneRunningCodeAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    passedAll: { $set: passedAll },
                    testResults:{ $set: testResults },
                }
            }
        });
    } else if(type === EventTypes.SDB_DOC_FETCHED) {
        const { doc, docType } = action as ISDBDocFetchedAction;
        if(docType === 'problems') {
            const { allProblems } = doc.getData();
            const intermediateSolutionStates = {};

            for(let problemID in allProblems) {
                if(allProblems.hasOwnProperty(problemID)) {
                    const problem = allProblems[problemID];
                    if(!intermediateSolutionStates.hasOwnProperty(problemID)) {
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
    } else if(type === EventTypes.PROBLEM_ADDED) {
        const { problem } = action as IProblemAddedAction;
        const { id } = problem;
        return update(state, {
            intermediateSolutionState: {
                [id]: {
                    $set: getIntermediateSolutionState(problem)
                }
            }
        });
    } else if(type === EventTypes.BEGIN_RUN_CODE) {
        const { problemID } = action as IBeginRunningCodeAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    $merge: {
                        errors: [],
                        output: '',
                        passedAll: false,
                        testResults: {},
                        currentFailedVariableTest: '',
                        passedVariableTests: [],
                    }
                }
            }
        });
    } else if(type === EventTypes.CODE_CHANGED) {
        const { problemID } = action as ICodeChangedAction;
        return update(state, {
            intermediateSolutionState: {
                [problemID]: {
                    $merge: {
                        modified: true,
                    }
                }
            }
        });
    } else {
        return state;
    }
}

function getIntermediateSolutionState(problem: IProblem): ISolutionState {
    const { problemType } = problem.problemDetails;
    if(problemType === 'code') {
        return {
            modified: false,
            files: [],
            errors: [],
            output: '',
            passedAll: false,
            testResults: {},
            passedVariableTests: [],
            currentFailedVariableTest: '',
            currentActiveHelpSession: '',
        };
    } else {
        // throw new Error(`No way to get solution state object for problem type ${problemType}`)
        return null;
    }
}
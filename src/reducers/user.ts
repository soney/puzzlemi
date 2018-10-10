import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';
import uuid from '../utils/uuid';

export interface IUser {
    isAdmin: boolean;
    id: string;
    solutions: { [problemID: string]: {
        modified: boolean,
        code: string,
        errors: string[],
        files: Array<{
                contents: string,
                name: string
            }>,
        output: string,
        passedAll: boolean,
        testResults: {
            [testID: string]: {
                passed: boolean,
                message: string
            }
        }
    }}
}
const defaultUser: IUser = {
    id: uuid(),
    isAdmin: false,
    solutions: {}
};

export const user = (state: IUser = defaultUser, action: any) => {
    if(action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        const { problems } = puzzles;
        const solutions = {};
        problems.forEach((problem) => {
            const { id, givenCode } = problem;
            solutions[id] = { code: givenCode, errors: [], modified: false, files: [], output: '', passedAll: false, testResults: {} };
        })
        return update(state, {
            solutions: { $merge: solutions }
        });
    } else if(action.type === EventTypes.PROBLEM_ADDED) {
        const { problem } = action;
        const { id } = problem;
        return update(state, {
            solutions: { 
                [id]: {
                    $set: {
                        code: problem.givenCode,
                        errors: [],
                        files: [],
                        modified: false,
                        output: '',
                        passedAll: false,
                        testResults: {}
                    }
                }
            }
        });
    } else if(action.type === EventTypes.SET_IS_ADMIN) {
        return update(state, { isAdmin: { $set: action.isAdmin }});
    } else if(action.type === EventTypes.GIVEN_CODE_CHANGED) {
        const { id, code } = action;
        const solution = state.solutions[id];
        const { modified } = solution;
        if(modified) {
            return state;
        } else {
            return update(state, {
                solutions: {
                    [id]: {
                        code: { $set: code}
                    }
                }
            });
        }
    } else if(action.type === EventTypes.OUTPUT_CHANGED) {
        const { id, output } = action;
        return update(state, {
            solutions: {
                [id]: {
                    output: { $set: output }
                }
            }
        });
    } else if(action.type === EventTypes.CODE_CHANGED) {
        const { id, code, modified } = action;
        return update(state, {
            solutions: {
                [id]: {
                    code: { $set: code },
                    modified: { $set: modified },
                    passedAll: { $set: false }
                }
            }
        });
    } else if(action.type === EventTypes.BEGIN_RUN_CODE) {
        const { id } = action;
        return update(state, {
            solutions: {
                [id]: {
                    errors: { $set: [] },
                    passedAll: { $set: false },
                    testResults: { $set: {} },
                }
            }
        });
    } else if(action.type === EventTypes.DELETE_USER_FILE) {
        const { problemId, name } = action;
        const files = state.solutions[problemId].files;
        const fIndex = files.findIndex((f) => f.name === name);
        if(fIndex >= 0) {
            return update(state, {
                solutions: {
                    [problemId]: {
                        files: {$splice: [[fIndex, 1]]}
                    }
                }
            });
        } else {
            return state;
        }
    } else if(action.type === EventTypes.FILE_WRITTEN) {
        const { id, name, contents } = action;
        const files = state.solutions[id].files;
        const fIndex = files.findIndex((f) => f.name === name);
        if(fIndex < 0) {
            return update(state, {
                solutions: {
                    [id]: {
                        files: {
                            $push: [{ name, contents }]
                        }
                    }
                }
            });
        } else {
            return update(state, {
                solutions: {
                    [id]: {
                        files: {
                            [fIndex]: {
                                contents: {$set: contents}
                            }
                        }
                    }
                }
            });
        }
    } else if(action.type === EventTypes.ERROR_CHANGED) {
        const { id, errors } = action;
        return update(state, {
            solutions: {
                [id]: {
                    errors: { $set: errors }
                }
            }
        });
    } else if(action.type === EventTypes.DONE_RUNNING_CODE) {
        const { id, passedAll, testResults } = action;
        return update(state, {
            solutions: {
                [id]: {
                    passedAll: { $set: passedAll },
                    testResults:{ $set: testResults },
                }
            }
        });
    } else if(action.type === EventTypes.TEST_ADDED || action.type === EventTypes.TEST_PART_CHANGED || action.type === EventTypes.TEST_DELETED) {
        const { id } = action;
        return update(state, {
            solutions: {
                [id]: {
                    passedAll: { $set: false }
                }
            }
        });
    } else {
        return state;
    }
}
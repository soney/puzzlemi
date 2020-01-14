import EventTypes from '../actions/EventTypes';
import store from 'storejs';
import update from 'immutability-helper';
import uuid from '../utils/uuid';
import { IUser, ISolution, IResult } from '../components/App';

const defaultID = uuid();

const defaultUser: IUser = store.get('user') || {
    // const defaultUser: IUser =  {

    id: defaultID,
    userInfo: {
        loggedIn: false,
        username: 'ANON-' + defaultID.slice(-3),
        email: '',
        isInstructor: false
    },
    isAdmin: false,
    solutions: {},
};

const defaultResult: IResult = {
    errors: [],
    output: '',
    passedAll: -1,
    results: [],
}

function updateStore(u: IUser): void {
    store.set('user', u);
}

export const user = (state: IUser = defaultUser, action: any) => {
    if (action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        const { problems } = puzzles;
        let solutions = {};
        problems.forEach((problem) => {
            const { id, givenCode } = problem;
            if (!state.solutions || !state.solutions[id]) {
                const newSolution: ISolution = {
                    code: givenCode,
                    modified: false,
                    files: [],
                    testResults: {},
                    defaultResult: defaultResult,
                    passedAllTests: -1,
                    activeFailedTestID: ''
                }
                solutions[id] = newSolution;
            }
        })
        return update(state, {
            solutions: { $merge: solutions }
        });
    } else if (action.type === EventTypes.PROBLEM_ADDED) {
        const { problem } = action;
        const { id } = problem;
        return update(state, {
            solutions: {
                [id]: {
                    $set: {
                        code: problem.givenCode,
                        modified: false,
                        files: [],
                        testResults: {},
                        defaultResult: defaultResult,
                        passedAllTests: -1,
                        activeFailedTestID: ''
                    }
                }
            }
        });
    } else if (action.type === EventTypes.SET_IS_ADMIN) {
        const newState = update(state, { isAdmin: { $set: action.isAdmin } });
        updateStore(newState);
        return newState;
    } else if (action.type === EventTypes.SET_USER) {
        const newState = update(state, { userInfo: { $set: action.user } });
        updateStore(newState);
        return newState;
    } else if (action.type === EventTypes.GIVEN_CODE_CHANGED) {
        const { id, code } = action;
        const solution = state.solutions[id];
        const { modified } = solution;
        if (modified) {
            return state;
        } else {
            return update(state, {
                solutions: {
                    [id]: {
                        code: { $set: code }
                    }
                }
            });
        }
    } else if (action.type === EventTypes.OUTPUT_CHANGED) {
        const { id, output } = action;
        return update(state, {
            solutions: {
                [id]: {
                    defaultResult: {
                        output: { $set: output }
                    }
                }
            }
        });
    } else if (action.type === EventTypes.TESTS_OUTPUT_CHANGED) {
        const { id, output, testID } = action;
        return update(state, {
            solutions: {
                [id]: {
                    testResults: {
                        [testID]: {
                            output: { $set: output }
                        }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.CODE_CHANGED) {
        const { id, code, modified } = action;
        const newState = update(state, {
            solutions: {
                [id]: {
                    code: { $set: code },
                    modified: { $set: modified },
                    defaultResult: { $set: defaultResult },
                    testResults: { $set: {} },
                    passedAllTests: { $set: -1 },
                }
            }
        })
        updateStore(newState);
        return newState;
    } else if (action.type === EventTypes.BEGIN_RUN_CODE) {
        const { id } = action;
        return update(state, {
            solutions: {
                [id]: {
                    testResults: {$set: {}},
                    passedAllTests: {$set: -1},
                    defaultResult: { $set: defaultResult },
                    activeFailedTestID: { $set: '' },
                    // targetID: {$set: ''}
                }
            }
        });
    } else if (action.type === EventTypes.BEGIN_RUN_TESTS) {
        const { id } = action;
        return update(state, {
            solutions: {
                [id]: {
                    testResults: { $set: {} },
                    defaultResult: {$set: defaultResult },
                    passedAllTests: { $set: -1 },
                    activeFailedTestID: { $set: '' }
                }
            }
        })
    } else if (action.type === EventTypes.BEGIN_RUN_TEST) {
        const { id, testID } = action;
        let testResults = {};

        if (!state.solutions[id].testResults[testID]) {
            testResults[testID] = defaultResult;
        }
        return update(state, {
            solutions: {
                [id]: {
                    testResults: { $merge: testResults }
                }
            }
        })
    } else if (action.type === EventTypes.DELETE_USER_FILE) {
        const { problemId, name } = action;
        const files = state.solutions[problemId].files;
        const fIndex = files.findIndex((f) => f.name === name);
        if (fIndex >= 0) {
            return update(state, {
                solutions: {
                    [problemId]: {
                        files: { $splice: [[fIndex, 1]] }
                    }
                }
            });
        } else {
            return state;
        }
    } else if (action.type === EventTypes.FILE_WRITTEN) {
        const { id, name, contents } = action;
        const files = state.solutions[id].files;
        const fIndex = files.findIndex((f) => f.name === name);
        if (fIndex < 0) {
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
                                contents: { $set: contents }
                            }
                        }
                    }
                }
            });
        }
    } else if (action.type === EventTypes.ERROR_CHANGED) {
        const { id, errors } = action;
        return update(state, {
            solutions: {
                [id]: {
                    defaultResult: {
                        errors: { $set: errors }
                    }
                }
            }
        });
    } else if (action.type === EventTypes.TESTS_ERROR_CHANGED) {
        const { id, testID, errors } = action;
        return update(state, {
            solutions: {
                [id]: {
                    testResults: {
                        [testID]: {
                            errors: { $set: errors }
                        }
                    }
                }
            }
        })
    } 
    else if (action.type === EventTypes.DONE_RUNNING_TESTS) {
        const { id, passedAll } = action;
        return update(state, {
            solutions: {
                [id]: {
                    passedAllTests: { $set: passedAll }
                }
            }
        });
    } else if (action.type === EventTypes.DONE_RUNNING_TEST) {
        const { id, testID, results, passedAll } = action;
        return update(state, {
            solutions: {
                [id]: {
                    testResults: {
                        [testID]: {
                            passedAll: { $set: passedAll },
                            results: { $set: results }
                        }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.DONE_RUNNING_CODE) {
        const { id, passedAll, results } = action;
        return update(state, {
            solutions: {
                [id]: {
                    defaultResult: {
                        passedAll: { $set: passedAll },
                        results: { $set: results },
                    }
                }
            }
        })
    } else if (action.type === EventTypes.TEST_ADDED || action.type === EventTypes.TEST_PART_CHANGED || action.type === EventTypes.TEST_DELETED) {
        const { id } = action;
        return update(state, {
            solutions: {
                [id]: {
                    passedAllTests: { $set: -1 },
                    testResults: { $set: {} },
                }
            }
        });
    } else if (action.type === EventTypes.UPDATE_ACTIVE_FAILED_TEST_ID) {
        const { problemID, testID } = action;
        return update(state, {
            solutions: {
                [problemID]: {
                    activeFailedTestID: { $set: testID }
                }
            }
        });
    }
    else {
        return state;
    }
}
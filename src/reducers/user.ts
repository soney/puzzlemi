import EventTypes from '../actions/EventTypes';
import store from 'storejs';
import update from 'immutability-helper';
import uuid from '../utils/uuid';
import { IUser } from '../components/App';

const defaultUser: IUser = store.get('user') || {
    id: uuid(),
    isAdmin: false,
    solutions: {},
};

function updateStore(u: IUser): void {
    store.set('user', u);
}

export const user = (state: IUser = defaultUser, action: any) => {
    if(action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        const { problems } = puzzles;
        let solutions = {};
        problems.forEach((problem) => {
            const { id, givenCode } = problem;
            if(!state.solutions || !state.solutions[id]) {
                solutions[id] = { code: givenCode, errors: [], modified: false, files: [], output: '', passedAll: false, testResults: {}, targetID: '' };
            }
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
                        defaultPass: false,
                        testResults: {},
                        // targetID: ''
                    }
                }
            }
        });
    } else if(action.type === EventTypes.SET_IS_ADMIN) {
        const newState = update(state, { isAdmin: { $set: action.isAdmin }});
        updateStore(newState);
        return newState;
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
        const newState = update(state, {
            solutions: {
                [id]: {
                    code: { $set: code },
                    modified: { $set: modified },
                    passedAll: { $set: false }
                }
            }
        });
        updateStore(newState);
        return newState;
    } else if(action.type === EventTypes.BEGIN_RUN_CODE) {
        const { id } = action;
        return update(state, {
            solutions: {
                [id]: {
                    errors: { $set: [] },
                    output: { $set: '' },
                    passedAll: { $set: false },
                    testResults: { $set: {} },
                    // targetID: {$set: ''}
                }
            }
        });
    } else if(action.type === EventTypes.BEGIN_RUN_TEST) {
        const { id, testID } = action;
        let testResults = {};

        if(!state.solutions[id].testResults[testID]) {           
            testResults[testID] = {passedAll: false, results: []};
        }
        return update(state, {
            solutions: {
                [id]: {
                    testResults: { $merge: testResults }
                }
            }
        })
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
        const { id, passedAll } = action;
        return update(state, {
            solutions: {
                [id]: {
                    passedAll: { $set: passedAll }
                }
            }
        });
    } else if(action.type === EventTypes.DONE_RUNNING_DEFAULT) {
        const { id, defaultPass } = action;
        return update(state, {
            solutions: {
                [id]: {
                    defaultPass: {$set: defaultPass},
                    testResults: {$set: {}},
                    passedAll: {$set: false}
                }
            }
        })
    } else if(action.type === EventTypes.TEST_ADDED || action.type === EventTypes.TEST_PART_CHANGED || action.type === EventTypes.TEST_DELETED) {
        const { id } = action;
        return update(state, {
            solutions: {
                [id]: {
                    passedAll: { $set: false }
                }
            }
        });
    } else if(action.type === EventTypes.DONE_RUNNING_TEST) {
        const { id, testID, results, passedAll } = action;
        return update(state, {
            solutions: {
                [id]: {
                    testResults: {
                        [testID]: {
                            passedAll: {$set: passedAll},
                            results: {$set: results}
                        }
                    }
                }
            }
        })
    // } else if(action.type === EventTypes.CHANGE_TARGET_ID){
    //     const {problemID, id} = action;
    //     return update(state, {
    //         solutions: {
    //             [problemID]: {
    //                 targetID: {$set: id}
    //             }    
    //         }
    //     })
    } else {
        return state;
    }
}
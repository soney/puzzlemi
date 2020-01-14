import EventTypes from '../actions/EventTypes';
import store from 'storejs';
import update from 'immutability-helper';
import uuid from '../utils/uuid';
import { IUserInfo } from '../components/App';

export interface IUser {
    isAdmin: boolean;
    id: string;
    userInfo: IUserInfo;
    solutions: { [problemID: string]: ICodeSolution|IMultipleChoiceSolution }
}

export interface IMultipleChoiceSolution {
    selectedItems: number[];
    passedAll: boolean;
}

export interface ICodeSolution {
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
}

const defaultUser: IUser = store.get('user') || {
    id: uuid(),
    userInfo: {
        loggedIn: false,
        name: '',
        email: '',
        isInstructor: false
    },
    name: '',
    email: '',
    isAdmin: false,
    solutions: {}
};

function updateStore(u: IUser): void {
    store.set('user', u);
}

export const user = (state: IUser = defaultUser, action: any) => {
    if(action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        const { problems } = puzzles;
        const solutions = {};
        problems.forEach((problemInfo) => {
            const { id, problem } = problemInfo;
            const { problemType, givenCode } = problem;
            if(!state.solutions || !state.solutions[id]) {
                if(problemType === 'code' ) {
                    solutions[id] = { code: givenCode, errors: [], modified: false, files: [], output: '', passedAll: false, testResults: {} };
                } else if(problemType === 'multiple-choice') {
                    solutions[id] = { selectedItems: [], passedAll: false };
                }
            }
        })
        return update(state, {
            solutions: { $merge: solutions }
        });
    } else if(action.type === EventTypes.PROBLEM_ADDED) {
        const problemInfo = action.problem;
        const { id, problem } = problemInfo;

        const { problemType } = problem;
        if(problemType === 'code') {
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
        } else if(problemType === 'multiple-choice') {
            return update(state, {
                solutions: { 
                    [id]: { $set: { selectedItems: [], passedAll: false } }
                }
            });
        } else {
            return state;
        }
    } else if(action.type === EventTypes.SET_IS_ADMIN) {
        const newState = update(state, { isAdmin: { $set: action.isAdmin }});
        updateStore(newState);
        return newState;
    } else if(action.type === EventTypes.SET_USER) {
        const newState = update(state, { userInfo: { $set: action.user }});
        updateStore(newState);
        return newState;
    } else if(action.type === EventTypes.GIVEN_CODE_CHANGED) {
        const { id, code } = action;
        const solution = state.solutions[id];
        const { modified } = solution as ICodeSolution;
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
                }
            }
        });
    } else if(action.type === EventTypes.DELETE_USER_FILE) {
        const { problemId, name } = action;
        const solution = state.solutions[problemId] as ICodeSolution;
        const { files } = solution;
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
        const solution = state.solutions[id] as ICodeSolution;
        const { files } = solution;
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
        const newState = update(state, {
            solutions: {
                [id]: {
                    passedAll: { $set: passedAll },
                    testResults:{ $set: testResults },
                }
            }
        });
        updateStore(newState);
        return newState;
    } else if(action.type === EventTypes.TEST_ADDED || action.type === EventTypes.TEST_PART_CHANGED || action.type === EventTypes.TEST_DELETED) {
        const { id } = action;
        const newState = update(state, {
            solutions: {
                [id]: {
                    passedAll: { $set: false }
                }
            }
        });
        updateStore(newState);
        return newState;
    } else if(action.type === EventTypes.MULTIPLE_CHOICE_SELECTION_TYPE_CHANGED) {
        const { problemId } = action;
        const newState = update(state, {
            solutions: {
                [problemId]: {
                    selectedItems: { $set: [] }
                }
            }
        });
        updateStore(newState);
        return newState;
    } else if(action.type === EventTypes.MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED) {
        const { problemId, selectedItems } = action;
        const newState = update(state, {
            solutions: {
                [problemId]: {
                    selectedItems: { $set: selectedItems }
                }
            }
        });
        updateStore(newState);
        return newState;
    } else if(action.type === EventTypes.PROBLEM_PASSED_CHANGED) {
        const { problemId, passedAll } = action;
        const newState = update(state, {
            solutions: {
                [problemId]: {
                    passedAll: { $set: passedAll }
                }
            }
        });
        updateStore(newState);
        return newState;
    } else {
        return state;
    }
}
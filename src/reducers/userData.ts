import { IProblemUserInfo } from '../components/App';
import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';

export const userData = (state: { [problemID: string]: IProblemUserInfo } = {}, action: any) => {
    if (action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        if (puzzles) {
            return JSON.parse(JSON.stringify(puzzles.userData));
        } else {
            return {};
        }
    } else if (action.type === EventTypes.PROBLEM_VISIBILITY_CHANGED) {
        const { problemID, visible } = action;
        return update(state, {
            $merge: {
                [problemID]: { visible, completed_default: [], testData: {} }
            }
        });
    } else if (action.type === EventTypes.PROBLEM_COMPLETION_INFO_FETCHED) {
        const { completionInfo, problemID } = action;
        return update(state, {
            [problemID]: { $set: completionInfo }
        });
    } else if (action.type === EventTypes.BEGIN_RUN_CODE) {
        const { id, userID } = action;
        let { completed_default } = state[id];
        const flag = completed_default.indexOf(userID);
        if (flag >= 0) completed_default.splice(flag, 1);
        return update(state, {
            [id]: {
                completed_default: { $set: completed_default }
            }
        })
    } else if (action.type === EventTypes.USER_COMPLETED_PROBLEM_DEFAULT) {
        const { problemID, userID } = action;
        let { completed_default } = state[problemID];
        const flag = completed_default.indexOf(userID);
        const index = flag >= 0 ? completed_default.length : completed_default.length - 1;
        return update(state, {
            [problemID]: {
                completed_default: { $splice: [[index, 0, userID]] }
            }
        });
    } else if (action.type === EventTypes.USER_COMPLETED_PROBLEM_TESTS) {
        const { problemID, userID } = action;
        let { completed_tests } = state[problemID];
        const flag = completed_tests.indexOf(userID);
        const index = flag >= 0 ? completed_tests.length : completed_tests.length - 1;
        return update(state, {
            [problemID]: {
                completed_tests: { $splice: [[index, 0, userID]] }
            }
        });
    } else if (action.type === EventTypes.INIT_TEST_USER_DATA) {
        const { problemID, testID, value } = action;
        return update(state, {
            [problemID]: {
                testData: {
                    [testID]: { $set: value }
                }
            }
        })
    } else if (action.type === EventTypes.UPDATE_TEST_USER_INFO_USER_DATA) {
        const { problemID, testID, userID, value } = action;
        return update(state, {
            [problemID]: {
                testData: {
                    [testID]: {
                        [userID]: {
                            passedAll: { $set: value }
                        }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.INIT_USER_USER_DATA) {
        const { problemID, testID, userID, value } = action;
        return update(state, {
            [problemID]: {
                testData: {
                    [testID]: {
                        [userID]: { $set: value }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.ENABLE_HELP_SESSION) {
        const { problemID, sessionIndex, helpSession } = action;
        return update(state, {
            [problemID]: {
                helpSessions: {
                    [sessionIndex]: { $set: helpSession }
                }
            }
        })
    } else if (action.type === EventTypes.DISABLE_HELP_SESSION) {
        const { problemID, sessionIndex } = action;
        return update(state, {
            [problemID]: {
                helpSessions: { $splice: [[sessionIndex, 1]] }
            }
        })

    } else if (action.type === EventTypes.JOIN_HELP_SESSION) {
        const { problemID, sessionIndex, tutorIndex, tutorID } = action;
        return update(state, {
            [problemID]: {
                helpSessions: {
                    [sessionIndex]: {
                        tutorIDs: { $splice: [[tutorIndex, 0, tutorID]] }
                    }
                }
            }

        })
    } else if (action.type === EventTypes.QUIT_HELP_SESSION) {
        const { problemID, sessionIndex, tutorIndex } = action;
        return update(state, {
            [problemID]: {
                helpSessions: {
                    [sessionIndex]: {
                        tutorIDs: { $splice: [[tutorIndex, 1]] }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.CHANGE_PROBLEM_CONFIG && action.config_item === "runTests") {
        const {problemID} = action;
        return update(state, {
            [problemID]: {
                completed_default: {$set: []},
                completed_tests: {$set: []},
            }
        })
        // } else if(action.type === EventTypes.SHARED_OUTPUT_CHANGED) {
        //     const { id, sessionIndex, output } = action;
        //     return update(state, {
        //         [id]: {
        //             helpSessions: {
        //                 [sessionIndex]: {
        //                     solution:{
        //                         output: {$set: output}
        //                     }
        //                 }
        //             }
        //         }
        //     })
        // } else if (action.type === EventTypes.SHARED_FILE_WRITTEN) {
        //     const { id, sessionIndex, name, contents } = action;
        //     const files = state[id].helpSessions[sessionIndex].solution.files;
        //     const fIndex = files.findIndex((f) => f.name === name);
        //     if(fIndex < 0) {
        //         return update(state, {
        //             [id]: {
        //                 'helpSessions': {
        //                     [sessionIndex]: {
        //                         'solution':{
        //                             files: {
        //                                 $push: [{ name, contents }]
        //                             }        
        //                         }
        //                     }
        //                 }
        //             }
        //         });
        //     } else {
        //         return update(state, {
        //             [id]: {
        //                 'helpSessions': {
        //                     [sessionIndex]: {
        //                         'solution': {
        //                             files: {
        //                                 [fIndex]: {
        //                                     contents: {$set: contents}
        //                                 }
        //                             }        
        //                         }
        //                     }
        //                 }
        //             }
        //         });
        //     }

        // } else if(action.type === EventTypes.BEGIN_RUN_SHARED_CODE) {
        //     const { id, sessionIndex } = action;
        //     return update(state, {
        //         [id]: {
        //             'helpSessions': {
        //                 [sessionIndex]: {
        //                     'solution': {
        //                         testResults: { $set: {} },        
        //                     }
        //                 }
        //             }
        //         }
        //     });
        // } else if(action.type === EventTypes.DONE_RUNNING_SHARED_CODE) {
        //     const { id, passedAll, sessionIndex, testResults } = action;
        //     return update(state, {
        //         [id]:{
        //             'helpSessions': {
        //                 [sessionIndex]: {
        //                     'solution': {
        //                         passedAll: { $set: passedAll },
        //                         testResults:{ $set: testResults },        
        //                     }
        //                 }
        //             }
        //         }
        //     });
        // } else if(action.type === EventTypes.SHARED_ERROR_CHANGED) {
        //     const { id, sessionIndex, errors } = action;
        //     return update(state, {
        //         [id]: {
        //             'helpSessions': {
        //                 [sessionIndex]: {
        //                     'solution': {
        //                         errors: { $set: errors }
        //                     }
        //                 }
        //             }
        //         }
        //     });
    }
    else {
        return state;
    }
}
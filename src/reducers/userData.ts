import { IProblemUserInfo } from '../components/App';
import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';

export const userData = (state: {[problemID: string]: IProblemUserInfo} = {}, action: any) => {
    if(action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        if(puzzles) {
            return JSON.parse(JSON.stringify(puzzles.userData));
        } else {
            return {};
        }
    } else if(action.type === EventTypes.PROBLEM_VISIBILITY_CHANGED) {
        const { problemID, visible } = action;
        return update(state, { $merge: {
                [problemID]: { visible, completed: [] }
            }
        });
    } else if(action.type === EventTypes.PROBLEM_COMPLETION_INFO_FETCHED) {
        const { completionInfo, problemID } = action;
        return update(state, {
            [problemID]: { $set: completionInfo }
        });
    } else if(action.type === EventTypes.USER_COMPLETED_PROBLEM) {
        const { index, problemID, userID } = action;
        return update(state, {
            [problemID]: {
                completed: { $splice: [[index, 0, userID]] }
            }
        });
    } else if(action.type === EventTypes.ENABLE_HELP_SESSION) {
        const { problemID, sessionIndex, helpSession } = action;
        return update(state, {
            [problemID]:{
                helpSessions: {
                    [sessionIndex]: { $set: helpSession }
                }
            }
        })
    } else if(action.type === EventTypes.DISABLE_HELP_SESSION) {
        const { problemID, sessionIndex } = action;
        return update(state, {
            [problemID]: {
                helpSessions: {$splice: [[sessionIndex, 1]]}
            }
        })

    } else if(action.type === EventTypes.JOIN_HELP_SESSION) {
        const { problemID, sessionIndex, tutorIndex, tutorID } = action;
        return update(state, {
            [problemID]:{
                helpSessions:{
                    [sessionIndex]:{
                        tutorIDs: {$splice: [[tutorIndex, 0, tutorID]]}
                    }
                }
            }

        })
    } else if(action.type === EventTypes.QUIT_HELP_SESSION) {
        const { problemID, sessionIndex, tutorIndex } = action;
        return update(state, {
            [problemID]: {
                helpSessions: {
                    [sessionIndex]: {
                        tutorIDs: {$splice: [[tutorIndex, 1]]}
                    }
                }
            }
        })
    } else if(action.type === EventTypes.SHARED_OUTPUT_CHANGED) {
        const { id, sessionIndex, output } = action;
        return update(state, {
            [id]: {
                helpSessions: {
                    [sessionIndex]: {
                        solution:{
                            output: {$set: output}
                        }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.SHARED_FILE_WRITTEN) {
        const { id, sessionIndex, name, contents } = action;
        const files = state[id].helpSessions[sessionIndex].solution.files;
        const fIndex = files.findIndex((f) => f.name === name);
        if(fIndex < 0) {
            return update(state, {
                [id]: {
                    'helpSessions': {
                        [sessionIndex]: {
                            'solution':{
                                files: {
                                    $push: [{ name, contents }]
                                }        
                            }
                        }
                    }
                }
            });
        } else {
            return update(state, {
                [id]: {
                    'helpSessions': {
                        [sessionIndex]: {
                            'solution': {
                                files: {
                                    [fIndex]: {
                                        contents: {$set: contents}
                                    }
                                }        
                            }
                        }
                    }
                }
            });
        }

    } else if(action.type === EventTypes.BEGIN_RUN_SHARED_CODE) {
        const { id, sessionIndex } = action;
        return update(state, {
            [id]: {
                'helpSessions': {
                    [sessionIndex]: {
                        'solution': {
                            errors: { $set: [] },
                            output: { $set: '' },
                            passedAll: { $set: false },
                            testResults: { $set: {} },        
                        }
                    }
                }
            }
        });
    } else if(action.type === EventTypes.DONE_RUNNING_SHARED_CODE) {
        const { id, passedAll, sessionIndex, testResults } = action;
        return update(state, {
            [id]:{
                'helpSessions': {
                    [sessionIndex]: {
                        'solution': {
                            passedAll: { $set: passedAll },
                            testResults:{ $set: testResults },        
                        }
                    }
                }
            }
        });
    } else if(action.type === EventTypes.SHARED_ERROR_CHANGED) {
        const { id, sessionIndex, errors } = action;
        return update(state, {
            [id]: {
                'helpSessions': {
                    [sessionIndex]: {
                        'solution': {
                            errors: { $set: errors }
                        }
                    }
                }
            }
        });
    }
    else {
        return state;
    }
}
import EventTypes from '../actions/EventTypes';
import { IProblem } from '../components/App';
import update from 'immutability-helper';

export const problems = (state: IProblem[] = [], action: any) => {
    if(action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        if(puzzles) {
            return JSON.parse(JSON.stringify([...puzzles.problems]));
        } else {
            return [];
        }
    } else if(action.type === EventTypes.PROBLEM_ADDED) {
        const { index, problem } = action;
        return update(state,  { $splice: [[index, 0, problem]] } );
    } else if(action.type === EventTypes.PROBLEM_DELETED) {
        const { index } = action;
        return update(state, { $splice: [[index, 1]] } );
    } else if(action.type === EventTypes.DESCRIPTION_CHANGED) {
        const { index, description } = action;
        return update(state, {
            [index]: {
                problem: {
                    description: { $set: description }
                }
            }
        });
    } else if(action.type === EventTypes.GIVEN_CODE_CHANGED) {
        const { index, code } = action;
        return update(state, {
            [index]: {
                problem: {
                    givenCode: { $set: code }
                }
            }
        });
    } else if(action.type === EventTypes.AFTER_CODE_CHANGED) {
        const { index, code } = action;
        return update(state, {
            [index]: {
                problem: {
                    afterCode: { $set: code }
                }
            }
        });
    } else if(action.type === EventTypes.TEST_ADDED) {
        const { index, test, testIndex } = action;
        return update(state, {
            [index]: {
                problem: {
                    tests: {$splice: [[testIndex, 0, test]]}
                }
            }
        });
    } else if(action.type === EventTypes.TEST_PART_CHANGED) {
        const { index, testIndex, part, value } = action;
        return update(state, {
            [index]: {
                problem: {
                    tests: {
                        [testIndex]: {
                            [part]: { $set: value }
                        }
                    }
                }
            }
        });
    } else if(action.type === EventTypes.TEST_DELETED) {
        const { index, testIndex } = action;
        return update(state, {
            [index]: {
                problem: {
                    tests: {$splice: [[testIndex, 1]]}
                }
            }
        });
    } else if(action.type === EventTypes.FILE_ADDED) {
        const { index, file, fileIndex } = action;
        return update(state, {
            [index]: {
                problem: {
                    files: {$splice: [[fileIndex, 0, file]]}
                }
            }
        });
    } else if(action.type === EventTypes.FILE_PART_CHANGED) {
        const { index, fileIndex, part, value } = action;
        return update(state, {
            [index]: {
                problem: {
                    files: {
                        [fileIndex]: {
                            [part]: { $set: value }
                        }
                    }
                }
            }
        });
    } else if(action.type === EventTypes.FILE_DELETED) {
        const { index, fileIndex } = action;
        return update(state, {
            [index]: {
                problem: {
                    files: {$splice: [[fileIndex, 1]]}
                }
            }
        });
    } else if(action.type === EventTypes.OPTION_ADDED) {
        const { index, optionIndex, option } = action;
        return update(state, {
            [index]: {
                problem: {
                    options: {$splice: [[optionIndex, 0, option]]}
                }
            }
        });
    } else if(action.type === EventTypes.OPTION_DELETED) {
        const { index, optionIndex } = action;
        return update(state, {
            [index]: {
                problem: {
                    options: {$splice: [[optionIndex, 1]]}
                }
            }
        });
    } else if(action.type === EventTypes.OPTION_DESCRIPTION_CHANGED) {
        const { index, optionIndex, description } = action;
        return update(state, {
            [index]: {
                problem: {
                    options: {
                        [optionIndex]: {
                            description: { $set: description }
                        }
                    }
                }
            }
        });
    } else if(action.type === EventTypes.MULTIPLE_CHOICE_SELECTION_TYPE_CHANGED) {
        const { index, selectionType } = action;
        return update(state, {
            [index]: {
                problem: {
                    selectionType: {$set: selectionType}
                }
            }
        });
    } else if(action.type === EventTypes.OPTION_CORRECTNESS_CHANGED) {
        const { index, optionIndex, isCorrect } = action;
        return update(state, {
            [index]: {
                problem: {
                    options: {
                        [optionIndex]: {
                            isCorrect: {$set: isCorrect}
                        }
                    }
                }
            }
        });
    } else if(action.type === EventTypes.MULTIPLE_CHOICE_REVEAL_SOLUTION_CHANGED) {
        const { index, revealSolution } = action;
        return update(state, {
            [index]: {
                problem: {
                    revealSolution: {$set: revealSolution}
                }
            }
        });
    } else {
        return state;
    }
}
import EventTypes from '../actions/EventTypes';
import { IProblem } from '../utils/types';
import update from 'immutability-helper';

export const problems = (state: IProblem[] = [], action: any) => {
    if (action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        if (puzzles) {
            return JSON.parse(JSON.stringify([...puzzles.problems]));
        } else {
            return [];
        }
    } else if (action.type === EventTypes.PROBLEM_ADDED) {
        const { index, problem } = action;
        return update(state, { $splice: [[index, 0, problem]] });
    } else if (action.type === EventTypes.PROBLEM_DELETED) {
        const { index } = action;
        return update(state, { $splice: [[index, 1]] });
    } else if (action.type === EventTypes.DESCRIPTION_CHANGED) {
        const { index, description } = action;
        return update(state, {
            [index]: {
                description: { $set: description }
            }
        });
    } else if (action.type === EventTypes.NOTES_CHANGED) {
        const { index, notes } = action;
        return update(state, {
            [index]: {
                notes: {$set: notes}
            }
        });
    } else if (action.type === EventTypes.GIVEN_CODE_CHANGED) {
        const { index, code } = action;
        return update(state, {
            [index]: {
                givenCode: { $set: code }
            }
        });
    } else if (action.type === EventTypes.AFTER_CODE_CHANGED) {
        const { index, code } = action;
        return update(state, {
            [index]: {
                afterCode: { $set: code }
            }
        });
    } else if (action.type === EventTypes.STANDARD_CODE_CHANGED) {
        const { index, code } = action;
        return update(state, {
            [index]: {
                standardCode: { $set: code }
            }
        })
    } else if (action.type === EventTypes.TEST_ADDED) {
        const { index, test, testIndex } = action;
        return update(state, {
            [index]: {
                tests: { $splice: [[testIndex, 0, test]] }
            }
        });
    } else if (action.type === EventTypes.TEST_PART_CHANGED) {
        const { index, testIndex, partType, partValue } = action;
        return update(state, {
            [index]: {
                tests: {
                    [testIndex]: {
                        [partType]: { $set: partValue }
                    }
                }
            }
        });
    } else if (action.type === EventTypes.TEST_VALUE_CHANGED) {
        const { index, testIndex, variableType, variableIndex, variableValue } = action;
        return update(state, {
            [index]: {
                tests: {
                    [testIndex]: {
                        [variableType]: {
                            [variableIndex]: {
                                value: { $set: variableValue }
                            }
                        }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.TEST_STATUS_CHANGED) {
        const { index, testIndex, value } = action;
        return update(state, {
            [index]: {
                tests: {
                    [testIndex]: {
                        verified: { $set: value }
                    }
                }
            }
        })

    } else if (action.type === EventTypes.TEST_DELETED) {
        const { index, testIndex } = action;
        return update(state, {
            [index]: {
                tests: { $splice: [[testIndex, 1]] }
            }
        });
    } else if (action.type === EventTypes.VARIABLE_ADDED) {
        const { index, variable, variableIndex } = action;
        return update(state, {
            [index]: {
                variables: { $splice: [[variableIndex, 0, variable]] }
            }
        });
    } else if (action.type === EventTypes.VARIABLE_DELETED) {
        const { index, variableIndex } = action;
        return update(state, {
            [index]: {
                variables: { $splice: [[variableIndex, 1]] }
            }
        });
    } else if (action.type === EventTypes.VARIABLE_PART_CHANGED) {
        const { index, variableIndex, part, value } = action;
        return update(state, {
            [index]: {
                variables: {
                    [variableIndex]: {
                        [part]: { $set: value }
                    }
                }
            }
        })
    } else if (action.type === EventTypes.FILE_ADDED) {
        const { index, file, fileIndex } = action;
        return update(state, {
            [index]: {
                files: { $splice: [[fileIndex, 0, file]] }
            }
        });
    } else if (action.type === EventTypes.FILE_PART_CHANGED) {
        const { index, fileIndex, part, value } = action;
        return update(state, {
            [index]: {
                files: {
                    [fileIndex]: {
                        [part]: { $set: value }
                    }
                }
            }
        });
    } else if (action.type === EventTypes.FILE_DELETED) {
        const { index, fileIndex } = action;
        return update(state, {
            [index]: {
                files: { $splice: [[fileIndex, 1]] }
            }
        });
    } else if (action.type === EventTypes.CHANGE_PROBLEM_CONFIG) {
        const { index, config_item, config_value } = action;
        return update(state, {
            [index]: {
                config: {
                    [config_item]: { $set: config_value }
                }
            }
        });
    } else {
        return state;
    }
}
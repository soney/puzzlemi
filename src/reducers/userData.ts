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
        const { index, problemID, userID, completed } = action;
        if(completed) {
            return update(state, {
                [problemID]: {
                    completed: { $splice: [[index, 0, userID]] }
                }
            });
        } else {
            return update(state, {
                [problemID]: {
                    completed: { $splice: [[index, 1]] }
                }
            });
        }
    } else {
        return state;
    }
}
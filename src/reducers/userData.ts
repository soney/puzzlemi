import { IPuzzleSet } from '../components/App';
import { SDBDoc } from 'sdb-ts';
import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';

export const userData = (state: SDBDoc<IPuzzleSet>|null = null, action: any) => {
    if(action.type === EventTypes.PUZZLES_FETCHED) {
        const { puzzles } = action;
        if(puzzles) {
            return JSON.parse(JSON.stringify(puzzles.userData));
        } else {
            return {};
        }
    } else if(action.type === EventTypes.PROBLEM_VISIBILITY_CHANGED) {
        const { problemID, visible } = action;
        return update(state, {
            [problemID]: {
                visible: { $set: visible }
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
    } else {
        return state;
    }
}
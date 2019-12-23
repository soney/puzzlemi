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
                [problemID]: { visible, completed: [], testData: {} }
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
    } else if(action.type === EventTypes.BEGIN_RUN_CODE){
        const { id } = action;
        const testData = {};
        if(!state[id]) {          
            testData[id] = {};
        }
        return update(state, {
            [id]: {
                testData: {$merge: testData}
            }
        });
    } else if(action.type === EventTypes.BEGIN_RUN_TEST){
        const { id, testID, userID } = action;
        let test = {};
        if(!state[id].testData[testID]){
            test[testID] = {};
            test[testID][userID] = {passedAll: false};
        }
        else if(!state[id].testData[testID][userID]){
            test = state[id].testData[testID];
            test[userID] = {passedAll: false};
        }
        return update(state,{
            [id]: {
                testData: {$merge: test}
            }
        })
    } else if(action.type === EventTypes.DONE_RUNNING_TEST){
        const { id, testID, passedAll, userID } = action;
        return update(state, {
            [id]:{
                testData:{
                    [testID]:{
                        [userID]: {
                            passedAll: {$set: passedAll}
                        }
                    }    
                }
            }
        })
    } else {
        return state;
    }
}
// import { EventTypes } from '../actions'
import { IPuzzleSet } from '../components/App';
import { SDBDoc } from 'sdb-ts';
import { EventTypes } from '../actions';

export const doc = (state: SDBDoc<IPuzzleSet>|null = null, action: any) => {
    if(action.type === EventTypes.SET_DOC) {
        return action.doc;
    } else {
        return state;
    }
}
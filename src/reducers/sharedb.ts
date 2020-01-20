import { SDBDoc } from 'sdb-ts';
import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';
import { IAggregateData } from './aggregateData';
import { ISolutions } from './solutions';
import { IUsers } from './users';
import { ISetDocAction, ISDBDocChangedAction, IProblemsFetchedAction } from '../actions/sharedb_actions';
import { IProblems } from './problems';

export interface ISDBDocsState {
    problems: SDBDoc<IProblems>|null,
    aggregateData: SDBDoc<IAggregateData>|null,
    solutions: SDBDoc<ISolutions>|null,
    users: SDBDoc<IUsers>|null,
    updateCount: number
}

export const shareDBDocs = (state: ISDBDocsState={problems: null, solutions: null, users: null, aggregateData: null, updateCount: 1}, action: ISetDocAction | ISDBDocChangedAction | IProblemsFetchedAction) => {
    const { type } = action;
    if(type === EventTypes.SET_DOC) {
        const { docType, doc } = action as ISetDocAction;
        return update(state, { [docType]: { $set: doc }});
    } else if(type === EventTypes.PROBLEMS_FETCHED) {
        return update(state, { updateCount: { $set: state.updateCount+1 } });
    } else if(type === EventTypes.SDB_DOC_CHANGED) {
        return update(state, { updateCount: { $set: state.updateCount+1 } });
    } else {
        return state;
    }
}
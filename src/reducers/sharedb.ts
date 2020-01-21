import { SDBDoc, ImmutabilityWrapper } from 'sdb-ts';
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
    immutable: {
        problems: ImmutabilityWrapper<IProblems>|null,
        aggregateData: ImmutabilityWrapper<IAggregateData>|null,
        solutions: ImmutabilityWrapper<ISolutions>|null,
        users: ImmutabilityWrapper<IUsers>|null,
    },
    i: {
        problems: IProblems|null,
        aggregateData: IAggregateData|null,
        solutions: ISolutions|null,
        users: IUsers|null
    }
}

export const shareDBDocs = (state: ISDBDocsState={
                     problems: null, aggregateData: null, solutions: null, users: null,
        immutable: { problems: null, aggregateData: null, solutions: null, users: null},
        i:         { problems: null, aggregateData: null, solutions: null, users: null} }
    , action: ISetDocAction | ISDBDocChangedAction | IProblemsFetchedAction) => {
    const { type } = action;
    if(type === EventTypes.SET_DOC) {
        const { docType, doc } = action as ISetDocAction;
        state = update(state, { [docType]: { $set: doc }});
        return update(state, { immutable: { [docType]: { $set: new ImmutabilityWrapper<any>(doc) }}});
    } else if(type === EventTypes.PROBLEMS_FETCHED) {
        return state;
    } else if(type === EventTypes.SDB_DOC_CHANGED) {
        const { docType } = action as ISDBDocChangedAction;
        const immutableDoc = state.immutable[docType];
        return update(state, { i : { [docType]: { $set: immutableDoc.getData() }}});
    } else {
        return state;
    }
}
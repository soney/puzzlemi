import * as React from 'react';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
import { SDBClient, SDBDoc } from 'sdb-ts';
import Problems from './Problems';
import { setDoc, beginListeningOnDoc } from '../actions/sharedb_actions';
import { setIsAdmin } from '../actions/user_actions';

export interface IPuzzleSet {
    problems: IProblem[]
}

export interface IProblem {
    afterCode: string;
    description: string;
    givenCode: string;
    files: any;
    id: string;
    tests: any;
};

const emptyDoc = { problems: [] };
const PMApplication = ({ isAdmin, dispatch }) => {
    // private ws: WebSocket = new WebSocket(`ws://${window.location.host}`);
    const ws: WebSocket = new WebSocket(`ws://localhost:8000`);
    const sdbClient: SDBClient = new SDBClient(ws);
    const sdbDoc: SDBDoc<IPuzzleSet> = sdbClient.get('puzzles', 'p');
    dispatch(setDoc(sdbDoc));
    sdbDoc.createIfEmpty(emptyDoc).then(() => {
        dispatch(beginListeningOnDoc(sdbDoc));
    });
    window['su'] = () => {
        dispatch(setIsAdmin(true));
    };
    return <div>
        <Problems />
    </div>;
};

export const App = reactRedux.connect()(PMApplication);
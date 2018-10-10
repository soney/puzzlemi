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
    const DEBUG_MODE = window.location.host === 'localhost:3000';
    const wsLocation = DEBUG_MODE ? `ws://localhost:8000` : `ws://${window.location.host}`;
    const puzzleName = DEBUG_MODE ? 'p' : window.location.pathname.slice(1);

    const ws: WebSocket = new WebSocket(wsLocation);
    const sdbClient: SDBClient = new SDBClient(ws);
    const sdbDoc: SDBDoc<IPuzzleSet> = sdbClient.get('puzzles', puzzleName);
    dispatch(setDoc(sdbDoc));
    sdbDoc.createIfEmpty(emptyDoc).then(() => {
        dispatch(beginListeningOnDoc(sdbDoc));
    });
    window['su'] = () => {
        dispatch(setIsAdmin(true));
    };
    window['toJSON'] = () => {
        console.log(JSON.stringify(sdbDoc.getData()));
    };
    window['fromJSON'] = (str: string) => {
        const newData: IPuzzleSet = JSON.parse(str);
        sdbDoc.submitObjectReplaceOp([], newData);
    };
    return <div>
        <Problems />
    </div>;
};

export const App = reactRedux.connect()(PMApplication);
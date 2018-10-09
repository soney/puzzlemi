// import update from 'immutability-helper';
import * as React from 'react';
// import { SDBClient, SDBDoc } from 'sdb-ts';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
// import { addProblem } from '../actions';
import { store } from '..';
import { SDBClient, SDBDoc } from 'sdb-ts';
import { problemAdded, puzzlesFetched, problemDeleted, addProblem, setDoc, setIsAdmin, descriptionChanged, givenCodeChanged, afterCodeChanged, testAdded, testDeleted, testPartChanged, fileAdded, fileDeleted, filePartChanged, beginListeningOnDoc } from '../actions';
import Problems from './Problems';
import { ThunkDispatch } from 'redux-thunk';
// import { Dispatch } from 'redux';

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
        <Problems sdbDoc={this.sdbDoc} />
    </div>;
};


// class PMApplication extends React.Component<IPMApplicationProps, IPMApplicationState> {
//     public constructor(props:IPMApplicationProps, state:IPMApplicationState) {
//         super(props, state);
//         this.state = {
//             isAdmin: !!this.props.isAdmin,
//             problems: []
//         };
//         this.props.dispatch(setIsAdmin(!!this.props.isAdmin));
//         this.sdbDoc = this.sdbClient.get('puzzles', 'p');
//         this.props.dispatch(setDoc(this.sdbDoc));
//     };
//     public render(): React.ReactNode {
//     }
// }

export const App = reactRedux.connect()(PMApplication);
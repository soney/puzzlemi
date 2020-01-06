import * as React from 'react';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
import { ReconnectingWebsocket, SDBClient, SDBDoc } from 'sdb-ts';
import Problems from './Problems';
import { setDoc, beginListeningOnDoc } from '../actions/sharedb_actions';
import { setIsAdmin } from '../actions/user_actions';
import update from 'immutability-helper';
// import { ISolution } from '../reducers/user';

export interface IPuzzleSet {
    problems: IProblem[];
    userData: {
        [problemID: string]: IProblemUserInfo;
    };
}

export interface IHelpSession {
    status: boolean;
    tuteeID: string;
    tutorIDs: string[];
    solution: ISolution;
}

export interface IProblemUserInfo {
    completed: string[];
    visible: boolean;
    testData: {
        [testID: string]: {
            [userID: string]: {
                passedAll: boolean
            }
        }
    },
    helpSessions: IHelpSession[];
}

export interface ITest {
    author: string,
    verified: boolean,
    id: string,
    input: any,
    output: any
    hidden: boolean;
    helpSessions: IHelpSession[];
}

export interface IProblem {
    afterCode: string;
    description: string;
    givenCode: string;
    standardCode: string;
    files: any;
    id: string;
    variables: any;
    tests: ITest[];
};

export interface ISolution {
    modified: boolean,
    code: string,
    errors: string[],
    files: Array<{
        contents: string,
        name: string
    }>,
    output: string,
    passedAll: boolean,
    defaultPass: boolean,
    // targetID: string,
    testResults: {
        [testID: string]: {
            passedAll: boolean,
            results: IOutput[];
        }
    }
}

export interface IUser {
    isAdmin: boolean;
    id: string;
    solutions: { [problemID: string]: ISolution }
}

// export interface IUser {
//     isAdmin: boolean;
//     id: string;
//     solutions: { [problemID: string]: {
//         modified: boolean,
//         code: string,
//         errors: string[],
//         files: Array<{
//                 contents: string,
//                 name: string
//             }>,
//         output: string,
//         passedAll: boolean,
//         defaultPass: boolean,
//         targetID: string,
//         testResults: {
//             [testID: string]: {
//                 passedAll: boolean,
//                 results: IOutput[]; 
//             }
//         }
//     }}
// }

export interface IOutput {
    passed: boolean;
    message: string;
}

const emptyDoc = { problems: [], userData: {} };
const PMApplication = ({ isAdmin, dispatch }) => {
    const DEBUG_MODE = window.location.host === 'localhost:3000';
    const wsLocation = DEBUG_MODE ? `ws://localhost:8000` : `${window.location.protocol === 'http:' ? 'ws' : 'wss'}://${window.location.host}`;
    const puzzleName = DEBUG_MODE ? 'p' : window.location.pathname.slice(1);

    const ws: ReconnectingWebsocket = new ReconnectingWebsocket(wsLocation);
    ws.addListener('close', (ev: CloseEvent) => {
        console.log(ev);
    });
    const sdbClient: SDBClient = new SDBClient(ws);
    const sdbDoc: SDBDoc<IPuzzleSet> = sdbClient.get('puzzles', puzzleName);
    dispatch(setDoc(sdbDoc));
    dispatch(setIsAdmin(isAdmin));
    // dispatch(setName(name!=null?name:'null'));
    sdbDoc.createIfEmpty(emptyDoc).then(() => {
        dispatch(beginListeningOnDoc(sdbDoc));
    });
    window['su'] = () => {
        dispatch(setIsAdmin(true));
    };
    window['toJSON'] = () => {
        console.log(JSON.stringify(update(sdbDoc.getData(), { userData: { $set: {} } })));
    };
    window['fromJSON'] = (str: string) => {
        const newData: IPuzzleSet = JSON.parse(str);
        sdbDoc.submitObjectReplaceOp([], newData);
    };
    return <div>
        <Problems />
        <div className='contact'>
            Contact: <a href='http://from.so/' target='_blank' rel='noopener noreferrer'>Steve Oney</a> (University of Michigan)
        </div>
    </div>;
};

export const App = reactRedux.connect()(PMApplication);
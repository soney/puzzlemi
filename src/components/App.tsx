// import update from 'immutability-helper';
import * as React from 'react';
// import { SDBClient, SDBDoc } from 'sdb-ts';
import '../css/App.scss';
import * as reactRedux from 'react-redux';
// import { addProblem } from '../actions';
import { store } from '..';
import { SDBClient, SDBDoc } from 'sdb-ts';
import { problemAdded, puzzlesFetched, problemDeleted, addProblem, setDoc, setIsAdmin, descriptionChanged, givenCodeChanged, afterCodeChanged, testAdded, testDeleted, testPartChanged, fileAdded, fileDeleted, filePartChanged } from '../actions';
import Problems from './Problems';
import { ThunkDispatch } from 'redux-thunk';
// import { Dispatch } from 'redux';

interface IPMApplicationProps {
    isAdmin?: boolean;
    addProblem?: any;
    dispatch: ThunkDispatch<any, any, any>;
};

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

interface IPMApplicationState {
    isAdmin: boolean;
    problems: IProblem[];
};

class PMApplication extends React.Component<IPMApplicationProps, IPMApplicationState> {
    // private ws: WebSocket = new WebSocket(`ws://${window.location.host}`);
    private ws: WebSocket = new WebSocket(`ws://localhost:8000`);
    private sdbClient: SDBClient = new SDBClient(this.ws);
    private sdbDoc: SDBDoc<IPuzzleSet>;
    public constructor(props:IPMApplicationProps, state:IPMApplicationState) {
        super(props, state);
        this.state = {
            isAdmin: !!this.props.isAdmin,
            problems: []
        };
        window['su'] = () => {
            this.setState({ isAdmin: true });
            this.props.dispatch(setIsAdmin(true));
        };
        this.props.dispatch(setIsAdmin(!!this.props.isAdmin));
        this.sdbDoc = this.sdbClient.get('puzzles', 'p');
        this.props.dispatch(setDoc(this.sdbDoc));
        const emptyDoc = { problems: [] };
        this.sdbDoc.createIfEmpty(emptyDoc).then(() => {
            this.sdbDoc.subscribe((type: string, ops: any[]) => {
                if(type === null) {
                    store.dispatch(puzzlesFetched(this.sdbDoc.getData()));
                } else if (type === 'op') {
                    ops.forEach((op) => {
                        const { p, li, ld } = op;
                        const relPath = SDBDoc.relative(['problems'], p);
                        if(relPath) {
                            if(relPath.length === 1) {
                                const index = relPath[0] as number;
                                if(ld) { store.dispatch(problemDeleted(index)); }
                                if(li) { store.dispatch(problemAdded(index, li)); }
                            } else if(relPath.length === 3) {
                                const index = relPath[0] as number;
                                const item = relPath[1];
                                const problemP = ['problems', index];
                                if(item === 'description') {
                                    const newDescription = this.sdbDoc.traverse([...problemP, item]);
                                    store.dispatch(descriptionChanged(index, newDescription));
                                } else if(item === 'givenCode') {
                                    const newCode = this.sdbDoc.traverse([...problemP, item]);
                                    store.dispatch(givenCodeChanged(index, newCode));
                                } else if(item === 'afterCode') {
                                    const newCode = this.sdbDoc.traverse([...problemP, item]);
                                    store.dispatch(afterCodeChanged(index, newCode));
                                } else if(item === 'tests') {
                                    const { li, ld } = op;
                                    const testIndex = relPath[2] as number;
                                    if(li) {
                                        store.dispatch(testAdded(index, testIndex, li));
                                    } else if(ld) {
                                        store.dispatch(testDeleted(index, testIndex));
                                    }
                                } else if(item === 'files') {
                                    const { li, ld } = op;
                                    const fileIndex = relPath[2] as number;
                                    if(li) {
                                        store.dispatch(fileAdded(index, fileIndex, li));
                                    } else if(ld) {
                                        store.dispatch(fileDeleted(index, fileIndex));
                                    }
                                }
                            } else if(relPath.length === 5) {
                                const index = relPath[0] as number;
                                const item = relPath[1];
                                if(item === 'tests') {
                                    const testIndex = relPath[2] as number;
                                    const testP = ['problems', index, item, testIndex];
                                    const testPart = relPath[3] as 'actual'|'expected'|'description';
                                    const value = this.sdbDoc.traverse([...testP, testPart]);

                                    store.dispatch(testPartChanged(index, testIndex, testPart, value));
                                } else if(item === 'files') {
                                    const fileIndex = relPath[2] as number;
                                    const fileP = ['problems', index, item, fileIndex];
                                    const filePart = relPath[3] as 'name'|'contents';
                                    const value = this.sdbDoc.traverse([...fileP, filePart]);

                                    store.dispatch(filePartChanged(index, fileIndex, filePart, value));
                                }
                            }
                        }
                        console.log(op);
                    });
                }
            });
        });
    };
    public render(): React.ReactNode {
        return <div>
            <Problems sdbDoc={this.sdbDoc} />
            {
                this.state.isAdmin &&
                <div className="container">
                    <button className="btn btn-outline-success btn-sm btn-block" onClick={this.addProblem}>+ Problem</button>
                </div>
            }
        </div>;
    }
    private addProblem = (): void => {
        this.props.dispatch(addProblem());
    }
}

export const App = reactRedux.connect()(PMApplication);
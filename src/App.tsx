// import update from 'immutability-helper';
import * as React from 'react';
import { SDBClient, SDBDoc } from 'sdb-ts';
import './App.css';
import { IPMCodeChangeEvent } from './PMCode';
import { IPMFileContentsChangedEvent, IPMFileDeleteEvent, IPMFileNameChangedEvent } from './PMFile';
import { IPMDescriptionChangeEvent, IPMFileAddedEvent,  IPMTestAddedEvent, PMProblem } from './PMProblem';
import { IPMTestChangedEvent, IPMTestDeleteEvent } from './PMTestDisplay';

export interface ITest {
    actual: string;
    expected: string;
    description: string;
}
export interface IFile {
    contents: string;
    createdByWrite: boolean;
}

export type TestList = ITest[];
export interface IFileList {
    [fname: string]: IFile
};

export interface IProblem {
    afterCode: string;
    description: string;
    givenCode: string;
    tests: TestList;
    files: IFileList;
};

interface IPMApplicationProps {
    isAdmin?: boolean;
};

interface IPMApplicationState {
    isAdmin: boolean;
    problems: IProblem[];
};

export interface IPuzzleSet {
    problems: IProblem[]
}

let mainApp: App;
export class App extends React.Component<IPMApplicationProps, IPMApplicationState> {
    // private ws: WebSocket = new WebSocket(`ws://localhost:8000`);
    private ws: WebSocket = new WebSocket(`ws://${window.location.host}`);
    private sdbClient: SDBClient = new SDBClient(this.ws);
    private sdbDoc: SDBDoc<IPuzzleSet>;
    public constructor(props:IPMApplicationProps, state:IPMApplicationState) {
        super(props, state);
        mainApp = this;
        this.state = {
            isAdmin: !!this.props.isAdmin,
            problems: []
        };
        this.sdbDoc = this.sdbClient.get('puzzles', 'p');
        this.sdbDoc.createIfEmpty({
            problems: []
        });
        this.sdbDoc.subscribe((type: string, ops: any[]) => {
            if(type === null) {
                const data = this.sdbDoc.getData();
                this.setState({ problems: data.problems });
            } else if (type === 'op') {
                ops.forEach((op) => {
                    const { p } = op;
                    const relPath = SDBDoc.relative(['problems'], p);
                    if(relPath) {
                        const data = this.sdbDoc.getData();
                        this.setState({ problems: data.problems });
                    }
                });
            }
        });
    };
    public render(): React.ReactNode {
        const problemDisplays = this.state.problems.map((p, i) => {
            return <div key={i}>
                <PMProblem
                    afterCode={p.afterCode}
                    givenCode={p.givenCode}
                    files={p.files}
                    description={p.description}
                    tests={p.tests}
                    isAdmin={this.state.isAdmin}
                    onDescriptionChange={this.onDescriptionChange.bind(this, i)}
                    onTestAdded={this.onTestAdded.bind(this, i)}
                    onTestChange={this.onTestChange.bind(this, i)}
                    onTestDeleted={this.onTestDeleted.bind(this, i)}
                    onGivenCodeChange={this.onGivenCodeChange.bind(this, i)}
                    onAfterCodeChange={this.onAfterCodeChange.bind(this, i)}
                    onFileAdded={this.onFileAdded.bind(this, i)}
                    onFileNameChange={this.onFileNameChange.bind(this, i)}
                    onFileContentsChange={this.onFileContentsChange.bind(this, i)}
                    onFileDelete={this.onFileDelete.bind(this, i)}
                    onDelete={this.deleteProblem.bind(this, i)}
                />
            </div>;
        });
        return <div>
            {problemDisplays}
            {
                this.state.isAdmin &&
                <div className="container">
                    <button className="btn btn-outline-success btn-sm btn-block" onClick={this.addProblem}>+ Problem</button>
                </div>
            }
        </div>;
    }
    private onDescriptionChange = (i: number, event: IPMDescriptionChangeEvent): void => {
        const { description } = event;
        this.sdbDoc.submitObjectReplaceOp(['problems', i, 'description'], description);
    }
    private onTestAdded = (i: number, index: number, event: IPMTestAddedEvent): void => {
        const { test } = event;
        this.sdbDoc.submitListInsertOp(['problems', i, 'tests', index], test);
    }
    private onTestChange = (i: number, index: number, event: IPMTestChangedEvent): void => {
        const { actual, description, expected } = event;
        this.sdbDoc.submitListReplaceOp(['problems', i, 'tests', index], { actual, description, expected });
    }
    private onTestDeleted = (i: number, index: number, event: IPMTestDeleteEvent): void => {
        this.sdbDoc.submitListDeleteOp(['problems', i, 'tests', index]);
    }
    private onGivenCodeChange = (i: number, event: IPMCodeChangeEvent): void => {
        const { value } = event;
        this.sdbDoc.submitObjectReplaceOp(['problems', i, 'givenCode'], value);
    }
    private onAfterCodeChange = (i: number, event: IPMCodeChangeEvent): void => {
        const { value } = event;
        this.sdbDoc.submitObjectReplaceOp(['problems', i, 'afterCode'], value);
    }
    private onFileAdded = (i: number, event: IPMFileAddedEvent): void => {
        const { file, filename } = event;
        this.sdbDoc.submitObjectInsertOp(['problems', i, 'files', filename], file);
    }
    private onFileNameChange = (i: number, event: IPMFileNameChangedEvent): void => {
        const { oldName, name } = event;
        const oldP = ['problems', i, 'files', oldName];
        const newP = ['problems', i, 'files', name];
        const prevValue = this.sdbDoc.traverse(oldP);
        this.sdbDoc.submitObjectDeleteOp(oldP);
        this.sdbDoc.submitObjectInsertOp(newP, prevValue);
    }
    private onFileContentsChange = (i: number, event: IPMFileContentsChangedEvent): void => {
        const { name, contents } = event;
        this.sdbDoc.submitObjectReplaceOp(['problems', i, 'files', name, 'contents'], contents);
    }
    private onFileDelete = (i: number, event: IPMFileDeleteEvent): void => {
        const { name } = event;
        this.sdbDoc.submitObjectDeleteOp(['problems', i, 'files', name]);
    }
    private addProblem = (): void => {
        this.sdbDoc.submitListPushOp(['problems'], {
            afterCode: '',
            code: `# code here`,
            description: '*no description*',
            files: {},
            tests: [],
        });
        // this.state.problems.push({});
        // this.setState({ problems: this.state.problems });
    }
    private deleteProblem = (index: number): void => {
        this.sdbDoc.submitListDeleteOp(['problems', index]);
        // this.state.problems.splice(index, 1);
        // this.setState({ problems: this.state.problems });
    };
}

window['su'] = () => {
    mainApp.setState({ isAdmin: true});
};
// import update from 'immutability-helper';
import * as React from 'react';
import { SDBClient, SDBDoc } from 'sdb-ts';
import './App.css';
import { IPMDescriptionChangeEvent, IPMTestAddedEvent, PMProblem } from './PMProblem';

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
    code: string;
    description: string;
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

export class App extends React.Component<IPMApplicationProps, IPMApplicationState> {
    private ws: WebSocket = new WebSocket(`ws://localhost:8000`);
    private sdbClient: SDBClient = new SDBClient(this.ws);
    private sdbDoc: SDBDoc<IPuzzleSet>;
    public constructor(props:IPMApplicationProps, state:IPMApplicationState) {
        super(props, state);
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
                        if(relPath.length === 1) {
                            // const index: number = relPath[0] as number;
                            // const { ld, li } = op;

                            const data = this.sdbDoc.getData();
                            // console.log(data);
                            // if(li) {
                            //     this.state.problems.splice(index, 0, li);
                            //     this.setState({ problems: data.problems });
                            // } else if(ld) {
                            //     this.state.problems.splice(index, 1);
                            //     this.setState({ problems: data.problems });
                            // }
                            this.setState({ problems: data.problems });
                            // console.log(data.problems);
                        } else if(relPath.length === 2) {
                            // const [index, field] = relPath;
                            // if(field === 'description') {

                            // }
                            const data = this.sdbDoc.getData();
                            this.setState({ problems: data.problems });
                        }
                        console.log(relPath);
                    }
                });
            }
        });
    };
    public render(): React.ReactNode {
        const problemDisplays = this.state.problems.map((p, i) => {
            return <div key={i}>
                <button className="btn btn-default" onClick={this.deleteProblem.bind(this, i)}>Delete</button>
                <PMProblem
                    afterCode={p.afterCode}
                    code={p.code}
                    files={p.files}
                    description={p.description}
                    tests={p.tests}
                    onDescriptionChange={this.onDescriptionChange.bind(this, i)}
                    onTestAdded={this.onTestAdded.bind(this, i)}
                    isAdmin={this.state.isAdmin}
                />
            </div>;
        });
        return <div>
            {problemDisplays}
            {this.state.isAdmin && <button className="btn btn-default btn-block" onClick={this.addProblem}>+ Problem</button> }
        </div>;
    }
    private onDescriptionChange = (i: number, event: IPMDescriptionChangeEvent): void => {
        const { description } = event;
        this.sdbDoc.submitObjectReplaceOp(['problems', i, 'description'], description);
    }
    private onTestAdded = (i: number, event: IPMTestAddedEvent): void => {
        const { test, index } = event;
        this.sdbDoc.submitListInsertOp(['problems', i, 'tests', index], test);
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
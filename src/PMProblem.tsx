// tslint:disable:ordered-imports
import * as React from "react";
import { IFileList, ITest, TestList, IFile } from './App';
import { PMAssertion, PMAssertEqual } from './pyTests/PMTest';
import { PMTestSuite } from './pyTests/PMTestSuite';
import { PMProblemDescription, IPMProblemDescriptionChangedEvent } from './PMProblemDescription';
import './skulpt/skulpt.min.js';
import './skulpt/skulpt-stdlib.js';

declare var Sk;

import { PMTestDisplay, IPMTestChangedEvent, IPMTestDeleteEvent } from './PMTestDisplay';
import { IPMFileContentsChangedEvent, IPMFileNameChangedEvent, PMFile, IPMFileDeleteEvent } from './PMFile';
import { PMCode, IPMCodeChangeEvent } from './PMCode';

export interface IPMDescriptionChangeEvent {
    description: string;
}
export interface IPMTestAddedEvent {
    test: ITest;
}
export interface IPMFileAddedEvent {
    filename: string;
    file: IFile;
}
export interface IPMProblemDeleteEvent {

}
export interface IPMTest {
    index: number;
    test: ITest;
}

interface IPMProblemProps {
    afterCode: string;
    givenCode: string;
    description: string;
    isAdmin: boolean;
    rerunDelay?: number;
    tests: TestList;
    files: IFileList;
    onDescriptionChange?: (event: IPMDescriptionChangeEvent) => void;
    onTestAdded?: (i: number, event: IPMTestAddedEvent) => void;
    onTestChange?: (i: number, event: IPMTestChangedEvent) => void;
    onTestDeleted?: (i: number, event: IPMTestDeleteEvent) => void;
    onGivenCodeChange?: (event: IPMCodeChangeEvent) => void;
    onCodeChange?: (event: IPMCodeChangeEvent) => void;
    onAfterCodeChange?: (event: IPMCodeChangeEvent) => void;
    onFileAdded?: (event: IPMFileAddedEvent) => void;
    onFileNameChange?: (event: IPMFileNameChangedEvent) => void;
    onFileContentsChange?: (event: IPMFileContentsChangedEvent) => void;
    onFileDelete?: (event: IPMFileDeleteEvent) => void;
    onDelete?: (event: IPMProblemDeleteEvent) => void;
};

interface IPMProblemState {
    afterCode: string;
    code: string;
    givenCode: string;
    hasError: boolean;
    output: string;
    description: string;
    canRun: boolean;
    isAdmin: boolean;
    tests: TestList;
    files: IFileList;
    passedAll: boolean;
};

export class PMProblem extends React.Component<IPMProblemProps, IPMProblemState> {
    public static defaultProps = {
        isAdmin: false,
        rerunDelay: 1000,
    };
    private outputs: string[] = [];
    private rerunTimeout: number;
    private testsDiv: HTMLDivElement;
    private testSuite: PMTestSuite = new PMTestSuite();

    constructor(props:IPMProblemProps, state:IPMProblemState) {
        super(props, state);
        this.state = {
            afterCode: '',
            canRun: true,
            code: this.props.givenCode,
            description: this.props.description,
            files: this.props.files,
            givenCode: this.props.givenCode,
            hasError: false,
            isAdmin: !!this.props.isAdmin,
            output: '',
            passedAll: false,
            tests: this.props.tests
        };

        Sk.configure({
            inputfunTakesPrompt: true,
            jsonpSites : ['https://itunes.apple.com'],
            python3: true,
        });
        // Sk.pre = 'output';
        // Sk.python3 = true;
        // Sk.configure({ output: this.outf, read: builtinRead }); 
        // (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
    };

    public componentDidUpdate(prevProps: IPMProblemProps):void {
        const newState = {};
        ['afterCode', 'givenCode', 'description', 'tests', 'files', 'isAdmin'].forEach((prop: string) => {
            if(this.props[prop] !== prevProps[prop]) {
                newState[prop] = this.props[prop];
            }
        });
        if(Object.keys(newState).length > 0) {
            newState['passedAll'] = false;
            this.setState(newState);
        }
    };

    public render():React.ReactNode {
        const tests: React.ReactNode[] = this.state.tests.map((test, i) => {
            const { actual, expected, description } = test;
            const result = this.testSuite.getLatestResult(i);
            return <PMTestDisplay key={i} canEdit={this.state.isAdmin} onDelete={this.onTestDelete.bind(this, i)} onChange={this.onTestChange.bind(this, i)} actual={actual} expected={expected} description={description} result={result} />;
        });
        const filesout: React.ReactNode[] = Object.keys(this.state.files).map((fname) => {
            const { contents, createdByWrite } = this.state.files[fname];
            return <PMFile onContentsChange={this.onFileContentsChange} onNameChange={this.onFileNameChange} onDelete={this.onFileDelete} key={fname} canEdit={this.state.isAdmin || createdByWrite} filename={fname} contents={contents} />;
        });
        const hasFiles = Object.keys(this.state.files).length > 0;
        return <div className={'problem container' + (this.state.passedAll ? ' passedAll' : '')}>
            {
                this.state.isAdmin &&
                <div className="row">
                    <div className="col">
                        <button className="btn btn-block btn-sm btn-outline-danger" onClick={this.deleteProblem}>Delete Problem</button>
                    </div>
                </div>
            }

            <div className="row">
                <PMProblemDescription canEdit={this.state.isAdmin} description={this.state.description} onChange={this.onDescriptionChange} />
            </div>
            <div className="row">
                <div className="col">
                    { this.state.isAdmin && <PMCode onChange={this.onGivenCodeChange} value={this.state.givenCode} /> }
                    { this.state.isAdmin && <PMCode onChange={this.onAfterCodeChange} value={this.state.afterCode} /> }
                    { !this.state.isAdmin && <PMCode onChange={this.onCodeChange} value={this.state.givenCode} /> }
                    {!this.state.isAdmin && <button disabled={!this.state.canRun} className='btn btn-outline-success btn-sm btn-block' onClick={this.saveAndRun}>Run</button> }
                </div>
                <div className="col">
                    <div className={'codeOutput' + (this.state.hasError ? ' alert alert-danger' : ' no-error')}>{this.state.output}</div>
                    { hasFiles && <hr /> }
                    <div className='files'>
                        {hasFiles && <h4>Files:</h4>}
                        {filesout}
                        {this.state.isAdmin && <button className="btn btn-outline-success btn-sm btn-block" onClick={this.addFile}>+ File</button> }
                    </div>
                </div>
            </div>
            <hr />
            <div className="row">
                <div className="col">
                    <h4>Tests:</h4>
                    {tests}
                    {this.state.isAdmin && <button className="btn btn-outline-success btn-sm btn-block" onClick={this.addTest}>+ Test</button> }
                </div>
            </div>
        </div>
    };

    private onTestChange = (i: number, e: IPMTestChangedEvent): void => {
        // const {actual, description, expected}  = e;
        // this.state.tests[i].actual = actual;
        // this.state.tests[i].description = description;
        // this.state.tests[i].expected = expected;
        // this.setState({ tests: this.state.tests });
        if(this.props.onTestChange) {
            this.props.onTestChange(i, e);
        }
    };

    private onTestDelete = (i: number, e: IPMTestDeleteEvent): void => {
        // this.state.tests.splice(i, 1);
        // this.setState({ tests: this.state.tests });
        if(this.props.onTestDeleted) {
            this.props.onTestDeleted(i, e);
        }
    };

    private onDescriptionChange = (e: IPMProblemDescriptionChangedEvent): void => {
        const { value } = e;
        // this.setState({ problemDescription: value });
        if(this.props.onDescriptionChange) {
            this.props.onDescriptionChange({ description: value });
        }
    }
    private onGivenCodeChange = (e: IPMCodeChangeEvent): void => {
        // this.setState({ code: e.value });
        if(this.props.onGivenCodeChange) {
            this.props.onGivenCodeChange(e);
        }
    }
    private onCodeChange = (e: IPMCodeChangeEvent): void => {
        this.setState({ code: e.value });
        if(this.props.onCodeChange) {
            this.props.onCodeChange(e);
        }
    }
    private onAfterCodeChange = (e: IPMCodeChangeEvent): void => {
        // this.setState({ codeAfter: e.value });
        if(this.props.onAfterCodeChange) {
            this.props.onAfterCodeChange(e);
        }
    }
    private onFileContentsChange = (e: IPMFileContentsChangedEvent): void => {
        if(this.state.isAdmin) {
            if(this.props.onFileContentsChange) {
                this.props.onFileContentsChange(e);
            }
        } else {
            const { name, contents } = e;
            this.state.files[name].contents = contents;
            this.setState({ files: this.state.files });
        }
    }
    private onFileNameChange = (e: IPMFileNameChangedEvent): void => {
        if(this.state.isAdmin) {
            if(this.props.onFileNameChange) {
                this.props.onFileNameChange(e);
            }
        } else {
            const {oldName, name} = e;
            if(!this.state.files.hasOwnProperty(name)) {
                this.state.files[name] = this.state.files[oldName];
                delete this.state.files[oldName];
            }
            this.setState({ files: this.state.files });
        }
    }
    private onFileDelete = (e: IPMFileDeleteEvent): void => {
        if(this.state.isAdmin) {
            if(this.props.onFileDelete) {
                this.props.onFileDelete(e);
            }
        } else {
            const {name} = e;
            delete this.state.files[name];
            this.setState({ files: this.state.files });
        }
    }

    private outf = (outValue: string): void => {
        this.outputs.push(outValue);
        this.setState({ output: this.outputs.join('') });
    };

    private readf = (fname: string): string => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][fname] === undefined) {
            if(this.state.files[fname]) {
                return this.state.files[fname].contents;
            } else {
                throw new Error(`File not found: '${fname}'`);
            }
        } else {
            return Sk.builtinFiles["files"][fname];
        }
    }
    private writef = (bytes: string, name: string, pos: number): void => {
        this.state.files[name] = { contents: bytes, createdByWrite: true };
        this.setState({ files: this.state.files });
    };

    private saveAndRun = (): void => {
        document['currentDiv'] = () => this.testsDiv;
        this.startRerunTimer();
        this.outputs = [];
        this.setState({ hasError: true, output: '' });
        const { code, afterCode, tests } = this.state;
        const assertions: PMAssertion[] = tests.map((t) => new PMAssertEqual(t.actual, t.expected, t.description));
        this.testSuite.setAssertions(assertions);
        const testsStr = this.testSuite.getString();
        this.testSuite.onBeforeRunningTests();
        Sk.configure({
            filewriter: this.writef,
            output: this.outf,
            read: this.readf
        });
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${code}\n${afterCode}\n${testsStr}`, true);
        });
        myPromise.then((result) => {
            const { passedAll } = this.testSuite.getTestResults();
            this.setState({ hasError: false, passedAll });
            console.log('success', result);
        }, (err) => {
            const errString = err.toString();
            this.outputs.push(errString);
            this.setState({ passedAll: false, hasError: true, output: this.outputs.join('') });
            console.error(err);
        }).finally(() => {
            this.testSuite.onAfterRanTests();
            // this.setState({ testResults: this.testSuite.getTestResults() });
            this.forceUpdate();
        });
    };

    private startRerunTimer(): void {
        if(this.rerunTimeout) {
            clearTimeout(this.rerunTimeout);
        }
        this.setState({ canRun: false });
        this.rerunTimeout = setTimeout(() => {
            this.setState({ canRun: true });
        }, this.props.rerunDelay);
    }
    private addFile = (): void => {
        const originalFName = `file_${Object.keys(this.state.files).length}`;
        let filename: string = `${originalFName}.txt`;
        let i: number = 1;
        while(this.state.files.hasOwnProperty(filename)) {
            filename = `${originalFName}_${i}.txt`;
            i++;
        }
        const file = {contents: '', createdByWrite: false};
        // this.state.files[filename] = file;
        // this.setState({ files: this.state.files });
        if(this.props.onFileAdded) {
            this.props.onFileAdded({ file, filename });
        }
    }
    private addTest = (): void => {
        const test: ITest = {
            actual: 'True',
            description: '*no description*',
            expected: 'True'
        };
        // this.state.tests.push(test);
        // this.setState({ tests: this.state.tests });
        if(this.props.onTestAdded) {
            const index = this.state.tests.length;
            this.props.onTestAdded(index, { test });
        }
    }
    private deleteProblem = (): void => {
        if(this.props.onDelete) {
            this.props.onDelete({});
        }
    }
};
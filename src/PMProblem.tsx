// tslint:disable:ordered-imports
import * as React from "react";
import { PMAssertion, PMAssertEqual } from './pyTests/PMTest';
import { PMTestSuite } from './pyTests/PMTestSuite';
import { PMProblemDescription, IPMProblemDescriptionChangedEvent } from './PMProblemDescription';
import './skulpt/skulpt.min.js';
import './skulpt/skulpt-stdlib.js';

declare var Sk;

import { PMTestDisplay, IPMTestChangedEvent, IPMTestDeleteEvent } from './PMTestDisplay';
import { IPMFileContentsChangedEvent, IPMFileNameChangedEvent, PMFile, IPMFileDeleteEvent } from './PMFile';
import { PMCode, IPMCodeChangeEvent } from './PMCode';

interface IPMProblemProps {
    afterCode?: string;
    code?: string;
    description?: string;
    isAdmin?: boolean;
    rerunDelay?: number;
};

interface IPMProblemState {
    code: string;
    codeAfter: string;
    hasError: boolean;
    output: string;
    problemDescription: string;
    canRun: boolean;
    isAdmin: boolean;
    tests: Array<{ actual: string, expected: string, description: string }>;
    files: {[fname: string]: {contents: string, createdByWrite: boolean}};
};

export class PMProblem extends React.Component<IPMProblemProps, IPMProblemState> {
    public static defaultProps: IPMProblemProps = {
        afterCode: '',
        code: `# code here`,
        description: '*no description*',
        rerunDelay: 1000,
    };
    private outputs: string[] = [];
    private rerunTimeout: number;
    private testsDiv: HTMLDivElement;
    private testSuite: PMTestSuite = new PMTestSuite();

    constructor(props:IPMProblemProps, state:IPMProblemState) {
        super(props, state);
        this.state = {
            canRun: true,
            code: this.props.code || '',
            codeAfter: '',
            files: {},
            hasError: false,
            isAdmin: !!this.props.isAdmin,
            output: '',
            problemDescription: this.props.description || '',
            tests: []
        };

        Sk.configure({
            filewriter: this.writef,
            inputfunTakesPrompt: true,
            jsonpSites : ['https://itunes.apple.com'],
            output: this.outf,
            python3: true,
            read: this.readf
        });
        // Sk.pre = 'output';
        // Sk.python3 = true;
        // Sk.configure({ output: this.outf, read: builtinRead }); 
        // (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
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
        return <div className="container">
            <div className="row">
                <PMProblemDescription canEdit={this.state.isAdmin} description={this.state.problemDescription} onChange={this.onDescriptionChange} />
            </div>
            <div className="row">
                <div className="col">
                    <button disabled={!this.state.canRun} className='btn btn-success' onClick={this.saveAndRun}>Save &amp; Run</button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <PMCode onChange={this.onCodeChange} value={this.state.code} />
                    <div style={{ display: this.state.isAdmin ? '' : 'none' }}>
                        <PMCode onChange={this.onCodeAfterChange} value={this.state.codeAfter} />
                    </div>
                </div>
                <div className="col">
                    <div className='codeOutput'> {this.state.output} </div>
                    <div className='files'>
                        {filesout}
                        {this.state.isAdmin && <button className="btn btn-default btn-block" onClick={this.addFile}>+ File</button> }
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    {tests}
                    {this.state.isAdmin && <button className="btn btn-default btn-block" onClick={this.addTest}>+ Test</button> }
                </div>
            </div>
        </div>
    };

    private onTestChange = (i: number, e: IPMTestChangedEvent): void => {
        const {actual, description, expected}  = e;
        this.state.tests[i].actual = actual;
        this.state.tests[i].description = description;
        this.state.tests[i].expected = expected;
        this.setState({ tests: this.state.tests });
    };

    private onTestDelete = (i: number, e: IPMTestDeleteEvent): void => {
        this.state.tests.splice(i, 1);
        this.setState({ tests: this.state.tests });
    };

    private onDescriptionChange = (e: IPMProblemDescriptionChangedEvent): void => {
        const { value } = e;
        this.setState({ problemDescription: value });
    }
    private onCodeChange = (e: IPMCodeChangeEvent): void => {
        this.setState({ code: e.value });
    }
    private onCodeAfterChange = (e: IPMCodeChangeEvent): void => {
        this.setState({ codeAfter: e.value });
    }
    private onFileContentsChange = (e: IPMFileContentsChangedEvent): void => {
        const { name, contents } = e;
        this.state.files[name].contents = contents;
        this.setState({ files: this.state.files });
    }
    private onFileNameChange = (e: IPMFileNameChangedEvent): void => {
        const {oldName, name} = e;
        if(!this.state.files.hasOwnProperty(name)) {
            this.state.files[name] = this.state.files[oldName];
            delete this.state.files[oldName];
        }
        this.setState({ files: this.state.files });
    }
    private onFileDelete = (e: IPMFileDeleteEvent): void => {
        const {name} = e;
        delete this.state.files[name];
        this.setState({ files: this.state.files });
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
        const code = this.state.code;
        const afterCode = this.state.codeAfter;
        const assertions: PMAssertion[] = this.state.tests.map((t) => new PMAssertEqual(t.actual, t.expected, t.description));
        this.testSuite.setAssertions(assertions);
        const testsStr = this.testSuite.getString();
        this.testSuite.onBeforeRunningTests();
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${code}\n${afterCode}\n${testsStr}`, true);
        });
        myPromise.then((result) => {
            console.log('success', result);
        }, (err) => {
            const errString = err.toString();
            this.outputs.push(errString);
            this.setState({ hasError: true, output: this.outputs.join('') });
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
        let fname: string = `${originalFName}.txt`;
        let i: number = 1;
        while(this.state.files.hasOwnProperty(fname)) {
            fname = `${originalFName}_${i}.txt`;
            i++;
        }
        this.state.files[fname] = {contents: '', createdByWrite: false};
        this.setState({ files: this.state.files });
    }
    private addTest = (): void => {
        this.state.tests.push({
            actual: 'True',
            description: '*no description*',
            expected: 'True'
        });
        this.setState({ tests: this.state.tests });
    }
};
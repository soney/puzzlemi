// tslint:disable:ordered-imports
import * as CodeMirror from 'codemirror';
import * as React from "react";
import { PMTestSuite } from './pyTests/PMTestSuite';
import { PMProblemDescription } from './PMProblemDescription';
import './skulpt/skulpt.min.js';
import './skulpt/skulpt-stdlib.js';

declare var Sk;

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import { PMTestDisplay } from './PMTestDisplay';
import { PMFile } from './PMFile';
import { PMAssertion, PMAssertEqual } from './pyTests/PMTest';

interface IPMProblemProps {
    afterCode?: string;
    options?: any;
    problemDescription: string;
    value?: string;
    rerunDelay?: number;
};

interface IPMProblemState {
    hasError: boolean,
    output: string,
    canRun: boolean,
    isAdmin: boolean,
    tests: PMAssertion[],
    runBefore: string,
    runAfter: string,
    files: {[fname: string]: string}
};

export class PMProblem extends React.Component<IPMProblemProps, IPMProblemState> {
    public static defaultProps: IPMProblemProps = {
        afterCode: '',
        options: {
            lineNumbers: true,
            mode: 'python'
        },
        problemDescription: '*(empty problem description)*',
        rerunDelay: 1000,
        value: `f = open('hello.txt', 'w')\nf.write('hello world')\nf.close()\n#f = open('hello.txt', 'r')\n#print(f.read())\n#f.close()`
    };
    private mainCodeNode: HTMLTextAreaElement;
    private afterCodeNode: HTMLTextAreaElement;
    private codeMirror: CodeMirror;
    private afterCodeMirror: CodeMirror;
    private outputs: string[] = [];
    private rerunTimeout: number;
    private testsDiv: HTMLDivElement;
    private testSuite: PMTestSuite = new PMTestSuite();

    constructor(props:IPMProblemProps, state:IPMProblemState) {
        super(props, state);
        this.state = {
            canRun: true,
            files: {},
            hasError: false,
            isAdmin: true,
            output: '',
            runAfter: '',
            runBefore: '',
            tests: this.testSuite.getTests()
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

    public componentDidMount():void {
        this.codeMirror = CodeMirror.fromTextArea(this.mainCodeNode, this.props.options);
        this.codeMirror.setValue(this.props.value);
        this.afterCodeMirror = CodeMirror.fromTextArea(this.afterCodeNode, this.props.options);
        this.afterCodeMirror.setValue(this.props.afterCode);
    };

    public render():React.ReactNode {
        const tests: React.ReactNode[] = this.state.tests.map((test, i) => {
            const result = this.testSuite.getLatestResult(test);
            return <PMTestDisplay key={i} canEdit={this.state.isAdmin} test={test} result={result} />;
        });
        const filesout: React.ReactNode[] = Object.keys(this.state.files).map((fname) => {
            const contents = this.state.files[fname];
            return <PMFile key={fname} canEdit={this.state.isAdmin} filename={fname} contents={contents} />;
        });
        return <div className="container">
            <div className="row">
                <PMProblemDescription canEdit={this.state.isAdmin} description={this.props.problemDescription} />
            </div>
            <div className="row">
                <div className="col">
                    <button disabled={!this.state.canRun} className='btn btn-success' onClick={this.saveAndRun}>Save &amp; Run</button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <textarea
                        ref={(ref:HTMLTextAreaElement) => this.mainCodeNode = ref}
                        defaultValue={this.props.value}
                        autoComplete="off"
                    />
                    <div style={{ display: this.state.isAdmin ? '' : 'none' }}>
                        <textarea
                            ref={(ref:HTMLTextAreaElement) => this.afterCodeNode = ref}
                            defaultValue={this.props.afterCode}
                            autoComplete="off"
                        />
                    </div>
                </div>
                <div className="col">
                    <div className='codeOutput'> {this.state.output} </div>
                    <div className='files'>
                        {filesout}
                        <button className="btn btn-default btn-block" onClick={this.addFile}>+ File</button>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    {tests}
                    <button className="btn btn-default btn-block" onClick={this.addTest}>+ Test</button>
                </div>
            </div>
        </div>
    };

    private outf = (outValue: string): void => {
        this.outputs.push(outValue);
        this.setState({ output: this.outputs.join('') });
    };

    private readf = (fname: string): string => {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][fname] === undefined) {
            console.log(this.state.files, fname);
            if(this.state.files[fname]) {
                return this.state.files[fname];
            } else {
                throw new Error(`File not found: '${fname}'`);
            }
        } else {
            return Sk.builtinFiles["files"][fname];
        }
    }
    private writef = (bytes: string, name: string, pos: number): void => {
        this.state.files[name] = bytes;
        this.setState({ files: this.state.files });
    };

    private saveAndRun = (): void => {
        document['currentDiv'] = () => this.testsDiv;
        this.startRerunTimer();
        this.outputs = [];
        this.setState({ hasError: true, output: '' });
        const code = this.codeMirror.getValue();
        const afterCode = this.afterCodeMirror.getValue();
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
        this.state.files[`file_${Object.keys(this.state.files).length}`] = '';
        this.setState({ files: this.state.files });
    }
    private addTest = (): void => {
        this.testSuite.addTest(new PMAssertEqual('x', '1', 'x is 1'));
        this.forceUpdate();
    }
};
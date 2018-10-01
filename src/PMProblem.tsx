import * as CodeMirror from 'codemirror';
import * as React from "react";
import * as showdown from 'showdown';
import * as Sk from 'skulpt';
import { IPMTestSuiteResults, PMTestSuite } from './pyTests/PMTestSuite';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';

function builtinRead(x) {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
        throw new Error("File not found: '" + x + "'");
    }
    return Sk.builtinFiles["files"][x];
}

interface IPMProblemProps {
    options?: any;
    value?: string;
    rerunDelay?: number;
};

interface IPMProblemState {
    hasError: boolean,
    output: string,
    canRun: boolean,
    problemDescription: string,
    testResults: IPMTestSuiteResults,
    runBefore: string,
    runAfter: string
};

export class PMProblem extends React.Component<IPMProblemProps, IPMProblemState> {
    public static defaultProps: IPMProblemProps = {
        options: {
            lineNumbers: true,
            mode: 'python'
        },
        rerunDelay: 1000,
        value: `x = 1`
    };
    private textareaNode: HTMLTextAreaElement;
    private codeMirror: CodeMirror;
    private outputs: string[] = [];
    private rerunTimeout: number;
    private testsDiv: HTMLDivElement;
    private converter: showdown.Converter = new showdown.Converter();
    private tests: PMTestSuite = new PMTestSuite();

    constructor(props:IPMProblemProps, state:IPMProblemState) {
        super(props, state);
        this.state = {
            canRun: true,
            hasError: false,
            output: '',
            problemDescription: ' do something with `x` and `y` and this code! **hello**!',
            runAfter: '',
            runBefore: '',
            testResults: this.tests.getTestResults()
        };

        Sk.pre = 'output';
        Sk.python3 = true;
        Sk.configure({ output: this.outf, read: builtinRead }); 
        // (Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
    };

    public componentDidMount():void {
        this.codeMirror = CodeMirror.fromTextArea(this.textareaNode, this.props.options);
        this.codeMirror.setValue(this.props.value);
    };

    public render():React.ReactNode {
        const testResults: React.ReactNode[] = this.state.testResults.results.map((result, i) => {
            const { passed, message } = result;
            return <div key={i} className={'test' + passed ? 'passed' : 'failed'}>
                {(passed ? 'Passed: ' : 'Failed: ') + message}
            </div>;
        });
        return <div className="container">
            <div className="row">
                <div className="col problemDescription" dangerouslySetInnerHTML={this.getProblemDescriptionHTML()} />
            </div>
            <div className="row">
                <div className="col">
                    <button disabled={!this.state.canRun} className='btn btn-success' onClick={this.saveAndRun}>Save &amp; Run</button>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <textarea
                        ref={(ref:HTMLTextAreaElement) => this.textareaNode = ref}
                        defaultValue={this.props.value}
                        autoComplete="off"
                    />
                </div>
                <div className="col">
                    <div className='codeOutput'> {this.state.output} </div>
                </div>
            </div>
            <div className="row">
                <div className="col">
                    {testResults}
                </div>
            </div>
        </div>
    };

    private getProblemDescriptionHTML(): {__html: string} {
        return { __html: this.converter.makeHtml(this.state.problemDescription) };
    }

    private outf = (outValue: string): void => {
        this.outputs.push(outValue);
        this.setState({ output: this.outputs.join('') });
    };

    private saveAndRun = (): void => {
        document['currentDiv'] = () => this.testsDiv;
        this.startRerunTimer();
        this.outputs = [];
        this.setState({ hasError: true, output: '' });
        const code = this.codeMirror.getValue();
        const testsStr = this.tests.getString();
        this.tests.onBeforeRunningTests();
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, `${code}\n${testsStr}`, true);
        });
        myPromise.then((mod) => {
            // console.log('success');
        }, (err) => {
            const errString = err.toString();
            this.outputs.push(errString);
            this.setState({ hasError: true, output: this.outputs.join('') });
            console.log(errString);
        }).finally(() => {
            this.tests.onAfterRanTests();
            this.setState({ testResults: this.tests.getTestResults() });
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
};
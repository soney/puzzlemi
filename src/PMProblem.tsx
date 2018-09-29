import * as CodeMirror from 'codemirror';
import * as React from "react";
import * as Sk from 'skulpt';
Sk.pre = "output";

function outf(text) { 
    console.log(text);
    // var mypre = document.getElementById("output"); 
    // mypre.innerHTML = mypre.innerHTML + text; 
} 
function builtinRead(x) {
    console.log(x);
    // if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined)
    //         throw "File not found: '" + x + "'";
    // return Sk.builtinFiles["files"][x];
}
Sk.configure({output:outf, read:builtinRead}); 
(Sk.TurtleGraphics || (Sk.TurtleGraphics = {})).target = 'mycanvas';
// import {SDBClient, SDBDoc} from 'sdb-ts';

import 'codemirror/lib/codemirror.css';


interface IPMProblemProps {
    options?: any;
    value?: string;
};
interface IPMProblemState {
    errors: any[]
};

export class PMProblem extends React.Component<IPMProblemProps, IPMProblemState> {
    public static defaultProps: IPMProblemProps = {
        options: {},
        value: ''
    };
    private textareaNode: HTMLTextAreaElement;
    private codeMirror: CodeMirror;

    constructor(props:IPMProblemProps, state:IPMProblemState) {
        super(props, state);
        this.state = {
            errors: []
        };
    };

    public componentDidMount():void {
        this.codeMirror = CodeMirror.fromTextArea(this.textareaNode, this.props.options);
        this.codeMirror.setValue(this.props.value);
    };

    public render():React.ReactNode {
        return <div>
            Code:
            <button className='btn btn-success' onClick={this.saveAndRun}>Save &amp; Run</button>
            <textarea
                ref={(ref:HTMLTextAreaElement) => this.textareaNode = ref}
                defaultValue={this.props.value}
                autoComplete="off"
            />
        </div>
    };

    private saveAndRun = (): void => {
        const code = this.codeMirror.getValue();
        console.log(code);
        const myPromise = Sk.misceval.asyncToPromise(() => {
            return Sk.importMainWithBody("<stdin>", false, code, true);
        });
        myPromise.then((mod) => {
            console.log('success');
        },
        (err) => {
            console.log(err.toString());
        });
    };
};
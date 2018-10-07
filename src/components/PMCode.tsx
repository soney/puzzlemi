// tslint:disable:ordered-imports
import * as CodeMirror from 'codemirror';
import * as React from "react";

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/markdown/markdown';

export interface IPMCodeChangeEvent {
    value: string;
}

interface IPMCodeProps {
    options?: any;
    value?: string;
    onChange?: (e:IPMCodeChangeEvent) => void;
};

interface IPMCodeState {
    code: string;
};

export class PMCode extends React.Component<IPMCodeProps, IPMCodeState> {
    public static defaultProps: IPMCodeProps = {
        options: {
            lineNumbers: true,
            mode: 'python'
        },
        value: ''
    };
    private codeMirror: CodeMirror.EditorFromTextArea;
    private codeNode: HTMLTextAreaElement;

    constructor(props:IPMCodeProps, state:IPMCodeState) {
        super(props, state);
        this.state = {
            code: this.props.value || ''
        };
    };

    public componentDidUpdate(prevProps: IPMCodeProps):void {
        const { value } = this.props;
        if(value !== prevProps.value) {
            this.setState({ code: value as string });
            if(value !== this.codeMirror.getValue()) {
                this.codeMirror.setValue(value as string);
            }
        }
    };

    public componentDidMount():void {
        this.codeMirror = CodeMirror.fromTextArea(this.codeNode, this.props.options);
        this.codeMirror.setValue(this.state.code);
        this.codeMirror.on('change', (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList) => {
            if(change.origin !== 'setValue') {
                if(this.props.onChange) {
                    this.props.onChange({ value: this.codeMirror.getValue() });
                }
            }
        });
    };
    public componentWillUnmount(): void {
        if(this.codeMirror) {
            this.codeMirror.toTextArea();
        }
    }

    public render():React.ReactNode {
        return <textarea
                ref={(ref:HTMLTextAreaElement) => this.codeNode = ref}
                defaultValue={this.props.value}
                autoComplete="off"
            />;
    };
};
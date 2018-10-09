// tslint:disable:ordered-imports
import * as CodeMirror from 'codemirror';
import * as React from "react";

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/markdown/markdown';
import { SDBSubDoc } from 'sdb-ts';
import ShareDBCodeMirrorBinding from '../utils/ShareDBCodeMirrorBinding';

export interface ICodeChangeEvent {
    value: string;
}

interface ICodeEditorProps {
    options?: any;
    value?: string;
    shareDBSubDoc?: SDBSubDoc<string>;
    onChange?: (e:ICodeChangeEvent) => void;
};

interface ICodeEditorState {
    code: string;
};

export class CodeEditor extends React.Component<ICodeEditorProps, ICodeEditorState> {
    public static defaultProps: ICodeEditorProps = {
        options: {
            lineNumbers: true,
            mode: 'python',
            lineWrapping: true,
            viewportMargin: 50,
            width: null,
            height: null,
        },
        value: ''
    };
    private codeMirror: CodeMirror.EditorFromTextArea;
    private codeNode: HTMLTextAreaElement;
    private codemirrorBinding: ShareDBCodeMirrorBinding;

    constructor(props:ICodeEditorProps, state:ICodeEditorState) {
        super(props, state);
        this.state = {
            code: this.props.value || ''
        };
    };

    public componentDidUpdate(prevProps: ICodeEditorProps):void {
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
        this.codeMirror.setSize(this.props.options.width, this.props.options.height);

        if(this.props.shareDBSubDoc) {
            this.codemirrorBinding = new ShareDBCodeMirrorBinding(this.codeMirror, this.props.shareDBSubDoc);
        }

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
        if(this.codemirrorBinding) {
            this.codemirrorBinding.destroy();
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
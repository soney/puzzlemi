// tslint:disable:ordered-imports
import * as CodeMirror from 'codemirror';
import * as React from "react";

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/markdown/markdown';
import ShareDBCodeMirrorBinding from '../utils/ShareDBCodeMirrorBinding';

export interface ICodeChangeEvent {
    value: string;
}

interface ICodeOutputEditorProps {
    options?: any;
    value?: string;
    outputVariable?: any;
    onVariableChange?: any;
    flag?: any;
    // shareDBSubDoc?: SDBSubDoc<string>;
    onChange?: (e: ICodeChangeEvent) => void;
};

interface ICodeEditorState {
    code: string;
};

export class CodeOutputEditor extends React.Component<ICodeOutputEditorProps, ICodeEditorState> {
    public static defaultProps: ICodeOutputEditorProps = {
        options: {
            height: 80,
            indentUnit: 4,
            lineNumbers: true,
            lineWrapping: true,
            mode: 'python',
            viewportMargin: 50,
            width: null,
            onChangeCallback: null,
            readOnly: false
        },
        value: 'x = 1;'
    };
    private codeMirror!: CodeMirror.EditorFromTextArea;
    private codeNode!: HTMLTextAreaElement;
    private codemirrorBinding!: ShareDBCodeMirrorBinding;
    private VariableMarker: any[];

    constructor(props: ICodeOutputEditorProps, state: ICodeEditorState) {
        super(props, state);

        this.VariableMarker = [];

        let staticText = "# expected variables";
        this.props.outputVariable.forEach(output => {
            staticText += "\n# " + output.name + " = " + output.value;
        });

        this.props.options.height = 10 + 20 * (this.props.outputVariable.length + 1);

        this.state = {
            code: staticText,
        }
    };

    public componentDidUpdate(prevProps: ICodeOutputEditorProps): void {
        const { value, flag } = this.props;
        if (value !== prevProps.value) {
            this.setState({ code: value as string });
            // if(value !== this.codeMirror.getValue()) {
            //     this.codeMirror.setValue(value as string);
            // }
        }
        if (flag !== prevProps.flag) {
            this.resetEditor();
        }
    };

    private resetEditor(): void {
        let staticText = "# expected variables";
        this.props.outputVariable.forEach(output => {
            staticText += "\n# " + output.name + " = " + output.value;
        });

        this.codeMirror.setValue(staticText);
        const doc = this.codeMirror.getDoc();
        doc.markText({ line: 0, ch: 0 }, { line: 1, ch: 0 }, { readOnly: true });
        this.props.outputVariable.forEach((output, index) => {
            const variable_length = output.name.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: variable_length + 5 }, { readOnly: true });
            this.VariableMarker[index].clear();
            const marker = doc.markText({ line: index + 1, ch: variable_length + 5 }, { line: index + 1, ch: total_length }, { css: "background: #baffba" });
            this.VariableMarker[index] = marker;
        })
    }

    public componentDidMount(): void {
        this.codeMirror = CodeMirror.fromTextArea(this.codeNode, this.props.options);
        this.codeMirror.setValue(this.state.code);
        this.codeMirror.setSize(this.props.options.width, this.props.options.height);
        this.codeMirror.setOption('extraKeys', {
            Tab: (cm) => {
                const spaces = Array(cm.getOption('indentUnit')! + 1).join(' ');
                cm.getDoc().replaceSelection(spaces);
            }
        });

        const doc = this.codeMirror.getDoc();
        doc.markText({ line: 0, ch: 0 }, { line: 1, ch: 0 }, { readOnly: true });
        this.props.outputVariable.forEach((output, index) => {
            const variable_length = output.name.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: variable_length + 5 }, { readOnly: true });
            const marker = doc.markText({ line: index + 1, ch: variable_length + 5 }, { line: index + 1, ch: total_length }, { css: "background: #baffba" });
            this.VariableMarker.push(marker);
        })

        this.codeMirror.on('change', (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList) => {
            const doc = this.codeMirror.getDoc();
            this.props.outputVariable.forEach((output, index) => {
                const variable_length = output.name.length;
                const total_length = doc.getLine(index + 1).length;
                const content = doc.getLine(index + 1).substr(variable_length + 5, total_length - variable_length - 5);
                if (content !== output.value) {
                    this.props.onVariableChange(index, content);
                    // update input value
                    // update marker
                    this.VariableMarker[index].clear();
                    const marker = doc.markText({ line: index + 1, ch: variable_length + 5 }, { line: index + 1, ch: total_length }, { css: "background: yellow" });
                    this.VariableMarker[index] = marker;
                }
                else {
                    this.VariableMarker[index].clear();
                    const marker = doc.markText({ line: index + 1, ch: variable_length + 5 }, { line: index + 1, ch: total_length }, { css: "background: #baffba" });
                    this.VariableMarker[index] = marker;
                }
            })
        });
    };
    public componentWillUnmount(): void {
        if (this.codeMirror) {
            this.codeMirror.toTextArea();
        }
        if (this.codemirrorBinding) {
            this.codemirrorBinding.destroy();
        }
    }

    public render(): React.ReactNode {
        return <textarea
            ref={(ref: HTMLTextAreaElement) => this.codeNode = ref}
            defaultValue={this.props.value}
            autoComplete="off"
        />;
    };
};
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

interface ICodeInputEditorProps {
    options?: any;
    value?: string;
    inputVariable?: any;
    onVariableChange?: any;
    flag?: any;
    // shareDBSubDoc?: SDBSubDoc<string>;
    onChange?: (e: ICodeChangeEvent) => void;
};

interface ICodeEditorState {
    code: string;
};

export class CodeInputEditor extends React.Component<ICodeInputEditorProps, ICodeEditorState> {
    public static defaultProps: ICodeInputEditorProps = {
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
    // private inputVariable: any;

    constructor(props: ICodeInputEditorProps, state: ICodeEditorState) {
        super(props, state);

        this.VariableMarker = [];

        let staticText = "# given variables";
        this.props.inputVariable.forEach(input => {
            staticText += "\n" + input.name + " = " + input.value;
        });

        this.props.options.height = 10 + 20 * (this.props.inputVariable.length + 1);

        this.state = {
            code: staticText,
        }
    };

    public componentDidUpdate(prevProps: ICodeInputEditorProps): void {
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
        let staticText = "# given variables";
        this.props.inputVariable.forEach(input => {
            staticText += "\n" + input.name + " = " + input.value;
        });

        this.codeMirror.setValue(staticText);
        const doc = this.codeMirror.getDoc();
        doc.markText({ line: 0, ch: 0 }, { line: 1, ch: 0 }, { readOnly: true });
        this.props.inputVariable.forEach((input, index) => {
            const variable_length = input.name.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: variable_length + 3 }, { readOnly: true });
            this.VariableMarker[index].clear();
            const marker = doc.markText({ line: index + 1, ch: variable_length + 3 }, { line: index + 1, ch: total_length }, { css: "background: #baffba" });
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
        this.props.inputVariable.forEach((input, index) => {
            const variable_length = input.name.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: variable_length + 3 }, { readOnly: true });
            const marker = doc.markText({ line: index + 1, ch: variable_length + 3 }, { line: index + 1, ch: total_length }, { css: "background: #baffba" });
            this.VariableMarker.push(marker);
        })

        this.codeMirror.on('change', (instance: CodeMirror.Editor, change: CodeMirror.EditorChangeLinkedList) => {
            const doc = this.codeMirror.getDoc();
            this.props.inputVariable.forEach((input, index) => {
                const variable_length = input.name.length;
                const total_length = doc.getLine(index + 1).length;
                const content = doc.getLine(index + 1).substr(variable_length + 3, total_length - variable_length - 3);
                if (content !== input.value) {
                    // update input value
                    this.props.onVariableChange(index, content);
                    // update marker
                    this.VariableMarker[index].clear();
                    const marker = doc.markText({ line: index + 1, ch: variable_length + 3 }, { line: index + 1, ch: total_length }, { css: "background: yellow" });
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
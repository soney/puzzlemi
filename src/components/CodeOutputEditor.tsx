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
    variables?: any;
    onVariableChange?: any;
    flag?: any;
    isEdit?: any;
    failedTest?: any;
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
    private outputVariables: any[];

    constructor(props: ICodeOutputEditorProps, state: ICodeEditorState) {
        super(props, state);

        this.VariableMarker = [];
        this.outputVariables = [];

        let staticText = "# assertions";
        this.props.variables.forEach(variable => {
            if (variable.type === "output") this.outputVariables.push(variable);
        })

        this.outputVariables.forEach(output => {
            staticText += "\nassert(" + output.name + " == " + output.value+')';
        });

        this.props.options.readOnly = !this.props.isEdit;
        this.state = {
            code: staticText,
        }
    };

    public componentDidUpdate(prevProps: ICodeOutputEditorProps): void {
        const { value, flag, variables, isEdit, failedTest } = this.props;
        if (value !== prevProps.value) {
            this.setState({ code: value as string });
            // if(value !== this.codeMirror.getValue()) {
            //     this.codeMirror.setValue(value as string);
            // }
        }
        if (flag !== prevProps.flag) {
            this.resetEditor();
            this.resetMarkers();
        }
        if (variables !== prevProps.variables) {
            this.resetEditor();
            this.resetMarkers();
        }
        if (isEdit !== prevProps.isEdit) {
            this.resetEditor();
            this.resetMarkers();
        }
        if (failedTest !== prevProps.failedTest) {
            if (failedTest !== null) {
                this.resetFailed();
            }
            // else {
            //     this.resetEditor();
            //     this.resetMarkers();
            // }
        }
    };

    private resetFailed(): void {
        this.outputVariables = this.props.failedTest.output;

        // init static text
        let staticText = "# assertions";
        this.outputVariables.forEach(output => {
            staticText += "\nassert(" + output.name + " == " + output.value+')';
        });

        this.codeMirror.setValue(staticText);

        // init code mirror options
        this.props.options.height = 10 + 20 * (this.outputVariables.length + 1);
        this.codeMirror.setSize(this.props.options.width, this.props.options.height);
        this.codeMirror.setOption('readOnly', true);

        const doc = this.codeMirror.getDoc();
        doc.markText({ line: 0, ch: 0 }, { line: 1, ch: 0 }, { readOnly: true });

        // init editing markers
        this.VariableMarker = [];
        this.outputVariables.forEach((output, index) => {
            const variable_length = output.name.length;
            const pos_left = variable_length + 11;
            const pos_right = variable_length + 11 + output.value.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: pos_left }, { readOnly: true });
            const marker = doc.markText({ line: index + 1, ch: pos_left }, { line: index + 1, ch: pos_right }, { css: "background: #f8d7da" });
            this.VariableMarker.push(marker);
            doc.markText({ line: index + 1, ch: pos_right }, { line: index + 1, ch: total_length }, { readOnly: true });
        })
    }

    private resetEditor(): void {
        // init output variables
        this.outputVariables = [];
        this.props.variables.forEach(variable => {
            if (variable.type === "output") this.outputVariables.push(variable);
        })

        // init static text
        let staticText = "# assertions";        
        this.outputVariables.forEach(output => {
            staticText += "\nassert(" + output.name + " == " + output.value + ")";
        });
        this.codeMirror.setValue(staticText);

        // init code mirror options
        this.props.options.height = 10 + 20 * (this.outputVariables.length + 1);
        this.codeMirror.setSize(this.props.options.width, this.props.options.height);
        this.codeMirror.setOption('readOnly', !this.props.isEdit);
    }

    private resetMarkers(): void {
        // init readOnly markers
        const doc = this.codeMirror.getDoc();
        doc.markText({ line: 0, ch: 0 }, { line: 1, ch: 0 }, { readOnly: true });

        // init editing markers
        this.VariableMarker = [];
        this.outputVariables.forEach((output, index) => {
            const variable_length = output.name.length;
            const pos_left = variable_length + 11;
            const pos_right = variable_length + 11 + output.value.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: pos_left }, { readOnly: true });
            const marker = doc.markText({ line: index + 1, ch: pos_left }, { line: index + 1, ch: pos_right }, { css: "background: #baffba" });
            this.VariableMarker.push(marker);
            doc.markText({ line: index + 1, ch: pos_right }, { line: index + 1, ch: total_length }, { readOnly: true });
        })
    }

    private listenEditorChange = () => {
        const doc = this.codeMirror.getDoc();
        this.outputVariables.forEach((output, index) => {
            const variable_length = output.name.length;
            const pos_left = variable_length + 11;
            const total_length = doc.getLine(index + 1).length;
            const content = doc.getLine(index + 1).substr(pos_left, total_length - pos_left - 1);
            if (content !== output.value) {
                this.props.onVariableChange(index, content);
                // update input value
                // update marker
                this.VariableMarker[index].clear();
                const marker = doc.markText({ line: index + 1, ch: pos_left }, { line: index + 1, ch: pos_left + content.length }, { css: "background: yellow" });
                this.VariableMarker[index] = marker;
            }
        })
    }

    public componentDidMount(): void {
        this.codeMirror = CodeMirror.fromTextArea(this.codeNode, this.props.options);
        this.codeMirror.setValue(this.state.code);
        this.props.options.height = 10 + 20 * (this.outputVariables.length + 1);
        this.codeMirror.setSize(this.props.options.width, this.props.options.height);
        this.codeMirror.setOption('extraKeys', {
            Tab: (cm) => {
                const spaces = Array(cm.getOption('indentUnit')! + 1).join(' ');
                cm.getDoc().replaceSelection(spaces);
            }
        });
        this.resetMarkers();

        this.codeMirror.on('change', this.listenEditorChange);
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
        return <div className="code-editor code-output-editor">
            <textarea
                ref={(ref: HTMLTextAreaElement) => this.codeNode = ref}
                defaultValue={this.props.value}
                autoComplete="off"
            />
        </div>;
    };
};
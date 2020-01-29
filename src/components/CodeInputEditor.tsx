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
    private inputVariables: any[];

    constructor(props: ICodeInputEditorProps, state: ICodeEditorState) {
        super(props, state);

        this.VariableMarker = [];
        this.inputVariables = [];

        let staticText = "# given variables";
        this.props.variables.forEach(variable => {
            if (variable.type === "input") this.inputVariables.push(variable);
        })

        this.inputVariables.forEach(input => {
            staticText += "\n" + input.name + " = " + input.value;
        });

        this.props.options.height = 10 + 20 * (this.inputVariables.length + 1);
        this.props.options.readOnly = !this.props.isEdit;
        this.state = {
            code: staticText,
        }
    };

    public componentDidUpdate(prevProps: ICodeInputEditorProps): void {
        const { value, flag, variables, isEdit, failedTest } = this.props;
 
        if (value !== prevProps.value) {
            this.setState({ code: value as string });
            // if(value !== this.codeMirror.getValue()) {
            //     this.codeMirror.setValue(value as string);
            // }
        }
        if (flag !== prevProps.flag) {
            console.log('flag')
            console.log(flag);
            console.log(prevProps.flag)
            this.resetEditor();
            this.resetMarkers();
        }
        if (variables !== prevProps.variables) {
            console.log('variables')
            this.resetEditor();
            this.resetMarkers();
        }
        if (isEdit !== prevProps.isEdit) {
            console.log('is edit')
            this.resetEditor();
            this.resetMarkers();
        }
        if (failedTest !== prevProps.failedTest) {
            console.log(failedTest)

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
        console.log('reset failed')
        this.inputVariables = this.props.failedTest.input;
        
        // init static text
        let staticText = "# given variables";
        this.inputVariables.forEach(input => {
            staticText += "\n" + input.name + " = " + input.value;
        });
        this.codeMirror.setValue(staticText);

        // init code mirror options
        this.props.options.height = 10 + 20 * (this.inputVariables.length + 1);
        this.codeMirror.setSize(this.props.options.width, this.props.options.height);
        this.codeMirror.setOption('readOnly', true);

        const doc = this.codeMirror.getDoc();
        doc.markText({ line: 0, ch: 0 }, { line: 1, ch: 0 }, { readOnly: true });

        // init editing markers
        this.inputVariables.forEach((input, index) => {
            const variable_length = input.name.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: variable_length + 3 }, { readOnly: true });
            const marker = doc.markText({ line: index + 1, ch: variable_length + 3 }, { line: index + 1, ch: total_length }, { css: "background: #f8d7da" });
            console.log(marker)
            this.VariableMarker.push(marker);
        })
    }


    private resetEditor(): void {
        // init input variables
        this.inputVariables = [];
        this.props.variables.forEach(variable => {
            if (variable.type === "input") this.inputVariables.push(variable);
        })

        // init static text
        let staticText = "# given variables";
        this.inputVariables.forEach(input => {
            staticText += "\n" + input.name + " = " + input.value;
        });
        this.codeMirror.setValue(staticText);

        // init code mirror options
        this.props.options.height = 10 + 20 * (this.inputVariables.length + 1);
        this.codeMirror.setSize(this.props.options.width, this.props.options.height);
        this.codeMirror.setOption('readOnly', !this.props.isEdit);
    }

    private resetMarkers(): void {
        console.log('reset markers')

        // init readOnly markers
        const doc = this.codeMirror.getDoc();
        doc.markText({ line: 0, ch: 0 }, { line: 1, ch: 0 }, { readOnly: true });

        // init editing markers
        this.VariableMarker = [];
        this.inputVariables.forEach((input, index) => {
            const variable_length = input.name.length;
            const total_length = doc.getLine(index + 1).length;
            doc.markText({ line: index + 1, ch: 0 }, { line: index + 1, ch: variable_length + 3 }, { readOnly: true });
            const marker = doc.markText({ line: index + 1, ch: variable_length + 3 }, { line: index + 1, ch: total_length }, { css: "background: #baffba" });
            this.VariableMarker.push(marker);
        })
    }

    private listenEditorChange = () => {
        const doc = this.codeMirror.getDoc();
        this.inputVariables.forEach((input, index) => {
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
        return <textarea
            ref={(ref: HTMLTextAreaElement) => this.codeNode = ref}
            defaultValue={this.props.value}
            autoComplete="off"
        />;
    };
};
import * as CodeMirror from 'codemirror';
import * as React from "react";
import * as showdown from 'showdown';

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/markdown/markdown';

interface IPMProblemDescriptionProps {
    canEdit: boolean;
    description: string;
};

interface IPMProblemDescriptionState {
    contents: string,
    editing: boolean
};

export class PMProblemDescription extends React.Component<IPMProblemDescriptionProps, IPMProblemDescriptionState> {
    private converter: showdown.Converter = new showdown.Converter();
    private textareaNode: HTMLTextAreaElement;
    private codeMirror: CodeMirror;

    constructor(props:IPMProblemDescriptionProps, state:IPMProblemDescriptionState) {
        super(props, state);
        this.state = {
            contents: this.props.description,
            editing: false
        };
    };

    public componentDidMount():void {
    };

    public render():React.ReactNode {
        if(this.state.editing) {
            return <div>
                <button className="btn btn-default btn-sm" onClick={this.cancelEditing}>Cancel</button>
                <button className="btn btn-default btn-sm" onClick={this.doneEditing}>Done</button>
                <textarea
                    ref={this.textareaRef}
                    defaultValue={this.props.description}
                    autoComplete="off"
                />
            </div>
        } else {
            return <div>
                <button className="btn btn-default btn-sm" style={{ display: this.props.canEdit ? '' : 'none' }} onClick={this.beginEditing}>Edit</button>
                <div className="col problemDescription" dangerouslySetInnerHTML={this.getProblemDescriptionHTML()} />
            </div>;
        }
    };
    private textareaRef = (el: HTMLTextAreaElement): void => {
        this.textareaNode = el;
        if(el) {
            this.codeMirror = CodeMirror.fromTextArea(this.textareaNode, {
                lineNumbers: false,
                mode: 'markdown'
            });
            this.codeMirror.setValue(this.state.contents);
        }
    }
    private beginEditing = (): void => {
        this.setState({ editing: true });
    };
    private doneEditing = (): void => {
        this.codeMirror.toTextArea();
        this.setState({
            contents: this.codeMirror.getValue(),
            editing: false,
        });
    }
    private cancelEditing = (): void => {
        this.codeMirror.toTextArea();
        this.setState({
            editing: false,
        });
    }
    private getProblemDescriptionHTML(): {__html: string} {
        return { __html: this.converter.makeHtml(this.state.contents) };
    }
};
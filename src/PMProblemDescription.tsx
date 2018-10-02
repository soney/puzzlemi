import * as React from "react";
import * as showdown from 'showdown';
import { IPMCodeChangeEvent, PMCode } from './PMCode';

export interface IPMProblemDescriptionChangedEvent {
    value: string;
}

interface IPMProblemDescriptionProps {
    canEdit: boolean;
    description: string;
    onChange?: (e: IPMProblemDescriptionChangedEvent) => void;
};

interface IPMProblemDescriptionState {
    contents: string;
    editing: boolean;
};

export class PMProblemDescription extends React.Component<IPMProblemDescriptionProps, IPMProblemDescriptionState> {
    private converter: showdown.Converter = new showdown.Converter();
    private oldContents: string;

    constructor(props:IPMProblemDescriptionProps, state:IPMProblemDescriptionState) {
        super(props, state);
        this.state = {
            contents: this.props.description,
            editing: false
        };
    };

    public componentDidUpdate(prevProps: IPMProblemDescriptionProps):void {
        const { description } = this.props;
        if(description !== prevProps.description) {
            this.setState({ contents: description });
        }
    };

    public render():React.ReactNode {
        if(this.state.editing) {
            return <div>
                <button className="btn btn-default btn-sm" onClick={this.cancelEditing}>Cancel</button>
                <button className="btn btn-default btn-sm" onClick={this.doneEditing}>Done</button>
                <PMCode value={this.state.contents} options={{lineNumbers: false, mode: 'markdown'}} onChange={this.updateContents} />
            </div>
        } else {
            return <div>
                <button className="btn btn-default btn-sm" style={{ display: this.props.canEdit ? '' : 'none' }} onClick={this.beginEditing}>Edit</button>
                <div className="col problemDescription" dangerouslySetInnerHTML={this.getProblemDescriptionHTML()} />
            </div>;
        }
    };
    private updateContents = (e: IPMCodeChangeEvent): void => {
        this.setState({ contents: e.value });
    }
    private beginEditing = (): void => {
        this.oldContents = this.state.contents;
        this.setState({ editing: true });
    };
    private doneEditing = (): void => {
        if(this.props.onChange) {
            this.props.onChange({ value: this.state.contents });
        }
        this.setState({
            editing: false,
        });
        delete this.oldContents;
    }
    private cancelEditing = (): void => {
        // this.codeMirror.toTextArea();
        this.setState({
            contents: this.oldContents,
            editing: false
        });
        delete this.oldContents;
    }
    private getProblemDescriptionHTML(): {__html: string} {
        return { __html: this.converter.makeHtml(this.state.contents) };
    }
};
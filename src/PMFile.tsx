import * as React from "react";

export interface IPMFileContentsChangedEvent {
    name: string;
    contents: string;
}
export interface IPMFileNameChangedEvent {
    oldName: string;
    name: string;
}
export interface IPMFileDeleteEvent {
    name: string;
}

interface IPMFileProps {
    filename: string;
    contents: string;
    canEdit: boolean;
    onNameChange?: (e: IPMFileNameChangedEvent) => void;
    onContentsChange?: (e: IPMFileContentsChangedEvent) => void;
    onDelete?: (e: IPMFileDeleteEvent) => void;
};

interface IPMFileState {
    editing: boolean;
    name: string;
    data: string
};

export class PMFile extends React.Component<IPMFileProps, IPMFileState> {
    private oldName: string;
    private oldData: string;
    constructor(props:IPMFileProps, state:IPMFileState) {
        super(props, state);
        this.state = {
            data: this.props.contents,
            editing: false,
            name: this.props.filename
        };
    };

    public componentDidUpdate(prevProps: IPMFileProps):void {
        const { filename, contents } = this.props;
        if(filename !== prevProps.filename) {
            this.setState({ name: filename });
        }
        if(contents !== prevProps.contents) {
            this.setState({ data: contents });
        }
    };

    public render():React.ReactNode {
        if(this.state.editing) {
            return <div>
                <button className="btn btn-default btn-sm" onClick={this.cancelEditing}>Cancel</button>
                <button className="btn btn-default btn-sm" onClick={this.doneEditing}>Done</button>
                <input type="text" autoComplete="off" value={this.state.name} onChange={this.onNameChange} />
                <textarea value={this.state.data} onChange={this.onDataChange}  />
            </div>
        } else {
            return <div>
                {this.props.canEdit && 
                    <button className="btn btn-default btn-xs" onClick={this.beginEditing} style={{ display: this.props.canEdit ? '' : 'none' }}>Edit</button>}
                {this.props.canEdit && 
                    <button className="btn btn-default btn-xs" onClick={this.deleteFile} style={{ display: this.props.canEdit ? '' : 'none' }}>Delete</button>}
                <strong>{this.state.name}:</strong>
                {this.state.data}
            </div>;
        }
    };

    private deleteFile = (): void => {
        if(this.props.onDelete) {
            this.props.onDelete({ name: this.state.name });
        }
    }
    private beginEditing = (): void => {
        this.oldData = this.state.data;
        this.oldName = this.state.name;
        this.setState({ editing: true });
    };
    private doneEditing = (): void => {
        if(this.oldName !== this.state.name && this.props.onNameChange) {
            this.props.onNameChange({ name: this.state.name, oldName: this.oldName });
        }
        if(this.oldData !== this.state.data && this.props.onContentsChange) {
            this.props.onContentsChange({ name: this.state.name, contents: this.state.data });
        }
        this.setState({ editing: false });
        delete this.oldData;
        delete this.oldName;
    }
    private cancelEditing = (): void => {
        this.setState({
            data: this.oldData,
            editing: false,
            name: this.oldName
        });
        delete this.oldData;
        delete this.oldName;
    }
    private onNameChange = (e): void => {
        this.setState({ name: e.target.value });
    }
    private onDataChange = (e): void => {
        this.setState({ data: e.target.value });
    }
};
import * as React from "react";

interface IPMFileProps {
    filename: string,
    contents: string,
    canEdit: boolean
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
                <button className="btn btn-default btn-xs" onClick={this.beginEditing} style={{ display: this.props.canEdit ? '' : 'none' }}>Edit</button>
                <strong>{this.state.name}:</strong>
                {this.state.data}
            </div>;
        }
    };

    private beginEditing = (): void => {
        this.oldData = this.state.data;
        this.oldName = this.state.name;
        this.setState({ editing: true });
    };
    private doneEditing = (): void => {
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
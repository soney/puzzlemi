import * as React from "react";
import * as showdown from 'showdown';
import { IPMTestResult } from "./pyTests/PMTestSuite";

export interface IPMTestDeleteEvent { }
export interface IPMTestChangedEvent {
    actual: string;
    expected: string;
    description: string;
}

interface IPMTestDisplayProps {
    actual: string;
    canEdit: boolean;
    description: string;
    expected: string;
    key: number;
    onChange?: (e: IPMTestChangedEvent) => void;
    onDelete?: (e: IPMTestDeleteEvent) => void;
    result: IPMTestResult | null;
};

interface IPMTestDisplayState {
    editing: boolean,
    actual: string,
    expected: string,
    description: string
};

export class PMTestDisplay extends React.Component<IPMTestDisplayProps, IPMTestDisplayState> {
    private oldActual: string;
    private oldExpected: string;
    private oldDescription: string;
    private converter: showdown.Converter = new showdown.Converter();
    constructor(props:IPMTestDisplayProps, state:IPMTestDisplayState) {
        super(props, state);
        this.state = {
            actual: this.props.actual,
            description: this.props.description,
            editing: false,
            expected: this.props.expected
        };
    };

    public componentDidUpdate(prevProps: IPMTestDisplayProps):void {
        const { actual, description, expected } = this.props;
        if(actual !== prevProps.actual) { this.setState({ actual }); }
        if(description !== prevProps.description) { this.setState({ description }); }
        if(expected !== prevProps.expected) { this.setState({ expected }); }
    };

    public render():React.ReactNode {
        if(this.state.editing) {
            return <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Actual</th>
                        <th scope="col">Expected</th>
                        <th scope="col">Description</th>
                        <th scope="col" />
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input value={this.state.actual} placeholder="Actual" onChange={this.onActualChanged} type="text" /></td>
                        <td><input value={this.state.expected} placeholder="Expected" onChange={this.onExpectedChanged} type="text" /></td>
                        <td><input value={this.state.description} placeholder="Description" onChange={this.onDescriptionChanged} type="text" /></td>
                        <td>
                            <div className="btn-group" role="group" aria-label="Basic example">
                                <button className="btn btn-outline-primary btn-sm" onClick={this.doneEditing}>Done</button>
                                <button className="btn btn-outline-secondary btn-sm" onClick={this.cancelEditing}>Cancel</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        } else {
            const ran: boolean = this.props.result !== null;
            let passed: boolean = false;
            if(ran) {
                const result = this.props.result as IPMTestResult;
                passed = result.passed;
            }
            const ranMessage = ran ? ( passed ? 'Passed' : 'Failed' ) : '';
            const extraClass = ran ? ( passed ? 'alert-success' : 'alert-danger') : 'alert-secondary';
            return <div className={'container test alert ' + extraClass}>
                <div className="row">
                    <div className="col">
                        <span dangerouslySetInnerHTML={this.getMessageHTML()} />
                    </div>
                    <div className="col">
                        {ranMessage}
                    </div>
                    {
                        this.props.canEdit && 
                        <div className="col">
                            <div className="btn-group" role="group" aria-label="Basic example">
                                <button className="btn btn-outline-secondary btn-sm" onClick={this.beginEditing}>Edit</button>
                                <button className="btn btn-outline-danger btn-sm" onClick={this.deleteTest}>Delete</button>
                            </div>
                        </div>
                    }
                </div>
            </div>;
        }
    };
    private getMessageHTML(): {__html: string} {
        return { __html: this.converter.makeHtml(this.state.description) };
    }
    private deleteTest = (): void => {
        if(this.props.onDelete) {
            this.props.onDelete({});
        }
    }
    private beginEditing = (): void => {
        this.oldActual = this.state.actual;
        this.oldExpected = this.state.expected;
        this.oldDescription = this.state.description;
        this.setState({ editing: true });
    }
    private doneEditing = (): void => {
        if(this.props.onChange) {
            this.props.onChange({
                actual: this.state.actual,
                description: this.state.description,
                expected: this.state.expected,
            })
        }
        this.setState({ editing: false });
        delete this.oldActual;
        delete this.oldDescription;
        delete this.oldExpected;
    }
    private cancelEditing = (): void => {
        this.setState({
            actual: this.oldActual,
            description: this.oldDescription,
            editing: false,
            expected: this.oldExpected
        });
        delete this.oldActual;
        delete this.oldDescription;
        delete this.oldExpected;
    }
    private onActualChanged = (e): void => {
        this.setState({ actual: e.target.value });
    }
    private onDescriptionChanged = (e): void => {
        this.setState({ description: e.target.value });
    }
    private onExpectedChanged = (e): void => {
        this.setState({ expected: e.target.value });
    }
};
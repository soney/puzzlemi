import * as React from "react";
import * as showdown from 'showdown';
import { PMAssertion } from "./pyTests/PMTest";
import { IPMTestResult } from "./pyTests/PMTestSuite";

interface IPMTestDisplayProps {
    canEdit: boolean;
    result: IPMTestResult | null;
    test: PMAssertion;
};

interface IPMTestDisplayState {
    editing: boolean,
    actual: string,
    expected: string,
    description: string
};

export class PMTestDisplay extends React.Component<IPMTestDisplayProps, IPMTestDisplayState> {
    private converter: showdown.Converter = new showdown.Converter();
    constructor(props:IPMTestDisplayProps, state:IPMTestDisplayState) {
        super(props, state);
        const { test } = this.props;
        this.state = {
            actual: test.getActualExpression(),
            description: test.getDescription(),
            editing: false,
            expected: test.getExpectedExpression()
        };
    };

    public render():React.ReactNode {
        if(this.state.editing) {
            return <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Actual</th>
                        <th scope="col">Expected</th>
                        <th scope="col">Description</th>
                        <th scope="col" colSpan={2} />
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><input value={this.state.actual} placeholder="Actual" onChange={this.onActualChanged} type="text" /></td>
                        <td><input value={this.state.expected} placeholder="Expected" onChange={this.onExpectedChanged} type="text" /></td>
                        <td><input value={this.state.description} placeholder="Description" onChange={this.onDescriptionChanged} type="text" /></td>
                        <td><button className="btn btn-default btn-sm" onClick={this.cancelEditing}>Cancel</button></td>
                        <td><button className="btn btn-default btn-sm" onClick={this.doneEditing}>Done</button></td>
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
            const ranMessage = ran ? ( passed ? 'Passed: ' : 'Failed: ' ) : '';
            return <div className={'test' + passed ? 'passed' : 'failed'}>
                {ranMessage} <span dangerouslySetInnerHTML={this.getMessageHTML()} />
                <button style={{ display: this.props.canEdit ? '' : 'none' }} className="btn btn-default btn-sm" onClick={this.beginEditing}>Edit</button>
            </div>;
        }
    };
    private getMessageHTML(): {__html: string} {
        return { __html: this.converter.makeHtml(this.props.test.getDescription()) };
    }
    private beginEditing = (): void => {
        this.setState({ editing: true });
    }
    private doneEditing = (): void => {
        const { test } = this.props;
        this.setState({ editing: false });
        test.setDescription(this.state.description);
        test.setActualExpression(this.state.actual);
        test.setExpectedExpression(this.state.expected);
        this.setState({
            actual: test.getActualExpression(),
            description: test.getDescription(),
            editing: false,
            expected: test.getExpectedExpression(),
        });
    }
    private cancelEditing = (): void => {
        const { test } = this.props;
        this.setState({
            actual: test.getActualExpression(),
            description: test.getDescription(),
            editing: false,
            expected: test.getExpectedExpression(),
        });
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
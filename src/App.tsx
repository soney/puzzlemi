import * as React from 'react';
import './App.css';
import { PMProblem } from './PMProblem';

export interface IProblem {
};

interface IPMApplicationProps {
    isAdmin?: boolean;
};

interface IPMApplicationState {
    isAdmin: boolean;
    problems: IProblem[];
};

export class App extends React.Component<IPMApplicationProps, IPMApplicationState> {
    public constructor(props:IPMApplicationProps, state:IPMApplicationState) {
        super(props, state);
        this.state = {
            isAdmin: !!this.props.isAdmin,
            problems: []
        };
    };
    public render(): React.ReactNode {
        const problemDisplays = this.state.problems.map((p, i) => {
            return <div key={i}>
                <button className="btn btn-default" onClick={this.deleteProblem.bind(this, i)}>Delete</button>
                <PMProblem isAdmin={this.state.isAdmin} />
            </div>;
        });
        return <div>
            {problemDisplays}
            {this.state.isAdmin && <button className="btn btn-default btn-block" onClick={this.addProblem}>+ Problem</button> }
        </div>;
    }
    private addProblem = (): void => {
        this.state.problems.push({});
        this.setState({ problems: this.state.problems });
    }
    private deleteProblem = (index: number): void => {
        this.state.problems.splice(index, 1);
        this.setState({ problems: this.state.problems });
    };
}
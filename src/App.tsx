import * as React from 'react';
import './App.css';
import { PMProblem } from './PMProblem';

export interface IProblem {

}

export class App extends React.Component {
    private problems: IProblem[] = [];
    public render(): React.ReactNode {
        const problemDisplays = this.problems.map((p, i) => {
            return <PMProblem key={i} />;
        });
        return <div>
            {problemDisplays}
            <button className="btn btn-default btn-block" onClick={this.addProblem}>+ Problem</button>
        </div>;
    }
    private addProblem = (): void => {
        this.problems.push({});
        this.setState({ problems: this.problems });
    }
}
// import update from 'immutability-helper';
import * as React from 'react';
// import { SDBClient, SDBDoc } from 'sdb-ts';
import '../css/App.css';
import * as reactRedux from 'react-redux';
import { addProblem } from '../actions';

const AppRedux = ({ dispatch }) => {
    // const problemDisplays = this.state.problems.map((p, i) => {
    //     return <div key={i}>
    //         <PMProblem
    //             afterCode={p.afterCode}
    //             givenCode={p.givenCode}
    //             files={p.files}
    //             description={p.description}
    //             tests={p.tests}
    //             isAdmin={this.state.isAdmin}
    //         />
    //     </div>;
    // });
    return <div>
        <div className="container">
            <button className="btn btn-outline-success btn-sm btn-block" onClick={dispatch(addProblem())}>+ Problem</button>
        </div>
    </div>;
};

export const App = reactRedux.connect()(AppRedux);
// export class App extends React.Component<IPMApplicationProps, IPMApplicationState> {
    // public render(): React.ReactNode {
//     }
// }
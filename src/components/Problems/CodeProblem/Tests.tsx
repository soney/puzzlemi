import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import Test from './Test';
import { addTest } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';

const Tests = ({ problem, tests, isAdmin, dispatch }) => {
    const doAddTest = () => {
        dispatch(addTest(problem.id));
    }
    if (isAdmin) {
        return <div className='tests'>
            <h4>Tests:</h4>
            <i>Note: <code>self.getEditorText()</code> refers to the source code and <code>self.getOutput()</code> refers to the output.</i>
            <table className="table">
                <thead>
                    <tr>
                        <th>Actual</th>
                        <th>Expected</th>
                        <th>Description</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {tests && tests.length
                    ? tests.map((test, i) => <Test problem={problem} test={test} key={test.id+`${i}`} testIndex={i} />)
                    : <tr><td colSpan={4} className='no-tests'>(no tests)</td></tr>
                    }
                    <tr>
                        <td colSpan={4}>
                            <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTest}>+ Test</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>;
    } else {
        if(tests && tests.length) {
            return <div className='tests'>
                <table className="table">
                    <tbody>
                        { tests.map((test, i) => <Test problem={problem} test={test} key={`${test.id}-${i}`}  testIndex={i} />) }
                    </tbody>
                </table>
            </div>;
        } else {
            return <div className='tests' />
        }
    }
}
function mapStateToProps(state: IPMState, ownProps) {
    const { problem } = ownProps;
    const problemID = problem.id;
    const { intermediateUserState } = state;
    const { isAdmin } = intermediateUserState;

    const { problemDetails } = problem;
    const { tests } = problemDetails;

    const testIDs = tests.map((t) => t.id); // fingerprint

    return update(ownProps, { $merge: { isAdmin, problem, problemID, tests, testIDs }});
}
export default connect(mapStateToProps)(Tests); 
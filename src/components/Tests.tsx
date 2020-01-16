import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import Test from './Test';
import { addTest } from '../actions/sharedb_actions';

const Tests = ({ index, tests, isAdmin, doc, dispatch }) => {
    const doAddTest = () => {
        dispatch(addTest(index));
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
                    ? tests.map((test, i) => <Test key={test.id+`${i}`} index={index} testIndex={i} />)
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
                        { tests.map((test, i) => <Test key={test.id+`${i}`} index={index} testIndex={i} />) }
                    </tbody>
                </table>
            </div>;
        } else {
            return <div className='tests' />
        }
    }
}
function mapStateToProps(state, ownProps) {
    const { user, problems, doc } = state;
    const { isAdmin } = user;
    const problemInfo = problems[ownProps.index];
    const { problem } = problemInfo;
    const { tests } = problem;

    return update(ownProps, { isAdmin: {$set: isAdmin}, tests: {$set: tests}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(Tests); 
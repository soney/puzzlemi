import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import TestTemplateVariable from './TestTemplateVariable';
import { addTestVariable } from '../actions/sharedb_actions';


const TestTemplate = ({ index, isAdmin, doc, testVariable, dispatch }) => {
    const doAddTestVariable = () => {
        dispatch(addTestVariable(index, isAdmin));
    }

    return <div className='test-template'>
        {isAdmin && <div>
            <h4>Default Test</h4>
            <table className="table">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Variable Name</th>
                        <th>Default Value</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {testVariable && testVariable.length
                        ? testVariable.map((variable, i) => <TestTemplateVariable key={i} index={index} variableIndex={i} variable={variable} />)
                        : <tr><td colSpan={6} className='no-tests'>(no variables)</td></tr>
                    }

                    <tr>
                        <td colSpan={6}>
                            <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddTestVariable}>+ Variable</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>}
    </div>
}
function mapStateToProps(state, ownProps) {
    const { user, problems, doc } = state;
    const { isAdmin } = user;
    const problem = problems[ownProps.index];
    const { variables } = problem;
    const testVariable = variables;
    return update(ownProps, { isAdmin: { $set: isAdmin }, testVariable: { $set: testVariable }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(TestTemplate); 
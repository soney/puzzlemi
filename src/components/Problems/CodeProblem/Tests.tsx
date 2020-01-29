import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import Test from './Test';

import { addTest } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';
import VariableTest from './UnitTest/VariableTest';
import ConfigPanel from './ConfigPanel';
import { ICodeSolutionState } from '../../../reducers/intermediateUserState';

const Tests = ({ config, problem, tests, isAdmin, dispatch, outputVariables, validVariableTests, passedVariableTests }) => {
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
                        ? tests.map((test, i) => <Test problem={problem} test={test} key={test.id + `${i}`} testIndex={i} />)
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
        // if (tests && tests.length) {
            const pass_rate = validVariableTests.length === 0 ? 0 : passedVariableTests.length / validVariableTests.length * 100;
            const width_style = { width: pass_rate + "%" } as React.CSSProperties;
            return <div className='tests'>
                {config.runTests &&
                    <div className='variable-tests-results'>
                        <div className="progress">
                            <div className="progress-bar bg-success" role="progressbar" style={width_style} aria-valuenow={pass_rate} aria-valuemin={0} aria-valuemax={100}>
                                {passedVariableTests.length} / {validVariableTests.length}
                            </div>
                        </div>
                    </div>
                }
                <div>
                    <table className="table">
                        <tbody>
                            {tests.map((test, i) => <Test problem={problem} test={test} key={`${test.id}-${i}`} testIndex={i} />)}
                        </tbody>
                    </table>
                    <table className="table">
                        <tbody>
                            {outputVariables.map((variable, i) => <VariableTest problem={problem} variable={variable} key={`${variable.name}-${i}`} />)}
                        </tbody>
                    </table>
                </div>
            </div>;
    //     } else {
    //         return <div className='tests' />
    //     }
    }
}
function mapStateToProps(state: IPMState, ownProps) {
    const { problem } = ownProps;
    const problemID = problem.id;
    const { intermediateUserState } = state;
    const { isAdmin, intermediateSolutionState } = intermediateUserState;
    const intermediateProblemState = intermediateSolutionState[problem.id] as ICodeSolutionState;
    const { passedVariableTests, currentFailedVariableTest } = intermediateProblemState;

    const { problemDetails } = problem;
    const { tests, variables, config, variableTests } = problemDetails;

    const outputVariables = variables.filter(i => i.type === 'output')
    const validVariableTests = variableTests.filter(i => i.verified === true);

    const testIDs = tests.map((t) => t.id); // fingerprint

    return update(ownProps, { $merge: { isAdmin, problem, problemID, tests, testIDs, outputVariables, validVariableTests, config, passedVariableTests, currentFailedVariableTest } });
}
export default connect(mapStateToProps)(Tests); 
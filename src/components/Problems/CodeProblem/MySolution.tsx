import * as React from 'react';
import { useState } from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from '../../CodeEditor';
import { CodeInputEditor } from '../../CodeInputEditor';
import { CodeOutputEditor } from '../../CodeOutputEditor';
import { ICodeSolution } from '../../../reducers/solutions';
import { ICodeVariableTest } from '../../../reducers/problems';
import { ISolutionState, ICodeSolutionState } from '../../../reducers/intermediateUserState';
import { runCode } from '../../../actions/runCode_actions';
import { codeChanged } from '../../../actions/user_actions';
import { addVariableTest } from '../../../actions/sharedb_actions';
import Tests from './Tests';
import Files from './Files';

import uuid from '../../../utils/uuid';


// import { setHelpRequest } from '../actions/sharedb_actions';
// import { setCode, updateActiveFailedTestID } from '../actions/user_actions';
// import TestResults from './TestResults';
// import Result from './Result';
// import { runCode, runUnitTests, runVerifyTest } from '../actions/runCode_actions';
// import { newTest } from '../actions/sharedb_actions';
// import { ITest } from '../utils/types';


const MySolution = ({ userSolution, intermediateCodeState, isAdmin, username, problem, failedTest, output, errors, verifiedTests, config, flag, variables, dispatch }) => {
    const codeSolution = userSolution as ICodeSolution;
    const graphicsRef = React.createRef<HTMLDivElement>();
    const doRunCode = () => {
        const graphicsEl = graphicsRef.current;
        if (graphicsEl) {
            graphicsEl.innerHTML = '';
        }
        return dispatch(runCode(codeSolution, problem, intermediateCodeState, graphicsEl, myTest));
    };
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(codeChanged(problem, value));
    };

    let myTest: ICodeVariableTest;
    myTest = {
        author: username,
        verified: isAdmin,
        id: uuid(),
        input: variables.filter(i => i.type === 'input'),
        output: variables.filter(i => i.type === 'output')
    };

    const [count, setCount] = useState(0);

    // const doRequestHelp = () => {
    //     dispatch(setHelpRequest(id, uid));
    // }

    // const doSetCode = (ev) => {
    //     const { value } = ev;
    //     console.log('todo ' + value);
    //     // return dispatch(setCode(index, value));
    // };
    const doResetTest = () => {
        setCount(count + 1);
        console.log('todo');
        // dispatch(updateActiveFailedTestID(id, ''));
    }
    // const doRunCode = () => {
    //     doResetTest();
    //     // return dispatch(runCode(index));
    // };
    const doRunTests = () => {
        // return dispatch(runUnitTests(index));
    };
    const doChangeInputVariable = (index, content) => {
        myTest.input[index].value = content;
    }
    const doChangeOutputVariable = (index, content) => {
        myTest.output[index].value = content;
    }

    const doSubmitTest = () => {
        dispatch(addVariableTest(problem.id, myTest));
        // if (config.autoVerify) dispatch(runVerifyTest(index, myTest.id));
        // doResetTest();
    }

    return <div>
        <div className="row">
            <div className="col">
                <div>
                    {variables &&
                        <CodeInputEditor failedTest={failedTest} variables={variables} onVariableChange={doChangeInputVariable} flag={count} isEdit={config.addTests} />
                    }
                    <CodeEditor value={codeSolution.code} onChange={doSetCode} flag={flag} />
                    {variables &&
                        <CodeOutputEditor failedTest={failedTest} variables={variables} onVariableChange={doChangeOutputVariable} flag={count} isEdit={config.addTests} />
                    }
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
                    {config.runTests &&
                        <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunTests}>Run All Tests ({verifiedTests.length})</button>
                    }
                    {variables && config.addTests &&
                        <div className="test-btn">
                            <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doResetTest}>Reset Test Case</button>
                            <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doSubmitTest}>Submit New Test Case</button>
                        </div>
                    }
                </div>
            </div>
            <div className="col">
                <pre className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                    {output}
                    {errors.join('\n')}
                </pre>
                <div ref={graphicsRef} className='graphics'></div>

                <Files problem={problem} />
                {/* <div>
                    {defaultResult.passedAll !== -1 &&
                        <Result result={defaultResult} tag="default" />
                    }
                    {testResults.length !== 0 &&
                        <TestResults index={index} />
                    }
                </div> */}
            </div>
        </div>
        <div className="row">
            <div className="col">
                <Tests problem={problem} />
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const myuid = users.myuid as string;

    const username = myuid === "testuid" ? "testuser" : users.allUsers[myuid].username;

    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config, variables, variableTests } = problemDetails;
    const verifiedTests = variableTests.filter(i => i.verified === true);
    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid];
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { output, errors } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { output: '', errors: [] };
    return update(ownProps, { $merge: { isAdmin, username, problemsDoc, config, variables, userSolution, intermediateCodeState, output, errors, verifiedTests } });
}
export default connect(mapStateToProps)(MySolution);

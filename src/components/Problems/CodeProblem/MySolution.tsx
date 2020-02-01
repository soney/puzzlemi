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
import { runCode, runUnitTests, runVerifyTest } from '../../../actions/runCode_actions';
import { codeChanged } from '../../../actions/user_actions';
import { addVariableTest } from '../../../actions/sharedb_actions';
import Tests from './Tests';
import Files from './Files';
import uuid from '../../../utils/uuid';


const MySolution = ({ userSolution, intermediateCodeState, isAdmin, username, problem, output, errors, verifiedTests, config, flag, variables, dispatch, failedTest }) => {
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
    if(failedTest!==null){
        myTest = JSON.parse(JSON.stringify(failedTest));
        myTest.author = username;
        myTest.id = uuid();
        myTest.verified = isAdmin;
    } else {
        myTest = {
            author: username,
            verified: isAdmin,
            id: uuid(),
            input: JSON.parse(JSON.stringify(variables.filter(i=>i.type === 'input'))),
            output: JSON.parse(JSON.stringify(variables.filter(i => i.type === 'output')))
        };    
    }

    const [count, setCount] = useState(0);

    // const doRequestHelp = () => {
    //     dispatch(setHelpRequest(id, uid));
    // }

    const doResetTest = () => {
        setCount(count + 1);
    }
    const doRunTests = () => {
        const graphicsEl_tmp = graphicsRef.current;
        if (graphicsEl_tmp) {
        graphicsEl_tmp.innerHTML = '';
        }
        return dispatch(runUnitTests(codeSolution, problem, intermediateCodeState, graphicsEl_tmp));
    };
    const doChangeInputVariable = (index, content) => {
        myTest.input[index].value = content;
    }
    const doChangeOutputVariable = (index, content) => {
        myTest.output[index].value = content;
    }

    const doSubmitTest = () => {
        dispatch(addVariableTest(problem.id, myTest));
        if (config.autoVerify) dispatch(runVerifyTest(problem, intermediateCodeState, myTest));
        // doResetTest();
    }

    return <div>
        <div className="row">
            <div className="col">
                <div>
                    {variables &&
                        <CodeInputEditor failedTest={failedTest} variables={variables} onVariableChange={doChangeInputVariable} flag={count+flag} isEdit={config.addTests} />
                    }
                    <CodeEditor value={codeSolution.code} onChange={doSetCode} flag={flag} />
                    {variables &&
                        <CodeOutputEditor failedTest={failedTest} variables={variables} onVariableChange={doChangeOutputVariable} flag={count+flag} isEdit={config.addTests} />
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
    const { output, errors, currentFailedVariableTest } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { output: '', errors: [], currentFailedVariableTest: '' };
    let failedT = verifiedTests.filter(i=>i.id===currentFailedVariableTest);
    const failedTest = failedT.length>0?failedT[0]:null;
    return update(ownProps, { $merge: { isAdmin, username, problemsDoc, config, variables, userSolution, intermediateCodeState, output, errors, verifiedTests, failedTest } });
}
export default connect(mapStateToProps)(MySolution);

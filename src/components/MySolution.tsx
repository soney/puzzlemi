import * as React from 'react';
import { useState } from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import { CodeInputEditor } from './CodeInputEditor';
import { CodeOutputEditor } from './CodeOutputEditor';
import { setHelpRequest } from '../actions/sharedb_actions';
import { setCode, updateActiveFailedTestID } from '../actions/user_actions';
import TestResults from './TestResults';
import { runCode, runUnitTests, runVerifyTest} from '../actions/runCode_actions';
import { newTest } from '../actions/sharedb_actions';
import { ITest } from './App';
import uuid from '../utils/uuid';


const MySolution = ({ index, uid, doc,id, testResults, failedTest, userInfo, verifiedTests, config, isAdmin, variables, errors, output, code, dispatch }) => {

    let myTest:ITest;
    if (variables) {
        myTest = {
            author: userInfo.username,
            verified:isAdmin,
            hidden: false,
            helpSessions: [],
            id: uuid(),
            input: [],
            output: []
        };
        variables.forEach(variable=>{
            const variable_copy = JSON.parse(JSON.stringify(variable));
            if(variable.type === "input") myTest.input.push(variable_copy);
            else if (variable.type === "output") myTest.output.push(variable_copy);
        })
    }
    const [count, setCount] = useState(0);

    const doRequestHelp = () => {
        dispatch(setHelpRequest(id, uid));
    }

    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(setCode(index, value));
    };
    const doResetTest = () => {
        setCount(count + 1);
        dispatch(updateActiveFailedTestID(id, ''));
    }
    const doRunCode = () => {
        doResetTest();
        return dispatch(runCode(index));
    };
    const doRunTests = () => {
        return dispatch(runUnitTests(index));
    };
    const doChangeInputVariable = (index, content) => {
        myTest.input[index].value = content;
    }
    const doChangeOutputVariable = (index, content) => {
        myTest.output[index].value = content;
    }

    const doSubmitTest = () => {
        dispatch(newTest(index, myTest)).then(
            dispatch(runVerifyTest(index, myTest.id))
        );
        doResetTest();
    }

    return <div>
        <div className="row">
            <div className="col">
                <div>
                    {variables &&
                        <CodeInputEditor failedTest = {failedTest} variables={variables} onVariableChange={doChangeInputVariable} flag={count} isEdit={config.addTests}/>
                    }
                    <CodeEditor value={code} onChange={doSetCode} />
                    {variables &&
                        <CodeOutputEditor failedTest = {failedTest} variables={variables} onVariableChange={doChangeOutputVariable} flag={count} isEdit={config.addTests}/>
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
                <div>
                    {(output || errors.length > 0) &&
                        <div>
                        <pre className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                            {output}
                            {errors.join('\n')}
                        </pre>
                        </div>
                    }
                    <TestResults index={index} />
                    {(output || errors.length > 0) &&
                    <button className='btn btn-outline-primary request-help-button' onClick={doRequestHelp}>Request Help</button>
                    }
                </div>
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems } = state;
    const { isAdmin, userInfo } = user;
    const problem = problems[index];
    const { id, config, variables, tests } = problem;
    let verifiedT: any[] = [];
    tests.forEach((test, i) => {
        if (test.verified === true) verifiedT.push({ i, test });
    });
    const verifiedTests = verifiedT;
    const uid = user.id;

    const { code, output, errors, activeFailedTestID, testResults } = user.solutions[id];

    let failedT = null;
    if(activeFailedTestID!=='') {
        tests.forEach(test => {
            if(test.id === activeFailedTestID) failedT = test;
        })
    }
    const failedTest = failedT;

    return update(ownProps, { index: { $set: index }, testResults: {$set: testResults}, failedTest: {$set: failedTest}, userInfo: {$set: userInfo}, verifiedTests: {$set: verifiedTests}, config: {$set: config}, uid: { $set: uid }, id:{$set:id}, isAdmin: { $set: isAdmin }, variables: { $set: variables }, errors: { $set: errors }, output: { $set: output }, code: { $set: code }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(MySolution);

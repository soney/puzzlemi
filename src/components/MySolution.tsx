import * as React from 'react';
import { useState } from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import { CodeInputEditor } from './CodeInputEditor';
import { CodeOutputEditor } from './CodeOutputEditor';
import { setHelpRequest } from '../actions/sharedb_actions';
import { setCode } from '../actions/user_actions';
import TestResults from './TestResults';
import { runCode, runUnitTests } from '../actions/runCode_actions';
import { newTest } from '../actions/sharedb_actions';
import { ITest } from './App';
import uuid from '../utils/uuid';


const MySolution = ({ index, uid, doc,id, isAdmin, defaultTest, errors, output, code, dispatch }) => {
    let myTest:ITest;
    if (defaultTest) {
        myTest = {
            author: uid,
            verified:isAdmin,
            hidden: false,
            helpSessions: [],
            id: uuid(),
            input: [],
            output: []
        };
        defaultTest.forEach(variable=>{
            if(variable.type === "input") myTest.input.push(variable);
            else if (variable.type === "output") myTest.output.push(variable);
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
    const doRunCode = () => {
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
        return dispatch(newTest(index, myTest));
    }
    const doResetTest = () => {
        setCount(count + 1);
    }
    return <div>
        <div className="row">
            <div className="col">
                <div>
                    {defaultTest &&
                        <CodeInputEditor variables={defaultTest} onVariableChange={doChangeInputVariable} flag={count} />
                    }
                    <CodeEditor value={code} onChange={doSetCode} />
                    {defaultTest &&
                        <CodeOutputEditor variables={defaultTest} onVariableChange={doChangeOutputVariable} flag={count} />
                    }
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunTests}>Run All Tests</button>
                    {defaultTest &&
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
    const { isAdmin } = user;
    const problem = problems[index];
    const { id } = problem;
    const defaultTest = problem.variables;
    const uid = user.id;
    const { code, output, errors } = user.solutions[id];
    return update(ownProps, { index: { $set: index }, uid: { $set: uid }, id:{$set:id}, isAdmin: { $set: isAdmin }, defaultTest: { $set: defaultTest }, errors: { $set: errors }, output: { $set: output }, code: { $set: code }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(MySolution);

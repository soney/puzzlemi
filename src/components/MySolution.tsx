import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import { setCode } from '../actions/user_actions';
import TestResults from './TestResults';
import { runCode, runUnitTests } from '../actions/runCode_actions';


const MySolution = ({ index, uid, doc, passedAll, errors, output, code, dispatch }) => {
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(setCode(index, value));
    };
    const doRunCode = () => {
        return dispatch(runCode(index));
    };
    const doRunTests = () => {
        return dispatch(runUnitTests(index));
    }
    return <div>
        <div className="row">
            <div className="col">
                <div>
                    <CodeEditor value={code} onChange={doSetCode} />
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunTests}>Run All Tests</button>
                </div>
            </div>
            <div className="col">
                <div>
                    {(output || errors.length > 0) &&
                        <pre className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                            {output}
                            {errors.join('\n')}
                        </pre>
                    }
                    <TestResults index={index} />
                </div>
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems } = state;
    const { id } = problems[index];
    const uid = user.id;
    const { code, output, passedAll, errors } = user.solutions[id];
    return update(ownProps, { index: { $set: index }, uid: { $set: uid }, passedAll: { $set: passedAll }, errors: { $set: errors }, output: { $set: output }, code: { $set: code }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(MySolution);

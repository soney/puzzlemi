import * as React from 'react';
import { connect } from "react-redux";
import { deleteProblem, resetCode, setCode } from '../actions/index';
import { runCode } from '../actions/userCode';
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import Tests from './Tests';
import Files from './Files';

const Problem = ({ code, errors, index, output, dispatch, doc, passedAll, isAdmin }) => {
    const delProblem = () => {
        return dispatch(deleteProblem(index));
    };
    const doRunCode = () => {
        return dispatch(runCode(index));
    };
    const doResetCode = () => {
        return dispatch(resetCode(index));
    };
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(setCode(index, value));
    };
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    const afterCodeSubDoc = doc.subDoc([...p, 'afterCode']);
    return <li className={'problem container' + (passedAll ? ' passedAll' : '')}>
        { isAdmin &&
            <div className="row">
                <div className="col">
                    <button className="btn btn-block btn-sm btn-outline-danger" onClick={delProblem}>Delete Problem</button>
                </div>
            </div>
        }
        <div className="row">
            <div className="col">
                <ProblemDescription index={index} />
            </div>
        </div>
        <div className="row">
            {   isAdmin &&
                <div className="col">
                    <h4>Given Code:</h4>
                    <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                    <h4>Run After:</h4>
                    <CodeEditor shareDBSubDoc={afterCodeSubDoc} />
                </div>
            }
            {   !isAdmin &&
                <div className="col">
                    <CodeEditor value={code} onChange={doSetCode} />
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
                </div>
            }
            <div className="col">
                {   !isAdmin &&
                    <div className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                        {output}
                        {errors.join('\n')}
                    </div>
                }
                <Files index={index} />
            </div>
        </div>
        <div className="row">
            <div className="col">
                <Tests index={index} />
            </div>
        </div>
    </li>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems } = state;
    const { id } = problems[index];
    const { isAdmin } = user;
    const { code, output, passedAll, errors } = user.solutions[id];
    return update(ownProps, { passedAll: { $set: passedAll },  errors: { $set: errors }, output: { $set: output }, isAdmin: { $set: isAdmin }, code: { $set: code }, doc: { $set: doc }});
}
export default connect(mapStateToProps)(Problem);

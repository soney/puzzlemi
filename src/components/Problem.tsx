import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import Tests from './Tests';
import Files from './Files';
import { deleteProblem } from '../actions/sharedb_actions';
import { runCode } from '../actions/runCode_actions';
import { setCode } from '../actions/user_actions';

const Problem = ({ code, errors, index, output, dispatch, doc, passedAll, isAdmin, numCompleted, myCompletionIndex }) => {
    const doDeleteProblem = () => {
        return dispatch(deleteProblem(index));
    };
    const doRunCode = () => {
        return dispatch(runCode(index));
    };
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(setCode(index, value));
    };
    const iHaveCompleted = myCompletionIndex >= 0;
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    const afterCodeSubDoc = doc.subDoc([...p, 'afterCode']);
    return <li className={'problem container' + (passedAll ? ' passedAll' : '')}>
        { isAdmin &&
            <div className="row">
                <div className="col">
                    <button className="btn btn-block btn-sm btn-outline-danger" onClick={doDeleteProblem}>Delete Problem</button>
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
                    <pre className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                        {output}
                        {errors.join('\n')}
                    </pre>
                }
                <Files index={index} />
            </div>
        </div>
        <div className="row">
            <div className="col">
                <Tests index={index} />
            </div>
        </div>
        <div className="row completion-info">
            <div className="col">
                {iHaveCompleted &&
                    <span> You are #{myCompletionIndex+1} of </span>
                }
                {numCompleted} {numCompleted === 1 ? 'user' : 'users'}{iHaveCompleted && <span> that</span>} finished this problem.
            </div>
        </div>
    </li>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems, userData } = state;
    const { id } = problems[index];
    const { isAdmin } = user;
    const { code, output, passedAll, errors } = user.solutions[id];
    const completed: string[] = userData[id] ? userData[id].completed : [];
    const numCompleted = completed.length;
    const myCompletionIndex = completed.indexOf(user.id);
    return update(ownProps, { numCompleted: {$set: numCompleted }, myCompletionIndex: { $set: myCompletionIndex}, passedAll: { $set: passedAll },  errors: { $set: errors }, output: { $set: output }, isAdmin: { $set: isAdmin }, code: { $set: code }, doc: { $set: doc }});
}
export default connect(mapStateToProps)(Problem);

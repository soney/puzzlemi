import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from '../CodeEditor';
import Tests from '../Tests';
import Files from '../Files';
import { runCode } from '../../actions/runCode_actions';
import { setCode } from '../../actions/user_actions';

const CodeProblem = ({ index, problem, code, output, dispatch, doc, isAdmin, errors }) => {
    const doRunCode = () => {
        return dispatch(runCode(index));
    };
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(setCode(index, value));
    };

    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'problem', 'givenCode']);
    const afterCodeSubDoc = doc.subDoc([...p, 'problem', 'afterCode']);
    return <>
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
    </>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems } = state;
    const { id } = problems[index];
    const { isAdmin } = user;
    const { code, output, errors } = user.solutions[id];
    // const visible = userData[id] && userData[id].visible;
    return update(ownProps, { id: {$set: id},  errors: { $set: errors }, output: { $set: output }, isAdmin: { $set: isAdmin }, code: { $set: code }, doc: { $set: doc }});
}
export default connect(mapStateToProps)(CodeProblem);

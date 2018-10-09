import * as React from 'react';
import { connect } from "react-redux";
import { deleteProblem } from '../actions/index';
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import Tests from './Tests';
import Files from './Files';

const Problem = ({ index, dispatch, doc, isAdmin }) => {
    const delProblem = () => {
        return dispatch(deleteProblem(index));
    };
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    const afterCodeSubDoc = doc.subDoc([...p, 'afterCode']);
    return <li className={'problem container'}>
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
        {
            isAdmin &&
            <div className="row">
                <div className="col">
                    <h4>Given Code:</h4>
                    <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                </div>
            </div>
        }
        {   isAdmin &&
            <div className="row">
                <div className="col">
                    <h4>Run After:</h4>
                    <CodeEditor shareDBSubDoc={afterCodeSubDoc} />
                </div>
            </div>
        }
        <div className="row">
            <div className="col">
                {   !isAdmin &&
                    <CodeEditor value='' />
                }
                {   !isAdmin &&
                    <button disabled={false} className='btn btn-outline-success btn-sm btn-block'>Run</button>
                }
            </div>
            <div className="col">
                <Files index={index} />
            </div>
        </div>
        <div className="row">
            <div className="col">
                <h4>Tests:</h4>
                <Tests index={index} />
            </div>
        </div>
    </li>;
}
function mapStateToProps(state, ownProps) {
    const { isAdmin, doc } = state;
    return update(ownProps, { isAdmin: { $set: isAdmin }, doc: { $set: doc }});
}
export default connect(mapStateToProps)(Problem);

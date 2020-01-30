import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from '../../CodeEditor';
import update from 'immutability-helper';
import { deleteUserFile } from '../../../actions/user_actions';
import { deleteProblemFile } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';

const File = ({ dispatch, problem, fileIndex, file, name, contents, isAdmin, problemsDoc, isUserFile }) => {
    const doDeleteFile = () => {
        if(isUserFile) {
            dispatch(deleteUserFile(problem.id, file.id));
        } else {
            dispatch(deleteProblemFile(problem.id, file.id));
        }
    };
    const p = ['allProblems', problem.id, 'problemDetails', 'files', fileIndex];
    const nameSubDoc = problemsDoc.subDoc([...p, 'name']);
    const contentsSubDoc = problemsDoc.subDoc([...p, 'contents']);
    if(isAdmin) {
        return <div>
            <div className='clearfix'>
                <button className="btn btn-outline-danger btn-sm float-right" onClick={doDeleteFile}>Delete</button>
            </div>
            <CodeEditor shareDBSubDoc={nameSubDoc} options={{lineNumbers: false, mode: 'text', lineWrapping: true, height: 30}} />
            <CodeEditor shareDBSubDoc={contentsSubDoc} options={{lineNumbers: false, mode: 'text', lineWrapping: true, height: 120}} />
        </div>;
    } else {
        return <div className='file'>
            <div className='fileInfo clearfix'>
                <code className='filename'>{name}</code>
                { isUserFile &&
                    <button className="btn btn-outline-danger btn-sm float-right" onClick={doDeleteFile}>Delete</button>
                }
            </div>
            <pre className='fileData'>
                {contents}
            </pre>
        </div>;
    }
}
function mapStateToProps(state: IPMState, ownProps) {
    const { file } = ownProps;
    const { name, contents } = file;
    const { intermediateUserState, shareDBDocs } = state;
    const { isAdmin } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;

    return update(ownProps, { $merge: { isAdmin, problemsDoc, name, contents } });
}
export default connect(mapStateToProps)(File); 
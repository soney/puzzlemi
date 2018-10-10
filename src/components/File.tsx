import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import { deleteUserFile } from '../actions/user_actions';
import { deleteFile } from '../actions/sharedb_actions';

const File = ({ dispatch, index, fileIndex, file, isAdmin, doc, isUserFile }) => {
    const doDeleteFile = () => {
        if(isUserFile) {
            dispatch(deleteUserFile(index, file.name));
        } else {
            dispatch(deleteFile(index, fileIndex));
        }
    };
    const p = ['problems', index, 'files', fileIndex];
    const nameSubDoc = doc.subDoc([...p, 'name']);
    const contentsSubDoc = doc.subDoc([...p, 'contents']);
    if(isAdmin) {
        return <div>
            <button className="btn btn-outline-danger btn-sm" onClick={doDeleteFile}>Delete</button>
            <CodeEditor shareDBSubDoc={nameSubDoc} options={{lineNumbers: false, mode: 'text', lineWrapping: true}} />
            <CodeEditor shareDBSubDoc={contentsSubDoc} options={{lineNumbers: false, mode: 'text', lineWrapping: true}} />
        </div>;
    } else {
        return <div className='file'>
            <div className='fileInfo'>
                <code className='filename'>{file.name}</code>
                { isUserFile &&
                    <button className="btn btn-outline-danger btn-sm" onClick={doDeleteFile}>Delete</button>
                }
            </div>
            <pre className='fileData'>
                {file.contents}
            </pre>
        </div>;
    }
}
function mapStateToProps(state, ownProps) {
    const { index, fileIndex, isUserFile } = ownProps;
    const { user, problems, doc } = state;
    const { isAdmin, solutions } = user;
    const problem = problems[index]

    let file;
    if(isUserFile) {
        const solution = solutions[problem.id];
        file = solution.files[fileIndex]
    } else {
        file = problem.files[fileIndex]
    }

    return update(ownProps, { isAdmin: {$set: isAdmin}, file: {$set: file}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(File); 
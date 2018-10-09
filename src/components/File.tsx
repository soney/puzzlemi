import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import { descriptionChanged, deleteTest, deleteFile } from '../actions';

const File = ({ dispatch, index, fileIndex, file, isAdmin, doc }) => {
    const doDeleteFile = () => {
        dispatch(deleteFile(index, fileIndex));
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
                {file.name}
            </div>
            <div className='fileData'>
                {file.contents}
            </div>
        </div>;
    }
}
function mapStateToProps(state, ownProps) {
    const { index, fileIndex } = ownProps;
    const { isAdmin, problems, doc } = state;
    const file = problems[index].files[fileIndex];

    return update(ownProps, { isAdmin: {$set: isAdmin}, file: {$set: file}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(File); 
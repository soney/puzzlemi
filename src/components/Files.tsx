import * as React from 'react';
import { connect } from "react-redux";
import * as showdown from 'showdown';
import { CodeEditor } from './CodeEditor';
import update from 'immutability-helper';
import { descriptionChanged, addTest, addFile } from '../actions';
import File from './File';

const Files = ({ index, files, isAdmin, doc, dispatch }) => {
    const doAddFile = () => {
        dispatch(addFile(index));
    }
    const hasFiles = !!(files && files.length);
    return <div>
        {   hasFiles &&
            <h4>Files:</h4>
        }
        {   hasFiles &&
            files.map((file, i) => <File key={file.id+`${i}`} index={index} fileIndex={i} />)
        }
        { isAdmin &&
            <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddFile}>+ File</button>
        }
    </div>;
}
function mapStateToProps(state, ownProps) {
    const { isAdmin, problems, doc } = state;
    const problem = problems[ownProps.index];
    const { files } = problem;

    return update(ownProps, { isAdmin: {$set: isAdmin}, files: {$set: files}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(Files); 
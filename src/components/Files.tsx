import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import File from './File';
import { addFile } from '../actions/sharedb_actions';

const Files = ({ index, files, isAdmin, doc, dispatch, userFiles }) => {
    const doAddFile = () => {
        dispatch(addFile(index));
    }
    const hasFiles = !!(files && files.length);
    const hasUserFiles = !!(userFiles && userFiles.length);
    return <div>
        {   isAdmin &&
            <h4>Files:</h4>
        }
        {   (hasFiles || hasUserFiles) &&
            <hr />
        }
        {   (hasFiles) &&
            files.map((file, i) => <File key={file.id+`${i}`} index={index} fileIndex={i} isUserFile={false} />)
        }
        {   (hasUserFiles) &&
            userFiles.map((file, i) => <File key={file.id+`${i}`} index={index} fileIndex={i} isUserFile={true} />)
        }
        { isAdmin &&
            <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddFile}>+ File</button>
        }
    </div>;
}
function mapStateToProps(state, ownProps) {
    const { user, problems, doc } = state;
    const { isAdmin, solutions } = user;
    const problem = problems[ownProps.index];
    const { files } = problem;
    const solution = solutions[problem.id];
    const userFiles = solution.files;

    return update(ownProps, { isAdmin: {$set: isAdmin}, files: {$set: files}, userFiles: {$set: userFiles}, doc: {$set: doc} });
}
export default connect(mapStateToProps)(Files); 
import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import File from './File';
import { addFileToProblem } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';
import { ICodeSolution } from '../../../reducers/solutions';

const Files = ({ problem, problemFiles, isAdmin, dispatch, userFiles }) => {
    const doAddFile = () => {
        dispatch(addFileToProblem(problem.id));
    }
    const hasProblemFiles = !!(problemFiles && problemFiles.length);
    const hasUserFiles = !!(userFiles && userFiles.length);
    return <div>
        {   (hasProblemFiles || hasUserFiles) &&
            <hr />
        }
        {   (hasProblemFiles) &&
            problemFiles.map((file, i) => <File problem={problem} key={`${file.id}-${i}`} file={file} fileIndex={i} isUserFile={false} />)
        }
        {   (hasUserFiles) &&
            userFiles.map((file, i) => <File problem={problem} key={`${file.id}-${i}`} file={file} fileIndex={i} isUserFile={true} />)
        }
        { isAdmin &&
            <button className="btn btn-outline-success btn-sm btn-block" onClick={doAddFile}>+ File</button>
        }
    </div>;
}
function mapStateToProps(state: IPMState, ownProps) {
    const { problem } = ownProps;
    const problemID = problem.id;
    const { intermediateUserState, solutions, users } = state;
    const { isAdmin } = intermediateUserState;
    const myuid = users.myuid as string;
    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid] as ICodeSolution;

    const { problemDetails } = problem;
    const { files: problemFiles } = problemDetails;
    const userFiles = userSolution.files;

    const fileIDs = [...problemFiles, ...userFiles].map((f) => f.id); // fingerprint for updates

    return update(ownProps, { $merge: { isAdmin, problemID, problemFiles, userFiles, fileIDs }});
}
export default connect(mapStateToProps)(Files); 
import { connect } from "react-redux";
import * as React from 'react';
import { setIsAdmin } from '../actions/user_actions';
import update from 'immutability-helper';
import { IPuzzleSet } from "./App";
import { IPMState } from "../reducers";

const PMUserHeader = ({users, dispatch, problemsDoc, isAdmin}) => {
    const { myuid } = users;
    if(!myuid) { return <nav>fetching user information...</nav> }

    const { loggedIn, isInstructor, username, email } = users.allUsers[myuid];

    const handleEditChange = (event) => {
        const checked = event.target.checked;
        dispatch(setIsAdmin(checked));
    }
    const downloadJSON = () => {
        const data = problemsDoc.getData();
        let newData = data;
        for(let key in data.userData) {
            if(data.hasOwnProperty(key)) {
                newData = update(newData, { userData: {
                    [key]: {
                        completed: { $set: [] }
                    }
                }})
            }
        }
        const stringifiedData = JSON.stringify(newData);
        download('puzzlemi-saved.json', stringifiedData);
    };
    const handleFile = (event) => {
        const { target } = event;
        const { files } = target;
        for (let i = 0, numFiles = files.length; i < numFiles; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = function(e) {
                if(e.target) {
                    const result = e.target.result as string;
                    const newData: IPuzzleSet = JSON.parse(result);
                    problemsDoc.submitObjectReplaceOp([], newData);
                }
            }
            reader.readAsText(file);
        }
    }

    const editButton = isInstructor ? <label className='float-right'><input type="checkbox" onChange={handleEditChange} /> Edit Mode</label> : null;
    const adminRow = isAdmin ? <div className="row">
        <button onClick={downloadJSON} className='btn btn-sm btn-primary'>Export problems</button>
        <label>Import problems: <input type="file" onChange={handleFile} className="form-control-file" /></label>
    </div> : null;
    const userInfo = loggedIn ? <span>Logged in as {username} ({email})</span> : <span>Not logged in.</span>
    return <nav>
        {userInfo} {editButton}
        {adminRow}
    </nav>
}

function mapStateToProps(state: IPMState, ownProps) {
    const { users, shareDBDocs, intermediateUserState } = state;

    const { isAdmin } = intermediateUserState;

    return update(ownProps, { $merge: { problemsDoc: shareDBDocs.problems, isAdmin, users } });
}
export default connect(mapStateToProps)(PMUserHeader);

// https://stackoverflow.com/a/18197341
function download(filename: string, text: string): void {
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
import { connect } from "react-redux";
import * as React from 'react';
import { setIsAdmin } from '../actions/user_actions';
import update from 'immutability-helper';
import { IPuzzleSet } from "./App";

const PMUserHeader = ({loggedIn, username, email, isInstructor, dispatch, doc, isAdmin}) => {
    const handleEditChange = (event) => {
        const checked = event.target.checked;
        dispatch(setIsAdmin(checked));
    }
    const downloadJSON = () => {
        const data = JSON.stringify(update(doc.getData(), { userData: { $set: {} }}));
        download('puzzlemi-saved.json', data);
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
                    doc.submitObjectReplaceOp([], newData);
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

function mapStateToProps(state, ownProps) {
    const { user, doc } = state;
    const { userInfo } = user;
    const { isAdmin } = user;

    return update(userInfo, { isAdmin: { $set: isAdmin}, doc: { $set: doc }});
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
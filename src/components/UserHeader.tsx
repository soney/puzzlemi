import { connect } from "react-redux";
import * as React from 'react';
import { setIsAdmin } from '../actions/user_actions';
import update from 'immutability-helper';
import { IPuzzleSet } from "./App";
import { IPMState } from "../reducers";
import { selectUserForSolutionView } from "../actions/app_actions";
import * as classNames from 'classnames';

const PMUserHeader = ({users, selectedUserForSolutionsView, dispatch, problemsDoc, isAdmin, allUsers}) => {
    const { myuid } = users;
    if(!myuid) { return <nav>fetching user information...</nav> }

    const { loggedIn, isInstructor, username, email } = users.allUsers[myuid];

    const handleEditChange = (event) => {
        const checked = event.target.checked;
        dispatch(setIsAdmin(checked));
    }
    const downloadJSON = () => {
        const data = problemsDoc.getData();
        const stringifiedData = JSON.stringify(data);
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

    const allUserDisplays = allUsers.map((u) => {
            const isSelectedUser = (u === selectedUserForSolutionsView);
            function selectUser() {
                if(isSelectedUser) {
                    dispatch(selectUserForSolutionView(false));
                } else {
                    dispatch(selectUserForSolutionView(u));
                }
            }
            return <a href="#0" className={classNames({user: true, selected: isSelectedUser})} key={u} onClick={selectUser}>{u}</a>
        });
    for(let i: number = allUserDisplays.length-1; i>0; i--) {
        allUserDisplays.splice(i, 0, ", ");
    }
    if(allUserDisplays.length === 0) {
        allUserDisplays.splice(0, 0, "(nobody here)");
    }

    const editButton = isInstructor ? <label className='float-right'><input type="checkbox" onChange={handleEditChange} /> Admin Mode</label> : null;
    const adminRow = isAdmin ? <>
        <div className="row">
            <div className="col">
                <button onClick={downloadJSON} className='btn btn-sm btn-primary'>Export problems</button>
                <label>Import problems: <input type="file" onChange={handleFile} className="form-control-file" /></label>
            </div>
        </div>
        <div className="row">
            <div className='col'>
                Users:
            </div>
        </div>
        <div className="row">
            <div className='col users'>
                {allUserDisplays}
            </div>
        </div>
    </>: null;
    const userInfo = loggedIn ? <span>Logged in as {username} ({email})</span> : <span>Not logged in.</span>
    return <nav>
        {userInfo} {editButton}
        {adminRow}
    </nav>
}

function mapStateToProps(state: IPMState, ownProps) {
    const { app, users, shareDBDocs, intermediateUserState } = state;
    const { isAdmin } = intermediateUserState;
    const { selectedUserForSolutionsView } = app;

    let allUsers: string[] = [];
    if(isAdmin) {
        try {
            const usersDocData = shareDBDocs.i.users;
            if(usersDocData) {
                const dataUsers = usersDocData.allUsers;
                allUsers = Object.keys(dataUsers!);
            }
        } catch(e) {
            console.error(e);
        }
    }

    return update(ownProps, { $merge: { problemsDoc: shareDBDocs.problems, selectedUserForSolutionsView, isAdmin, users, allUsers } });
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
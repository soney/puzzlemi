import { connect } from "react-redux";
import * as React from 'react';
import { setIsAdmin } from '../actions/user_actions';
import update from 'immutability-helper';
import { IPMState } from "../reducers";
import { selectUserForSolutionView } from "../actions/app_actions";
import * as classNames from 'classnames';
import { replaceProblems } from "../actions/sharedb_actions";
import { IProblems } from "../reducers/problems";
import Hotkeys from 'react-hot-keys';

const PMUserHeader = ({users, channel, selectedUserForSolutionsView, dispatch, problemsDoc, isAdmin, allUsers}) => {
    const { myuid } = users;
    if(!myuid) { return <nav>fetching user information...</nav> }

    const { loggedIn, isInstructor, username, email } = users.allUsers[myuid];

    const toggleIsAdmin = () => {
        dispatch(setIsAdmin(!isAdmin));
    };

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
                    const newData: IProblems = JSON.parse(result);
                    dispatch(replaceProblems(newData));
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

    const editButton = isInstructor ? <div className="custom-control custom-switch">
            <input id="admin-mode" type="checkbox" className="custom-control-input" onChange={handleEditChange} checked={isAdmin} />
            <label htmlFor="admin-mode" className="custom-control-label">Admin Mode</label>
        </div> : null;
        // <label className='float-right'><input type="checkbox" onChange={handleEditChange} /> Admin Mode</label> : null;
    const usersRow = isAdmin ? <div className="allUsers container">
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
    </div>: null;
    const userInfo = loggedIn ? <span>Logged in as {username} ({email})</span> : <span>Not logged in.</span>
    return <>
        <nav className="navbar navbar-light navbar-expand-lg bg-light">
            <span className='navbar-brand nav-item'>PuzzleMI [{channel}]</span>
            <ul className='navbar-nav mr-auto'>
                <li className='nav-item'>{userInfo}</li>
            </ul>
            {isAdmin && 
                <form className="form-inline">
                    <div className="btn-group">
                        <button onClick={downloadJSON} className='btn btn-sm btn-outline-secondary'>Export problems</button>
                        <label className="file-upload btn btn-sm btn-outline-secondary">Import problems <input type="file" onChange={handleFile} className="form-control-file" /></label>
                    </div>
                </form>
            }
            <form className="form-inline">
                <Hotkeys keyName="ctrl+shift+a" onKeyDown={toggleIsAdmin}></Hotkeys>
                <span className='nav-item'>{editButton}</span>
            </form>
        </nav>
        {usersRow}
    </>;
}

function mapStateToProps(state: IPMState, ownProps) {
    const { app, users, shareDBDocs, intermediateUserState } = state;
    const { isAdmin } = intermediateUserState;
    const { channel, selectedUserForSolutionsView } = app;

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

    return update(ownProps, { $merge: { problemsDoc: shareDBDocs.problems, selectedUserForSolutionsView, isAdmin, users, allUsers, channel } });
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
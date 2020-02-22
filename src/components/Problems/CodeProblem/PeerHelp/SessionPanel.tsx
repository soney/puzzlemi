import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { CodeEditor } from '../../../CodeEditor';
import ChatWidget from './ChatWidget';
import * as showdown from 'showdown';
import { timeAgo } from '../../../../utils/timestamp';
import { changeHelpSessionStatus, changeHelpSessionAccessControl, deleteHelpSession, changeHelperLists } from '../../../../actions/sharedb_actions';

const SessionPanel = ({ dispatch, activeSession, helperLists, usersDocData, sessionIndex, myuid, isInstructor, problem, aggregateDataDoc, sessions, isTutee, clickCallback }) => {
    const [isEdit, setIsEdit] = React.useState(false);

    if (activeSession === null) return <></>;

    const p = ['userData', problem.id, 'helpSessions', activeSession.id];
    const sharedCodeSubDoc = aggregateDataDoc.subDoc([...p, 'solution', 'code']);
    const titleSubDoc = aggregateDataDoc.subDoc([...p, 'title']);
    const converter = new showdown.Converter();

    let allUserDisplaysList: any[] = [];
    let helperIDs = Object.keys(helperLists)
    helperIDs.forEach(helperID => {
        if (usersDocData !== null && usersDocData.allUsers.hasOwnProperty(helperID)) allUserDisplaysList.push(usersDocData.allUsers[helperID].username);
    })

    const allUserDisplays = allUserDisplaysList.length === 0 ? 'can not display' : allUserDisplaysList.join(', ');

    const toggleEdit = () => {
        setIsEdit(!isEdit);
    }

    const doChangeSessionStatus = () => {
        dispatch(changeHelpSessionStatus(problem.id, activeSession.id, !activeSession.status));
    }

    const doChangeSessionAccessControl = () => {
        dispatch(changeHelpSessionAccessControl(problem.id, activeSession.id, !activeSession.readOnly));
    }
    const doDeleteSession = () => {
        dispatch(deleteHelpSession(problem.id, activeSession.id));
        toggleListView();
    }
    const toggleListView = () => {
        clickCallback(true);
        dispatch(changeHelperLists(problem.id, "", myuid))
    }

    return <>
        <nav className="navbar navbar-light bg-light">
            <button className="btn btn-link return-button" onClick={toggleListView}>Return to the Session List</button>
        </nav>
        <div className="session-head">
            <div className="row">
                <div className="col-10">
                    {isEdit
                        ? <div><CodeEditor shareDBSubDoc={titleSubDoc} refreshDoc={sessionIndex} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 50 }} /></div>
                        : <div><p dangerouslySetInnerHTML={{ __html: converter.makeHtml(activeSession.title) }} />
                        </div>}
                </div>
                <div className="col-2">
                    {(isTutee || isInstructor) &&
                        <button type="button" className="btn btn-outline-secondary" onClick={toggleEdit}>{isEdit ? "Save" : "Edit the title"}</button>
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-8">
                    <div className={activeSession.status ? "session-open" : "session-close"}>
                        <small>{activeSession.tutee} opened this help session {timeAgo(parseInt(activeSession.timestamp))}</small>
                    </div>
                </div>
                <div className="col-2">
                    {(isTutee || isInstructor) &&
                        <button type="button" className="btn btn-outline-danger" onClick={doChangeSessionStatus}>{activeSession.status ? "Resolve" : "Reopen"}</button>
                    }
                </div>
                <div className="col-2">
                    {(isTutee || isInstructor) &&
                        <button type="button" className="btn btn-outline-danger" onClick={doDeleteSession}>Delete</button>
                    }
                </div>
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
        <div className="session-body">
            <div className="row">
                <div className="col">
                    <CodeEditor shareDBSubDoc={sharedCodeSubDoc} refreshDoc={sessionIndex} options={(activeSession.readOnly && !isTutee) ? { readOnly: true, lineNumbers: true, height: 300 } : { lineNumbers: true, height: 300 }} />
                    {isTutee &&
                        <div className="custom-control custom-switch">
                            <input type="checkbox" className="custom-control-input" id={"readonly"} onClick={doChangeSessionAccessControl} defaultChecked={activeSession.readOnly} />
                            <label className="custom-control-label" htmlFor={"readonly"}>Read Only</label>
                        </div>
                    }
                </div>
                <div className="col">
                    <ChatWidget problem={problem} sessions={sessions} />
                </div>
            </div>
        </div>
    </>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs, intermediateUserState, users } = state;
    const { sessions, problem } = ownProps;
    const aggregateDataDoc = shareDBDocs.aggregateData
    const aggregateData = shareDBDocs.i.aggregateData;
    const { helperLists } = aggregateData ? aggregateData.userData[problem.id] : { helperLists: {} };
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    let activeS = sessions.filter(s => s.id === currentActiveHelpSession);
    const activeSession = activeS.length > 0 ? activeS[0] : null;
    const sessionIndex = sessions.indexOf(activeSession);
    const myuid = users.myuid as string;
    const { allUsers } = users;
    const usersDocData = shareDBDocs.i.users;
    const { isInstructor } = allUsers[myuid];
    const username = users.allUsers[myuid].username;
    const isTutee = activeSession !== null ? activeSession.tutee === username : false;
    return update(ownProps, { $merge: { username, sessionIndex, allUsers, aggregateDataDoc, sessions, activeSession, isTutee, myuid, isInstructor, helperLists, usersDocData } });
}
export default connect(mapStateToProps)(SessionPanel);

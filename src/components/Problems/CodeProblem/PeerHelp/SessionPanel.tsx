import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { CodeEditor } from '../../../CodeEditor';
import ChatWidget from './ChatWidget';
import * as showdown from 'showdown';
import { timeAgo } from '../../../../utils/timestamp';
import { changeHelpSessionStatus, changeHelpSessionAccessControl, deleteHelpSession, changeHelperLists } from '../../../../actions/sharedb_actions';
import { IPMState } from '../../../../reducers';
import { ICodeSolutionAggregate } from '../../../../reducers/aggregateData';

const SessionPanel = ({ dispatch, activeSession, helperLists, usersDocData, sessionIndex, myuid, isInstructor, problem, aggregateDataDoc, sessions, isTutee, clickCallback }) => {
    const [isEdit, setIsEdit] = React.useState(false);

    if (activeSession === null) return <></>;

    const p = ['userData', problem.id, 'helpSessions', activeSession.id];
    const sharedCodeSubDoc = aggregateDataDoc.subDoc([...p, 'code']);
    const titleSubDoc = aggregateDataDoc.subDoc([...p, 'title']);
    const converter = new showdown.Converter();

    let allUserDisplaysList: any[] = [];

    const helperIDs = Object.keys(helperLists)
    const relatedHelperIDs = helperIDs.filter(i => helperLists[i] === activeSession.id)
    relatedHelperIDs.forEach(helperID => {
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
    const chat_path = ['userData', problem.id, 'helpSessions', activeSession.id]

    return <>
        <nav className="navbar navbar-light bg-light">
            <button className="btn btn-link return-button" onClick={toggleListView}>Return to the Session List</button>
        </nav>
        <div className="session-head">
            <div className="row">
                <div className="col-10">
                    {isEdit
                        ? <div><CodeEditor shareDBSubDoc={titleSubDoc} refreshDoc={sessionIndex} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 50 }} /></div>
                        : <div><h4 dangerouslySetInnerHTML={{ __html: converter.makeHtml(activeSession.title) }} />
                        </div>}
                </div>
                <div className="col-2">
                    {(isTutee || isInstructor) &&
                        <button type="button" className="btn btn-outline-secondary" onClick={toggleEdit}>{isEdit ? <i className="fas fa-save"></i> : <i className="fas fa-edit"></i>}</button>
                    }
                </div>
            </div>
            <div className="row">
                <div className="col-10">
                    <div className={activeSession.status ? "session-open" : "session-close"}>
                        <small>opened {timeAgo(parseInt(activeSession.timestamp))} </small>
                    </div>
                    {(isTutee || isInstructor) &&
                        <div className="custom-control custom-switch related-button">
                            <input type="checkbox" className="custom-control-input" id={"help-session-button-" + problem.id} onClick={doChangeSessionStatus} defaultChecked={activeSession.status} />
                            <label className="custom-control-label" htmlFor={"help-session-button-" + problem.id}>Open</label>
                        </div>
                    }
                </div>
                <div className="col-2">
                    {(isTutee || isInstructor) &&
                        <button type="button" className="btn btn-outline-danger" onClick={doDeleteSession}><i className="fas fa-trash-alt"></i></button>
                    }
                </div>
            </div>
        </div>
        <div className="row">
            <div className='col'>
                Active Users: {allUserDisplays}
            </div>
        </div>
        <div className="session-body">
            <div className="row">
                <div className="col">
                    <CodeEditor shareDBSubDoc={sharedCodeSubDoc} refreshDoc={sessionIndex} options={(activeSession.readOnly && !isTutee) ? { readOnly: true, lineNumbers: true, height: 300, lineWrapping: true } : { lineNumbers: true, height: 300, lineWrapping: true }} />
                    {isTutee &&
                        <div className="custom-control custom-switch">
                            <input type="checkbox" className="custom-control-input" id={"readonly"} onClick={doChangeSessionAccessControl} defaultChecked={activeSession.readOnly} />
                            <label className="custom-control-label" htmlFor={"readonly"}>Read Only</label>
                        </div>
                    }
                </div>
                <div className="col">
                    <ChatWidget problem={problem} sessions={sessions} chatMessages={activeSession.chatMessages} path={chat_path}/>
                </div>
            </div>
        </div>
    </>
}

function mapStateToProps(state: IPMState, ownProps) {
    const { shareDBDocs, intermediateUserState, users } = state;
    const { sessions, problem } = ownProps;
    const aggregateDataDoc = shareDBDocs.aggregateData
    const aggregateData = shareDBDocs.i.aggregateData;
    const { helperLists } = aggregateData ? (aggregateData.userData[problem.id] as ICodeSolutionAggregate) : { helperLists: {} };
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
    const isTutee = activeSession !== null ? activeSession.userID === myuid : false;
    return update(ownProps, { $merge: { username, sessionIndex, allUsers, aggregateDataDoc, sessions, activeSession, isTutee, myuid, isInstructor, helperLists, usersDocData } });
}
export default connect(mapStateToProps)(SessionPanel);

import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { CodeEditor } from '../../../CodeEditor';
import ChatWidget from './ChatWidget';
import * as showdown from 'showdown';
import { timeAgo } from '../../../../utils/timestamp';
import { changeHelpSessionStatus, changeHelpSessionAccessControl } from '../../../../actions/sharedb_actions';

const SessionPanel = ({ dispatch, activeSession, allUsers, helperLists, sessionIndex, isInstructor, problem, aggregateDataDoc, sessions, isTutee, clickCallback }) => {
    const [isEdit, setIsEdit] = React.useState(false);

    if (activeSession === null) return <></>;

    const p = ['userData', problem.id, 'helpSessions', activeSession.id];
    const sharedCodeSubDoc = aggregateDataDoc.subDoc([...p, 'solution', 'code']);
    const titleSubDoc = aggregateDataDoc.subDoc([...p, 'title']);
    const descriptionSubDoc = aggregateDataDoc.subDoc([...p, 'description']);
    const converter = new showdown.Converter();

    const toggleEdit = () => {
        setIsEdit(!isEdit);
    }

    const doChangeSessionStatus = () => {
        dispatch(changeHelpSessionStatus(problem.id, activeSession.id, !activeSession.status));
    }

    const doChangeSessionAccessControl = () => {
        dispatch(changeHelpSessionAccessControl(problem.id, activeSession.id, !activeSession.readOnly));
    }
    const toggleListView = () => {
        clickCallback(true);
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
                    {isEdit
                        ? <div><CodeEditor shareDBSubDoc={descriptionSubDoc} refreshDoc={sessionIndex} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 50 }} /></div>
                        : <div><p dangerouslySetInnerHTML={{ __html: converter.makeHtml(activeSession.description) }} /></div>}
                    <div className={activeSession.status ? "session-open" : "session-close"}>
                        <small>{activeSession.tutee} opened this help session {timeAgo(parseInt(activeSession.timestamp))}</small>
                    </div>
                    {/* <div className="row">
                        <div className='col'>
                            Users:
            </div>
                    </div>
                    <div className="row">
                        <div className='col users'>
                            {allUserDisplays}
                        </div>
                    </div> */}
                </div>
                {(isTutee || isInstructor) &&
                    <>
                        <div className="col-2">
                            <button type="button" className="btn btn-outline-secondary" onClick={toggleEdit}>{isEdit ? "Save" : "Edit"}</button>
                            <button type="button" className="btn btn-outline-danger" onClick={doChangeSessionStatus}>{activeSession.status ? "Close" : "Reopen"}</button>
                        </div>
                    </>
                }
            </div>
        </div>
        <div className="session-body">
            <div className="row">
                <div className="col">
                    <CodeEditor shareDBSubDoc={sharedCodeSubDoc} refreshDoc={sessionIndex} options={(activeSession.readOnly && !isTutee) ? { readOnly: true } : {}} />
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
    const { isInstructor } = allUsers[myuid];
    const username = users.allUsers[myuid].username;
    const isTutee = activeSession !== null ? activeSession.tutee === username : false;
    return update(ownProps, { $merge: { username, sessionIndex, allUsers, aggregateDataDoc, sessions, activeSession, isTutee, isInstructor, helperLists } });
}
export default connect(mapStateToProps)(SessionPanel);

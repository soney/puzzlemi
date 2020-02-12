import * as React from 'react';
import { connect } from "react-redux";
import { useState } from 'react';
import update from 'immutability-helper';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { CodeEditor } from '../../../CodeEditor';
import ChatWidget from './ChatWidget';
import * as showdown from 'showdown';
import { timeAgo } from '../../../../utils/timestamp';
import { changeHelpSessionStatus } from '../../../../actions/sharedb_actions';

const SessionPanel = ({ dispatch, activeSession, sessionIndex, problem, aggregateDataDoc, sessions, isTutee }) => {
    const [isEdit, setIsEdit] = useState(false);

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

    return <>
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
                    <div className={activeSession.status?"session-open":"session-close"}>
                        <small>{activeSession.tutee} opened this help session {timeAgo(parseInt(activeSession.timestamp))}</small>
                    </div>
                </div>
                {isTutee &&
                    <>
                        <div className="col-2">
                            <button type="button" className="btn btn-outline-secondary" onClick={toggleEdit}>{isEdit ? "Save" : "Edit"}</button>
                            <button type="button" className="btn btn-outline-danger" onClick={doChangeSessionStatus}>{activeSession.status ? "Close" : "Reopen"}</button>
                        </div>
                    </>
                }
            </div>
            <div className="row">
                <div className="col">
                    <CodeEditor shareDBSubDoc={sharedCodeSubDoc} refreshDoc={sessionIndex} />
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
    const { sessions } = ownProps;
    const aggregateDataDoc = shareDBDocs.aggregateData
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    let activeS = sessions.filter(s => s.id === currentActiveHelpSession);
    const activeSession = activeS.length > 0 ? activeS[0] : null;
    const sessionIndex = sessions.indexOf(activeSession);
    const myuid = users.myuid as string;
    const username = myuid.slice(0, 7) === "testuid" ? "testuser-" + myuid.slice(-4) : users.allUsers[myuid].username;
    const isTutee = activeSession !== null ? activeSession.tutee === username : false;
    return update(ownProps, { $merge: { username, sessionIndex, aggregateDataDoc, sessions, activeSession, isTutee } });
}
export default connect(mapStateToProps)(SessionPanel);

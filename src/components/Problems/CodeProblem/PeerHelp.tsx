import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
// import { setHelpRequest, joinHelpSession, quitHelpSession } from '../actions/sharedb_actions';
// import { setCode } from '../actions/user_actions';
import { CodeEditor } from '../../CodeEditor';
// import { runSharedCode } from '../actions/runCode_actions';

const PeerHelp = ({ index, id, helpSessions, myCompletionIndex, errors, output, currentHelpSessionIndex, currentHelpSession, passedAll, problem, uid, doc, dispatch }) => {
    const iHaveCompleted = myCompletionIndex >= 0;
    const doRequestHelp = () => {
        // dispatch(setHelpRequest(id, uid));
    }

    const doJoinHelpSession = (e) => {
        const tuteeID = e.target.getAttribute('data-user');
        console.log('todo '+tuteeID);
        // dispatch(joinHelpSession(id, tuteeID, uid));
    }

    const doQuitHelpSession = () => {
        // if (currentHelpSession.tuteeID === uid) dispatch(setCode(index, currentCodeSubDoc.getData()));
        // dispatch(quitHelpSession(id, currentHelpSessionIndex, uid));
    }
    const doRunSharedCode = () => {
        // return dispatch(runSharedCode(index, currentHelpSessionIndex));
    }
    const userp = ['userData', id, 'helpSessions'];
    const currentCodeSubDoc = doc.subDoc([...userp, currentHelpSessionIndex, 'solution', 'code']);
    return <div>
        <div className="row">
            <div className="col">
                {currentHelpSession ?
                    <div>
                        <CodeEditor shareDBSubDoc={currentCodeSubDoc} />
                        <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunSharedCode}>Run</button>
                    </div>
                    : <div>
                        <CodeEditor />
                    </div>
                }
            </div>
            <div className="col">
                {(currentHelpSessionIndex === -1) &&
                    <div>
                        {((!iHaveCompleted || !passedAll || errors.length > 0)) &&
                            <button className='btn btn-outline-primary request-help-button' onClick={doRequestHelp}>Request Help</button>
                        }
                        {(iHaveCompleted && helpSessions && helpSessions.length > 0) &&
                            <div>
                                <div className="alert alert-success" role="alert">
                                    Help Requests
                        </div>
                                {helpSessions.map((helpSession, i) =>
                                    <button key={helpSession.tuteeID} data-user={helpSession.tuteeID} className='btn btn-outline-primary help-session-button' onClick={doJoinHelpSession}>{helpSession.tuteeID}</button>
                                )}
                            </div>
                        }
                    </div>
                }
                {(currentHelpSessionIndex !== -1) &&
                    <div>
                        <h5>Current Users</h5>
                        <ul className="list-group">
                            <li className="list-group-item">{currentHelpSession.tuteeID} <span className="badge badge-pill badge-warning">Tutee</span></li>
                            {currentHelpSession.tutorIDs.map((tutorID, i) =>
                                <li className="list-group-item" key={tutorID}>{tutorID} <span className="badge badge-pill badge-info">Tutor</span>
                                </li>
                            )}
                        </ul>
                        <button className='btn btn-outline-danger quit-help-button' onClick={doQuitHelpSession}>Quit Help Session</button>
                    </div>
                }</div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems, userData } = state;
    const problem = problems[index];
    const { id } = problem;
    const uid = user.id;
    const completed: string[] = userData[id] ? userData[id].completed : [];
    const myCompletionIndex = completed ? completed.indexOf(user.id) : -1;
    const helpSessions = userData[id] && userData[id].helpSessions;
    const activeHelpSessions = helpSessions.filter(session => session.status);
    const isRequestedHelp = activeHelpSessions.filter(session => session.tuteeID === uid);
    const isOfferHelp = activeHelpSessions.filter(session => session.tutorIDs.includes(uid));
    const currentHelpSession = isRequestedHelp[0] || isOfferHelp[0];
    const currentHelpSessionIndex = helpSessions.indexOf(currentHelpSession);
    const { output, passedAll, errors } = currentHelpSession ? currentHelpSession.solution : user.solutions[id];
    return update(ownProps, { index: { $set: index }, id: { $set: id }, myCompletionIndex: { $set: myCompletionIndex }, currentHelpSession: { $set: currentHelpSession }, currentHelpSessionIndex: { $set: currentHelpSessionIndex }, problem: { $set: problem }, uid: { $set: uid }, doc: { $set: doc }, errors: { $set: errors }, helpSessions: { $set: helpSessions }, output: { $set: output }, passedAll: { $set: passedAll } });
}
export default connect(mapStateToProps)(PeerHelp);

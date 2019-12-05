import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import Tests from './Tests';
import Files from './Files';
import { deleteProblem, setProblemVisibility, setHelpRequest, joinHelpSession, quitHelpSession } from '../actions/sharedb_actions';
import { runCode, runSharedCode } from '../actions/runCode_actions';
import { setCode } from '../actions/user_actions';

const Problem = ({ id, visible, uid, code, errors, index, currentHelpSession, currentHelpSessionIndex, output, dispatch, helpSessions, doc, passedAll, isAdmin, numCompleted, myCompletionIndex }) => {
    const doDeleteProblem = () => {
        return dispatch(deleteProblem(index));
    };
    const doRunCode = () => {
        return dispatch(runCode(index));
    };
    const doRunSharedCode = () => {
        return dispatch(runSharedCode(index, currentHelpSessionIndex));
    }
    const doSetCode = (ev) => {
        const { value } = ev;
        return dispatch(setCode(index, value));
    };

    const doHideProblem = () => {
        dispatch(setProblemVisibility(id, false));
    }
    const doShowProblem = () => {
        dispatch(setProblemVisibility(id, true));
    }

    const doRequestHelp = () => {
        dispatch(setHelpRequest(id, uid));
    }

    const doJoinHelpSession = (e) => {
        const tuteeID = e.target.getAttribute('data-user');
        dispatch(joinHelpSession(id, tuteeID, uid));
    }

    const doQuitHelpSession = () => {
        if(currentHelpSession.tuteeID === uid) dispatch(setCode(index, currentCodeSubDoc.getData()));
        dispatch(quitHelpSession(id, currentHelpSessionIndex, uid));
    }

    // const doUpdateProblemVisiblity = (ev) => {
    //     console.log(ev);
    // };

    const iHaveCompleted = myCompletionIndex >= 0;
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    const afterCodeSubDoc = doc.subDoc([...p, 'afterCode']);
    const userp = ['userData', id, 'helpSessions'];
    const currentCodeSubDoc = doc.subDoc([...userp, currentHelpSessionIndex, 'solution', 'code']);

    return <li className={'problem container' + (passedAll ? ' passedAll' : '')}>
        { isAdmin &&
            <div className="row">
                <div className="col clearfix">
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                        <label className={"btn btn-sm " + (visible ? "btn-primary" : "btn-outline-primary")}>
                            <input type="radio" name="options" id="visible" onChange={doShowProblem} /> Visible
                        </label>
                        <label className={"btn btn-sm " + (!visible ? "btn-secondary" : "btn-outline-secondary")}>
                            <input type="radio" name="options" id="hidden" onChange={doHideProblem} /> Hidden
                        </label>
                    </div>
                    <button className="btn btn-sm btn-outline-danger float-right" onClick={doDeleteProblem}>Delete Problem</button>
                </div>
            </div>
        }
       <div className="row">
            <div className="col">
                <ProblemDescription index={index} />
            </div>
        </div>
        <div className="row">
            {   isAdmin &&
                <div className="col">
                    <h4>Given Code:</h4>
                    <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                    <h4>Run After:</h4>
                    <CodeEditor shareDBSubDoc={afterCodeSubDoc} />
                </div>
            }
            {   !isAdmin &&
                <div className="col">
                    { currentHelpSession?
                    <div>
                        <CodeEditor value={currentCodeSubDoc.getData()} shareDBSubDoc={currentCodeSubDoc}/>
                        <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunSharedCode}>Run</button>
                    </div>
                    :
                    <div>
                        <CodeEditor value={code} onChange={doSetCode} />
                        <button disabled={false} className='btn btn-outline-success btn-sm btn-block' onClick={doRunCode}>Run</button>
                    </div>
                    }
                </div>
            }
            <div className="col">
                {   !isAdmin &&
                    <div>
                    <pre className={'codeOutput' + (errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                        {output}
                        {errors.join('\n')}
                    </pre>
                    {(currentHelpSessionIndex=== -1) &&
                    <div>
                        {((!iHaveCompleted || !passedAll || errors.length > 0)) &&
                        <button className='btn btn-outline-primary request-help-button' onClick={doRequestHelp}>Request Help</button>
                        }
                        {(iHaveCompleted && helpSessions && helpSessions.length>0)&&
                        <div>
                        <div className="alert alert-success" role="alert">
                            Help Requests
                        </div>
                        { helpSessions.map((helpSession, i)=>
                            <button key={helpSession.tuteeID} data-user={helpSession.tuteeID} className='btn btn-outline-primary help-session-button' onClick={doJoinHelpSession}>{helpSession.tuteeID}</button>
                        )}
                        </div>
                        }
                    </div>
                    }
                    {(currentHelpSessionIndex!==-1) &&
                    <div>
                        <h5>Current Users</h5>
                        <ul className="list-group">
                            <li className="list-group-item">{currentHelpSession.tuteeID} <span className="badge badge-pill badge-warning">Tutee</span></li>
                            {currentHelpSession.tutorIDs.map((tutorID, i)=>
                                <li className="list-group-item" key={tutorID}>{tutorID} <span className="badge badge-pill badge-info">Tutor</span>
                                </li>
                            )}
                        </ul>
                        <button className='btn btn-outline-danger quit-help-button' onClick={doQuitHelpSession}>Quit Help Session</button>
                    </div>
                    }
                    </div>
                }
                <Files index={index} />
            </div>
        </div>
        <div className="row">
            <div className="col">
                <Tests index={index} />
            </div>
        </div>
        <div className="row completion-info">
            <div className="col">
                {iHaveCompleted &&
                    <span> You are #{myCompletionIndex+1} of </span>
                }
                {numCompleted} {numCompleted === 1 ? 'user' : 'users'}{iHaveCompleted && <span> that</span>} finished this problem.
            </div>
        </div>
    </li>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems, userData } = state;
    const { id } = problems[index];
    const { isAdmin } = user;
    const uid = user.id;
    const helpSessions = userData[id] && userData[id].helpSessions;
    const visible = userData[id] && userData[id].visible;
    const completed: string[] = userData[id] ? userData[id].completed : [];
    const numCompleted = completed ? completed.length : 0;
    const myCompletionIndex = completed ? completed.indexOf(user.id) : -1;
    const activeHelpSessions = helpSessions.filter(session=>session.status);
    const isRequestedHelp = activeHelpSessions.filter(session=>session.tuteeID===uid);
    const isOfferHelp = activeHelpSessions.filter(session=>session.tutorIDs.includes(uid));
    const currentHelpSession = isRequestedHelp[0] || isOfferHelp[0];
    const currentHelpSessionIndex = helpSessions.indexOf(currentHelpSession);
    const { code, output, passedAll, errors } = currentHelpSession? currentHelpSession.solution:user.solutions[id];
    return update(ownProps, { id: {$set: id}, uid:{$set: uid}, currentHelpSession:{$set: currentHelpSession}, currentHelpSessionIndex: {$set: currentHelpSessionIndex}, helpSessions:{$set: activeHelpSessions}, visible: {$set: visible}, numCompleted: {$set: numCompleted }, myCompletionIndex: { $set: myCompletionIndex}, passedAll: { $set: passedAll },  errors: { $set: errors }, output: { $set: output }, isAdmin: { $set: isAdmin }, code: { $set: code }, doc: { $set: doc }});
}
export default connect(mapStateToProps)(Problem);

import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import Tests from './Tests';
import TestTemplate from './TestTemplate';
import MySolution from './MySolution';
import LiveCode from './LiveCode';
import PeerHelp from './PeerHelp';
import ConfigPanel from './ConfigPanel';
import { deleteProblem, setProblemVisibility } from '../actions/sharedb_actions';

const Problem = ({ id, visible, config, index, currentHelpSession, currentHelpSessionIndex, dispatch, helpSessions, doc, passedAll, isAdmin, numCompleted, myCompletionIndex }) => {
    const doDeleteProblem = () => {
        return dispatch(deleteProblem(index));
    };
    const doHideProblem = () => {
        dispatch(setProblemVisibility(id, false));
    }
    const doShowProblem = () => {
        dispatch(setProblemVisibility(id, true));
    }

    const iHaveCompleted = myCompletionIndex >= 0;
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    const afterCodeSubDoc = doc.subDoc([...p, 'afterCode']);
    const standardCodeSubDoc = doc.subDoc([...p, 'standardCode']);

    return <li className={'problem container' + (passedAll ? ' passedAll' : '')}>
        {isAdmin &&
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
        {isAdmin &&
            <div>
                <div className="row">
                    <div className="col">
                        <TestTemplate index={index} />
                    </div>
                    <div className="col">
                        <ConfigPanel index={index} />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <h4>Given Code:</h4>
                        <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                        <h4>Run After:</h4>
                        <CodeEditor shareDBSubDoc={afterCodeSubDoc} />
                    </div>
                    <div className="col">
                        {config.autoVerify &&
                            <div>
                                <h4>Standard Code:</h4>
                                <CodeEditor shareDBSubDoc={standardCodeSubDoc} />
                            </div>
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <Tests index={index} />
                    </div>
                </div>
            </div>

        }
        {!isAdmin &&
            <div>
                <nav>
                    <div className="nav nav-tabs" id="nav-tab" role="tablist">
                        <a className="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">My Solution</a>
                        {config.displayInstructor &&
                            <a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false">Instructor</a>
                        }
                        {config.peerHelp &&
                            <a className="nav-item nav-link" id="nav-contact-tab" data-toggle="tab" href="#nav-contact" role="tab" aria-controls="nav-contact" aria-selected="false">Peers</a>
                        }
                    </div>
                </nav>
                <div className="tab-content" id="nav-tabContent">
                    <div className="tab-pane fade show active" id="nav-home" role="tabpanel" aria-labelledby="nav-home-tab">
                        <MySolution index={index} />
                        <div className="row">
                            <div className="col">
                                <Tests index={index} />
                            </div>
                        </div>
                    </div>
                    {config.displayInstructor &&
                        <div className="tab-pane fade" id="nav-profile" role="tabpanel" aria-labelledby="nav-profile-tab">
                            <LiveCode index={index} />
                        </div>
                    }
                    {config.peerHelp &&
                        <div className="tab-pane fade" id="nav-contact" role="tabpanel" aria-labelledby="nav-contact-tab">
                            <PeerHelp index={index} />
                        </div>
                    }
                </div>
            </div>
        }
        <div className="row completion-info">
            <div className="col">
                {iHaveCompleted &&
                    <span> You are #{myCompletionIndex + 1} of </span>
                }
                {numCompleted} {numCompleted === 1 ? 'user' : 'users'}{iHaveCompleted && <span> that</span>} finished this problem.
            </div>
        </div>
    </li>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems, userData } = state;
    const { id, config } = problems[index];
    const { isAdmin } = user;
    const uid = user.id;
    const helpSessions = userData[id] && userData[id].helpSessions;
    const visible = userData[id] && userData[id].visible;
    const completed: string[] = userData[id] ? userData[id].completed_default : [];
    const numCompleted = completed ? completed.length : 0;
    const myCompletionIndex = completed ? completed.indexOf(user.id) : -1;
    const activeHelpSessions = helpSessions.filter(session => session.status);
    const isRequestedHelp = activeHelpSessions.filter(session => session.tuteeID === uid);
    const isOfferHelp = activeHelpSessions.filter(session => session.tutorIDs.includes(uid));
    const currentHelpSession = isRequestedHelp[0] || isOfferHelp[0];
    const currentHelpSessionIndex = helpSessions.indexOf(currentHelpSession);
    const { passedAll } = currentHelpSession ? currentHelpSession.solution : user.solutions[id];
    return update(ownProps, { id: { $set: id }, config: { $set: config }, currentHelpSession: { $set: currentHelpSession }, currentHelpSessionIndex: { $set: currentHelpSessionIndex }, helpSessions: { $set: activeHelpSessions }, visible: { $set: visible }, numCompleted: { $set: numCompleted }, myCompletionIndex: { $set: myCompletionIndex }, passedAll: { $set: passedAll }, isAdmin: { $set: isAdmin }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(Problem);

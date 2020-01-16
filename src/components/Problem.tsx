import * as React from 'react';
import { useState } from 'react';
import { connect } from "react-redux";
import ProblemDescription from './ProblemDescription';
import ProblemNotes from './ProblemNotes';
import update from 'immutability-helper';
import { CodeEditor } from './CodeEditor';
import Tests from './Tests';
import Variables from './Variables';
import MySolution from './MySolution';
import LiveCode from './LiveCode';
import PeerHelp from './PeerHelp';
import ConfigPanel from './ConfigPanel';
import { deleteProblem, setProblemVisibility } from '../actions/sharedb_actions';

const Problem = ({ id, visible, config, index, dispatch, doc, passedAll, isAdmin, numCompleted, myCompletionIndex }) => {
    const [count, setCount] = useState(0);

    const doDeleteProblem = () => {
        dispatch(deleteProblem(index));
    };
    const doHideProblem = () => {
        dispatch(setProblemVisibility(id, false));
    }
    const doShowProblem = () => {
        dispatch(setProblemVisibility(id, true));
    }
    const refreshCM = () => {
        setCount(count + 1);
    }

    const iHaveCompleted = myCompletionIndex >= 0;
    const p = ['problems', index];
    const givenCodeSubDoc = doc.subDoc([...p, 'givenCode']);
    const afterCodeSubDoc = doc.subDoc([...p, 'afterCode']);
    const standardCodeSubDoc = doc.subDoc([...p, 'standardCode']);

    return <li className={'problem container' + (passedAll === true ? ' passedAll' : '')}>
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
                        <nav>
                            <div className="nav nav-tabs instructor-tab" id="nav-tab" role="tablist">
                                <a className="nav-item nav-link active" id="nav-given-tab" data-toggle="tab" href="#nav-given" role="tab" aria-controls="nav-given" aria-selected="true">Given Code</a>
                                <a className="nav-item nav-link" id="nav-after-tab" data-toggle="tab" href="#nav-after" role="tab" aria-controls="nav-after" aria-selected="false" onClick={refreshCM}>Run After</a>
                                <a className="nav-item nav-link" id="nav-standard-tab" data-toggle="tab" href="#nav-standard" role="tab" aria-controls="nav-standard" aria-selected="false" onClick={refreshCM}>Standard Code</a>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="nav-given" role="tabpanel" aria-labelledby="nav-given-tab">
                                <CodeEditor shareDBSubDoc={givenCodeSubDoc} />
                            </div>
                            <div className="tab-pane fade" id="nav-after" role="tabpanel" aria-labelledby="nav-after-tab">
                                <CodeEditor shareDBSubDoc={afterCodeSubDoc} flag={count} />
                            </div>
                            <div className="tab-pane fade" id="nav-standard" role="tabpanel" aria-labelledby="nav-standard-tab">
                                <CodeEditor shareDBSubDoc={standardCodeSubDoc} flag={count} />
                            </div>
                        </div>
                    </div>
                    <div className="col">
                        <nav>
                            <div className="nav nav-tabs instructor-tab" id="nav-tab" role="tablist">
                                <a className="nav-item nav-link active" id="nav-notes-tab" data-toggle="tab" href="#nav-notes" role="tab" aria-controls="nav-notes" aria-selected="true">Notes</a>
                                <a className="nav-item nav-link" id="nav-draw-tab" data-toggle="tab" href="#nav-draw" role="tab" aria-controls="nav-draw" aria-selected="false">Draw</a>
                            </div>
                        </nav>
                        <div className="tab-content" id="nav-tabContent">
                            <div className="tab-pane fade show active" id="nav-notes" role="tabpanel" aria-labelledby="nav-notes-tab">
                                <ProblemNotes index={index} isRender={false} />
                            </div>
                            <div className="tab-pane fade" id="nav-draw" role="tabpanel" aria-labelledby="nav-draw-tab">
                                <ProblemNotes index={index} isRender={true} />
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    <nav>
                        <div className="nav nav-tabs instructor-tab" id="nav-tab" role="tablist">
                            <a className="nav-item nav-link active" id="nav-variables-tab" data-toggle="tab" href="#nav-variables" role="tab" aria-controls="nav-variables" aria-selected="true">Variables</a>
                            <a className="nav-item nav-link" id="nav-config-tab" data-toggle="tab" href="#nav-config" role="tab" aria-controls="nav-config" aria-selected="false">Config</a>
                            <a className="nav-item nav-link" id="nav-tests-tab" data-toggle="tab" href="#nav-tests" role="tab" aria-controls="nav-tests" aria-selected="false" onClick={refreshCM}>Tests</a>
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-tabContent">
                        <div className="tab-pane fade show active" id="nav-variables" role="tabpanel" aria-labelledby="nav-variables-tab">
                            <Variables index={index} />
                        </div>
                        <div className="tab-pane fade" id="nav-config" role="tabpanel" aria-labelledby="nav-config-tab">
                            <ConfigPanel index={index} />
                        </div>
                        <div className="tab-pane fade" id="nav-tests" role="tabpanel" aria-labelledby="nav-tests-tab">
                            <Tests index={index} flag={count} />
                        </div>
                    </div>
                </div>
            </div>

        }
        {!isAdmin &&
            <div>
                <nav>
                    <div className="nav nav-tabs student-tab" id="nav-tab" role="tablist">
                        <a className="nav-item nav-link active" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab" aria-controls="nav-home" aria-selected="true">My Solution</a>
                        {config.displayInstructor &&
                            <a className="nav-item nav-link" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab" aria-controls="nav-profile" aria-selected="false" onClick={refreshCM}>Instructor</a>
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
                            <LiveCode index={index} flag={count} />
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
    const visible = userData[id] && userData[id].visible;
    let completed_string = [];
    if (userData[id]) {
        completed_string = config.runTests ? userData[id].completed_tests : userData[id].completed_default;
    }
    const completed: string[] = completed_string;
    const numCompleted = completed ? completed.length : 0;
    const myCompletionIndex = completed ? completed.indexOf(user.id) : -1;
    const passedAll = config.runTests ? user.solutions[id].passedAllTests : user.solutions[id].defaultResult.passedAll;
    return update(ownProps, { id: { $set: id }, config: { $set: config }, visible: { $set: visible }, numCompleted: { $set: numCompleted }, myCompletionIndex: { $set: myCompletionIndex }, passedAll: { $set: passedAll }, isAdmin: { $set: isAdmin }, doc: { $set: doc } });
}
export default connect(mapStateToProps)(Problem);

import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from '../ProblemDescription';
import ProblemNotes from './LiveCode/ProblemNotes';
import update from 'immutability-helper';
import CodeProblemConfigPanel from './CodeConfigPanel';
import Files from './Files';
import MySolution from './MySolution';
import LiveCode from './LiveCode/LiveCode';
import PeerHelp from './PeerHelp/PeerHelp';
import { ISolutionState } from '../../../reducers/intermediateUserState';
import { IPMState } from '../../../reducers';
import CodeSolutionView from './CodeSolutionView';
import PuzzleEditor from './PuzzleEditor/PuzzleEditor';
import CodeOutput from './CodeOutput';
import AllSolutions from './AllSolutions/AllSolutions';

const CodeProblem = ({ problem, isAdmin, config, claimFocus, numCompleted, passedAll }) => {
    const [count, setCount] = React.useState(0);
    const [peer, setPeer] = React.useState(0);
    const peerHelpTabRef = React.createRef<HTMLAnchorElement>();
    const peerHelpDivRef = React.createRef<HTMLDivElement>();
    const mySolutionTabRef = React.createRef<HTMLAnchorElement>();
    const mySolutionDivRef = React.createRef<HTMLDivElement>();
    const revealSolutionsTabRef = React.createRef<HTMLAnchorElement>();
    const revealSolutionsDivRef = React.createRef<HTMLDivElement>();


    const refreshCM = () => {
        setCount(count + 1);
    }
    const peerHelpRedirect = () => {
        const peerHelpTab = peerHelpTabRef.current as HTMLAnchorElement;
        const mySolutionTab = mySolutionTabRef.current as HTMLAnchorElement;
        peerHelpTab.classList.toggle('active');
        mySolutionTab.classList.toggle('active');
        const peerHelpDiv = peerHelpDivRef.current as HTMLDivElement;
        const mySolutionDiv = mySolutionDivRef.current as HTMLDivElement;
        peerHelpDiv.classList.toggle('active');
        peerHelpDiv.classList.toggle('show');
        mySolutionDiv.classList.toggle('active');
        mySolutionDiv.classList.toggle('show');
        setPeer(peer + 1);
    }

    if (isAdmin) {
        return <>
            <div className="row">
                <div className="col">
                    <ProblemDescription focusOnMount={claimFocus} problem={problem} />
                </div>
                <div className="col config-panel">
                    <CodeProblemConfigPanel problem={problem} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <PuzzleEditor problem={problem} flag={count} />
                </div>
                <div className="col">
                    <nav>
                        <div className="nav nav-tabs instructor-tab" id={"nav-instructor-note-tab-" + problem.id} role="tablist">
                            <a className="nav-item nav-link active" id={"nav-output-tab-" + problem.id} data-toggle="tab" href={"#nav-output-" + problem.id} role="tab" aria-controls={"nav-output-" + problem.id} aria-selected="true" onClick={refreshCM}>Output</a>
                            <a className="nav-item nav-link" id={"nav-notes-tab-" + problem.id} data-toggle="tab" href={"#nav-notes-" + problem.id} role="tab" aria-controls={"nav-notes-" + problem.id} aria-selected="false" onClick={refreshCM}>Notes</a>
                            <a className="nav-item nav-link" id={"nav-draw-tab-" + problem.id} data-toggle="tab" href={"#nav-draw-" + problem.id} role="tab" aria-controls={"nav-draw-" + problem.id} aria-selected="false" onClick={refreshCM}>Draw</a>
                            <a className="nav-item nav-link" id={"nav-files-tab-" + problem.id} data-toggle="tab" href={"#nav-files-" + problem.id} role="tab" aria-controls={"nav-files-" + problem.id} aria-selected="false" onClick={refreshCM}>Files</a>
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-instructor-note-tabContent">
                        <div className="tab-pane fade show active" id={"nav-output-" + problem.id} role="tabpanel" aria-labelledby={"nav-output-tab-" + problem.id}>
                            <CodeOutput problem={problem} />
                        </div>
                        <div className="tab-pane fade" id={"nav-notes-" + problem.id} role="tabpanel" aria-labelledby={"nav-notes-tab-" + problem.id}>
                            <ProblemNotes problem={problem} isRender={false} flag={count} />
                        </div>
                        <div className="tab-pane fade" id={"nav-draw-" + problem.id} role="tabpanel" aria-labelledby={"nav-draw-tab-" + problem.id}>
                            <ProblemNotes problem={problem} isRender={true} />
                        </div>
                        <div className="tab-pane fade" id={"nav-files-" + problem.id} role="tabpanel" aria-labelledby={"nav-files-tab-" + problem.id}>
                            <Files problem={problem} />
                        </div>
                    </div>
                </div>
            </div>
            <CodeSolutionView problem={problem} />
            {!config.disableTest &&
                <div className="row completion-info">
                    <div className="col">
                        {passedAll &&
                            <span>You are one of </span>
                        }
                        {numCompleted} {numCompleted === 1 ? 'person' : 'people'}{passedAll && <span> that</span>} answered correctly.
                </div>
                </div>
            }
        </>
    }
    else {
        return <>
            <div className="row">
                <div className="col">
                    <ProblemDescription focusOnMount={claimFocus} problem={problem} />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <nav>
                        <div className="nav nav-tabs student-tab" id={"nav-student-tab-" + problem.id} role="tablist">
                            {(config.displayInstructor || config.peerHelp || config.revealSolutions) &&
                                <a ref={mySolutionTabRef} className="nav-item nav-link active" id={"nav-home-tab-" + problem.id} data-toggle="tab" href={"#nav-home-" + problem.id} role="tab" aria-controls={"nav-home-" + problem.id} aria-selected="true" onClick={refreshCM}>My Solution</a>
                            }
                            {config.displayInstructor &&
                                <a className="nav-item nav-link" id={"nav-profile-tab-" + problem.id} data-toggle="tab" href={"#nav-profile-" + problem.id} role="tab" aria-controls={"nav-profile-" + problem.id} aria-selected="false" onClick={refreshCM}>Instructor</a>
                            }
                            {config.peerHelp &&
                                <a ref={peerHelpTabRef} className="nav-item nav-link" id={"nav-contact-tab-" + problem.id} data-toggle="tab" href={"#nav-contact-" + problem.id} role="tab" aria-controls={"nav-contact-" + problem.id} aria-selected="false">Help Sessions</a>
                            }
                            {config.revealSolutions &&
                                <a ref={revealSolutionsTabRef} className="nav-item nav-link" id={"nav-solutions-tab-" + problem.id} data-toggle="tab" href={"#nav-solutions-" + problem.id} role="tab" aria-controls={"nav-solutions-" + problem.id} aria-selected="false">All Solutions</a>
                            }
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-student-tabContent">
                        <div ref={mySolutionDivRef} className="tab-pane fade show active" id={"nav-home-" + problem.id} role="tabpanel" aria-labelledby={"nav-home-tab-" + problem.id}>
                            <MySolution problem={problem} flag={count} redirectCallback={peerHelpRedirect} />
                        </div>
                        {config.displayInstructor &&
                            <div className="tab-pane fade" id={"nav-profile-" + problem.id} role="tabpanel" aria-labelledby={"nav-profile-tab-" + problem.id}>
                                <LiveCode problem={problem} flag={count} />
                            </div>
                        }
                        {config.peerHelp &&
                            <div ref={peerHelpDivRef} className="tab-pane fade" id={"nav-contact-" + problem.id} role="tabpanel" aria-labelledby={"nav-contact-tab-" + problem.id}>
                                <PeerHelp problem={problem} listView={peer} />
                            </div>
                        }
                        {config.revealSolutions &&
                            <div ref={revealSolutionsDivRef} className="tab-pane fade" id={"nav-solutions-" + problem.id} role="tabpanel" aria-labelledby={"nav-solutions-tab-" + problem.id}>
                                <AllSolutions problem={problem} flag={count}/>
                            </div>
                        }
                    </div>
                </div>
            </div>
            {!config.disableTest &&
                <div className="row completion-info">
                    <div className="col">
                        {passedAll &&
                            <span>You are one of </span>
                        }
                        {numCompleted} {numCompleted === 1 ? 'person' : 'people'}{passedAll && <span> that</span>} answered correctly.
                </div>
                </div>
            }
        </>
    }
}

function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin, awaitingFocus } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;
    const aggregateData = shareDBDocs.i.aggregateData;
    const problemAggregateData = aggregateData && aggregateData.userData[problem.id];
    const claimFocus = awaitingFocus && awaitingFocus.id === problem.id;
    const myuid = users.myuid as string;
    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const numCompleted = completed.length;
    const passedAll = completed.indexOf(myuid) >= 0;


    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid];
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];

    return update(ownProps, { $merge: { isAdmin, problemsDoc, userSolution, intermediateCodeState, config, claimFocus, numCompleted, passedAll } });
}
export default connect(mapStateToProps)(CodeProblem);

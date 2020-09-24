import * as React from 'react';
import { connect } from "react-redux";
import ProblemDescription from '../ProblemDescription';
// import ProblemNotes from './LiveCode/ProblemNotes';
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
import { logEvent } from '../../../utils/Firebase';
import { IProblem, ICodeProblemConfig, ICodeProblem, getCodeProblemCompletionStatus, CodeProblemCompletionStatus } from '../../../reducers/problems';
import { HELP_DOCS } from '../../App';
import { ICodeTest, ICodeSolutionAggregate } from '../../../reducers/aggregateData';

interface ICodeProblemOwnProps {
    problem: IProblem;
}
interface ICodeProblemProps extends ICodeProblemOwnProps {
    isAdmin: boolean;
    config: ICodeProblemConfig;
    claimFocus: boolean;
    requireAddingTest: boolean;
    passedAll: boolean;
    isInstructor: boolean;
    numStuCompleted: number;
    numStuTotal: number;
    myuid: string;
    codeTestFeedback: CodeProblemCompletionStatus;
    allTests: any;
}

const CodeProblem = ({ problem, isAdmin, config, claimFocus, codeTestFeedback, passedAll, isInstructor, numStuCompleted, numStuTotal, myuid, allTests }: ICodeProblemProps): JSX.Element => {
    const [count, setCount] = React.useState(0);
    const [peer, setPeer] = React.useState(0);
    const [currentTestID, setCurrentTestID] = React.useState(Object.keys(allTests)[0]);
    const currentTest = allTests.hasOwnProperty(currentTestID) ? allTests[currentTestID] : Object.values(allTests)[0];

    const peerHelpTabRef = React.createRef<HTMLAnchorElement>();
    const peerHelpDivRef = React.createRef<HTMLDivElement>();
    const mySolutionTabRef = React.createRef<HTMLAnchorElement>();
    const mySolutionDivRef = React.createRef<HTMLDivElement>();
    const revealSolutionsTabRef = React.createRef<HTMLAnchorElement>();
    const revealSolutionsDivRef = React.createRef<HTMLDivElement>();
    const refreshMySolution = React.useCallback(() => {
        const mySolutionDiv = mySolutionDivRef.current as HTMLDivElement;
        if (mySolutionDiv && !mySolutionDiv.classList.contains('active')) {
            mySolutionDiv.classList.toggle('active');
            mySolutionDiv.classList.toggle('show');
        }
    }, [mySolutionDivRef]);
    React.useEffect(() => {
        if (!config.displayInstructor) {
        }
        refreshMySolution();
    }, [config.displayInstructor, refreshMySolution])

    React.useEffect(() => {
        if (!config.revealSolutions) { refreshMySolution(); }
    }, [config.revealSolutions, refreshMySolution])

    React.useEffect(() => {
        if (!config.peerHelp) { refreshMySolution(); }
    }, [config.peerHelp, refreshMySolution])

    const doSelectCallback = (ID) => {
        setCurrentTestID(ID);
    }

    const switchPanel = (e) => {
        const panel = e.target.id.slice(4, 5)
        if (panel === "h") logEvent("focus_my_solution", {}, problem.id, myuid);
        if (panel === "p") logEvent("focus_instructor_board", {}, problem.id, myuid);
        if (panel === "s") logEvent("focus_group_discussion", {}, problem.id, myuid);
        refreshCM();
    }
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

    const completionInfo = <div className="row completion-info">
        <div className="col">
            {isInstructor &&
                <p>{numStuCompleted} of {numStuTotal} student{numStuTotal === 1 ? '' : 's'} answered correctly </p>
            }
            {!isInstructor &&
                <p>{passedAll && <span>You are one of </span>} {numStuCompleted} {numStuCompleted === 1 ? 'person' : 'people'} {passedAll && <span> that</span>} answered correctly </p>
            }
        </div>
    </div>;

    let testFeedback: JSX.Element | null = null;
    if (codeTestFeedback === CodeProblemCompletionStatus.NO_TESTS) {
        testFeedback = <div className="alert alert-danger" role="alert">
            You passed our tests but you must write at least one test case. <a href={HELP_DOCS.WRITING_TEST_CASES} target="_blank" rel="noopener noreferrer">(see how)</a>.
        </div>;
    } else if (codeTestFeedback === CodeProblemCompletionStatus.TEST_NOT_VERIFIED) {
        testFeedback = <div className="alert alert-danger" role="alert">
            Write at least one <strong>verified</strong> test case <a href={HELP_DOCS.VERIFYING_TEST_CASES} target="_blank" rel="noopener noreferrer">(more detail)</a>.
        </div>;
    } else if (codeTestFeedback === CodeProblemCompletionStatus.TEST_DUPLICATES_INSTRUCTORS) {
        testFeedback = <div className="alert alert-danger" role="alert">
            Write at least one test case that is different from the instructors' test cases. <a href={HELP_DOCS.WRITING_TEST_CASES} target="_blank" rel="noopener noreferrer">(see how)</a>.
        </div>;
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
            <div className="row instructor-puzzle-container">
                <div className="col-7">
                    <PuzzleEditor problem={problem} flag={count} doSelectCallback={doSelectCallback} currentTest={currentTest} />
                </div>
                <div className="col-5">
                    <CodeOutput problem={problem} currentTest={currentTest} />
                    <Files problem={problem} />
                </div>
            </div>
            <CodeSolutionView problem={problem} />
            {completionInfo}
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
                                <a ref={mySolutionTabRef} className="nav-item nav-link active" id={"nav-home-tab-" + problem.id} data-toggle="tab" href={"#nav-home-" + problem.id} role="tab" aria-controls={"nav-home-" + problem.id} aria-selected="true" onClick={switchPanel}>My Solution</a>
                            }
                            {config.displayInstructor &&
                                <a className="nav-item nav-link" id={"nav-profile-tab-" + problem.id} data-toggle="tab" href={"#nav-profile-" + problem.id} role="tab" aria-controls={"nav-profile-" + problem.id} aria-selected="false" onClick={switchPanel}>Instructor</a>
                            }
                            {config.peerHelp &&
                                <a ref={peerHelpTabRef} className="nav-item nav-link" id={"nav-contact-tab-" + problem.id} data-toggle="tab" href={"#nav-contact-" + problem.id} role="tab" aria-controls={"nav-contact-" + problem.id} aria-selected="false">Help Sessions</a>
                            }
                            {config.revealSolutions &&
                                <a ref={revealSolutionsTabRef} className="nav-item nav-link" id={"nav-solutions-tab-" + problem.id} data-toggle="tab" href={"#nav-solutions-" + problem.id} role="tab" aria-controls={"nav-solutions-" + problem.id} aria-selected="false" onClick={switchPanel}>My Group</a>
                            }
                        </div>
                    </nav>
                    <div className="tab-content" id="nav-student-tabContent">
                        <div ref={mySolutionDivRef} className="tab-pane fade show active" id={"nav-home-" + problem.id} role="tabpanel" aria-labelledby={"nav-home-tab-" + problem.id}>
                            <MySolution problem={problem} flag={count} redirectCallback={peerHelpRedirect} currentTest={currentTest} doSelectCallback={doSelectCallback} />
                        </div>
                        {config.displayInstructor &&
                            <div className="tab-pane fade" id={"nav-profile-" + problem.id} role="tabpanel" aria-labelledby={"nav-profile-tab-" + problem.id}>
                                <LiveCode problem={problem} flag={count} />
                            </div>
                        }
                        {config.peerHelp &&
                            <div ref={peerHelpDivRef} className="tab-pane fade" id={"nav-contact-" + problem.id} role="tabpanel" aria-labelledby={"nav-contact-tab-" + problem.id}>
                                <PeerHelp problem={problem} listView={peer} currentTest={currentTest} />
                            </div>
                        }
                        {config.revealSolutions &&
                            <div ref={revealSolutionsDivRef} className="tab-pane fade" id={"nav-solutions-" + problem.id} role="tabpanel" aria-labelledby={"nav-solutions-tab-" + problem.id}>
                                <AllSolutions problem={problem} flag={count} />
                            </div>
                        }
                    </div>
                </div>
            </div>
            {completionInfo}
            {testFeedback}
            {(config.startTimer && !passedAll) &&
                <div className="row time-info">
                    <div className="col">
                        {config.currentTime} seconds left
                    </div>
                </div>
            }
            {config.startTimer &&
            <div className="problemleaderboard-info">
                <button className="btn btn-primary" type="button" data-toggle="collapse" data-target="#collapseExample" aria-expanded="false" aria-controls="collapseExample">
                    Check Leaderboard
  </button>
            <div className="collapse" id="collapseExample">
                <div className="card card-body">
                        <div className="problemleaderboard-header">Leaderboard</div>
                        <ul className="list-group problemleaderboard-list">
                            {config.problemLeaderBoard.map((member, index) =>
                                <li className="list-group-item" key={index}>
                                    <div className="row leaderboard-user">
                                        <div className="col leaderboard-rank"> {index + 1}
                                        </div>
                                        <div className="col leaderboard-username"> {member.username}
                                        </div>
                                        <div className="col leaderboard-time"> {member.completionTime}
                                        </div>
                                    </div>
                                </li>
                            )}</ul>
                    </div>
                </div>
            </div>
                        }


        </>
    }
}

function mapStateToProps(state: IPMState, ownProps: ICodeProblemOwnProps): ICodeProblemProps {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { isAdmin, awaitingFocus } = intermediateUserState;
    const problemsDoc = shareDBDocs.problems;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails as ICodeProblem;
    const aggregateData = shareDBDocs.i.aggregateData;
    const problemAggregateData = aggregateData && aggregateData.userData[problem.id];
    const claimFocus = awaitingFocus && awaitingFocus.id === problem.id;
    const myuid = users.myuid as string;
    const localUsers = users.allUsers;
    const isInstructor = localUsers && localUsers[myuid] && localUsers[myuid].isInstructor;

    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const sdbUsers = shareDBDocs.i.users ? shareDBDocs.i.users.allUsers : {};
    const allUsers = Object.keys(sdbUsers).length > Object.keys(localUsers).length ? sdbUsers : localUsers;
    const allUsersID = Object.keys(allUsers);
    const numStuCompleted = completed.filter(i => (allUsers[i] && !allUsers[i].isInstructor)).length;
    const numStuTotal = allUsersID.filter(i => (allUsers[i] && !allUsers[i].isInstructor)).length;
    const numCompleted = completed.length;
    const passedAll = completed.indexOf(myuid) >= 0;
    const userSolution = solutions.allSolutions[ownProps.problem.id][myuid];
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];

    const codeTestFeedback = getCodeProblemCompletionStatus(problem, state);
    const instructorTests = (problemDetails as ICodeProblem).tests;

    const tests: { [id: string]: ICodeTest } = problemAggregateData ? (problemAggregateData as ICodeSolutionAggregate).tests : {};

    const allTests = Object.assign(JSON.parse(JSON.stringify(instructorTests)), JSON.parse(JSON.stringify(tests)));

    return update(ownProps, { $merge: { isAdmin, problemsDoc, userSolution, intermediateCodeState, config, claimFocus, numCompleted, passedAll, isInstructor, numStuCompleted, numStuTotal, myuid, codeTestFeedback, allTests } as any }) as ICodeProblemProps;
}
export default connect(mapStateToProps)(CodeProblem);

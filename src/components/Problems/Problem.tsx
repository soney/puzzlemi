import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { deleteProblem, setProblemVisibility, moveProblemUp, moveProblemDown } from '../../actions/sharedb_actions';
import CodeProblem from './CodeProblem/CodeProblem';
import MultipleChoiceProblem from './MultipleChoiceProblem/MultipleChoiceProblem';
import * as classNames from 'classnames';
import TextResponseProblem from './TextResponseProblem/TextResponseProblem';
import { IPMState } from '../../reducers';
import { IProblemType, CodeProblemCompletionStatus, getCodeProblemCompletionStatus } from '../../reducers/problems';

enum PassedStatus {
    NOT_PASSED='not_passed', AWAITING_TEST='awaiting_test', PASSED='passed'
}

const Problem = ({ problem, dispatch, numCompleted, passedStatus, visible, revealSolution, isAdmin, pointUserToOtherProblem }) => {
    const { id: problemID, problemDetails } = problem;
    const { problemType } = problemDetails;

    const elementRef: React.Ref<HTMLDivElement> = React.createRef();

    // React.useEffect(() => {
    //     if (claimFocus) {
    //         const el = elementRef.current;
    //         if (el) {
    //             el.scrollIntoView({block: 'start', inline: 'nearest'});
    //         }
    //     }
    // });

    const doDeleteProblem = () => {
        return dispatch(deleteProblem(problemID));
    };
    const doHideProblem = () => {
        dispatch(setProblemVisibility(problemID, false));
    }
    const doShowProblem = () => {
        dispatch(setProblemVisibility(problemID, true));
    }
    const doMoveProblemUp = () => {
        dispatch(moveProblemUp(problemID));
    }
    const doMoveProblemDown = () => {
        dispatch(moveProblemDown(problemID));
    }

    let problemDisplay: JSX.Element|null = null;
    if(problemType === IProblemType.Code) {
        problemDisplay = <CodeProblem problem={problem} />;
    } else if(problemType === IProblemType.MultipleChoice) {
        problemDisplay = <MultipleChoiceProblem problem={problem} />;
    } else if(problemType === IProblemType.TextResponse) {
        problemDisplay = <TextResponseProblem problem={problem} />;
    }

    let pointUserToOtherProblemDisplay: JSX.Element|null = null;

    if(pointUserToOtherProblem) {
        pointUserToOtherProblemDisplay = <div className="alert alert-warning" role="alert">
            Try completing all of the problems before this one <a href={`#${pointUserToOtherProblem}`}>(go back)</a>
        </div>;
    }

    return <div id={problem.id} className={classNames({'problem': true, 'container': true, 'warning': (passedStatus === PassedStatus.AWAITING_TEST)&&!isAdmin, 'success': (passedStatus===PassedStatus.PASSED)&&!isAdmin})} ref={elementRef}>
        { isAdmin &&
            <div className="btn-toolbar justify-content-between">
                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                    <label className={"btn btn-sm " + (visible ? "btn-primary" : "btn-outline-primary")}>
                        <input type="radio" name="options" id="visible" onClick={doShowProblem} />
                        <i className="fas fa-eye"></i>&nbsp;Visible
                    </label>
                    <label className={"btn btn-sm " + (!visible ? "btn-secondary" : "btn-outline-secondary")}>
                        <input type="radio" name="options" id="hidden" onClick={doHideProblem} />
                        <i className="fas fa-eye-slash"></i>&nbsp;Hidden
                    </label>
                </div>

                <div className="btn-group btn-group-toggle" data-toggle="buttons">
                    <label className={"btn btn-sm btn-outline-secondary"}>
                        <input type="radio" name="options" onClick={doMoveProblemUp} />
                        <i className="fas fa-arrow-up"></i>&nbsp;Up
                    </label>
                    <label className={"btn btn-sm btn-outline-secondary"}>
                        <input type="radio" name="options" onClick={doMoveProblemDown} />
                        <i className="fas fa-arrow-down"></i>&nbsp;Down
                    </label>
                </div>
                <button className="btn btn-sm btn-outline-danger float-right" onClick={doDeleteProblem}><i className="fas fa-trash"></i>&nbsp;Delete Problem</button>
            </div>
        }
        { !isAdmin && pointUserToOtherProblemDisplay }
        {problemDisplay}
        {
            ((problemType === IProblemType.MultipleChoice && revealSolution)) &&
            <div className="row completion-info">
                <div className="col">
                    {passedStatus === PassedStatus.PASSED &&
                        <span>You are one of </span>
                    }
                    {numCompleted} {numCompleted === 1 ? 'person' : 'people'}{(passedStatus===PassedStatus.PASSED) && <span> that</span>} answered correctly.
                </div>
            </div>
        }
    </div>;
}

function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs, users } = state;
    const myuid = users.myuid as string;
    const { isAdmin, awaitingFocus } = intermediateUserState;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { problemType, revealSolution } = problemDetails;
    const problemID = problem.id;
    const { visible } = ownProps.problem;
    const aggregateData = shareDBDocs.aggregateData?.getData();
    const problemAggregateData = aggregateData && aggregateData.userData[problemID];

    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const numCompleted = completed.length;

    let passedStatus: PassedStatus = PassedStatus.NOT_PASSED;
    if(problemType === IProblemType.Code) {
        const completionStatus = getCodeProblemCompletionStatus(problem, state);
        if(completionStatus === CodeProblemCompletionStatus.ALL_COMPLETED) {
            passedStatus = PassedStatus.PASSED;
        } else if(completionStatus === CodeProblemCompletionStatus.NO_TESTS || completionStatus === CodeProblemCompletionStatus.TEST_DUPLICATES_INSTRUCTORS || completionStatus === CodeProblemCompletionStatus.TEST_NOT_VERIFIED) {
            passedStatus = PassedStatus.AWAITING_TEST;
        }
    } else if(problemType === IProblemType.MultipleChoice) {
        if(completed.indexOf(myuid) >= 0 && !revealSolution) {
            passedStatus = PassedStatus.PASSED;
        }
    }
    // const passedAll = completed.indexOf(myuid) >= 0 && !(problemType===IProblemType.MultipleChoice&&!revealSolution);

    const claimFocus = awaitingFocus && awaitingFocus.id === problem.id;

    return update(ownProps, {$merge: { isAdmin, numCompleted, passedStatus, visible, revealSolution, claimFocus }});
}
export default connect(mapStateToProps)(Problem);

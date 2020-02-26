import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { deleteProblem, setProblemVisibility, moveProblemUp, moveProblemDown } from '../../actions/sharedb_actions';
import CodeProblem from './CodeProblem/CodeProblem';
import MultipleChoiceProblem from './MultipleChoiceProblem/MultipleChoiceProblem';
import * as classNames from 'classnames';
import TextResponseProblem from './TextResponseProblem/TextResponseProblem';
import { IPMState } from '../../reducers';
import { IProblemType } from '../../reducers/problems';

const Problem = ({ problem, dispatch, numCompleted, passedAll, visible, revealSolution, isAdmin }) => {
    const { id: problemID, problemDetails } = problem;
    const { problemType } = problemDetails;

    const elementRef: React.Ref<HTMLLIElement> = React.createRef();

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

    return <li className={classNames({'problem': true, 'container': true, 'passedAll': passedAll&&!isAdmin})} ref={elementRef}>
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
            // <div className="row">
            //     <div className="col clearfix">
            //     </div>
            // </div>
        }
        {problemDisplay}
        {
            ((problemType === IProblemType.MultipleChoice && revealSolution)) &&
            <div className="row completion-info">
                <div className="col">
                    {passedAll &&
                        <span>You are one of </span>
                    }
                    {numCompleted} {numCompleted === 1 ? 'person' : 'people'}{passedAll && <span> that</span>} answered correctly.
                </div>
            </div>
        }
    </li>;
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
    const aggregateData = shareDBDocs.i.aggregateData;
    const problemAggregateData = aggregateData && aggregateData.userData[problemID];

    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const numCompleted = completed.length;
    const passedAll = completed.indexOf(myuid) >= 0 && !(problemType===IProblemType.MultipleChoice&&!revealSolution);

    const claimFocus = awaitingFocus && awaitingFocus.id === problem.id;

    return update(ownProps, {$merge: { isAdmin, numCompleted, passedAll, visible, revealSolution, claimFocus }});
}
export default connect(mapStateToProps)(Problem);

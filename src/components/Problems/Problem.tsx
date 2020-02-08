import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { deleteProblem, setProblemVisibility } from '../../actions/sharedb_actions';
import CodeProblem from './CodeProblem/CodeProblem';
import MultipleChoiceProblem from './MultipleChoiceProblem/MultipleChoiceProblem';
import * as classNames from 'classnames';
import TextResponseProblem from './TextResponseProblem/TextResponseProblem';
import { IPMState } from '../../reducers';

const Problem = ({ problem, dispatch, numCompleted, passedAll, visible, revealSolution, isAdmin }) => {
    const { id: problemID, problemDetails } = problem;
    const { problemType } = problemDetails;

    const doDeleteProblem = () => {
        return dispatch(deleteProblem(problemID));
    };
    const doHideProblem = () => {
        dispatch(setProblemVisibility(problemID, false));
    }
    const doShowProblem = () => {
        dispatch(setProblemVisibility(problemID, true));
    }

    let problemDisplay: JSX.Element|null = null;
    if(problemType === 'code') {
        problemDisplay = <CodeProblem problem={problem} />;
    } else if(problemType === 'multiple-choice') {
        problemDisplay = <MultipleChoiceProblem problem={problem} />;
    } else if(problemType === 'text-response') {
        problemDisplay = <TextResponseProblem problem={problem} />;
    }

    return <li className={classNames({'problem': true, 'container': true, 'passedAll': passedAll&&!isAdmin})}>
        { isAdmin &&
            <div className="row">
                <div className="col clearfix">
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                        <label className={"btn btn-sm " + (visible ? "btn-primary" : "btn-outline-primary")}>
                            <input type="radio" name="options" id="visible" onClick={doShowProblem} /> Visible
                        </label>
                        <label className={"btn btn-sm " + (!visible ? "btn-secondary" : "btn-outline-secondary")}>
                            <input type="radio" name="options" id="hidden" onClick={doHideProblem} /> Hidden
                        </label>
                    </div>
                    <button className="btn btn-sm btn-outline-danger float-right" onClick={doDeleteProblem}>Delete Problem</button>
                </div>
            </div>
        }
        {problemDisplay}
        {
            ((problemType === 'code') || (problemType === 'multiple-choice' && revealSolution)) &&
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
    const { isAdmin } = intermediateUserState;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { problemType, revealSolution } = problemDetails;
    const problemID = problem.id;
    const { visible } = ownProps.problem;
    const aggregateData = shareDBDocs.i.aggregateData;
    const problemAggregateData = aggregateData && aggregateData.userData[problemID];

    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const numCompleted = completed.length;
    const passedAll = completed.indexOf(myuid) >= 0 && !(problemType==='multiple-choice'&&!revealSolution);

    return update(ownProps, {$merge: { isAdmin, numCompleted, passedAll, visible, revealSolution }});
}
export default connect(mapStateToProps)(Problem);

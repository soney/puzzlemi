import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { deleteProblem, setProblemVisibility } from '../../actions/sharedb_actions';
import CodeProblem from './CodeProblem';
import MultipleChoiceProblem from './MultipleChoiceProblem';

const Problem = ({ id, doc, visible, problem, index, dispatch, passedAll, isAdmin,}) => {
    const doDeleteProblem = () => {
        return dispatch(deleteProblem(index));
    };

    const doHideProblem = () => {
        dispatch(setProblemVisibility(id, false));
    }
    const doShowProblem = () => {
        dispatch(setProblemVisibility(id, true));
    }

    const { problemType } = problem;
    let problemDisplay: JSX.Element|null = null;
    if(problemType === 'code') {
        problemDisplay = <CodeProblem index={index} doc={doc} problem={problem} />;
    } else if(problemType === 'multiple-choice') {
        problemDisplay = <MultipleChoiceProblem index={index} doc={doc} problem={problem} />;
    }

    // const doUpdateProblemVisiblity = (ev) => {
    //     console.log(ev);
    // };

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
        {problemDisplay}
    </li>;
}
function mapStateToProps(state, ownProps) {
    const { index } = ownProps;
    const { user, doc, problems, userData } = state;
    const { id, problem } = problems[index];
    const { isAdmin } = user;
    const { code, output, passedAll, errors } = user.solutions[id];
    const visible = userData[id] && userData[id].visible;
    const completed: string[] = userData[id] ? userData[id].completed : [];
    const numCompleted = completed ? completed.length : 0;
    const myCompletionIndex = completed ? completed.indexOf(user.id) : -1;
    return update(ownProps, { id: {$set: id}, visible: {$set: visible}, numCompleted: {$set: numCompleted }, myCompletionIndex: { $set: myCompletionIndex}, passedAll: { $set: passedAll },  errors: { $set: errors }, problem: { $set: problem }, output: { $set: output }, isAdmin: { $set: isAdmin }, code: { $set: code }, doc: { $set: doc }});
}
export default connect(mapStateToProps)(Problem);

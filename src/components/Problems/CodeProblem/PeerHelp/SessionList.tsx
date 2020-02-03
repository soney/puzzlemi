import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { timeAgo } from '../../../../utils/timestamp';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { updateCurrentActiveHelpSession } from '../../../../actions/user_actions';
import * as showdown from 'showdown';

const SessionList = ({ session, currentActiveHelpSession, dispatch, problem }) => {
    const onChangeActiveID = () => {
        dispatch(updateCurrentActiveHelpSession(problem.id, session.id))
    }
    const converter = new showdown.Converter();

    return <div onClick={onChangeActiveID} className={session.id === currentActiveHelpSession ? "list-group-item list-group-item-action active" : "list-group-item list-group-item-action"}>
        <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1"><p dangerouslySetInnerHTML={{ __html: converter.makeHtml(session.title) }} /></h5>
            <small>{timeAgo(parseInt(session.timestamp))}</small>
        </div>
        <p className="mb-1" dangerouslySetInnerHTML={{ __html: converter.makeHtml(session.description) }} />
        <small>{session.tutee}</small>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState } = state;
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    return update(ownProps, { $merge: { currentActiveHelpSession } });
}
export default connect(mapStateToProps)(SessionList);

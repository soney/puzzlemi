import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { timeAgo } from '../../../../utils/timestamp';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { updateCurrentActiveHelpSession } from '../../../../actions/user_actions';
import { changeHelperLists } from '../../../../actions/sharedb_actions';
import * as showdown from 'showdown';

const SessionList = ({ session, currentActiveHelpSession, dispatch, problem, myuid, helperLists, clickCallback }) => {
    console.log(session)
    const onChangeActiveID = () => {
        dispatch(updateCurrentActiveHelpSession(problem.id, session.id))
        dispatch(changeHelperLists(problem.id, session.id, myuid))
        clickCallback(false)
    }
    const converter = new showdown.Converter();
    const sessionIDs = Object.values(helperLists);
    const helperNumber = sessionIDs.filter(s => s === session.id).length;

    return <div onClick={onChangeActiveID} className="list-group-item list-group-item-action">
        <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1"><p className={session.status ? "session-open" : "session-close"} dangerouslySetInnerHTML={{ __html: converter.makeHtml(session.title) }} /></h5>
        </div>
        <div className="row">
            <div className="col-8">
                <small>opened {timeAgo(parseInt(session.timestamp))} by {session.tutee}</small>
            </div>
            <div className="col-4">
                <small>Active Users: {helperNumber}</small>
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs, users } = state;
    const myuid = users.myuid as string;

    const { problem } = ownProps;
    const aggregateData = shareDBDocs.i.aggregateData;
    const { helperLists } = aggregateData.userData[problem.id];

    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    return update(ownProps, { $merge: { currentActiveHelpSession, myuid, helperLists } });
}
export default connect(mapStateToProps)(SessionList);

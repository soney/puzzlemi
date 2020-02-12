import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { useState } from 'react';
import SessionList from './SessionList';
import SessionPanel from './SessionPanel';
import { IHelpSession } from '../../../../reducers/aggregateData';
import uuid from '../../../../utils/uuid';
import { addHelpSession, changeHelperLists } from '../../../../actions/sharedb_actions';
import { updateCurrentActiveHelpSession } from '../../../../actions/user_actions';

const PeerHelp = ({ sessions, problem, dispatch, myuid, username, userSolution}) => {
    const [isOpenView, setIsOpen] = useState(true);

    const open_sessions = sessions.filter(s => s.status);
    const close_sessions = sessions.filter(s => !s.status);

    const toggleOpenView = () => {
        setIsOpen(true);
    }
    const toggleCloseView = () => {
        setIsOpen(false);
    }

    const doRequestHelp = () => {
        const helpID = uuid();
        dispatch(addHelpSession(problem.id, username, userSolution, helpID)).then(()=>{
            dispatch(updateCurrentActiveHelpSession(problem.id, helpID));
            dispatch(changeHelperLists(problem.id, helpID, myuid))
        });
    }

    return <div>
        <SessionPanel problem={problem} sessions={sessions} />
        <div className="help-sessions-list">
            <h5>List of Help Sessions </h5>

            <div className="list-group help-sessions-list-group">
                <div className="list-group-item">
                    <div className="session-list-button-open-close">
                        <button type="button" className="btn btn-outline-success" onClick={toggleOpenView}>{open_sessions.length} Open</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={toggleCloseView}>{close_sessions.length} Closed</button>
                    </div>
                    <div className="session-list-button-new">
                    <button type="button" className="btn btn-outline-primary" onClick={doRequestHelp}><i className="fas fa-comment"></i> Start a Help Session</button>
                    </div>
                </div>
                {isOpenView
                    ? <>{open_sessions.map((session, i) => <SessionList key={i} session={session} problem={problem} />)}</>
                    : <>{close_sessions.map((session, i) => <SessionList key={i} session={session} problem={problem} />)}</>
                }

            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs, users, solutions } = state;
    const { problem } = ownProps;
    const aggregateData = shareDBDocs.i.aggregateData
    const myuid = users.myuid as string;
    const username = users.allUsers[myuid].username;
    const userSolution = solutions.allSolutions[problem.id][myuid];

    let helpSessions = {};
    if (aggregateData) {
        helpSessions = aggregateData.userData[problem.id].helpSessions
    }
    const helpSessionObjects: IHelpSession[] = Object.values(helpSessions);

    return update(ownProps, { $merge: { sessions: helpSessionObjects,myuid, username,  userSolution} });
}
export default connect(mapStateToProps)(PeerHelp);

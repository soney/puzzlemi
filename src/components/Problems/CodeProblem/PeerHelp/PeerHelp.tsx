import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import SessionList from './SessionList';
import SessionPanel from './SessionPanel';

const PeerHelp = ({ sessions, problem }) => {
    return <div>
        <SessionPanel problem={problem} sessions={sessions} />
        <div className="help-sessions-list">
            <h5>List of Help Sessions </h5>

            <div className="list-group help-sessions-list-group">
                {sessions.map((session, i) => <SessionList key={i} session={session} sessions={sessions} problem={problem} />)}
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const { problem } = ownProps;
    const aggregateData = shareDBDocs.i.aggregateData

    let helpSessions = [];
    if(aggregateData){
        helpSessions = aggregateData.userData[problem.id].helpSessions
    }
    return update(ownProps, { $merge: { sessions: helpSessions } });
}
export default connect(mapStateToProps)(PeerHelp);

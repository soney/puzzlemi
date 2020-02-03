import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import SessionList from './SessionList';
import SessionPanel from './SessionPanel';

const PeerHelp = ({ helpSessions, problem }) => {
    return <div>
        <SessionPanel problem={problem} />
        <div className="help-sessions-list">
            <h5>List of Help Sessions </h5>

            <div className="list-group help-sessions-list-group">
                {helpSessions.map((session, i) => <SessionList key={i} session={session} problem={problem} />)}
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const { problem } = ownProps;

    const aggregateDataDoc = shareDBDocs.aggregateData
    const aggregateData = aggregateDataDoc.getData();
    const helpSessions = aggregateData.userData[problem.id].helpSessions
    return update(ownProps, { $merge: { helpSessions } });
}
export default connect(mapStateToProps)(PeerHelp);

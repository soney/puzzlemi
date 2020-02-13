import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import SessionList from './SessionList';
import SessionPanel from './SessionPanel';
import { IHelpSession } from '../../../../reducers/aggregateData';
import uuid from '../../../../utils/uuid';
import { addHelpSession, changeHelperLists } from '../../../../actions/sharedb_actions';
import { updateCurrentActiveHelpSession } from '../../../../actions/user_actions';

const PeerHelp = ({ sessions, problem, dispatch, myuid, username, userSolution, listView }) => {
    const [viewNum, setViewNum] = React.useState(0);
    const [isListView, setIsList] = React.useState(true);

    const open_sessions = sessions.filter(s => s.status);
    const close_sessions = sessions.filter(s => !s.status);
    const my_sessions = sessions.filter(s => s.tutee === username);
    const sessionCollections = [open_sessions, close_sessions, my_sessions];
    const current_sessions = sessionCollections[viewNum];

    React.useEffect(() => {
        if (listView === 0) setIsList(true);
        else setIsList(false)
    }, [listView])

    const toggleOpenView = () => {
        setViewNum(0);
    }
    const toggleCloseView = () => {
        setViewNum(1);
    }
    const toggleMyView = () => {
        setViewNum(2);
    }

    const doRequestHelp = () => {
        const helpID = uuid();
        dispatch(addHelpSession(problem.id, username, userSolution, helpID)).then(() => {
            dispatch(updateCurrentActiveHelpSession(problem.id, helpID));
            dispatch(changeHelperLists(problem.id, helpID, myuid))
        });
        setIsList(false);
    }

    const clickCallback = (status) => {
        setIsList(status);
    }

    return <div>

        {isListView
            ? <div className="help-sessions-list">
                <nav className="navbar navbar-light bg-light">
                    <div className="navbar-brand">Sessions</div>
                </nav>

                <div className="list-group help-sessions-list-group">
                    <div className="list-group-item">
                        <div className="btn-group btn-group-toggle" data-toggle="buttons">
                            <label className={viewNum===0?"btn btn-light action active":"btn btn-light"} onClick={toggleOpenView}>
                                <input type="radio" name="options" id="option1" /> {open_sessions.length} Open
                            </label>
                            <label className={viewNum===1?"btn btn-light action active":"btn btn-light"} onClick={toggleCloseView}>
                                <input type="radio" name="options" id="option2" /> {close_sessions.length} Closed
                            </label>
                            <label className={viewNum===2?"btn btn-light action active":"btn btn-light"} onClick={toggleMyView}>
                                <input type="radio" name="options" id="option3" /> {my_sessions.length} My
                            </label>
                        </div>
                        <div className="session-list-button-new">
                            <button type="button" className="btn btn-outline-primary" onClick={doRequestHelp}><i className="fas fa-comment"></i> Start a Help Session</button>
                        </div>
                    </div>
                    {current_sessions.map((session, i) => <SessionList key={i} session={session} problem={problem} clickCallback={clickCallback} />)}
                </div>
            </div>
            : <SessionPanel problem={problem} sessions={sessions} clickCallback={clickCallback} />
        }
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

    return update(ownProps, { $merge: { sessions: helpSessionObjects, myuid, username, userSolution } });
}
export default connect(mapStateToProps)(PeerHelp);

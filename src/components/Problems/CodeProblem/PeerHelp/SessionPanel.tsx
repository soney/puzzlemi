import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { CodeEditor } from '../../../CodeEditor';
import ChatWidget from './ChatWidget';
import * as showdown from 'showdown';

const SessionPanel = ({ activeSession, sessionIndex, problem, aggregateDataDoc, sessions, isTutee }) => {
    if (activeSession === null) return <></>;

    const p = ['userData', problem.id, 'helpSessions', sessionIndex];
    const sharedCodeSubDoc = aggregateDataDoc.subDoc([...p, 'solution', 'code']);
    const titleSubDoc = aggregateDataDoc.subDoc([...p, 'title']);
    const descriptionSubDoc = aggregateDataDoc.subDoc([...p, 'description']);
    const converter = new showdown.Converter();

    return <div>
        <div className="session-head">
            <h5>Title:</h5>
            {isTutee
                ? <div><CodeEditor shareDBSubDoc={titleSubDoc} refreshDoc={sessionIndex} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 50 }} /></div>
                : <div><p dangerouslySetInnerHTML={{ __html: converter.makeHtml(activeSession.title) }} />
                </div>}
            <h5>Description: </h5>
            {isTutee
                ? <div><CodeEditor shareDBSubDoc={descriptionSubDoc} refreshDoc={sessionIndex} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 50 }} /></div>
                : <div><p dangerouslySetInnerHTML={{ __html: converter.makeHtml(activeSession.description) }} /></div>}
        </div>
        <div className="row">
            <div className="col">
                <CodeEditor shareDBSubDoc={sharedCodeSubDoc} refreshDoc={sessionIndex} />
            </div>
            <div className="col">
                <ChatWidget problem={problem} sessions={sessions} />
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs, intermediateUserState, users } = state;
    const { sessions } = ownProps;
    const aggregateDataDoc = shareDBDocs.aggregateData
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    let activeS = sessions.filter(s => s.id === currentActiveHelpSession);
    const activeSession = activeS.length > 0 ? activeS[0] : null;
    const sessionIndex = sessions.indexOf(activeSession);
    const myuid = users.myuid as string;
    const username = myuid.slice(0,7) === "testuid" ? "testuser-"+myuid.slice(-4) : users.allUsers[myuid].username;
    const isTutee = activeSession !== null ? activeSession.tutee === username : false;
    return update(ownProps, { $merge: { username, sessionIndex, aggregateDataDoc, sessions, activeSession, isTutee } });
}
export default connect(mapStateToProps)(SessionPanel);

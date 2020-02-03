import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { CodeEditor } from '../../../CodeEditor';
import ChatWidget from './ChatWidget';
import * as showdown from 'showdown';

const SessionPanel = ({ activeSession, dispatch, problem, aggregateDataDoc, helpSessions, isTutee }) => {
    if (activeSession === null) return <></>;

    const sessionIndex = helpSessions.indexOf(activeSession);
    const p = ['userData', problem.id, 'helpSessions', sessionIndex];
    const sharedCodeSubDoc = aggregateDataDoc.subDoc([...p, 'solution', 'code']);
    const titleSubDoc = aggregateDataDoc.subDoc([...p, 'title']);
    const descriptionSubDoc = aggregateDataDoc.subDoc([...p, 'description']);
    const converter = new showdown.Converter();

    return <div>
        <div className="session-head">
            <h5>Title:</h5>
            {isTutee
                ? <div><CodeEditor shareDBSubDoc={titleSubDoc} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 50 }} /></div>
                : <div><p dangerouslySetInnerHTML={{ __html: converter.makeHtml(activeSession.title) }} />
                </div>}
            <h5>Description: </h5>
            {isTutee
                ? <div><CodeEditor shareDBSubDoc={descriptionSubDoc} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 50 }} /></div>
                : <div><p dangerouslySetInnerHTML={{ __html: converter.makeHtml(activeSession.description) }} /></div>}
        </div>
        <div className="row">
            <div className="col">
                <CodeEditor shareDBSubDoc={sharedCodeSubDoc} />
            </div>
            <div className="col">
                <ChatWidget problem={problem} />
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs, intermediateUserState, users } = state;
    const { problem } = ownProps;
    const aggregateDataDoc = shareDBDocs.aggregateData
    const aggregateData = aggregateDataDoc.getData();
    const helpSessions = aggregateData.userData[problem.id].helpSessions;
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    let activeS = helpSessions.filter(s => s.id === currentActiveHelpSession);
    const activeSession = activeS.length > 0 ? activeS[0] : null;
    const myuid = users.myuid as string;
    const username = myuid === "testuid" ? "testuser" : users.allUsers[myuid].username;
    const isTutee = activeSession !== null ? activeSession.tutee === username : false;
    return update(ownProps, { $merge: { activeSession, isTutee, aggregateDataDoc, helpSessions } });
}
export default connect(mapStateToProps)(SessionPanel);

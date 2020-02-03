import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { timeAgo, getTimeStamp } from '../../../../utils/timestamp';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { CodeEditor } from '../../../CodeEditor';
import { addMessage } from '../../../../actions/sharedb_actions';
import { IMessage } from '../../../../reducers/aggregateData';
import * as showdown from 'showdown';

let message = 'send your *message* here';
const ChatWidget = ({ activeSession, dispatch, problem, helpSessions, username }) => {
    const sessionIndex = helpSessions.indexOf(activeSession);

    const onMessageChange = (e) => {
        message = e.value;
    }

    const onSendMessage = () => {
        const newMessage: IMessage = {
            sender: username,
            content: message,
            timestamp: getTimeStamp()
        }
        dispatch(addMessage(problem.id, newMessage, sessionIndex))
    }
    const converter = new showdown.Converter();


    return <div>
        <div className="chat-container">
            <div className="chat-messages-wrapper">
                {activeSession.chatMessages.map((message, i) => <div className="chat-message-container" key={i}>

                    <div className="card chat-message-item">
                        <div className="card-header">
                            <span className="sender">{message.sender}</span>
                            <span className="timestamp">
                                ({timeAgo(parseInt(message.timestamp))})
                            </span>
                        </div>
                        <div className="card-body content">
                            <p dangerouslySetInnerHTML={{ __html: converter.makeHtml(message.content) }} />
                        </div>
                    </div>
                </div>)}
            </div>
            <div className="chat-input-container row">
                <div className="chat-input-wrapper col-10">
                    <CodeEditor value='send your *message* here' onChange={onMessageChange} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 36 }} />
                </div>
                <div className="chat-button-wrapper col-2">
                    <button type="submit" className="btn btn-primary chat-send" onClick={onSendMessage}>Send</button>
                </div>
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
    return update(ownProps, { $merge: { activeSession, aggregateDataDoc, helpSessions, username } });
}
export default connect(mapStateToProps)(ChatWidget);

import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { timeAgo, getTimeStamp } from '../../../../utils/timestamp';
import { ISolutionState, ICodeSolutionState } from '../../../../reducers/intermediateUserState';
import { addMessage } from '../../../../actions/sharedb_actions';
import { IMessage } from '../../../../reducers/aggregateData';
import * as showdown from 'showdown';
import getChannelName from '../../../../utils/channelName';
import { analytics } from '../../../../utils/Firebase';

let message = 'send your *message* here';
const ChatWidget = ({ activeSession, dispatch, problem, sessions, myemail, username }) => {
    const chatInput = React.createRef<HTMLInputElement>();
    const chatWrapper = React.createRef<HTMLDivElement>();
    const [isAnonymous, setIsAnonymous] = React.useState(false);

    const onMessageChange = (e) => {
        message = e.target.value;
    }

    const onKeyDown = (e) => {
        if (e.key === 'Enter') {
            onSendMessage();
        }
    }

    const onSendMessage = () => {
        if (message.length === 0) return;
        const newMessage: IMessage = {
            sender: username,
            content: message,
            timestamp: getTimeStamp(),
            isAnonymous,
        }
        dispatch(addMessage(problem.id, newMessage, activeSession.id))
        message = '';
        if (chatInput.current) {
            chatInput.current.value = ''
        }
        analytics.logEvent("update_help_session", { problemID: problem.id, channel: getChannelName(), user: myemail, helpSession: activeSession });
    }
    
    const toggleAnonymous = () => {
        setIsAnonymous(!isAnonymous);
    }

    const getSender = (message) => {
        const anonymousList = activeSession.chatMessages.filter(s=>s.isAnonymous);
        const names = anonymousList.map(s=>s.sender);
        const anonymousNames = names.filter((v,i) => names.indexOf(v) === i)

        if(message.isAnonymous) {
            const index = anonymousNames.indexOf(message.sender);
            return "Student-"+index;
        }
        else return message.sender;
    }

    React.useEffect(() => {
        if (chatWrapper.current) {
            chatWrapper.current.scrollTop = chatWrapper.current.scrollHeight;
        }
    }, [activeSession.chatMessages, chatWrapper])

    const converter = new showdown.Converter();

    return <div>
        <div className="chat-container">
            <div className="chat-messages-wrapper" ref={chatWrapper} >
                {activeSession.chatMessages.map((message, i) => <div className={"chat-message-container" + ((message.sender === username) ? ' isSender' : '')} key={i}>

                    <div className="chat-message-item">
                        <div className="chat-header">
                            <span className="sender">{getSender(message)}</span>
                            <span className="timestamp">
                                ({timeAgo(parseInt(message.timestamp))})
                            </span>
                        </div>
                        <div className="chat-content">
                            <p dangerouslySetInnerHTML={{ __html: converter.makeHtml(message.content) }} />
                        </div>
                    </div>
                </div>)}
            </div>
            <div className="chat-input-container row">
                <div className="chat-input-wrapper col-10">
                    <input id='chatInput' type='text' ref={chatInput} onChange={onMessageChange} onKeyDown={onKeyDown} style={{ 'height': '36px', 'width': '100%' }}></input>
                    <div className="custom-control custom-switch related-button">
                            <input type="checkbox" className="custom-control-input" id={"chat-anonymous-button-" + problem.id} onClick={toggleAnonymous} defaultChecked={isAnonymous} />
                            <label className="custom-control-label" htmlFor={"chat-anonymous-button-" + problem.id}>Anonymous</label>
                    </div>
                </div>
                <div className="chat-button-wrapper col-2">
                    <button type="submit" className="btn btn-primary chat-send" onClick={onSendMessage}>Send</button>
                </div>
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, users } = state;
    const { sessions } = ownProps;
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    let activeS = sessions.filter(s => s.id === currentActiveHelpSession);
    const activeSession = activeS.length > 0 ? activeS[0] : null;
    const myuid = users.myuid as string;
    const myemail = users.allUsers[myuid].email;
    const username = users.allUsers[myuid].username;
    return update(ownProps, { $merge: { activeSession, sessions, username, myemail } });
}
export default connect(mapStateToProps)(ChatWidget);
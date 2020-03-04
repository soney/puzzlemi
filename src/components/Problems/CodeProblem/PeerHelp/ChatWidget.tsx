import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { timeAgo, getTimeStamp } from '../../../../utils/timestamp';
import { addMessage } from '../../../../actions/sharedb_actions';
import { IMessage } from '../../../../reducers/aggregateData';
import * as showdown from 'showdown';
import getChannelName from '../../../../utils/channelName';
import { analytics } from '../../../../utils/Firebase';
import { getAnonym } from '../../../../utils/anonymous';

let message = 'send your *message* here';
const ChatWidget = ({ dispatch, problem, chatMessages, myemail, username, path, isInstructor }) => {
    const chatInput = React.createRef<HTMLInputElement>();
    const chatWrapper = React.createRef<HTMLDivElement>();
    const [isAnonymous, setIsAnonymous] = React.useState(true);

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
        dispatch(addMessage(newMessage, path))
        message = '';
        if (chatInput.current) {
            chatInput.current.value = ''
        }
        analytics.logEvent("send_message", { problemID: problem.id, channel: getChannelName(), user: myemail, message: newMessage, path });
    }

    const toggleAnonymous = () => {
        setIsAnonymous(!isAnonymous);
    }

    const getSender = (message) => {
        if (message.isAnonymous) {
            const anonym = getAnonym(message.sender)
            if (isInstructor) return anonym + "(" + message.sender + ")"
            else return anonym;
        }
        else return message.sender;
    }

    React.useEffect(() => {
        if (chatWrapper.current) {
            chatWrapper.current.scrollTop = chatWrapper.current.scrollHeight;
        }
    }, [chatMessages, chatWrapper])

    const converter = new showdown.Converter();

    return <div>
        <div className="chat-container">
            <div className="chat-messages-wrapper" ref={chatWrapper} >
                {chatMessages.map((message, i) => <div className={"chat-message-container" + ((message.sender === username) ? ' isSender' : '')} key={i}>

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
    const { users } = state;
    const myuid = users.myuid as string;
    const { isInstructor, username, email } = users.allUsers[myuid];
    return update(ownProps, { $merge: { username, myemail: email, isInstructor } });
}
export default connect(mapStateToProps)(ChatWidget);
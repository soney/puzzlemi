import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { timeAgo, getTimeStamp } from '../../../../utils/timestamp';
import { addMessage } from '../../../../actions/sharedb_actions';
import { IMessage } from '../../../../reducers/aggregateData';
import * as showdown from 'showdown';
import getChannelName from '../../../../utils/channelName';
import { analytics } from '../../../../utils/Firebase';

let message = 'send your *message* here';
const ChatWidget = ({ dispatch, problem, chatMessages, myemail, username, path }) => {
    const chatInput = React.createRef<HTMLInputElement>();
    const chatWrapper = React.createRef<HTMLDivElement>();

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
            timestamp: getTimeStamp()
        }
        dispatch(addMessage(newMessage, path))
        message = '';
        if (chatInput.current) {
            chatInput.current.value = ''
        }
        analytics.logEvent("send_message", { problemID: problem.id, channel: getChannelName(), user: myemail, message: newMessage, path });
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
                            <span className="sender">{message.sender}</span>
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
    const myemail = users.allUsers[myuid].email;
    const username = users.allUsers[myuid].username;
    return update(ownProps, { $merge: { username, myemail } });
}
export default connect(mapStateToProps)(ChatWidget);
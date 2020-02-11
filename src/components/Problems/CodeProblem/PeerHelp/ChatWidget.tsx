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
interface ChatWidgetProps{
    activeSession: any,
    dispatch: any, 
    problem: any, 
    sessions: any, 
    username: any,

}

interface ChatWidgetState{
    // chatInput: any,
    sessionIndex: any,
    messageLength: any,
    converter: any,
}

class ChatWidget extends React.Component<ChatWidgetProps, ChatWidgetState>{// ({ activeSession, dispatch, problem, sessions, username }) => {

    public static defaultProps: ChatWidgetProps = {
        activeSession: undefined,
        dispatch: undefined, 
        problem: undefined, 
        sessions: undefined, 
        username: undefined,
    }

    constructor(props: ChatWidgetProps, state: ChatWidgetState) {
        super(props, state);

        // this.refs.chatInput = React.createRef<HTMLInputElement>();

        this.state = {
            // chatInput: React.createRef<HTMLInputElement>(),
            sessionIndex: this.props.sessions.indexOf(this.props.activeSession),
            messageLength: this.props.activeSession.chatMessages.length,
            converter: new showdown.Converter(),
        };
    };
    private chatInput = React.createRef<HTMLInputElement>()
    private chatWrapper = React.createRef<HTMLDivElement>()

    // const sessionIndex = this.props.sessions.indexOf(this.props.activeSession);
    // const messageLength = this.props.activeSession.chatMessages.length;

    componentDidMount(){
        this.scrollBottom();
    }

    componentDidUpdate(){
        console.log('uppdate!')
        if(this.state.messageLength!=this.props.activeSession.chatMessages.length){
            this.scrollBottom();
        }
    }

    // const chatInput = React.createRef<HTMLInputElement>();
    // const chatWrapper = React.createRef<HTMLDivElement>();

    onMessageChange = (e) => {
        message = e.target.value;
    }
    
    onKeyDown = (e) => {
        if (e.key=='Enter'){
            this.onSendMessage();
        }
    }

    onSendMessage = () => {
        const newMessage: IMessage = {
            sender: this.props.username,
            content: message,
            timestamp: getTimeStamp()
        }
        console.log(this.props.problem.id, newMessage, this.state.sessionIndex)
        this.props.dispatch(addMessage(this.props.problem.id, newMessage, this.state.sessionIndex))
        message='';
        // console.log(this.refs.chatInput)
        if(this.chatInput.current){
            this.chatInput.current.value=''
            // this.refs.chatInput.value=''
        }
    }

    
    

    scrollBottom = () => {
      
        if(this.chatWrapper['current']){
            this.chatWrapper['current'].scrollTop=this.chatWrapper['current'].scrollHeight;
        }
        
    }
    render(){
        return (<div>
            <div className="chat-container">
                <div className="chat-messages-wrapper" ref={this.chatWrapper} id='chatWrapper'>
                    {this.props.activeSession.chatMessages.map((message, i) => <div className={"chat-message-container"+((message.sender==this.props.username)?' chat-I-am-sender':' chat-other-sender')} key={i}>
    
                        <div className="card chat-message-item">
                            <div className={"card-header chat-header"+((message.sender==this.props.username)?' chat-I-am-sender-header':'')}>
                                <span className="sender">{message.sender}</span>
                                <span className="timestamp">
                                    ({timeAgo(parseInt(message.timestamp))})
                                </span>
                            </div>
                            <div className="card-body content">
                                <p style={{'margin':'0px'}} dangerouslySetInnerHTML={{ __html: this.state.converter.makeHtml(message.content) }} />
                            </div>
                        </div>
                    </div>)}
                </div>
                <div className="chat-input-container row">
                    <div className="chat-input-wrapper col-10">
                        <input id='chatInput' type='text' ref={this.chatInput} onChange={this.onMessageChange} onKeyDown={this.onKeyDown} style={{'height':'36px', 'width':'100%'}}></input>
                        {/* <CodeEditor value='send your *message* here' onChange={onMessageChange} options={{ lineNumbers: false, mode: 'markdown', lineWrapping: true, height: 36 }} /> */}
                    </div>
                    <div className="chat-button-wrapper col-2">
                        <button type="submit" className="btn btn-primary chat-send" onClick={this.onSendMessage}>Send</button>
                    </div>
                </div>
            </div>
        </div>)

    }
    
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, users } = state;
    const { sessions } = ownProps;
    const intermediateCodeState: ISolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveHelpSession } = intermediateCodeState ? intermediateCodeState as ICodeSolutionState : { currentActiveHelpSession: '' };
    let activeS = sessions.filter(s => s.id === currentActiveHelpSession);
    const activeSession = activeS.length > 0 ? activeS[0] : null;
    
    const myuid = users.myuid as string;
    const username = myuid.slice(0,7) === "testuid" ? "testuser-"+myuid.slice(-4) : users.allUsers[myuid].username;
    return update(ownProps, { $merge: { activeSession, sessions, username } });
}
export default connect(mapStateToProps)(ChatWidget);

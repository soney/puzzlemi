import { connect } from "react-redux";
import * as React from 'react';
// import update from 'immutability-helper';

const PMUserHeader = ({loggedIn, username, email, isInstructor}) => {
    if(loggedIn) {
        return <div>Logged in as {username} ({email})</div>;
    } else {
    return <div>Not logged in. {username}</div>
    }
}

function mapStateToProps(state, ownProps) {
    const { user } = state;
    const { userInfo } = user;
    return userInfo;
}
export default connect(mapStateToProps)(PMUserHeader); 
import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';
import { ISetUserAction } from '../actions/user_actions';

export interface IUserInfo {
    uid: string,
    username: string,
    email: string,
    isInstructor: boolean,
    loggedIn: boolean
}

export interface IUsers {
    isInstructor: () => boolean,
    myuid: string|null,
    allUsers: {
        [userID: string]: IUserInfo
    }
}
const defaultUsersState: IUsers = {
    isInstructor: function() {
        if(this.myuid) {
            return this.allUsers[this.myuid].isInstructor;
        }
        return false;
    },
    myuid: null,
    allUsers: {} 
}

export const users = (state: IUsers=defaultUsersState, action: ISetUserAction) => {
    const { type } = action;
    if(type === EventTypes.SET_USER) {
        const { user } = action;
        return update(state, {
            myuid: { $set: user.uid },
            allUsers: {
                [user.uid]: { $set: user}
            }
        });
    } else {
        return state;
    }
}
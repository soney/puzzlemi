import { connect } from "react-redux";
import * as React from 'react';
import update from 'immutability-helper';
import { IPMState } from "../../reducers";
import { selectUserForSolutionView } from "../../actions/app_actions";
import * as classNames from 'classnames';
import { IUsers } from "../../reducers/users";
import { SDBDoc } from "sdb-ts";

interface ILeaderboardOwnProps {
    maximumToDisplay: number|false
}

interface ILeaderboardProps extends ILeaderboardOwnProps {
    isAdmin: boolean;
    selectedUserForSolutionsView: string | false;
    dispatch: React.Dispatch<any>;
    usersDoc: SDBDoc<IUsers>;
    leaderList: LeaderList;
    users: IUsers;
}

const PMLeaderboard = ({ maximumToDisplay, isAdmin, users, selectedUserForSolutionsView, dispatch, usersDoc, leaderList }: ILeaderboardProps) => {
    if(!usersDoc) { return null; }
    const { myuid } = users;

    const usersData = usersDoc.getData();
    // let highScore: number = 0;
    // let lowScore: number = 0;
    // if(sortableScores.length > 0) {
    //     highScore = sortableScores[0][1];
    //     lowScore = sortableScores[sortableScores.length-1][1];
    // }
    let hasShownUser: boolean = false;
    let skippedUsers: boolean = false;
    let keepAddingUsers: boolean = true;
    let count: number = 0;
    const leaderboardList: ([number, number, string, boolean, boolean]|string)[] = [];
    outer: for(let i: number = 0; i<leaderList.length; i++) {
        const { rank, users, score } = leaderList[i];
        const isTie = users.length > 1;
        for(let j: number = 0; j<users.length; j++) {
            const uid = leaderList[i].users[j];
            const isMe = uid === myuid;
            if(isMe) {
                hasShownUser = true;
                if(skippedUsers) {
                    leaderboardList.push(' ... ');
                }
                leaderboardList.push([rank, score, uid, isTie, isMe]);
                if(!keepAddingUsers) {
                    break outer;
                }
            } else if(keepAddingUsers) {
                leaderboardList.push([rank, score, uid, isTie, isMe]);
            } else {
                skippedUsers = true;
            }
            count++;
            if(hasShownUser && (maximumToDisplay !== false && count >= maximumToDisplay)) {
                break outer;
            } else if(keepAddingUsers && !hasShownUser && (maximumToDisplay !== false && count >= maximumToDisplay-1)) {
                keepAddingUsers = false;
            }
        }
    }

    const leaderboardUserDisplays:(JSX.Element|string)[] = leaderboardList.map((L) => {
        if(typeof(L) === 'string') {
            return L;
        }
        const [rank, score, uid, isTie, isMe] = L;
        const u = usersData.allUsers[uid];
        const isSelectedUser = (u.email === selectedUserForSolutionsView);

        function selectUser(): void {
            if (isSelectedUser) {
                dispatch(selectUserForSolutionView(false));
            } else {
                dispatch(selectUserForSolutionView(u.email!));
            }
        }

        const rankLabel = <span className='rank'>{rank}. {isTie&&<span className='tie'>(tie)</span>}</span>;

        if(isAdmin) {
            const userInfo = `${u.fullName} (${score})`;
            return <span key={uid} className='leaderboardUser'>
                {rankLabel} <a href="#0" className={classNames({ user: true, selected: isSelectedUser })} key={u.uid} onClick={selectUser}>{userInfo}</a>
            </span>;
        } else {
            return <span key={uid} className={'leaderboardUser' + (isMe ? ' isUser': '')}>{rankLabel} <span className='user_alias' style={{color: u.userColor!}}><i className={`fas fa-${u.userIcon}`}></i> {u.anonymousName} ({score} solved)</span></span>;
        }
    });
    if (leaderboardUserDisplays.length === 0) {
        leaderboardUserDisplays.splice(0, 0, "(nobody here)");
    }
    return <div className="leaderboard container">
        <div className="row">
            <div className='col'>
                Leader Board:
            </div>
        </div>
        <div className="row">
            <div className='col users'>
                {leaderboardUserDisplays}
            </div>
        </div>
    </div>;
}

type LeaderList = Array<({score: number, users: string[], rank: number})>;

function mapStateToProps(state: IPMState, ownProps: ILeaderboardOwnProps): ILeaderboardProps {
    const { app, shareDBDocs, users, intermediateUserState } = state;
    const { isAdmin } = intermediateUserState;
    const { selectedUserForSolutionsView } = app;

    let allUsers: string[] = [];
    const leaderList: LeaderList = [];
    const completedByUser: {[uid: string]: number} = {};
    try {
        const usersDocData = shareDBDocs.i.users!;
        const aggregateData = shareDBDocs.i.aggregateData!;

        if (usersDocData) {
            const dataUsers = usersDocData.allUsers;
            allUsers = Object.keys(dataUsers!);
        }

        if (aggregateData) {
            const data = Object.values(aggregateData.userData);
            data.forEach((d) => {
                if(d.completed) {
                    d.completed.forEach((uid) => {
                        if(completedByUser.hasOwnProperty(uid)) {
                            completedByUser[uid]++;
                        } else {
                            completedByUser[uid] = 1;
                        }
                    });
                }
            });
            allUsers.forEach((uid) => {
                if(!completedByUser.hasOwnProperty(uid)) {
                    completedByUser[uid] = 0;
                }
            });
            const sortableScores: [string, number][] = [];
            for(let uid in completedByUser) {
                if(completedByUser.hasOwnProperty(uid)) {
                    if(usersDocData.allUsers[uid] && !usersDocData.allUsers[uid].isInstructor) {
                        sortableScores.push([uid, completedByUser[uid]]);
                    }
                }
            }
            sortableScores.sort((a, b) => b[1]-a[1]);
            let rank: number = 1;
            let currentScore: number = -1;
            let currentLLItem: { score: number, users: string[], rank: number }|null = null;
            sortableScores.forEach(([uid, score]) => {
                if(currentScore === score) {
                    currentLLItem!.users.push(uid);
                } else {
                    if(currentLLItem) { rank += currentLLItem.users.length; }
                    currentLLItem = {
                        rank,
                        score,
                        users: [uid]
                    };
                    leaderList.push(currentLLItem);
                    currentScore = score;
                }
            });
        }
    } catch (e) {
        console.error(e);
    }

    return update(ownProps, { $merge: { users, usersDoc: shareDBDocs.users, selectedUserForSolutionsView, isAdmin, completedByUser, leaderList } } as any) as ILeaderboardProps;
}
export default connect(mapStateToProps)(PMLeaderboard);

// const fakeUsers = [
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"bc9cc369-1249-73e6-571d-15edb34f0db4","ip":"::ffff:127.0.0.1","anonymousName":"Burgundy Jet","userIcon":"fighter-jet","userColor":"#800020"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"3bce561a-be80-6dd6-2047-f627a4f89ea7","ip":"::ffff:127.0.0.1","anonymousName":"Tan Cat","userIcon":"cat","userColor":"#d2b48c"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"e25b3b40-010b-50a0-826d-a77b78a454e6","ip":"::ffff:127.0.0.1","anonymousName":"Gray Cake","userIcon":"birthday-cake","userColor":"#808080"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"d59004d8-3545-833d-4e9a-fd84c0c5884c","ip":"::ffff:127.0.0.1","anonymousName":"Plum Umbrella","userIcon":"umbrella","userColor":"#dda0dd"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"8cc69489-565e-e249-76c0-9da750018b5c","ip":"::ffff:127.0.0.1","anonymousName":"Gold Cake","userIcon":"birthday-cake","userColor":"#ffd700"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"c810b119-3918-6e14-45d4-fe1123731a66","ip":"::ffff:127.0.0.1","anonymousName":"Burgundy Mitten","userIcon":"mitten","userColor":"#800020"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"ff919920-2a20-e678-ab27-c067689dd570","ip":"::ffff:127.0.0.1","anonymousName":"Fuchsia Cow","userIcon":"cow","userColor":"#f0f"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"59d07fa6-3d36-77db-f25c-7323134b9d9d","ip":"::ffff:127.0.0.1","anonymousName":"Cyan Jet","userIcon":"fighter-jet","userColor":"#17a2b8"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"7e5551d3-a469-5757-75cd-5b8db5be852d","ip":"::ffff:127.0.0.1","anonymousName":"Emerald Spider","userIcon":"spider","userColor":"#50c878"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"bbdd2d8a-3b56-ca9b-c6cb-e8728e824736","ip":"::ffff:127.0.0.1","anonymousName":"Plum Lemon","userIcon":"lemon","userColor":"#dda0dd"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"941ab2c7-3e76-e908-d888-91327c4266ad","ip":"::ffff:127.0.0.1","anonymousName":"Copper Rocket","userIcon":"rocket","userColor":"#b87333"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"9067564e-903a-2639-4c99-556a2cdf198c","ip":"::ffff:127.0.0.1","anonymousName":"Denim Badger","userIcon":"badger-honey","userColor":"#1560bd"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"f63803ca-9538-fd4f-1a8f-95eecf0e737a","ip":"::ffff:127.0.0.1","anonymousName":"Maize Rabbit","userIcon":"rabbit","userColor":"#ffcb05"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"9e947b7f-c5b4-cdcd-56f2-ccc1796870e2","ip":"::ffff:127.0.0.1","anonymousName":"Amber Cow","userIcon":"cow","userColor":"#ffbf00"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"ed0bb0a2-c56d-40d6-665f-43e58f8f80a0","ip":"::ffff:127.0.0.1","anonymousName":"Rose Cat","userIcon":"cat","userColor":"#ff007f"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"c0b45d0d-af0b-4020-f588-1ad2bd296059","ip":"::ffff:127.0.0.1","anonymousName":"Burgundy Squirrel","userIcon":"squirrel","userColor":"#800020"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"4fde9543-abb4-7361-cb90-7a4f582cf93e","ip":"::ffff:127.0.0.1","anonymousName":"Scarlet Satellite","userIcon":"satellite","userColor":"#ff2400"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"5deb393d-2328-7216-b43f-811196e3a096","ip":"::ffff:127.0.0.1","anonymousName":"Maroon Pepper","userIcon":"pepper-hot","userColor":"#b03060"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"90a28973-9bda-ae6a-87bd-92c3902d4aa3","ip":"::ffff:127.0.0.1","anonymousName":"Gold Elephant","userIcon":"elephant","userColor":"#ffd700"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"a1433dd5-5569-e523-fbd2-30593b0b711b","ip":"::ffff:127.0.0.1","anonymousName":"Scarlet Drum","userIcon":"drum","userColor":"#ff2400"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"099630e5-65e1-b2a6-12ca-227f88a69fbe","ip":"::ffff:127.0.0.1","anonymousName":"Crimson Squirrel","userIcon":"squirrel","userColor":"#dc143c"},
//     {"loggedIn":false,"username":null,"fullName":null,"email":null,"isInstructor":true,"uid":"be03d3c7-6aba-5dd2-ee67-40d28db188ec","ip":"::ffff:127.0.0.1","anonymousName":"Gold Squirrel","userIcon":"squirrel","userColor":"#ffd700"}
// ];

// const fakeCompleted = {};
// fakeUsers.forEach((u) => fakeCompleted[u.uid] = Math.round(Math.random()*fakeUsers.length));
// const fakeUsersData = {
//     allUsers: {}
// }
// fakeUsers.forEach((u) => fakeUsersData.allUsers[u.uid] = u);
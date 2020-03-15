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
    let keepAddingUsers: boolean = true;
    let count: number = 0;
    const leaderboardList: ([number, number, string, boolean, boolean]|string)[] = [];
    // const leaderboardUserDisplays:(JSX.Element|string)[] = [];
    outer: for(let i: number = 0; i<leaderList.length; i++) {
        const { rank, users, score } = leaderList[i];
        const isTie = users.length > 1;
        for(let j: number = 0; j<users.length; j++) {
            const uid = leaderList[i].users[j];
            const isMe = uid === myuid;
            if(isMe) {
                hasShownUser = true;
                if(!keepAddingUsers) {
                    break;
                }
            }
            leaderboardList.push([rank, score, uid, isTie, isMe]);
            count++;
            if(hasShownUser && (maximumToDisplay !== false && count >= maximumToDisplay)) {
                break outer;
            } else if(!hasShownUser && (maximumToDisplay !== false && count >= maximumToDisplay-1)) {
                keepAddingUsers = false;
                leaderboardList.push('...');
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
            return <span className='leaderboardUser'>
                {rankLabel} <a href="#0" className={classNames({ user: true, selected: isSelectedUser })} key={u.uid} onClick={selectUser}>{userInfo}</a>
            </span>;
        } else {
            return <span className={'leaderboardUser' + (isMe ? ' isUser': '')}>{rankLabel} <span className='user_alias' style={{color: u.userColor!}}><i className={`fas fa-${u.userIcon}`}></i> {u.anonymousName}</span></span>;
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
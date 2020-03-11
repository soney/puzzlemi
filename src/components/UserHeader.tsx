import { connect } from "react-redux";
import * as React from 'react';
import { setIsAdmin } from '../actions/user_actions';
import update from 'immutability-helper';
import { IPMState } from "../reducers";
import { selectUserForSolutionView } from "../actions/app_actions";
import * as classNames from 'classnames';
import { replaceProblems } from "../actions/sharedb_actions";
import { IProblems, ICodeProblem, IMultipleChoiceOption, IMultipleChoiceProblem, ITextResponseProblem, IProblemType } from "../reducers/problems";
import Hotkeys from 'react-hot-keys';
import { CodeTestType, ICodeTest, IAggregateData } from "../reducers/aggregateData";
import copy from 'copy-to-clipboard';
import download from "../utils/download";
import { IUsers } from "../reducers/users";
import { SDBDoc } from "sdb-ts";
import { ISolutions } from "../reducers/solutions";

interface IUserHeaderOwnProps {
}

interface IUserHeaderProps extends IUserHeaderOwnProps {
    isAdmin: boolean;
    channel: string;
    selectedUserForSolutionsView: string | false;
    dispatch: React.Dispatch<any>;
    users: IUsers;
    allUsers: string[];
    problemsDoc: SDBDoc<IProblems>;
    aggregateDataDoc: SDBDoc<IAggregateData>,
    solutionsDoc: SDBDoc<ISolutions>,
    usersDoc: SDBDoc<IUsers>,
    completedByUser: CompletedByUser
}
const PMUserHeader = ({ users, channel, selectedUserForSolutionsView, dispatch, problemsDoc, isAdmin, allUsers, aggregateDataDoc, solutionsDoc, usersDoc, completedByUser }: IUserHeaderProps) => {
    const { myuid } = users;
    if (!myuid) { return <nav>fetching user information...</nav> }

    const { loggedIn, isInstructor, username, email } = users.allUsers[myuid];

    const toggleIsAdmin = () => {
        dispatch(setIsAdmin(!isAdmin));
    };

    const handleEditChange = (event) => {
        const checked = event.target.checked;
        dispatch(setIsAdmin(checked));
    }

    const downloadJSON = (event) => {
        const data = problemsDoc.getData();
        const stringifiedData = JSON.stringify(data);
        download('puzzlemi-saved.json', stringifiedData);
        event.preventDefault();
    };

    const downloadAll = (event) => {
        const problemsData = problemsDoc.getData();
        const aggregateDataData = aggregateDataDoc.getData();
        const solutionsData = solutionsDoc.getData();
        const usersData = usersDoc.getData();
        const data = {
            problems: problemsData,
            aggregateData: aggregateDataData,
            solutions: solutionsData,
            users: usersData,
        }
        const stringifiedData = JSON.stringify(data);
        download('puzzlemi-all-saved.json', stringifiedData);
        event.preventDefault();
    }

    const getMarkdown = (event) => {
        const problemsData: IProblems = problemsDoc.getData();
        const { order, allProblems } = problemsData;
        let result: string = '';
        order.forEach((problemID: string, i: number) => {
            const problem = allProblems[problemID];
            const { problemDetails } = problem;
            const { problemType } = problemDetails;
            if (problemType === IProblemType.Code) {
                const { description, givenCode, tests } = (problemDetails as ICodeProblem);
                result += `${description}\n\n\n`;
                let canonicalInstructorTest: ICodeTest | null = null;
                for (let testID in tests) {
                    if (tests.hasOwnProperty(testID)) {
                        const test = tests[testID];
                        if (test.type === CodeTestType.INSTRUCTOR && test.author === 'default') {
                            canonicalInstructorTest = test;
                            break;
                        }
                    }
                }
                if (canonicalInstructorTest) {
                    result += `\`\`\`python\n${canonicalInstructorTest.before}\n\`\`\`\n\n\n`;
                }
                result += `\`\`\`python\n${givenCode}\n\`\`\`\n\n\n`;
                if (canonicalInstructorTest) {
                    result += `\`\`\`python\n${canonicalInstructorTest.after}\n\`\`\`\n\n\n`;
                }
            } else if (problemType === IProblemType.MultipleChoice) {
                const { description, options } = (problemDetails as IMultipleChoiceProblem);
                result += `${description}\n\n\n`;
                options.forEach((option: IMultipleChoiceOption) => {
                    result += `- ${option.description}\n`;
                });
            } else if (problemType === IProblemType.TextResponse) {
                const { description } = (problemDetails as ITextResponseProblem);
                result += `${description}\n\n\n`;
                result += '```text\n\n\n```\n\n';
            }
            if (i < order.length - 1) {
                result += `\n---\n\n`;
            }
        });
        copy(result, { format: 'text/plain' });
        event.preventDefault();
    };

    const handleFile = (event) => {
        const { target } = event;
        const { files } = target;
        for (let i = 0, numFiles = files.length; i < numFiles; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = function (e) {
                if (e.target) {
                    const result = e.target.result as string;
                    const newData: IProblems = JSON.parse(result);
                    dispatch(replaceProblems(newData));
                }
            }
            reader.readAsText(file);
        }
        event.preventDefault();
        target.value = ''; // Reset in case the same file gets imported again
    }

    const allUserDisplays: (React.ReactElement | string)[] = allUsers.map((u) => {
        const isSelectedUser = (u === selectedUserForSolutionsView);
        function selectUser() {
            if (isSelectedUser) {
                dispatch(selectUserForSolutionView(false));
            } else {
                dispatch(selectUserForSolutionView(u));
            }
        }
        return <a href="#0" className={classNames({ user: true, selected: isSelectedUser })} key={u} onClick={selectUser}>{u}</a>
    });
    for (let i: number = allUserDisplays.length - 1; i > 0; i--) {
        allUserDisplays.splice(i, 0, ", ");
    }
    if (allUserDisplays.length === 0) {
        allUserDisplays.splice(0, 0, "(nobody here)");
    }

    const editButton = isInstructor ? <div className="custom-control custom-switch">
        <input id="admin-mode" type="checkbox" className="custom-control-input" onChange={handleEditChange} checked={isAdmin} />
        <label htmlFor="admin-mode" className="custom-control-label">Admin Mode</label>
    </div> : null;
    // <label className='float-right'><input type="checkbox" onChange={handleEditChange} /> Admin Mode</label> : null;
    const usersRow = isAdmin ? <div className="allUsers container">
        <div className="row">
            <div className='col'>
                Users:
            </div>
        </div>
        <div className="row">
            <div className='col users'>
                {allUserDisplays}
            </div>
        </div>
    </div> : null;
    let leaderboardRow: JSX.Element|null = null;
    if(isAdmin) {
        if(usersDoc) {
            const usersData = usersDoc.getData();
            const sortableScores: [string, number][] = [];
            for(let uid in completedByUser) {
                if(completedByUser.hasOwnProperty(uid)) {
                    if(usersData.allUsers[uid] && !usersData.allUsers[uid].isInstructor) {
                        sortableScores.push([uid, completedByUser[uid]]);
                    }
                }
            }
            sortableScores.sort((a, b) => b[1]-a[1]);
            let highScore: number = 0;
            let lowScore: number = 0;
            if(sortableScores.length > 0) {
                highScore = sortableScores[0][1];
                lowScore = sortableScores[sortableScores.length-1][1];
            }
            const leaderboardUserDisplays:(JSX.Element|string)[] = sortableScores.map(([uid, score]) => {
                const u = usersData.allUsers[uid];
                const isSelectedUser = (u.email === selectedUserForSolutionsView);
                function selectUser() {
                    if (isSelectedUser) {
                        dispatch(selectUserForSolutionView(false));
                    } else {
                        dispatch(selectUserForSolutionView(u.email!));
                    }
                }
                const userInfo = `${u.fullName} (${score})`;
                const pct = (highScore === lowScore) ? 0.5 : (score - lowScore) / (highScore - lowScore);
                const userStyle = isSelectedUser ? {} : {color: rgbToHex(interpolatergb(failColor, successColor, pct))};
                return <a href="#0" style={userStyle} className={classNames({ user: true, selected: isSelectedUser })} key={u.uid} onClick={selectUser}>{userInfo}</a>
            });
            for (let i: number = leaderboardUserDisplays.length - 1; i > 0; i--) {
                leaderboardUserDisplays.splice(i, 0, ", ");
            }
            if (leaderboardUserDisplays.length === 0) {
                leaderboardUserDisplays.splice(0, 0, "(nobody here)");
            }
            leaderboardRow = <div className="leaderboard container">
                <div className="row">
                    <div className='col'>
                        Student Leader Board (number of correct solutions):
                    </div>
                </div>
                <div className="row">
                    <div className='col users'>
                        {leaderboardUserDisplays}
                    </div>
                </div>
            </div>;
        }
    }
    const userInfo = loggedIn ? <span>Logged in as {username} ({email})</span> : <span>Not logged in.</span>
    return <>
        <nav className="navbar navbar-light navbar-expand-lg bg-light">
            <span className='navbar-brand nav-item'>PuzzleMI [{channel}]</span>
            <ul className='navbar-nav mr-auto'>
                <li className='nav-item'>{userInfo}</li>
            </ul>
            {isAdmin &&
                <form className="form-inline">
                    <div className="btn-group">
                        <button onClick={getMarkdown} className='btn btn-sm btn-outline-secondary'>
                            <i className="fas fa-copy"></i>&nbsp;Copy Markdown
                        </button>
                        <button onClick={downloadJSON} className='btn btn-sm btn-outline-secondary'>
                            <i className="fas fa-file-export"></i>&nbsp;Export Problems
                        </button>
                        <label className="file-upload btn btn-sm btn-outline-secondary">
                            <i className="fas fa-file-import"></i>&nbsp;Import Problems
                            <input type="file" onChange={handleFile} className="form-control-file" />
                        </label>
                        <button onClick={downloadAll} className='btn btn-sm btn-outline-secondary'>
                            <i className="fas fa-file-export"></i>&nbsp;Export All
                        </button>
                    </div>
                </form>
            }
            <form className="form-inline">
                <Hotkeys keyName="ctrl+shift+a" onKeyDown={toggleIsAdmin} filter={() => true}></Hotkeys>
                <span className='nav-item'>{editButton}</span>
            </form>
        </nav>
        {usersRow}
        {leaderboardRow}
    </>;
}

type CompletedByUser = {[uid: string]: number};

function mapStateToProps(state: IPMState, ownProps: IUserHeaderOwnProps): IUserHeaderProps {
    const { app, users, shareDBDocs, intermediateUserState } = state;
    const { isAdmin } = intermediateUserState;
    const { channel, selectedUserForSolutionsView } = app;

    let allUsers: string[] = [];
    const completedByUser: CompletedByUser = {};
    if (isAdmin) {
        try {
            const usersDocData = shareDBDocs.i.users;
            const aggregateData = shareDBDocs.i.aggregateData;

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
            }
        } catch (e) {
            console.error(e);
        }
    }

    return update(ownProps, { $merge: { problemsDoc: shareDBDocs.problems, aggregateDataDoc: shareDBDocs.aggregateData, solutionsDoc: shareDBDocs.solutions, usersDoc: shareDBDocs.users, selectedUserForSolutionsView, isAdmin, users, allUsers, channel, completedByUser } }) as IUserHeaderProps;
}
export default connect(mapStateToProps)(PMUserHeader);

type RGB = [number, number, number];
const interpolate = (low: number, high: number, pct: number): number => (low + pct*(high-low));
const interpolatergb = (low: RGB, high: RGB, pct: number): RGB => [interpolate(low[0], high[0], pct), interpolate(low[1], high[1], pct), interpolate(low[2], high[2], pct)]
const numToHex = (num: number): string => {
  let hex = Number(num).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
}
const rgbToHex = (rgb: RGB): string => `#${numToHex(rgb[0])}${numToHex(rgb[1])}${numToHex(rgb[2])}`;

const successColor: RGB = [0, 123, 255];
const failColor: RGB = [220, 53, 69];
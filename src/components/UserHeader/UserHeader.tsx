import { connect } from "react-redux";
import * as React from 'react';
import { setIsAdmin } from '../../actions/user_actions';
import update from 'immutability-helper';
import { IPMState } from "../../reducers";
import { selectUserForSolutionView } from "../../actions/app_actions";
import * as classNames from 'classnames';
import { replaceProblems } from "../../actions/sharedb_actions";
import { IProblems, ICodeProblem, IMultipleChoiceOption, IMultipleChoiceProblem, ITextResponseProblem, IProblemType } from "../../reducers/problems";
import Hotkeys from 'react-hot-keys';
import { CodeTestType, ICodeTest, IAggregateData } from "../../reducers/aggregateData";
import copy from 'copy-to-clipboard';
import download from "../../utils/download";
import { IUsers } from "../../reducers/users";
import { SDBDoc } from "sdb-ts";
import { ISolutions } from "../../reducers/solutions";
import Leaderboard from "./Leaderboard";

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
}
const PMUserHeader = ({ users, channel, selectedUserForSolutionsView, dispatch, problemsDoc, isAdmin, allUsers, aggregateDataDoc, solutionsDoc, usersDoc }: IUserHeaderProps) => {
    const { myuid } = users;
    if (!myuid) { return <nav>fetching user information...</nav> }

    const { loggedIn, isInstructor, username, anonymousName, userColor, userIcon } = users.allUsers[myuid];

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

    // const downloadAll = (event) => {
    //     const problemsData = problemsDoc.getData();
    //     const aggregateDataData = aggregateDataDoc.getData();
    //     const solutionsData = solutionsDoc.getData();
    //     const usersData = usersDoc.getData();
    //     const data = {
    //         problems: problemsData,
    //         aggregateData: aggregateDataData,
    //         solutions: solutionsData,
    //         users: usersData,
    //     }
    //     const stringifiedData = JSON.stringify(data);
    //     download('puzzlemi-all-saved.json', stringifiedData);
    //     event.preventDefault();
    // }

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
    const anonymousInfo = <span style={{color: userColor!}}><i className={`fas fa-${userIcon}`}></i> {anonymousName}</span>;
    const userInfo = loggedIn ? <span>{username} (a.k.a. {anonymousInfo})</span> : <span>({anonymousInfo})</span>
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
                        {/* <button onClick={downloadAll} className='btn btn-sm btn-outline-secondary'>
                            <i className="fas fa-file-export"></i>&nbsp;Export All
                        </button> */}
                    </div>
                </form>
            }
            <form className="form-inline">
                <Hotkeys keyName="ctrl+shift+a" onKeyDown={toggleIsAdmin} filter={() => true}></Hotkeys>
                <span className='nav-item'>{editButton}</span>
            </form>
        </nav>
        {usersRow}
        <Leaderboard maximumToDisplay={isAdmin ? false : 10} />
    </>;
}

function mapStateToProps(state: IPMState, ownProps: IUserHeaderOwnProps): IUserHeaderProps {
    const { app, users, shareDBDocs, intermediateUserState } = state;
    const { isAdmin } = intermediateUserState;
    const { channel, selectedUserForSolutionsView } = app;

    let allUsers: string[] = [];
    if (isAdmin) {
        try {
            const usersDocData = shareDBDocs.i.users;

            if (usersDocData) {
                const dataUsers = usersDocData.allUsers;
                allUsers = Object.keys(dataUsers!);
            }
        } catch (e) {
            console.error(e);
        }
    }

    return update(ownProps, { $merge: { problemsDoc: shareDBDocs.problems, aggregateDataDoc: shareDBDocs.aggregateData, solutionsDoc: shareDBDocs.solutions, usersDoc: shareDBDocs.users, selectedUserForSolutionsView, isAdmin, users, allUsers, channel } }) as IUserHeaderProps;
}
export default connect(mapStateToProps)(PMUserHeader);
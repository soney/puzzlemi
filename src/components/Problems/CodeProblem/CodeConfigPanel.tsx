import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { changeProblemConfig, initAllGroups } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';
import { ISharedSession, IGroupSolution } from '../../../reducers/aggregateData';
import { getTimeStamp } from '../../../utils/timestamp';
import uuid from '../../../utils/uuid';

const CodeProblemConfigPanel = ({ dispatch, problem, config, completed, allSolutions, allUsers }) => {
    const userIDs = Object.keys(allSolutions);
    const completedU = userIDs.filter(u=> completed.indexOf(u) >= 0);
    const inCompletedU = userIDs.filter(u => completed.indexOf(u) < 0);

    const onSwitch = (e) => {
        const item = e.target.id.split('-')[0];
        dispatch(changeProblemConfig(problem.id, item, e.target.checked));
        if (item === "revealSolutions") {
            let allGroups = e.target.checked ? getGroupMatching(allSolutions, allUsers) : {};
            dispatch(initAllGroups(problem.id, allGroups));
        }
    }
    const getSharedSession = (userID, allSolutions, allUsers): ISharedSession => {
        const newSharedSession: ISharedSession = {
            id: userID,
            timestamp: getTimeStamp(),
            status: true,
            userID,
            username: allUsers[userID] ? allUsers[userID].username : "",
            chatMessages: [],
            readOnly: true,
            completed: completed.includes(userID),
            code: allSolutions[userID].code
        }
        return newSharedSession;
    }

    const getGroupMatching = (allSolutions, allUsers): any => {
        let completedUsers = JSON.parse(JSON.stringify(completedU));
        let inCompletedUsers = JSON.parse(JSON.stringify(inCompletedU))
        let allGroups = {};

        if (completedUsers.length === 0 || inCompletedUsers.length === 0) {
            // put all students into one group if there is 0 completed student or 0 incompleted student
            let solutions = {};
            userIDs.forEach(userID => {
                const newSharedSession = getSharedSession(userID, allSolutions, allUsers);
                solutions[newSharedSession.id] = newSharedSession;
            })
            let groupSolution: IGroupSolution = {
                id: uuid(),
                solutions: solutions,
                chatMessages: []
            }
            allGroups[groupSolution.id] = groupSolution;
        }
        else {
            let largePile = completedUsers.length >= inCompletedUsers.length ? completedUsers : inCompletedUsers;
            let smallPile = completedUsers.length < inCompletedUsers.length ? completedUsers : inCompletedUsers;
            const groupNumber = smallPile.length;
            // compute quotient and remainder
            const q = Math.floor(largePile.length / smallPile.length);
            const r = largePile.length - q * smallPile.length;
            let groupSolutionList: any[] = [];
            for (let index = 0; index < groupNumber; index++) {
                let solutions = {};
                // random select 1 element from the small pile
                let s_userID = smallPile[Math.floor(Math.random() * smallPile.length)];
                smallPile.splice(smallPile.indexOf(s_userID), 1);
                const newSharedSession = getSharedSession(s_userID, allSolutions, allUsers);
                solutions[newSharedSession.id] = newSharedSession;
                // random select q elements from the large pile
                for (let i = 0; i < q; i++) {
                    let l_userID = largePile[Math.floor(Math.random() * largePile.length)];
                    largePile.splice(largePile.indexOf(l_userID), 1);
                    const newSharedSession = getSharedSession(l_userID, allSolutions, allUsers);
                    solutions[newSharedSession.id] = newSharedSession;
                }
                groupSolutionList.push(solutions);
            }
            // for the remaining, put each element into a random group
            let random_list: any[] = [];
            while (random_list.length < r) {
                const number = Math.floor(Math.random() * groupNumber)
                if (!random_list.includes(number)) random_list.push(number);
            };
            largePile.forEach((userID, index) => {
                const group_index = random_list[index];
                const solutions = groupSolutionList[group_index];
                const newSharedSession = getSharedSession(userID, allSolutions, allUsers);
                solutions[newSharedSession.id] = newSharedSession;
            })
            groupSolutionList.forEach(solutions => {
                let groupSolution: IGroupSolution = {
                    id: uuid(),
                    solutions,
                    chatMessages: []
                }
                allGroups[groupSolution.id] = groupSolution;
            })
        }
        return allGroups;
    }

    // const getGroupMatchingV2 = (allSolutions, allUsers): any => {
    //     const userIDs = Object.keys(allSolutions);
    //     const ratio = completed.length / userIDs.length;
    //     const userPerGroup = 2;
    //     const groupNumber = Math.floor(userIDs.length / userPerGroup);
    //     let allGroups = {};
    //     let completedUsers = JSON.parse(JSON.stringify(completed));
    //     let inCompletedUsers = userIDs.filter(u => completedUsers.indexOf(u) < 0);
    //     for (let currentGroup = 1; currentGroup <= groupNumber; currentGroup++) {
    //         let solutions = {};
    //         let expect_completed_user_num = Math.ceil(userPerGroup * ratio);
    //         let remain_completed_user_num = completedUsers.length;
    //         let completed_user_num = expect_completed_user_num > remain_completed_user_num ? remain_completed_user_num : expect_completed_user_num;
    //         let incompleted_user_num = userPerGroup - completed_user_num;
    //         // select random # of completed users
    //         let completed_num = currentGroup === groupNumber ? completedUsers.length : completed_user_num;
    //         let incompleted_num = currentGroup === groupNumber ? inCompletedUsers.length : incompleted_user_num;
    //         for (let i = 0; i < completed_num; i++) {
    //             let userID = completedUsers[Math.floor(Math.random() * completedUsers.length)];
    //             completedUsers.splice(completedUsers.indexOf(userID), 1);
    //             const newSharedSession = getSharedSession(userID, allSolutions, allUsers);
    //             solutions[newSharedSession.id] = newSharedSession;
    //         }
    //         // select random # of incompleted users
    //         for (let i = 0; i < incompleted_num; i++) {
    //             let userID = inCompletedUsers[Math.floor(Math.random() * inCompletedUsers.length)];
    //             inCompletedUsers.splice(inCompletedUsers.indexOf(userID), 1);
    //             const newSharedSession = getSharedSession(userID, allSolutions, allUsers);
    //             solutions[newSharedSession.id] = newSharedSession;
    //         }
    //         let groupSolution: IGroupSolution = {
    //             id: uuid(),
    //             solutions,
    //             chatMessages: []
    //         }
    //         allGroups[groupSolution.id] = groupSolution;
    //     }
    //     return allGroups;
    // }
    return <>
        {/* <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"peerHelp-" + problem.id} onClick={onSwitch} defaultChecked={config.peerHelp} />
            <label className="custom-control-label" htmlFor={"peerHelp-" + problem.id}>Peer Help</label>
        </div> */}
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"disableEdit-" + problem.id} onClick={onSwitch} defaultChecked={config.disableEdit} />
            <label className="custom-control-label" htmlFor={"disableEdit-" + problem.id}>Disable student code edits</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"revealSolutions-" + problem.id} onClick={onSwitch} defaultChecked={config.revealSolutions} />
            <label className="custom-control-label" htmlFor={"revealSolutions-" + problem.id}>Enable Group Discussion ({Object.keys(allSolutions).length}/{Object.keys(allUsers).length} loaded, {completedU.length}/{userIDs.length} completed)</label>
        </div>
    </>
}

function mapStateToProps(state: IPMState, ownProps) {
    const { intermediateUserState, shareDBDocs, solutions, users } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;
    const { isAdmin } = intermediateUserState;
    const aggregateData = shareDBDocs.aggregateData?.getData();
    const problemAggregateData = aggregateData && aggregateData.userData[problem.id];
    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const problemsDoc = shareDBDocs.problems;

    const solutionsData = shareDBDocs.i.solutions;
    let problemSolutions = {};

    if (solutionsData && solutionsData.allSolutions && solutionsData.allSolutions.hasOwnProperty(problem.id)) problemSolutions = solutionsData!.allSolutions[problem.id];

    const usersDoc = shareDBDocs.users;
    const localUsers = users.allUsers;
    const userData = usersDoc?.getData();
    const sdbUsers = (userData && userData.allUsers) || {};
    const allUsers = Object.keys(sdbUsers).length > Object.keys(localUsers).length ? sdbUsers : localUsers;
    return update(ownProps, { $merge: { isAdmin, problemsDoc, config, solutions, users, completed, allSolutions: problemSolutions, allUsers } });
}
export default connect(mapStateToProps)(CodeProblemConfigPanel);

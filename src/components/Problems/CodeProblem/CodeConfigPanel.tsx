import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { changeProblemConfig, initAllGroups } from '../../../actions/sharedb_actions';
import { IPMState } from '../../../reducers';
import { ISharedSession, IGroupSolution } from '../../../reducers/aggregateData';
import { getTimeStamp } from '../../../utils/timestamp';
import uuid from '../../../utils/uuid';
// import { logEvent } from '../../../utils/Firebase';
let interval;
let givenTime;
let currentTime;

const CodeProblemConfigPanel = ({ dispatch, problem, config, completed, rawSolutions, rawUsers, myuid }) => {
    const rawUserIDs = Object.keys(rawSolutions);
    let allSolutions = {};
    let allUsers = {};
    const disableButton = React.createRef<HTMLInputElement>();
    givenTime = config.maxTime;

    rawUserIDs.forEach(ID => {
        if (rawUsers[ID]&&(!rawUsers[ID].isInstructor || !rawUsers[ID].loggedIn)) {
            allSolutions[ID] = rawSolutions[ID];
            allUsers[ID] = rawUsers[ID];
        }
    })

    const userIDs = Object.keys(allSolutions);
    const completedU = userIDs.filter(u => completed.indexOf(u) >= 0);
    const inCompletedU = userIDs.filter(u => completed.indexOf(u) < 0);
    const onSwitch = (e) => {
        const item = e.target.id.split('-')[0];
        dispatch(changeProblemConfig(problem.id, item, e.target.checked));
        if (item === "revealSolutions") {
            let allGroups = e.target.checked ? getGroupMatching(allSolutions, allUsers) : {};
            dispatch(initAllGroups(problem.id, allGroups));
            // logEvent("instructor_toggle_group_discussion", { status: e.target.checked, groups: JSON.stringify(allGroups) }, problem.id, myuid);
        }
        else if (item === "disableEdit") {
            // logEvent("instructor_toggle_disable_student_edits", { status: e.target.checked }, problem.id, myuid);
        }
        else if (item === "startTimer") {
            toggleTimer(e.target.checked)
        }
    }
    const toggleTimer = (flag:boolean) => {
        if(flag){
            const btn = document.querySelector('#disableEdit-'+problem.id) as HTMLInputElement
            if(btn) btn.checked = false;
            dispatch(changeProblemConfig(problem.id, 'disableEdit', false));

            currentTime = givenTime
            dispatch(changeProblemConfig(problem.id, 'currentTime', currentTime));
            if (interval) {
                clearInterval(interval);
            }
            interval = setInterval(updateTimer, 1000);
        }
        else {
            if (interval) {
                clearInterval(interval);
            }
            currentTime = 0
            dispatch(changeProblemConfig(problem.id, 'currentTime', currentTime));
        }
    }
    const updateTimer = () => {
        if(currentTime > 0) {
            currentTime = currentTime - 1
            dispatch(changeProblemConfig(problem.id, 'currentTime', currentTime));
        }
        else {
            const btn = document.querySelector('#disableEdit-'+problem.id) as HTMLInputElement
            if(btn) btn.checked = true;
            dispatch(changeProblemConfig(problem.id, 'disableEdit', true));
            clearInterval(interval)
        }
    }

    const updateGivenTime = (e) => {
        if(e.target.value!=='') {
            givenTime = parseInt(e.target.value)
            dispatch(changeProblemConfig(problem.id, 'maxTime', givenTime));
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

    
    return <>
        <div className="custom-control custom-switch">
            <input ref={disableButton} type="checkbox" className="custom-control-input" id={"disableEdit-" + problem.id} onClick={onSwitch} defaultChecked={config.disableEdit} />
            <label className="custom-control-label" htmlFor={"disableEdit-" + problem.id}>Disable student code edits</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"revealSolutions-" + problem.id} onClick={onSwitch} defaultChecked={config.revealSolutions} />
            <label className="custom-control-label" htmlFor={"revealSolutions-" + problem.id}>Enable Group Discussion ({Object.keys(allSolutions).length}/{Object.keys(allUsers).length} loaded, {completedU.length}/{userIDs.length} completed)</label>
        </div>
        <div className="custom-control custom-switch">
            <input type="checkbox" className="custom-control-input" id={"startTimer-" + problem.id} onClick={onSwitch} defaultChecked={config.startTimer} />
<label className="custom-control-label" htmlFor={"startTimer-" + problem.id}>Enable Timer for <input type="text" className="timeInput" id="timer-value" name="timer-value" defaultValue={config.maxTime} onKeyUp={updateGivenTime} disabled={config.startTimer}/> secs <div className="timeBox" id={"timeBox-" + problem.id}>{config.currentTime} secs left</div></label>
        </div>
    </>
}

function mapStateToProps(state: IPMState, ownProps) {
    const { shareDBDocs, users } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;
    const aggregateData = shareDBDocs.aggregateData?.getData();
    const problemAggregateData = aggregateData && aggregateData.userData[problem.id];
    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const myuid = users.myuid as string;

    const solutionsData = shareDBDocs.i.solutions;
    let problemSolutions = {};

    if (solutionsData && solutionsData.allSolutions && solutionsData.allSolutions.hasOwnProperty(problem.id)) problemSolutions = solutionsData!.allSolutions[problem.id];
    const usersDoc = shareDBDocs.users;
    const localUsers = users.allUsers;
    const userData = usersDoc?.getData();
    const sdbUsers = (userData && userData.allUsers) || {};
    const allUsers = Object.keys(sdbUsers).length > Object.keys(localUsers).length ? sdbUsers : localUsers;
    return update(ownProps, { $merge: { config, completed, rawSolutions: problemSolutions, rawUsers: allUsers, myuid } });
}
export default connect(mapStateToProps)(CodeProblemConfigPanel);

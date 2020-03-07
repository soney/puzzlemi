import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import SolutionPanel from './SolutionPanel';
import ChatWidget from '../PeerHelp/ChatWidget';

const AllSolutions = ({ problem, allGroups, isInstructor, myuid, sIndex, gIndex, allUsers, flag }) => {
    const [currentSolutionIndex, setCurrentSolutionIndex] = React.useState(sIndex?sIndex:0);
    const [currentGroupIndex, setCurrentGroupIndex] = React.useState(gIndex?gIndex:0);
    const groupIDs = Object.keys(allGroups);
    if (groupIDs.length === 0) return <>No group so far.</>;
    if (gIndex === undefined) return <>You don't have any assigned group yet</>;
    const solutions = allGroups[groupIDs[currentGroupIndex]].solutions;
    const solutionIDs = Object.keys(solutions);

    const onSelectSolution = (e) => {
        const newIndex = e.target.getAttribute("data-index");
        setCurrentSolutionIndex(parseInt(newIndex));
    }
    const onSelectGroup = (e) => {
        const newIndex = e.target.getAttribute("data-index");
        setCurrentGroupIndex(parseInt(newIndex));
        setCurrentSolutionIndex(0);
    }

    const getSolutionClass = (id, index) => {
        let className = "btn btn-";
        const isComplete = solutions[id].completed;
        const isSelected = index === currentSolutionIndex;
        if (!isSelected) className += "outline-";
        if (isComplete) className += "success";
        else className += "danger";
        return className;
    }
    const getGroupClass = (id, index) => {
        let className = "btn btn-";
        const isSelected = index === currentGroupIndex;
        if (!isSelected) className += "outline-secondary";
        else className += "secondary";
        return className;
    }

    const getSolutionTitle = (id, index) => {
        const number = index + 1;
        const pseudo = allUsers[id]? allUsers[id].anonymousName:"Solution " + number.toString(); 
        const solution_title = (currentGroupIndex === gIndex && index===sIndex)? pseudo + " (me)" : pseudo;
        return solution_title;
    }

    const currentSolutionID = solutionIDs[currentSolutionIndex];
    const chat_path = ['userData', problem.id, 'allGroups', groupIDs[currentGroupIndex]];
    return <div>
        <div className="groupID-wrapper">
            {groupIDs.map((id, index) => <div key={index} className="solution-list-button">
                {(isInstructor || index === gIndex) &&
                    <button data-index={index} type="button" className={getGroupClass(id, index)} onClick={onSelectGroup}>Group {index + 1} {index === gIndex ? "*" : ""}</button>
                }
            </div>)}
        </div>
        <div className="solutionID-wrapper">
            {solutionIDs.map((id, index) => <div key={index} className="solution-list-button">
                <button data-index={index} type="button" className={getSolutionClass(id, index)} onClick={onSelectSolution}>{getSolutionTitle(id, index)}</button>
            </div>)}
        </div>
        <div className="row">
            <div className="col">
                {currentSolutionID && <SolutionPanel problem={problem} session={allGroups[groupIDs[currentGroupIndex]].solutions[currentSolutionID]} groupID={groupIDs[currentGroupIndex]} solutionIndex={currentSolutionIndex} groupIndex={currentGroupIndex} flag={flag}/>
                }
            </div>
            <div className="col">
                <ChatWidget problem={problem} path={chat_path} />
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs, users } = state;
    const { problem } = ownProps;
    const myuid = users.myuid as string;
    const { isInstructor } = users.allUsers[myuid];
    const localUsers = users.allUsers;
    const sdbUsers = shareDBDocs.users.getData().allUsers;
    const allUsers = Object.keys(sdbUsers).length > Object.keys(localUsers).length ? sdbUsers : localUsers;
    const aggregateData = shareDBDocs.aggregateData?.getData();
    const problemAggregateData = aggregateData && aggregateData.userData[problem.id];
    const allGroups = problemAggregateData && problemAggregateData.allGroups;
    const groupIDs = Object.keys(allGroups);
    let mygindex;
    let mysindex;
    groupIDs.forEach((gid, gindex) => {
        const solutions = allGroups[gid].solutions;
        const solutionIDs = Object.keys(solutions);
        solutionIDs.forEach((sid, sindex) => {
            if (solutions[sid].userID === myuid) {
                mysindex = sindex;
                mygindex = gindex;
            }
        })
    })

    return update(ownProps, { $merge: { allGroups: allGroups ? allGroups : {}, isInstructor, myuid, allUsers, gIndex: mygindex, sIndex: mysindex } });
}
export default connect(mapStateToProps)(AllSolutions);

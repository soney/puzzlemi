import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import SolutionPanel from './SolutionPanel';
import ChatWidget from '../PeerHelp/ChatWidget';

const AllSolutions = ({ problem, allGroups, isInstructor, myuid }) => {
    const [currentSolutionIndex, setCurrentSolutionIndex] = React.useState(0);
    const [currentGroupIndex, setCurrentGroupIndex] = React.useState(0);
    const groupIDs = Object.keys(allGroups);
    if (groupIDs.length === 0) return <></>;
    let mygid;
    let mysid;
    groupIDs.forEach(gid => {
        const solutions = allGroups[gid].solutions;
        const solutionIDs = Object.keys(solutions);
        solutionIDs.forEach(sid => {
            if (solutions[sid].userID === myuid) {
                mysid = sid;
                mygid = gid;
            }
        })
    })
    const solutions = allGroups[groupIDs[currentGroupIndex]].solutions;
    const solutionIDs = Object.keys(solutions);

    const onSelectSolution = (e) => {
        const newIndex = e.target.getAttribute("data-index");
        setCurrentSolutionIndex(parseInt(newIndex));
    }
    const onSelectGroup = (e) => {
        const newIndex = e.target.getAttribute("data-index");
        setCurrentGroupIndex(parseInt(newIndex));
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

    const currentSolutionID = solutionIDs[currentSolutionIndex];
    const chat_path = ['userData', problem.id, 'allGroups', groupIDs[currentGroupIndex]]

    return <div>
        <div className="groupID-wrapper">
            {groupIDs.map((id, index) => <div key={index} className="solution-list-button">
                {(isInstructor || id === mygid) &&
                    <button data-index={index} type="button" className={getGroupClass(id, index)} onClick={onSelectGroup}>Group {index + 1} {id === mygid ? "*" : ""}</button>
                }
            </div>)}
        </div>
        <div className="solutionID-wrapper">
            {solutionIDs.map((id, index) => <div key={index} className="solution-list-button">
                <button data-index={index} type="button" className={getSolutionClass(id, index)} onClick={onSelectSolution}>Solution {index + 1} {id === mysid ? "*" : ""}</button>
            </div>)}
        </div>
        <div>
            <h4>Group {currentGroupIndex + 1}</h4>
            <h4>Solution {currentSolutionIndex + 1}</h4>
        </div>
        <div className="row">
            <div className="col">
                {currentSolutionID && <SolutionPanel problem={problem} session={allGroups[groupIDs[currentGroupIndex]].solutions[currentSolutionID]} groupID={groupIDs[currentGroupIndex]} solutionIndex={currentSolutionIndex} groupIndex={currentGroupIndex} />
                }
            </div>
            <div className="col">
                <ChatWidget problem={problem} chatMessages={allGroups[groupIDs[currentGroupIndex]].chatMessages} path={chat_path} />
            </div>
        </div>
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs, users } = state;
    const { problem } = ownProps;
    const myuid = users.myuid as string;
    const { isInstructor } = users.allUsers[myuid];

    const aggregateData = shareDBDocs.i.aggregateData;
    const problemAggregateData = aggregateData && aggregateData.userData[problem.id];
    const allGroups = problemAggregateData && problemAggregateData.allGroups;

    return update(ownProps, { $merge: { allGroups: allGroups ? allGroups : {}, isInstructor, myuid } });
}
export default connect(mapStateToProps)(AllSolutions);

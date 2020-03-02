import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import SolutionPanel from './SolutionPanel';

const AllSolutions = ({ problem, allSolutions, completed }) => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const onSelect = (e) => {
        const newIndex = e.target.getAttribute("data-index");
        setCurrentIndex(parseInt(newIndex))
    }
    const solutionIDs = Object.keys(allSolutions);
    const getSolutionClass = (id, index) => {
        let className = "btn btn-";
        const isComplete = completed.includes(allSolutions[id].userID);
        const isSelected = index === currentIndex;
        if (!isSelected) className += "outline-";
        if (isComplete) className += "success";
        else className += "danger";
        return className;
    }
    const currentID = solutionIDs[currentIndex];
    return <div>
        {solutionIDs.map((id, index) => <div key={index} className="solution-list-button">
            <button data-index={index} type="button" className={getSolutionClass(id, index)} onClick={onSelect}>Solution {index + 1}</button>
        </div>)}
        {currentID && <SolutionPanel problem={problem} session={allSolutions[currentID]} index={currentIndex} />
        }
    </div>
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const { problem } = ownProps;
    const aggregateData = shareDBDocs.i.aggregateData;
    const problemAggregateData = aggregateData && aggregateData.userData[problem.id];
    const allSolutions = problemAggregateData && problemAggregateData.allSolutions;
    const completed = problemAggregateData && problemAggregateData.completed;

    return update(ownProps, { $merge: { allSolutions: allSolutions ? allSolutions : {}, completed } });
}
export default connect(mapStateToProps)(AllSolutions);

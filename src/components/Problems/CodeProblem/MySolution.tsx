import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import Files from './Files';
import PuzzleEditor from './PuzzleEditor/PuzzleEditor';
import CodeOutput from './CodeOutput'
import HelpMatch from './PeerHelp/HelpMatch';
import { ICodeTest } from '../../../reducers/aggregateData';
import { ICodeSolutionState } from '../../../reducers/intermediateUserState';


const MySolution = ({  problem, config, flag, redirectCallback, currentTest }) => {
    const graphicsRef = React.createRef<HTMLDivElement>();

    return <div>
        <div className="row">
            <div className={currentTest ? "col-7" : "col"}>
                <div>
                    <PuzzleEditor problem={problem} flag={flag} graphicsRef={graphicsRef} />
                </div>
            </div>
            <div className={currentTest ? "col-5" : "col"}>
                <CodeOutput problem={problem} />
                <div ref={graphicsRef} className='graphics'></div>

                <Files problem={problem} />

            </div>
        </div>
        {config.peerHelp &&                
                <HelpMatch problem={problem} redirectCallback={redirectCallback} />
        }
    </div>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const instructorTests = problemDetails.tests;
    const { config } = problemDetails;
    const aggregateData = shareDBDocs.i.aggregateData;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { currentActiveTest } = intermediateCodeState;
    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const tests: { [id: string]: ICodeTest } = aggregateData ? aggregateData.userData[problem.id].tests : {};
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);
    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];

    return update(ownProps, { $merge: { config, currentTest} });
}
export default connect(mapStateToProps)(MySolution);

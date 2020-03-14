import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import Files from './Files';
import PuzzleEditor from './PuzzleEditor/PuzzleEditor';
import CodeOutput from './CodeOutput'
import HelpMatch from './PeerHelp/HelpMatch';


const MySolution = ({ problem, config, flag, redirectCallback, currentTest, doSelectCallback }) => {
    const graphicsRef = React.createRef<HTMLDivElement>();
    return <div>
        <div className="row">
            <div className={currentTest ? "col-7" : "col"}>
                <div>
                    <PuzzleEditor problem={problem} flag={flag} graphicsRef={graphicsRef} doSelectCallback={doSelectCallback} currentTest={currentTest} />
                </div>
            </div>
            <div className={currentTest ? "col-5" : "col"}>
                <CodeOutput problem={problem} currentTest={currentTest} />
                <div ref={graphicsRef} className='graphics'></div>

                <Files problem={problem} />

            </div>
        </div>
        {config.peerHelp &&
            <HelpMatch problem={problem} redirectCallback={redirectCallback} currentTest={currentTest} />
        }
    </div>
}

function mapStateToProps(state, ownProps) {
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const { config } = problemDetails;

    return update(ownProps, { $merge: { config } });
}
export default connect(mapStateToProps)(MySolution);

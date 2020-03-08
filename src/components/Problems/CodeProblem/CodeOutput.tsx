import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ICodeSolutionState } from '../../../reducers/intermediateUserState';
import { ICodeTest } from '../../../reducers/aggregateData';
const CodeOutput = ({currentResult})=>{
    return <>
    {currentResult &&
    <>  
        {currentResult.output!=="" &&
        <pre className={'codeOutput no-error'}>
        {currentResult.output}
        </pre>
    }
        <pre className={'codeError' + (currentResult.errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
            {currentResult.errors.join('\n')}
        </pre>
    </>
    }
    </>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, shareDBDocs } = state;
    const aggregateDataDoc = shareDBDocs.aggregateData;
    const aggregateData = aggregateDataDoc.getData();
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const instructorTests = problemDetails.tests;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];

    const { currentActiveTest, testResults } = intermediateCodeState;
    let tests = {};
    if (aggregateData) {
        tests = aggregateData.userData[problem.id].tests;
    }

    const instructorTestObjects: ICodeTest[] = Object.values(instructorTests);
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)),instructorTests);

    const currentTest = allTests.hasOwnProperty(currentActiveTest) ? allTests[currentActiveTest] : instructorTestObjects[0];
    const currentResult = currentTest? testResults[currentTest.id]:testResults['default'];
    return update(ownProps, { $merge: { currentResult} });
}
export default connect(mapStateToProps)(CodeOutput);
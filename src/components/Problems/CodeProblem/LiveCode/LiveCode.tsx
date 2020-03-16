import * as React from 'react';
import { connect } from "react-redux";
import { CodeEditor } from '../../../CodeEditor';
import update from 'immutability-helper';
import TestList from '../PuzzleEditor/TestList';
import { ICodeTest, CodeTestType } from '../../../../reducers/aggregateData';
import SketchOverlay from './SketchOverlay';
// import ProblemNotes from './ProblemNotes';

const LiveCode = ({ problem, flag, problemsDoc, testResults, allTests, aggregateDataDoc }) => {
    const [currentTestID, setCurrentTestID] = React.useState(Object.keys(allTests)[0]);
    const currentTest = allTests.hasOwnProperty(currentTestID) ? allTests[currentTestID] : Object.values(allTests)[0];

    const p = ['allProblems', problem.id];
    const liveCodeSubDoc = problemsDoc.subDoc([...p, 'problemDetails', 'liveCode', 'code']);
    const p_test = currentTest && (currentTest.type === CodeTestType.INSTRUCTOR ? ['allProblems', problem.id, 'problemDetails', 'tests', currentTest.id] : ['userData', problem.id, 'tests', currentTest.id]);
    const beforeCodeSubDoc = currentTest && (currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'before']) : aggregateDataDoc.subDoc([...p_test, 'before']));
    const afterCodeSubDoc = currentTest && (currentTest.type === CodeTestType.INSTRUCTOR ? problemsDoc.subDoc([...p_test, 'after']) : aggregateDataDoc.subDoc([...p_test, 'after']));
    const currentResult = currentTest ? testResults[currentTest.id] : testResults['default'];
    const doSelectCallback = (ID) => {
        setCurrentTestID(ID);
    }
    return <div>
        <div className="row">
            <div className={currentTest ? "col-7" : "col"}>
                {currentTest
                    ? <div className="row">
                        <div className="col-9 puzzle-editor">
                            <div className="before-code"><CodeEditor shareDBSubDoc={beforeCodeSubDoc} flag={flag} options={{ readOnly: true, lineNumbers: true, lineWrapping: true }} refreshDoc={{ currentTest, flag }} /></div>
                            <div className="live-code"><CodeEditor shareDBSubDoc={liveCodeSubDoc} flag={flag} options={{ readOnly: true, lineNumbers: true }} /></div>
                            <div className="after-code"><CodeEditor shareDBSubDoc={afterCodeSubDoc} flag={flag} options={{ readOnly: true, lineNumbers: true, lineWrapping: true }} refreshDoc={{ currentTest, flag }} /></div>
                        </div>
                        <div className="col-3 tests live-code-tests">
                            <TestList problem={problem} doSelectCallback={doSelectCallback} currentTest={currentTest} disable={true} testResults={testResults} />
                        </div>
                    </div>
                    : <div className="row">
                        <div className="col">
                            <CodeEditor shareDBSubDoc={liveCodeSubDoc} flag={flag} options={{ readOnly: true, lineNumbers: true }} />
                        </div>
                    </div>
                }
            </div>
            <div className={currentTest ? "col-5 live-code-result" : "col live-code-result"}>
                {currentResult &&
                    <>
                        {currentResult.output !== "" &&
                            <pre className={'codeOutput no-error'}>
                                {currentResult.output}
                            </pre>
                        }
                        <pre className={'codeError' + (currentResult.errors.length > 0 ? ' alert alert-danger' : ' no-error')}>
                            {currentResult.errors.join('\n')}
                        </pre>
                    </>
                }
            </div>
        </div >
        <div className="row">
            <SketchOverlay problem={problem} />
        </div>
    </div>;
}

function mapStateToProps(state, ownProps) {
    const { shareDBDocs } = state;
    const { problem } = ownProps;
    const { problemDetails } = problem;
    const instructorTests = problemDetails.tests;

    const problemsDoc = shareDBDocs.problems;
    const aggregateDataDoc = shareDBDocs.aggregateData;

    const problemsData = shareDBDocs.i.problems;
    const problemData = problemsData.allProblems[problem.id];
    const testResults = problemData.problemDetails.liveCode.testResults;

    const aggregateData = shareDBDocs.i.aggregateData;
    const tests: { [id: string]: ICodeTest } = aggregateData ? aggregateData.userData[problem.id].tests : {};
    const allTests = Object.assign(JSON.parse(JSON.stringify(tests)), instructorTests);

    return update(ownProps, { $merge: { problemsDoc, testResults, aggregateDataDoc, allTests } });
}
export default connect(mapStateToProps)(LiveCode);

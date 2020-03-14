import * as React from 'react';
import { connect } from "react-redux";
import update from 'immutability-helper';
import { ICodeSolutionState } from '../../../reducers/intermediateUserState';
const CodeOutput = ({ currentResult }) => {
    return <>
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
    </>
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState } = state;
    const { currentTest } = ownProps;
    const intermediateCodeState: ICodeSolutionState = intermediateUserState.intermediateSolutionState[ownProps.problem.id];
    const { testResults } = intermediateCodeState;
    const currentResult = currentTest ? testResults[currentTest.id] : testResults['default'];
    return update(ownProps, { $merge: { currentResult } });
}
export default connect(mapStateToProps)(CodeOutput);
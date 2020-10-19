import * as React from 'react';
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import update from 'immutability-helper';
import { connect } from "react-redux";
import { CodePassedState } from '../../../../reducers/intermediateUserState';
import { CodeTestType, CodeTestStatus } from '../../../../reducers/aggregateData';

const TestItem = ({ isAdmin, problem, test, username, testResults, myuid, doSelectCallback, currentTest }) => {
    const selected = currentTest && currentTest.id === test.id;

    const doSetCurrentTest = (e) => {
        doSelectCallback(test.id)
    }

    const baseClasses = "list-group-item list-group-item-action test-list-item " + (test.type === CodeTestType.INSTRUCTOR ? 'instructor' : 'student');
    const activeClass = selected ? " active " : " ";
    const result = testResults[test.id];
    const isEditClass = test.author === username ? " isedit " : " ";
    let validClass;
    let validContent: string = "";

    switch (test.status) {
        case CodeTestStatus.VERIFIED:
            validClass = " verified ";
            validContent = "The test is valid.";
            break;
        case CodeTestStatus.VERIFICATION_FAILED:
            validClass = " not-verified ";
            validContent = "The test is invalid.";
            break;
        case CodeTestStatus.UNVERIFIED:
            validClass = " unverified ";
            validContent = "The test is waiting to be verified.";
            break;
    }
    const adminClass = isAdmin ? " isadmin " : " ";
    let passClass = 'pending';
    let passContent = "The result is pending.";
    if (result && result.hasOwnProperty('passed')) {
        const { passed } = result;
        if (passed === CodePassedState.PASSED) {
            passClass = 'passed';
            passContent = "The result is passeed.";
        } else if (passed === CodePassedState.FAILED) {
            passClass = 'failed';
            passContent = "The result is failed.";
        } else if (passed === CodePassedState.PENDING) {
            passClass = 'pending';
            passContent = "The result is pending.";
        }
    }
    const classValue = baseClasses + activeClass + isEditClass + validClass + adminClass + passClass;
    const tippyContent = validContent + " " + passContent;
    tippy('[data-tippy-content]');

    tippy('li', {
        duration: 0,
        arrow: false,
        delay: [1000, 200]
    });

    return <li data-tag={testResults.id} data-tippy-content={tippyContent} className={classValue} onClick={doSetCurrentTest}><p>{test.name}</p></li>;
}

function mapStateToProps(state, ownProps) {
    const { intermediateUserState, users } = state;
    const { isAdmin } = intermediateUserState;

    const myuid = users.myuid as string;
    const username = users.allUsers[myuid].username;

    return update(ownProps, { $merge: { isAdmin, username, myuid } })
}

export default connect(mapStateToProps)(TestItem);
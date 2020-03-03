export interface IAggregateData {
    userData: {
        [problemID: string]: ISolutionAggregate
    }
}

export type ISolutionAggregate = ICodeSolutionAggregate | IMultipleChoiceSolutionAggregate | ITextResponseSolutionAggregate;

export interface ICodeSolutionAggregate {
    completed: string[],
    tests: {
        [testID: string]: ICodeTest
    },
    helpSessions: {
        [helpSessionID: string]: IHelpSession
    },
    helperLists: {
        [userID: string]: string
    }

}

export enum CodeTestType { INSTRUCTOR='instructor', STUDENT='student' };
export enum CodeTestStatus { UNVERIFIED='unverified', VERIFICATION_FAILED='verification_failed', VERIFIED='verified' };

export interface ICodeTest {
    id: string;
    name: string;
    author: string|null;
    type: CodeTestType;
    before: string;
    after: string;
    status: CodeTestStatus;
    completed: string[],
}


export interface IHelpSession {
    id: string;
    status: boolean;
    readOnly: boolean;
    tutee: string;
    chatMessages: IMessage[];
    title: string;
    code: string;
    timestamp: string;
    errorTags: string[];
    testTags: string[];
}

export interface IMessage {
    sender: string;
    timestamp: string;
    content: string;
    isAnonymous: boolean;
}

export interface IMultipleChoiceSolutionAggregate {
    completed: string[],
    selected: {
        [itemID: string]: string[]
    }
}
export interface ITextResponseSolutionAggregate {
    completed: null
}
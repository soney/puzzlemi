import { ICodeSolution } from './solutions';
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
    helpSessions: IHelpSession[];
}

export interface ICodeTest {
    id: string;
    name: string;
    author: string;
    type: 'instructor' | 'student';
    before: string;
    after: string;
    status: 'Unverified' | 'Failed' | 'Passed';
    completed: string[],
}

export interface IHelpSession {
    id: string;
    status: boolean;
    tutee: string;
    tutors: string[];
    chatMessages: IMessage[];
    title: string;
    description: string;
    solution: ICodeSolution;
    timestamp: string;
}

export interface IMessage {
    sender: string;
    timestamp: string;
    content: string;
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
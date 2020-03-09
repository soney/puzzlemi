import {ICodeTest, ICodeSolutionAggregate, CodeTestStatus} from './aggregateData';
import { IPMState } from '.';

export interface IProblem {
    id: string;
    visible: boolean;
    problemDetails: IMultipleChoiceProblem | ICodeProblem | ITextResponseProblem
};

export enum IProblemType {
    TextResponse='text-response',
    MultipleChoice='multiple-choice',
    Code='code'
}

export enum IMultipleChoiceOptionType {
    Fixed='fixed'
}

export interface IMultipleChoiceOption {
    id: string;
    description: string;
    optionType: IMultipleChoiceOptionType.Fixed;
    freeResponse?: string | null;
    isCorrect: boolean;
}

export interface ITextResponseProblem {
    description: string;
    problemType: IProblemType.TextResponse;
}

export interface IMultipleChoiceProblem {
    description: string;
    options: IMultipleChoiceOption[];
    problemType: IProblemType.MultipleChoice;
    selectionType: IMultipleChoiceSelectionType;
    revealSolution: boolean;
}

export enum IMultipleChoiceSelectionType {
    Single='single',
    Multiple='multiple'
}

export interface ICodeProblem {
    description: string;
    givenCode: string;
    liveCode: string;
    standardCode: string;
    notes: string;
    files: ICodeFile[];
    config: ICodeProblemConfig;
    sketch: any[];
    tests:{
        [testID: string]: ICodeTest
    };
    problemType: IProblemType.Code;
}

export interface ICodeProblemConfig {
    runTests: boolean;
    addTests: boolean;
    displayInstructor: boolean;
    peerHelp: boolean;
    revealSolutions: boolean;
    disableEdit: boolean;
    requireTests: boolean;
}

export interface ICodeFile {
    id: string,
    name: string,
    contents: string
}

export interface IProblems {
    order: string[],
    allProblems: {
        [problemID: string]: IProblem
    }
}

export enum CodeProblemCompletionStatus {
    PROBLEM_NOT_COMPLETED,
    ALL_COMPLETED,
    TEST_NOT_VERIFIED,
    NO_TESTS
}

export function getCodeProblemCompletionStatus(problem: IProblem, state: IPMState): CodeProblemCompletionStatus {
    const { shareDBDocs, users } = state;
    const myuid = users.myuid as string;
    const { problemDetails } = problem;
    const problemID = problem.id;
    const aggregateData = shareDBDocs.aggregateData?.getData();
    const problemAggregateData = aggregateData && aggregateData.userData[problemID];
    const completed = (problemAggregateData && problemAggregateData.completed) || [];
    const passedAll = completed.indexOf(myuid) >= 0;
    if(passedAll) {
        const { config } = problemDetails as ICodeProblem;
        if(config.requireTests) {
            const username = users.allUsers[myuid].username;
            const tests = aggregateData ? (aggregateData.userData[problem.id] as ICodeSolutionAggregate).tests : {};
            const myTestObjects: ICodeTest[] = Object.values(tests).filter((t) => t.author === username);
            const validatedTests = myTestObjects.filter((t) => t.status === CodeTestStatus.VERIFIED);
            if(validatedTests.length > 0) {
                return CodeProblemCompletionStatus.ALL_COMPLETED;
            } else if(myTestObjects.length > 0) {
                return CodeProblemCompletionStatus.TEST_NOT_VERIFIED;
            } else {
                return CodeProblemCompletionStatus.NO_TESTS;
            }
        } else {
            return CodeProblemCompletionStatus.ALL_COMPLETED;
        }
    } else {
        return CodeProblemCompletionStatus.PROBLEM_NOT_COMPLETED;
    }
}

export function getFirstIncompleteCodeProblem(state: IPMState): string|null {
    const { shareDBDocs } = state;
    const problemsDoc = shareDBDocs.problems;
    const problems = problemsDoc!.getData();
    if(problems) {
        for(let i: number = 0; i<problems.order.length; i++) {
            const problemID = problems.order[i];
            const problem = problems.allProblems[problemID];
            const problemType = problem.problemDetails.problemType;
            if(problemType === IProblemType.Code) {
                if(getCodeProblemCompletionStatus(problem, state) !== CodeProblemCompletionStatus.ALL_COMPLETED) {
                    return problemID;
                }
            }
        }
    }
    return null;
}
import {ICodeTest} from './aggregateData';
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
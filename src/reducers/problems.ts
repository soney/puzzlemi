export interface IProblem {
    id: string;
    visible: boolean;
    problemDetails: IMultipleChoiceProblem | ICodeProblem | ITextResponseProblem
};

export interface IMultipleChoiceOption {
    id: string;
    description: string;
    optionType: 'fixed';
    freeResponse?: string | null;
    isCorrect: boolean;
}

export interface ITextResponseProblem {
    description: string;
    problemType: 'text-response';
}

export interface IMultipleChoiceProblem {
    description: string;
    options: IMultipleChoiceOption[];
    problemType: 'multiple-choice';
    selectionType: IMultipleChoiceSelectionType;
    revealSolution: boolean;
}

export type IMultipleChoiceSelectionType = 'single' | 'multiple';

export interface ICodeProblem {
    description: string;
    givenCode: string;
    liveCode: string;
    standardCode: string;
    notes: string;
    files: ICodeFile[];
    config: ICodeProblemConfig;
    sketch: any[];
    problemType: 'code';
}

export interface ICodeProblemConfig {
    runTests: boolean;
    addTests: boolean;
    displayInstructor: boolean;
    peerHelp: boolean;
    autoVerify: boolean;
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
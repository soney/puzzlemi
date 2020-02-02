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

export type IMultipleChoiceSelectionType = 'single'|'multiple';

export interface ICodeProblem {
    afterCode: string;
    description: string;
    givenCode: string;
    standardCode: string;
    notes: string;
    files: ICodeFile[];
    tests: ICodeTest[];
    variableTests: ICodeVariableTest[];
    variables: ICodeVariable[];
    config: ICodeProblemConfig;
    sketch: any [];
    problemType: 'code';
}

export interface ICodeProblemConfig {
    runTests: boolean;
    addTests: boolean;
    displayInstructor: boolean;
    peerHelp: boolean;
    autoVerify: boolean;
}

export interface ICodeVariable {
    name: string;
    value: string;
    type: 'input'|'output';
}

export interface ICodeTest {
    id: string,
    actual: string,
    expected: string,
    description: string
}

export interface ICodeVariableTest {
    id?: string,
    author?: string,
    status?: 'Unverified'|'Failed'|'Passed',
    input: ICodeVariable[],
    output: ICodeVariable[]
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
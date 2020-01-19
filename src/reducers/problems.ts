import EventTypes from '../actions/EventTypes';
import update from 'immutability-helper';
import { IProblemsFetchedAction, ISDBDocChangedAction } from '../actions/sharedb_actions';

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
    files: ICodeFile[],
    tests: ICodeTest[];
    problemType: 'code';
}

export interface ICodeTest {
    id: string,
    actual: string,
    expected: string,
    description: string
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
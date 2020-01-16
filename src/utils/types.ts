export interface IPuzzleSet {
    problems: IProblem[];
    userData: {
        [problemID: string]: IProblemUserInfo;
    };
}

export interface IUser {
    isAdmin: boolean;
    id: string;
    userInfo: IUserInfo;
    solutions: { [problemID: string]: ISolution }
}

export interface IHelpSession {
    status: boolean;
    tuteeID: string;
    tutorIDs: string[];
    solution: ISolution;
}

export interface IProblemUserInfo {
    completed_default: string[];
    completed_tests: string[];
    visible: boolean;
    testData: {
        [testID: string]: {
            [userID: string]: {
                passedAll: boolean
            }
        }
    },
    helpSessions: IHelpSession[];
}

export interface ITest {
    author: string,
    verified: boolean,
    id: string,
    input: IVariable[],
    output: IVariable[]
    // hidden: boolean;
    // helpSessions: IHelpSession[];
}

export interface IProblem {
    id: string;
    afterCode: string;
    description: string;
    givenCode: string;
    standardCode: string;
    notes: string;
    files: IFile[];
    variables: IVariable[];
    tests: ITest[];
    config: IProblemConfig;
};

export interface IProblemConfig {
    runTests: boolean;
    addTests: boolean;
    displayInstructor: boolean;
    peerHelp: boolean;
    autoVerify: boolean;
}

export interface IVariable {
    name: string;
    value: string;
    type: 'input'|'output';
}

export interface IFile {
    id: string;
    contents: string;
    name: string;
}

export interface ISolution {
    modified: boolean;
    code: string;
    files: Array<{
        contents: string;
        name: string
    }>;
    defaultResult: IResult;
    passedAllTests: boolean | number;
    // targetID: string,
    testResults: {
        [testID: string]: IResult
    }
    activeFailedTestID: string;
}

export interface IResult {
    errors: string[];
    output: string;
    passedAll: boolean | number;
    results: ITestMessage[];
}

export interface ITestMessage {
    passed: boolean;
    message: string;
}

export interface IUserInfo {
    username: string;
    email: string;
    isInstructor: boolean;
    loggedIn: boolean;
}
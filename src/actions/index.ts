export const addProblem = () => ({
    type: EventTypes.ADD_PROBLEM,
});

export const runCode = (): void => {

};

export enum EventTypes {
    ADD_PROBLEM,
}

export const EmptyProblem = {
    afterCode: '',
    code: `# code here`,
    description: '*no description*',
    files: {},
    tests: [],
}

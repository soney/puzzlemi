enum EventTypes {
    OPTION_ADDED = 'multiple-choice option added',
    OPTION_DELETED = 'multiple-choice option deleted',
    OPTION_DESCRIPTION_CHANGED = 'multiple-choice option description changed',
    OPTION_CORRECTNESS_CHANGED = 'multiple-choice option correctness changed',
    MULTIPLE_CHOICE_SELECTION_TYPE_CHANGED = 'multiple-choice selection type changed',
    MULTIPLE_CHOICE_REVEAL_SOLUTION_CHANGED = 'multiple-choice reveal solution changed',
    GIVEN_CODE_CHANGED = 'given code changed',
    AFTER_CODE_CHANGED = 'after code changed',
    PROBLEM_ADDED = 'problem added',
    TEST_ADDED = 'test added',
    TEST_PART_CHANGED = 'test part changed',
    SET_DOC = 'set doc',
    SET_IS_ADMIN = 'set is admin',
    SET_ACTIVE_TEST = 'set active test ID',
    CODE_CHANGED = 'code changed',
    OUTPUT_CHANGED = 'output changed',
    FILE_WRITTEN = 'file written',
    ERROR_CHANGED = 'error changed',
    PROBLEM_PASSED_CHANGED = 'problem passed changed',
    BEGIN_RUN_CODE = 'begin run code',
    DONE_RUNNING_CODE = 'done running code',
    DELETE_USER_FILE = 'delete user file',
    SET_USER = 'set user',
    MULTIPLE_CHOICE_SELECTED_OPTIONS_CHANGED = 'multiple-choice selected options changed',
    TEXT_RESPONSE_CHANGED = 'text response changed',
    TEXT_RESPONSE_EXAMPLE_CORRECT_SOLUTION_CHANGED = 'text response example correct solution changed',
    SDB_DOC_CHANGED = 'sharedb doc changed',
    APP_STATE_CHANGED = 'app state changed',
    SELECT_USER_FOR_SOLUTION_VIEW = 'select user for solution view',
    SDB_DOC_FETCHED = 'sharedb doc fetched',
    ADD_PASSED_TESTS = 'add passed tests',
    ADD_FAILED_TEST = 'add failed test',
    UPDATE_ACTIVE_HELP_SESSION = 'update active help session',
    DONE_RUNNING_LIVE = 'done running live code'
};
export default EventTypes;
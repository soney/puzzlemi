enum EventTypes {
    RUN_CODE = 'run code',
    DESCRIPTION_CHANGED = 'description changed',
    GIVEN_CODE_CHANGED = 'given code changed',
    AFTER_CODE_CHANGED = 'after code changed',
    PROBLEM_ADDED = 'problem added',
    TEST_ADDED = 'test added',
    TEST_DELETED = 'test deleted',
    TEST_PART_CHANGED = 'test part changed',
    FILE_ADDED = 'file added',
    FILE_PART_CHANGED = 'file part changed',
    FILE_DELETED = 'file deleted',
    PROBLEM_DELETED = 'problem deleted',
    PUZZLES_FETCHED = 'puzzles fetched',
    SET_DOC = 'set doc',
    SET_IS_ADMIN = 'set is admin',
    // SET_NAME='set name',
    CODE_CHANGED = 'code changed',
    RESET_CODE = 'reset code',
    OUTPUT_CHANGED = 'output changed',
    FILE_WRITTEN = 'file written',
    ERROR_CHANGED = 'error changed',
    TEST_STATUS_CHANGED = 'test status changed',
    PROBLEM_PASSED_CHANGED = 'problem passed changed',
    BEGIN_RUN_CODE = 'begin run code',
    DONE_RUNNING_CODE = 'done running code',
    DELETE_USER_FILE = 'delete user file',
    USER_COMPLETED_PROBLEM = 'user completed problem',
    PROBLEM_COMPLETION_INFO_FETCHED = 'problem completion info fetched',
    PROBLEM_VISIBILITY_CHANGED = 'problem visibility changed',
    VARIABLE_ADDED = 'add variable',
    VARIABLE_DELETED = 'delete variable',
    VARIABLE_PART_CHANGED = 'variable part changed',
    DONE_RUNNING_TEST = 'done running one test case',
    BEGIN_RUN_TEST = 'begin running one test case',
    DONE_RUNNING_DEFAULT = 'done running default test',
    // CHANGE_TARGET_ID = 'change target user test id',
    ENABLE_HELP_SESSION = 'help session added',
    JOIN_HELP_SESSION = 'join help session',
    QUIT_HELP_SESSION = 'tutor quit session',
    DISABLE_HELP_SESSION = 'tutee quit session',
    SHARED_OUTPUT_CHANGED = 'shared output change',
    SHARED_FILE_WRITTEN = 'shared file written',
    BEGIN_RUN_SHARED_CODE = 'begin run shared code',
    DONE_RUNNING_SHARED_CODE = 'done running shared code',
    SHARED_ERROR_CHANGED = 'shared error changed'
};
export default EventTypes;
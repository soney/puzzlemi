enum EventTypes {
    RUN_CODE='run code',
    DESCRIPTION_CHANGED='description changed',
    GIVEN_CODE_CHANGED='given code changed',
    AFTER_CODE_CHANGED='after code changed',
    PROBLEM_ADDED='problem added',
    TEST_ADDED='test added',
    TEST_DELETED='test deleted',
    TEST_PART_CHANGED='test part changed',
    FILE_ADDED='file added',
    FILE_PART_CHANGED='file part changed',
    FILE_DELETED='file deleted',
    PROBLEM_DELETED='problem deleted',
    PUZZLES_FETCHED='puzzles fetched',
    SET_DOC='set doc',
    SET_IS_ADMIN='set is admin',
    CODE_CHANGED='code changed',
    RESET_CODE='reset code',
    OUTPUT_CHANGED='output changed',
    FILE_WRITTEN='file written',
    ERROR_CHANGED='error changed',
    TEST_STATUS_CHANGED='test status changed',
    PROBLEM_PASSED_CHANGED='problem passed changed',
    BEGIN_RUN_CODE='begin run code',
    DONE_RUNNING_CODE='done running code',
    DELETE_USER_FILE='delete user file',
    USER_COMPLETED_PROBLEM='user completed problem',
    PROBLEM_COMPLETION_INFO_FETCHED='problem completion info fetched',
    PROBLEM_VISIBILITY_CHANGED='problem visibility changed',
    SET_USER='set user'
};
export default EventTypes;
enum EventTypes {
    RUN_CODE,
    DESCRIPTION_CHANGED,
    GIVEN_CODE_CHANGED,
    AFTER_CODE_CHANGED,
    PROBLEM_ADDED,
    TEST_ADDED,
    TEST_DELETED,
    TEST_PART_CHANGED,
    FILE_ADDED,
    FILE_PART_CHANGED,
    FILE_DELETED,
    PROBLEM_DELETED,
    PUZZLES_FETCHED,
    SET_DOC,
    SET_IS_ADMIN,
    CODE_CHANGED,
    RESET_CODE,
    OUTPUT_CHANGED,
    FILE_WRITTEN,
    ERROR_CHANGED,
    TEST_STATUS_CHANGED,
    PROBLEM_PASSED_CHANGED,
    BEGIN_RUN_CODE,
    DONE_RUNNING_CODE,
    DELETE_USER_FILE,
    USER_COMPLETED_PROBLEM,
    PROBLEM_COMPLETION_INFO_FETCHED
};
export default EventTypes;
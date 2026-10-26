USE [DBMS330284];
GO
SET NOCOUNT ON;
DECLARE @Passed INT=0, @ErrorNumber INT;
REVOKE EXECUTE ON dbo.SP_App_Faculty_DeleteFaculty FROM QUAN_TRI;
EXECUTE AS USER='dbms_test_admin';
BEGIN TRY
  EXEC dbo.SP_App_Faculty_DeleteFaculty @MaKhoa='__PERMISSION_PROBE__';
  REVERT;
  THROW 52040,N'QUAN_TRI ran faculty-delete procedure after EXECUTE was revoked.',1;
END TRY
BEGIN CATCH
  SET @ErrorNumber=ERROR_NUMBER();
  IF USER_NAME()='dbms_test_admin' REVERT;
  IF @ErrorNumber=52040
  BEGIN
    GRANT EXECUTE ON dbo.SP_App_Faculty_DeleteFaculty TO QUAN_TRI;
    THROW;
  END;
  IF @ErrorNumber<>229
  BEGIN
    GRANT EXECUTE ON dbo.SP_App_Faculty_DeleteFaculty TO QUAN_TRI;
    THROW;
  END;
  SET @Passed+=1;
END CATCH;
GRANT EXECUTE ON dbo.SP_App_Faculty_DeleteFaculty TO QUAN_TRI;
EXECUTE AS USER='dbms_test_admin';
EXEC dbo.SP_App_Faculty_DeleteFaculty @MaKhoa='__PERMISSION_PROBE__';
REVERT;
SET @Passed+=1;
IF @Passed<>2 THROW 52041,N'App procedure permission test failed.',1;
SELECT 'PASS' AS Result,@Passed AS PermissionAssertions;
GO

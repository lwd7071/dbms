-- ENCODING: UTF-8 WITH BOM
DECLARE @DatabaseName sysname = N'DBMS330284';
IF DB_ID(@DatabaseName) IS NULL
BEGIN
    DECLARE @CreateSql nvarchar(max) = N'CREATE DATABASE ' + QUOTENAME(@DatabaseName);
    EXEC sys.sp_executesql @CreateSql;
    PRINT N'Database đã được tạo: ' + @DatabaseName;
END
ELSE
    PRINT N'Database đã tồn tại: ' + @DatabaseName;
GO

USE [DBMS330284];
GO

SELECT
    DB_NAME() AS CurrentDatabase,
    SUSER_SNAME() AS CurrentLogin,
    GETDATE() AS ExecutionTime;
GO
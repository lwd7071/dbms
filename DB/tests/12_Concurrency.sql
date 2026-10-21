-- ENCODING: UTF-8 WITH BOM
USE [$(DatabaseName)];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
GO

IF OBJECT_ID(N'dbo.SP_DangKyTinChi', N'P') IS NULL
    THROW 50001, N'SP_DangKyTinChi chưa tồn tại. Hãy chạy 08_StoredProcedures.sql trước.', 1;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.sql_modules
    WHERE object_id = OBJECT_ID(N'dbo.SP_DangKyTinChi')
      AND definition LIKE N'%UPDLOCK%'
)
    THROW 50002, N'SP_DangKyTinChi chưa có cơ chế UPDLOCK để xử lý concurrency.', 1;
GO

IF NOT EXISTS
(
    SELECT 1
    FROM sys.sql_modules
    WHERE object_id = OBJECT_ID(N'dbo.SP_DangKyTinChi')
      AND definition LIKE N'%HOLDLOCK%'
)
    THROW 50003, N'SP_DangKyTinChi chưa có cơ chế HOLDLOCK để xử lý concurrency.', 1;
GO

SELECT
    N'READ COMMITTED' AS IsolationLevel,
    N'UPDLOCK' AS LockingMechanism,
    N'HOLDLOCK' AS ConcurrencyControl,
    N'ĐẠT' AS Status;
GO
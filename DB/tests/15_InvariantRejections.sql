USE [$(DatabaseName)];
GO
SET NOCOUNT ON;
DECLARE @Error int;

-- Khoa / lớp / CTĐT sai nhau phải bị trigger chặn và rollback.
BEGIN TRY
    BEGIN TRANSACTION;
    INSERT dbo.SINHVIEN (MaSinhVien, HoTen, MaKhoa, MaLop, MaCTDT)
    VALUES ('T' + RIGHT(REPLACE(CONVERT(varchar(36), NEWID()), '-', ''), 19), N'Fixture mismatch', 'CNTT', 'KTPM23_01', 'CTDT_CNTT_CQ');
    ROLLBACK;
    THROW 52100, N'Sai khoa lớp/CTĐT đã được chấp nhận.', 1;
END TRY BEGIN CATCH
    SET @Error = ERROR_NUMBER();
    IF XACT_STATE() <> 0 ROLLBACK;
    IF @Error <> 51008 THROW;
    PRINT N'PASS - Khoa/lớp/CTĐT sai bị từ chối (51008).';
END CATCH;

-- Lớp học phần ở trạng thái mở không thể thiếu lịch.
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @LHP varchar(20) = 'T' + RIGHT(REPLACE(CONVERT(varchar(36), NEWID()), '-', ''), 19);
    INSERT dbo.LOPHOCPHAN (MaLHP, MaMonHoc, MaHocKy, TenLHP, SoLuongToiDa, TrangThai)
    VALUES (@LHP, 'TRIET', 7, N'Fixture no schedule', 10, 'DA_KHOA');
    UPDATE dbo.LOPHOCPHAN SET TrangThai = 'MO_DANG_KY' WHERE MaLHP = @LHP;
    ROLLBACK;
    THROW 52101, N'Lớp mở không lịch đã được chấp nhận.', 1;
END TRY BEGIN CATCH
    SET @Error = ERROR_NUMBER();
    IF XACT_STATE() <> 0 ROLLBACK;
    IF @Error <> 51311 THROW;
    PRINT N'PASS - Mở lớp không lịch bị từ chối (51311).';
END CATCH;

-- Không thể giảm sức chứa thấp hơn sĩ số hiện tại.
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @CapacityLHP varchar(20), @Registered int;
    SELECT TOP (1) @CapacityLHP = lhp.MaLHP, @Registered = COUNT(*)
    FROM dbo.LOPHOCPHAN lhp
    INNER JOIN dbo.DANGKYTINCHI dk ON dk.MaLHP = lhp.MaLHP AND dk.TrangThai = 'REGISTERED'
    GROUP BY lhp.MaLHP
    HAVING COUNT(*) > 1
    ORDER BY COUNT(*) DESC;
    IF @CapacityLHP IS NULL THROW 52102, N'Không có lớp test đủ sĩ số.', 1;
    UPDATE dbo.LOPHOCPHAN SET SoLuongToiDa = @Registered - 1 WHERE MaLHP = @CapacityLHP;
    ROLLBACK;
    THROW 52103, N'Giảm sức chứa dưới sĩ số đã được chấp nhận.', 1;
END TRY BEGIN CATCH
    SET @Error = ERROR_NUMBER();
    IF XACT_STATE() <> 0 ROLLBACK;
    IF @Error <> 51002 THROW;
    PRINT N'PASS - Giảm sức chứa dưới sĩ số bị từ chối (51002).';
END CATCH;

-- Hồ sơ học phí không thể tham chiếu mức giá của học kỳ khác.
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @Student int, @Rate int, @RateSemester int, @OtherSemester int;
    SELECT TOP (1) @Student = sv.MaSV FROM dbo.SINHVIEN sv WHERE NOT EXISTS (SELECT 1 FROM dbo.HOCPHI hp WHERE hp.MaSV=sv.MaSV AND hp.MaHocKy=7);
    SELECT TOP (1) @Rate = MaMucHocPhi, @RateSemester = MaHocKy FROM dbo.MUCHOCPHI WHERE MaHocKy <> 7;
    SELECT @OtherSemester = 7;
    INSERT dbo.HOCPHI (MaSV, MaHocKy, MaMucHocPhi, SoTinChi, DonGiaTinChi, TongTien)
    VALUES (@Student, @OtherSemester, @Rate, 1, 1, 1);
    ROLLBACK;
    THROW 52104, N'Mức phí sai học kỳ đã được chấp nhận.', 1;
END TRY BEGIN CATCH
    SET @Error = ERROR_NUMBER();
    IF XACT_STATE() <> 0 ROLLBACK;
    IF @Error <> 547 THROW;
    PRINT N'PASS - Mức phí sai học kỳ bị từ chối bởi FK ghép (547).';
END CATCH;
GO

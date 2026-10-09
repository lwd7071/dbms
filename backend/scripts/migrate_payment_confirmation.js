const { getPool } = require('../src/config/db');

async function migratePaymentConfirmation() {
  const pool = await getPool();

  console.log('--- BẮT ĐẦU MIGRATION XÁC NHẬN THANH TOÁN ---');

  // 1. Kiểm tra và bổ sung cột TrangThai
  const checkTrangThai = await pool.request().query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CHITIETTHANHTOAN' AND COLUMN_NAME = 'TrangThai';
  `);

  if (checkTrangThai.recordset.length === 0) {
    console.log('1.1. Bổ sung cột TrangThai...');
    await pool.request().query(`
      ALTER TABLE dbo.CHITIETTHANHTOAN 
      ADD TrangThai VARCHAR(20) NOT NULL CONSTRAINT DF_CHITIETTHANHTOAN_TrangThai DEFAULT 'CHO_XAC_NHAN';
    `);

    console.log('1.2. Bổ sung ràng buộc CHECK cho TrangThai...');
    await pool.request().query(`
      ALTER TABLE dbo.CHITIETTHANHTOAN 
      ADD CONSTRAINT CK_CHITIETTHANHTOAN_TrangThai CHECK (TrangThai IN ('CHO_XAC_NHAN', 'DA_XAC_NHAN', 'TU_CHOI'));
    `);

    console.log('1.3. Cập nhật các bản ghi cũ thành DA_XAC_NHAN...');
    await pool.request().query(`
      UPDATE dbo.CHITIETTHANHTOAN 
      SET TrangThai = 'DA_XAC_NHAN' 
      WHERE TrangThai = 'CHO_XAC_NHAN';
    `);
  }

  // 2. Kiểm tra và bổ sung cột MaTaiKhoanXacNhan
  const checkMaTK = await pool.request().query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CHITIETTHANHTOAN' AND COLUMN_NAME = 'MaTaiKhoanXacNhan';
  `);

  if (checkMaTK.recordset.length === 0) {
    console.log('1.4. Bổ sung cột MaTaiKhoanXacNhan...');
    await pool.request().query(`
      ALTER TABLE dbo.CHITIETTHANHTOAN 
      ADD MaTaiKhoanXacNhan INT NULL CONSTRAINT FK_CHITIETTHANHTOAN_TAIKHOAN FOREIGN KEY REFERENCES dbo.TAIKHOAN(MaTaiKhoan);
    `);
  }

  // 3. Kiểm tra và bổ sung cột NgayXacNhan
  const checkNgayXacNhan = await pool.request().query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'CHITIETTHANHTOAN' AND COLUMN_NAME = 'NgayXacNhan';
  `);

  if (checkNgayXacNhan.recordset.length === 0) {
    console.log('1.5. Bổ sung cột NgayXacNhan...');
    await pool.request().query(`
      ALTER TABLE dbo.CHITIETTHANHTOAN 
      ADD NgayXacNhan DATETIME2 NULL;
    `);

    await pool.request().query(`
      UPDATE dbo.CHITIETTHANHTOAN 
      SET NgayXacNhan = NgayThanhToan 
      WHERE TrangThai = 'DA_XAC_NHAN' AND NgayXacNhan IS NULL;
    `);
  }

  // 4. Cập nhật Trigger TR_CHITIETTHANHTOAN_CapNhatHocPhi
  console.log('2. Cập nhật Trigger TR_CHITIETTHANHTOAN_CapNhatHocPhi...');
  await pool.request().query(`
    CREATE OR ALTER TRIGGER [dbo].[TR_CHITIETTHANHTOAN_CapNhatHocPhi]
    ON [dbo].[CHITIETTHANHTOAN]
    AFTER INSERT, UPDATE, DELETE
    AS
    BEGIN
        SET NOCOUNT ON;

        DECLARE @ChangedHocPhi TABLE (MaHocPhi INT PRIMARY KEY);

        INSERT INTO @ChangedHocPhi (MaHocPhi)
        SELECT DISTINCT MaHocPhi FROM inserted
        UNION
        SELECT DISTINCT MaHocPhi FROM deleted;

        DECLARE @PaymentSummary TABLE (
            MaHocPhi INT PRIMARY KEY,
            SoTienDaThanhToan DECIMAL(14,2)
        );

        -- Chỉ tính tổng tiền các giao dịch DA_XAC_NHAN
        INSERT INTO @PaymentSummary (MaHocPhi, SoTienDaThanhToan)
        SELECT
            hp.MaHocPhi,
            ISNULL(SUM(CASE WHEN ct.TrangThai = 'DA_XAC_NHAN' THEN ct.SoTien ELSE 0 END), 0) AS SoTienDaThanhToan
        FROM @ChangedHocPhi ch
        INNER JOIN dbo.HOCPHI hp
            ON hp.MaHocPhi = ch.MaHocPhi
        LEFT JOIN dbo.CHITIETTHANHTOAN ct
            ON ct.MaHocPhi = hp.MaHocPhi
        GROUP BY hp.MaHocPhi;

        -- Cập nhật HOCPHI
        UPDATE hp
        SET
            hp.SoTienDaThanhToan = ps.SoTienDaThanhToan,
            hp.TrangThai =
                CASE
                    WHEN ps.SoTienDaThanhToan = 0 THEN 'UNPAID'
                    WHEN ps.SoTienDaThanhToan < hp.TongTien THEN 'PARTIAL'
                    ELSE 'PAID'
                END,
            hp.NgayCapNhat = SYSUTCDATETIME()
        FROM dbo.HOCPHI hp
        INNER JOIN @PaymentSummary ps
            ON ps.MaHocPhi = hp.MaHocPhi;

        -- Kiểm tra số tiền vượt quá tổng học phí
        IF EXISTS
        (
            SELECT 1
            FROM @PaymentSummary ps
            INNER JOIN dbo.HOCPHI hp
                ON hp.MaHocPhi = ps.MaHocPhi
            WHERE ps.SoTienDaThanhToan > hp.TongTien
        )
        BEGIN
            THROW 51006, N'Tổng số tiền thanh toán không được vượt quá tổng học phí.', 1;
        END
    END;
  `);
  console.log('-> Đã cập nhật Trigger thành công.');

  // 5. Tạo Stored Procedure SP_XacNhanThanhToan
  console.log('3. Tạo SP_XacNhanThanhToan...');
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE dbo.SP_XacNhanThanhToan
        @MaThanhToan BIGINT,
        @MaTaiKhoanXacNhan INT
    AS
    BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;

        BEGIN TRANSACTION;
        BEGIN TRY
            -- 1. Kiểm tra giao dịch tồn tại
            DECLARE @CurrentStatus VARCHAR(20);
            DECLARE @MaHocPhi INT;
            DECLARE @SoTien DECIMAL(18, 2);

            SELECT 
                @CurrentStatus = TrangThai,
                @MaHocPhi = MaHocPhi,
                @SoTien = SoTien
            FROM dbo.CHITIETTHANHTOAN WITH (UPDLOCK, ROWLOCK)
            WHERE MaThanhToan = @MaThanhToan;

            IF @CurrentStatus IS NULL
            BEGIN
                THROW 51401, N'Giao dịch thanh toán không tồn tại.', 1;
            END;

            -- 2. Kiểm tra trạng thái hiện tại
            IF @CurrentStatus = 'DA_XAC_NHAN'
            BEGIN
                THROW 51402, N'Giao dịch đã được xác nhận trước đó.', 1;
            END;

            IF @CurrentStatus = 'TU_CHOI'
            BEGIN
                THROW 51403, N'Không thể xác nhận giao dịch đã bị từ chối.', 1;
            END;

            IF @CurrentStatus <> 'CHO_XAC_NHAN'
            BEGIN
                THROW 51405, N'Chỉ có thể xác nhận giao dịch đang ở trạng thái chờ xác nhận.', 1;
            END;

            -- 3. Kiểm tra quyền tài khoản
            DECLARE @VaiTro VARCHAR(20);
            DECLARE @TrangThaiTK VARCHAR(20);

            SELECT 
                @VaiTro = VaiTro,
                @TrangThaiTK = TrangThai
            FROM dbo.TAIKHOAN
            WHERE MaTaiKhoan = @MaTaiKhoanXacNhan;

            IF @VaiTro IS NULL OR @TrangThaiTK <> 'ACTIVE' OR @VaiTro NOT IN ('DAO_TAO', 'QUAN_TRI')
            BEGIN
                THROW 51404, N'Tài khoản không có quyền xác nhận thanh toán.', 1;
            END;

            -- 4. Cập nhật DA_XAC_NHAN (Kích hoạt Trigger cập nhật HOCPHI)
            UPDATE dbo.CHITIETTHANHTOAN
            SET 
                TrangThai = 'DA_XAC_NHAN',
                MaTaiKhoanXacNhan = @MaTaiKhoanXacNhan,
                NgayXacNhan = SYSUTCDATETIME()
            WHERE MaThanhToan = @MaThanhToan;

            COMMIT TRANSACTION;

            -- Trả về dữ liệu chi tiết
            SELECT 
                ct.MaThanhToan,
                ct.MaHocPhi,
                ct.SoTien,
                ct.PhuongThuc,
                ct.TrangThai AS TrangThaiThanhToan,
                ct.NgayThanhToan,
                ct.MaTaiKhoanXacNhan,
                ct.NgayXacNhan,
                hp.MaSV,
                hp.TongTien,
                hp.SoTienDaThanhToan,
                (hp.TongTien - hp.SoTienDaThanhToan) AS SoTienConLai,
                hp.TrangThai AS TrangThaiHocPhi
            FROM dbo.CHITIETTHANHTOAN ct
            INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi = hp.MaHocPhi
            WHERE ct.MaThanhToan = @MaThanhToan;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END;
  `);
  console.log('-> Đã tạo SP_XacNhanThanhToan thành công.');

  // 6. Tạo Stored Procedure SP_TuChoiThanhToan
  console.log('4. Tạo SP_TuChoiThanhToan...');
  await pool.request().query(`
    CREATE OR ALTER PROCEDURE dbo.SP_TuChoiThanhToan
        @MaThanhToan BIGINT,
        @MaTaiKhoanXacNhan INT
    AS
    BEGIN
        SET NOCOUNT ON;
        SET XACT_ABORT ON;

        BEGIN TRANSACTION;
        BEGIN TRY
            -- 1. Kiểm tra giao dịch tồn tại
            DECLARE @CurrentStatus VARCHAR(20);

            SELECT 
                @CurrentStatus = TrangThai
            FROM dbo.CHITIETTHANHTOAN WITH (UPDLOCK, ROWLOCK)
            WHERE MaThanhToan = @MaThanhToan;

            IF @CurrentStatus IS NULL
            BEGIN
                THROW 51401, N'Giao dịch thanh toán không tồn tại.', 1;
            END;

            -- 2. Kiểm tra trạng thái hiện tại
            IF @CurrentStatus <> 'CHO_XAC_NHAN'
            BEGIN
                THROW 51405, N'Chỉ có thể từ chối giao dịch đang ở trạng thái chờ xác nhận.', 1;
            END;

            -- 3. Kiểm tra quyền tài khoản
            DECLARE @VaiTro VARCHAR(20);
            DECLARE @TrangThaiTK VARCHAR(20);

            SELECT 
                @VaiTro = VaiTro,
                @TrangThaiTK = TrangThai
            FROM dbo.TAIKHOAN
            WHERE MaTaiKhoan = @MaTaiKhoanXacNhan;

            IF @VaiTro IS NULL OR @TrangThaiTK <> 'ACTIVE' OR @VaiTro NOT IN ('DAO_TAO', 'QUAN_TRI')
            BEGIN
                THROW 51404, N'Tài khoản không có quyền từ chối thanh toán.', 1;
            END;

            -- 4. Cập nhật TU_CHOI
            UPDATE dbo.CHITIETTHANHTOAN
            SET 
                TrangThai = 'TU_CHOI',
                MaTaiKhoanXacNhan = @MaTaiKhoanXacNhan,
                NgayXacNhan = SYSUTCDATETIME()
            WHERE MaThanhToan = @MaThanhToan;

            COMMIT TRANSACTION;

            SELECT 
                ct.MaThanhToan,
                ct.MaHocPhi,
                ct.SoTien,
                ct.PhuongThuc,
                ct.TrangThai AS TrangThaiThanhToan,
                ct.NgayThanhToan,
                ct.MaTaiKhoanXacNhan,
                ct.NgayXacNhan,
                hp.MaSV,
                hp.TongTien,
                hp.SoTienDaThanhToan,
                (hp.TongTien - hp.SoTienDaThanhToan) AS SoTienConLai,
                hp.TrangThai AS TrangThaiHocPhi
            FROM dbo.CHITIETTHANHTOAN ct
            INNER JOIN dbo.HOCPHI hp ON ct.MaHocPhi = hp.MaHocPhi
            WHERE ct.MaThanhToan = @MaThanhToan;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END;
  `);
  console.log('-> Đã tạo SP_TuChoiThanhToan thành công.');

  console.log('--- HOÀN THÀNH MIGRATION THÀNH CÔNG ---');
  process.exit(0);
}

migratePaymentConfirmation().catch(err => {
  console.error('LỖI MIGRATION:', err);
  process.exit(1);
});

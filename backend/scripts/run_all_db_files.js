const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '../../');
const dbDir = path.join(rootDir, 'DB');

console.log('🚀 Bắt đầu quy trình chạy lại toàn bộ CSDL từng file...');

// 1. Reset database về trạng thái mới
console.log('🔄 Đang reset CSDL DBMS330284 về trạng thái sạch...');
try {
  execSync('sqlcmd -S localhost -E -d master -Q "IF DB_ID(\'DBMS330284\') IS NOT NULL BEGIN ALTER DATABASE [DBMS330284] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [DBMS330284]; END"', { stdio: 'inherit' });
  console.log('✅ Đã drop database cũ.');
} catch (err) {
  console.error('❌ Lỗi khi drop database:', err.message);
  process.exit(1);
}

const files = [
  '01_CreateDatabase.md',
  '02_CreateTables.md',
  '03_Constraints.md',
  '04_SeedData.sql',
  '05_Triggers.md',
  '06_Views.md',
  '07_Functions.md',
  '08_StoredProcedures.md',
  '09_Indexes.md',
  '10_Transactions.md',
  '11_Security.md',
  '12_Concurrency.md',
  '13_Test_Integration.md'
];

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const filePath = path.join(dbDir, file);
  console.log(`\n▶️  [${i + 1}/${files.length}] Đang chạy file: ${file}...`);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File không tồn tại: ${filePath}`);
    process.exit(1);
  }

  // Nếu vừa tạo DB ở file 01, cần bảo đảm dbms_user được map vào DB
  if (i === 1) {
    try {
      execSync('sqlcmd -S localhost -E -d DBMS330284 -Q "IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = \'dbms_user\') BEGIN CREATE USER dbms_user FOR LOGIN dbms_user; ALTER ROLE db_owner ADD MEMBER dbms_user; END"', { stdio: 'pipe' });
      console.log('   (Đã map dbms_user với quyền db_owner trong DBMS330284)');
    } catch (e) {
      console.warn('   (Lưu ý map dbms_user:', e.message, ')');
    }
  }

  try {
    const dbArg = (i === 0) ? '-d master' : '-d DBMS330284';
    const cmd = `sqlcmd -S localhost -E ${dbArg} -f 65001 -i "${filePath}" -b`;
    const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
    console.log(`✅ File ${file} chạy THÀNH CÔNG.`);
    if (file === '13_Test_Integration.md') {
      console.log('--- KẾT QUẢ INTEGRATION TEST ---');
      console.log(output.split('\n').filter(line => line.includes('PASS')).join('\n'));
    }
  } catch (err) {
    console.error(`❌ LỖI tại file ${file}:`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

console.log('\n🎉 TẤT CẢ 13 FILE ĐÃ CHẠY HOÀN TẤT VÀ KHÔNG CÓ BẤT KỲ LỖI NÀO!');

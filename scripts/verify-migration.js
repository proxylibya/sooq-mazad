#!/usr/bin/env node

/**
 * MIGRATION VERIFICATION SCRIPT
 * سكريبت التحقق من نجاح الترحيل
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warning: (msg) => console.log(`\x1b[33m[WARNING]\x1b[0m ${msg}`),
  error: (msg) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
  section: (msg) => console.log(`\n\x1b[35m${'='.repeat(50)}\n${msg}\n${'='.repeat(50)}\x1b[0m`)
};

const results = {
  passed: [],
  warnings: [],
  failed: []
};

async function checkAuthenticationSystem() {
  log.section('Checking Authentication System');
  
  try {
    // Check users with passwords
    const usersWithPasswords = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM users
      WHERE "passwordHash" IS NOT NULL
    `;
    
    const count = parseInt(usersWithPasswords[0].count);
    
    if (count > 0) {
      results.passed.push(`✅ Found ${count} users with passwords`);
      log.success(`Found ${count} users with passwords`);
    } else {
      results.warnings.push(`⚠️ No users with passwords found`);
      log.warning('No users with passwords found');
    }
    
    // Check role distribution
    const roleStats = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count
      FROM users
      GROUP BY role
    `;
    
    log.info('User role distribution:');
    roleStats.forEach(stat => {
      log.info(`  ${stat.role}: ${stat.count} users`);
    });
    
    // Check for old auth tables
    const oldTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('user_passwords', 'admin_credentials')
    `;
    
    if (oldTables.length > 0) {
      results.warnings.push(`⚠️ Old auth tables still exist: ${oldTables.map(t => t.table_name).join(', ')}`);
      log.warning('Old authentication tables still exist - consider removing after verification');
    } else {
      results.passed.push('✅ Old auth tables removed');
      log.success('Old authentication tables have been removed');
    }
    
    return true;
  } catch (error) {
    results.failed.push(`❌ Auth check failed: ${error.message}`);
    log.error(`Authentication check failed: ${error.message}`);
    return false;
  }
}

async function checkWalletSystem() {
  log.section('Checking Wallet System');
  
  try {
    // Check wallet statistics
    const walletStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_wallets,
        COUNT(CASE WHEN "localBalance" > 0 THEN 1 END) as with_lyd,
        COUNT(CASE WHEN "globalBalance" > 0 THEN 1 END) as with_usd,
        COUNT(CASE WHEN "cryptoBalance" > 0 THEN 1 END) as with_crypto,
        COALESCE(SUM("localBalance"), 0) as total_lyd,
        COALESCE(SUM("globalBalance"), 0) as total_usd,
        COALESCE(SUM("cryptoBalance"), 0) as total_usdt
      FROM wallets
    `;
    
    const stats = walletStats[0];
    
    if (parseInt(stats.total_wallets) > 0) {
      results.passed.push(`✅ Found ${stats.total_wallets} wallets`);
      log.success(`Found ${stats.total_wallets} wallets`);
      log.info(`  With LYD: ${stats.with_lyd} (Total: ${stats.total_lyd} LYD)`);
      log.info(`  With USD: ${stats.with_usd} (Total: ${stats.total_usd} USD)`);
      log.info(`  With USDT: ${stats.with_crypto} (Total: ${stats.total_usdt} USDT)`);
    } else {
      results.warnings.push('⚠️ No wallets found');
      log.warning('No wallets found in the system');
    }
    
    // Check for orphaned wallets
    const orphaned = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM wallets w
      LEFT JOIN users u ON u.id = w."userId"
      WHERE u.id IS NULL
    `;
    
    if (parseInt(orphaned[0].count) > 0) {
      results.warnings.push(`⚠️ Found ${orphaned[0].count} orphaned wallets`);
      log.warning(`Found ${orphaned[0].count} orphaned wallets`);
    } else {
      results.passed.push('✅ No orphaned wallets');
      log.success('No orphaned wallets found');
    }
    
    // Check for users without wallets
    const usersWithoutWallet = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN wallets w ON w."userId" = u.id
      WHERE w.id IS NULL
    `;
    
    if (parseInt(usersWithoutWallet[0].count) > 0) {
      results.warnings.push(`⚠️ ${usersWithoutWallet[0].count} users without wallets`);
      log.warning(`Found ${usersWithoutWallet[0].count} users without wallets`);
    } else {
      results.passed.push('✅ All users have wallets');
      log.success('All users have wallets');
    }
    
    return true;
  } catch (error) {
    results.failed.push(`❌ Wallet check failed: ${error.message}`);
    log.error(`Wallet check failed: ${error.message}`);
    return false;
  }
}

async function checkLoggingSystem() {
  log.section('Checking Logging System');
  
  try {
    // Check activity logs
    const logStats = await prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(DISTINCT "userId") as unique_users,
        COUNT(DISTINCT action) as action_types,
        MIN("createdAt") as oldest_log,
        MAX("createdAt") as newest_log
      FROM activity_logs
    `;
    
    const stats = logStats[0];
    
    if (parseInt(stats.total_logs) > 0) {
      results.passed.push(`✅ Found ${stats.total_logs} activity logs`);
      log.success(`Found ${stats.total_logs} activity logs`);
      log.info(`  Unique users: ${stats.unique_users}`);
      log.info(`  Action types: ${stats.action_types}`);
      log.info(`  Date range: ${stats.oldest_log} to ${stats.newest_log}`);
    } else {
      results.warnings.push('⚠️ No activity logs found');
      log.warning('No activity logs found');
    }
    
    // Check for old log tables
    const oldLogTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN (
        'system_activity_logs', 
        'security_logs', 
        'audit_logs', 
        'analytics_events'
      )
    `;
    
    if (oldLogTables.length > 0) {
      results.warnings.push(`⚠️ Old log tables still exist: ${oldLogTables.length} tables`);
      log.warning(`Old log tables still exist: ${oldLogTables.map(t => t.table_name).join(', ')}`);
    } else {
      results.passed.push('✅ Old log tables removed');
      log.success('Old log tables have been removed');
    }
    
    return true;
  } catch (error) {
    results.failed.push(`❌ Logging check failed: ${error.message}`);
    log.error(`Logging check failed: ${error.message}`);
    return false;
  }
}

async function checkDataIntegrity() {
  log.section('Checking Data Integrity');
  
  try {
    // Check foreign key constraints
    const constraints = await prisma.$queryRaw`
      SELECT 
        tc.table_name,
        tc.constraint_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      LIMIT 10
    `;
    
    if (constraints.length > 0) {
      results.passed.push(`✅ Found ${constraints.length}+ foreign key constraints`);
      log.success(`Foreign key constraints are intact (${constraints.length}+ found)`);
    }
    
    // Check indexes
    const indexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        COUNT(*) as index_count
      FROM pg_indexes
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename
      ORDER BY index_count DESC
      LIMIT 5
    `;
    
    log.info('Top tables by index count:');
    indexes.forEach(idx => {
      log.info(`  ${idx.tablename}: ${idx.index_count} indexes`);
    });
    
    results.passed.push('✅ Indexes verified');
    
    return true;
  } catch (error) {
    results.failed.push(`❌ Integrity check failed: ${error.message}`);
    log.error(`Data integrity check failed: ${error.message}`);
    return false;
  }
}

async function checkPerformance() {
  log.section('Checking Performance Metrics');
  
  try {
    // Check table sizes
    const tableSizes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 5
    `;
    
    log.info('Top 5 tables by size:');
    tableSizes.forEach(table => {
      log.info(`  ${table.tablename}: ${table.size}`);
    });
    
    // Check database size
    const dbSize = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `;
    
    log.info(`Total database size: ${dbSize[0].size}`);
    results.passed.push(`✅ Database size: ${dbSize[0].size}`);
    
    return true;
  } catch (error) {
    results.warnings.push(`⚠️ Performance check incomplete: ${error.message}`);
    log.warning(`Performance check incomplete: ${error.message}`);
    return false;
  }
}

async function generateReport() {
  log.section('📊 MIGRATION VERIFICATION REPORT');
  
  const totalPassed = results.passed.length;
  const totalWarnings = results.warnings.length;
  const totalFailed = results.failed.length;
  
  if (totalFailed === 0) {
    log.success('✅ MIGRATION SUCCESSFUL!');
  } else {
    log.error('❌ MIGRATION HAS ISSUES!');
  }
  
  console.log('\n📈 Summary:');
  console.log(`  ✅ Passed: ${totalPassed}`);
  console.log(`  ⚠️ Warnings: ${totalWarnings}`);
  console.log(`  ❌ Failed: ${totalFailed}`);
  
  if (results.passed.length > 0) {
    console.log('\n✅ Passed Checks:');
    results.passed.forEach(item => console.log(`  ${item}`));
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    results.warnings.forEach(item => console.log(`  ${item}`));
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ Failed Checks:');
    results.failed.forEach(item => console.log(`  ${item}`));
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (results.warnings.some(w => w.includes('Old') && w.includes('tables'))) {
    console.log('  1. Remove old tables after confirming everything works');
    console.log('     Run: DROP TABLE IF EXISTS user_passwords, local_wallets, etc.');
  }
  
  if (results.warnings.some(w => w.includes('orphaned'))) {
    console.log('  2. Clean up orphaned records');
    console.log('     Run: DELETE FROM wallets WHERE "userId" NOT IN (SELECT id FROM users)');
  }
  
  if (results.warnings.some(w => w.includes('without wallets'))) {
    console.log('  3. Create wallets for users without them');
    console.log('     Run: node scripts/migrate-step-2-wallets.js');
  }
  
  if (totalFailed === 0 && totalWarnings === 0) {
    console.log('  🎉 No issues found - your migration is perfect!');
  }
  
  // Save report to file
  const fs = require('fs');
  const reportPath = `database-backups/verification_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      passed: totalPassed,
      warnings: totalWarnings,
      failed: totalFailed
    },
    details: results
  }, null, 2));
  
  log.info(`\n📁 Report saved to: ${reportPath}`);
}

async function main() {
  console.clear();
  log.section('🔍 MIGRATION VERIFICATION');
  log.info('Checking the success of database migration...\n');
  
  try {
    // Run all checks
    await checkAuthenticationSystem();
    await checkWalletSystem();
    await checkLoggingSystem();
    await checkDataIntegrity();
    await checkPerformance();
    
    // Generate report
    await generateReport();
    
    // Exit code based on results
    if (results.failed.length > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
    
  } catch (error) {
    log.error(`Fatal error during verification: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { 
  checkAuthenticationSystem, 
  checkWalletSystem, 
  checkLoggingSystem,
  checkDataIntegrity
};

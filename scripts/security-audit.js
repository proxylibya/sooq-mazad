#!/usr/bin/env node

/**
 * Enterprise Security Audit Script
 * Comprehensive security check for the entire project
 * Run: node scripts/security-audit.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bold: '\x1b[1m'
};

console.log(`${colors.cyan}${colors.bold}
╔══════════════════════════════════════════════════════════════╗
║                    🔒 Security Audit Tool                    ║
║                   SooqMazad Enterprise v2.0                  ║
╚══════════════════════════════════════════════════════════════╝
${colors.reset}`);

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  info: []
};

let filesScanned = 0;
let totalLines = 0;

// ============================================
// Security Patterns to Check
// ============================================

const securityPatterns = {
  // Critical: Exposed secrets
  exposedSecrets: {
    severity: 'critical',
    patterns: [
      /(?:api[_-]?key|apikey|api_secret|api[_-]?token)[\'"\s]*[:=][\'"\s]*[a-zA-Z0-9_\-]{20,}/gi,
      /(?:secret[_-]?key|secret|private[_-]?key)[\'"\s]*[:=][\'"\s]*[a-zA-Z0-9_\-]{20,}/gi,
      /(?:password|passwd|pwd)[\'"\s]*[:=][\'"\s]*[^\s\'\"]{8,}/gi,
      /(?:token|access[_-]?token|auth[_-]?token)[\'"\s]*[:=][\'"\s]*[a-zA-Z0-9_\-]{20,}/gi,
      /-----BEGIN (RSA |EC )?PRIVATE KEY-----/g,
      /mongodb:\/\/[^:]+:[^@]+@[^\/]+/g,
      /postgres:\/\/[^:]+:[^@]+@[^\/]+/g
    ],
    message: 'Exposed secret or credential detected'
  },

  // Critical: Client-side environment variables
  clientEnvVars: {
    severity: 'critical',
    patterns: [
      /process\.env\.(?!NEXT_PUBLIC_)[A-Z_]+/g
    ],
    fileFilter: ['*.tsx', '*.jsx', '*.ts', '*.js'],
    pathFilter: ['/pages/', '/components/', '/apps/web/', '/apps/admin/pages/'],
    message: 'Server-side environment variable exposed to client'
  },

  // High: SQL Injection risks
  sqlInjection: {
    severity: 'high',
    patterns: [
      /query\s*\(\s*['"`].*\$\{.*\}.*['"`]/g,
      /query\s*\(\s*['"`].*\+.*['"`]/g,
      /execute\s*\(\s*['"`].*\$\{.*\}.*['"`]/g,
      /raw\s*\(\s*['"`].*\$\{.*\}.*['"`]/g
    ],
    message: 'Potential SQL injection vulnerability'
  },

  // High: XSS vulnerabilities
  xssVulnerabilities: {
    severity: 'high',
    patterns: [
      /dangerouslySetInnerHTML/g,
      /innerHTML\s*=/g,
      /document\.write/g,
      /eval\s*\(/g,
      /new\s+Function\s*\(/g
    ],
    message: 'Potential XSS vulnerability'
  },

  // High: Insecure random
  insecureRandom: {
    severity: 'high',
    patterns: [
      /Math\.random\(\).*(?:password|token|secret|key|salt)/gi
    ],
    message: 'Insecure random number generation for sensitive data'
  },

  // Medium: Missing authentication checks
  missingAuth: {
    severity: 'medium',
    patterns: [
      /\/api\/.*\.(?:post|put|delete|patch)\s*\(\s*async\s*\([^)]*\)\s*=>\s*\{(?:(?!requireAuth|authenticate|verifyToken|isAuthenticated).)*?\}/gs
    ],
    fileFilter: ['*.ts', '*.js'],
    pathFilter: ['/api/', '/pages/api/'],
    message: 'API endpoint might be missing authentication'
  },

  // Medium: Console logs in production
  consoleLogs: {
    severity: 'medium',
    patterns: [
      /console\.(log|info|warn|error|debug|trace)/g
    ],
    fileFilter: ['*.ts', '*.tsx', '*.js', '*.jsx'],
    excludePaths: ['/test/', '/__tests__/', '/scripts/', '.test.', '.spec.'],
    message: 'Console log found (remove for production)'
  },

  // Medium: TypeScript any types
  anyTypes: {
    severity: 'low',
    patterns: [
      /:\s*any(?:\s|,|\)|$)/g,
      /<any>/g,
      /as\s+any/g
    ],
    fileFilter: ['*.ts', '*.tsx'],
    message: 'TypeScript "any" type detected'
  },

  // Low: TODO/FIXME comments
  todoComments: {
    severity: 'info',
    patterns: [
      /\/\/\s*(?:TODO|FIXME|HACK|XXX|BUG):/gi,
      /\/\*\s*(?:TODO|FIXME|HACK|XXX|BUG):/gi
    ],
    message: 'TODO/FIXME comment found'
  }
};

// ============================================
// File Scanning
// ============================================

function scanFile(filePath) {
  filesScanned++;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  totalLines += lines.length;
  
  const relativePath = path.relative(process.cwd(), filePath);
  
  Object.entries(securityPatterns).forEach(([checkName, check]) => {
    // Apply file filters
    if (check.fileFilter) {
      const matchesFilter = check.fileFilter.some(filter => {
        const regex = new RegExp(filter.replace('*', '.*'));
        return regex.test(filePath);
      });
      if (!matchesFilter) return;
    }
    
    // Apply path filters
    if (check.pathFilter) {
      const matchesPath = check.pathFilter.some(filter => 
        filePath.includes(filter)
      );
      if (!matchesPath) return;
    }
    
    // Apply exclude paths
    if (check.excludePaths) {
      const shouldExclude = check.excludePaths.some(exclude => 
        filePath.includes(exclude)
      );
      if (shouldExclude) return;
    }
    
    // Check patterns
    check.patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Find line number
          let lineNumber = 1;
          let charCount = 0;
          const matchIndex = content.indexOf(match);
          
          for (let i = 0; i < lines.length; i++) {
            charCount += lines[i].length + 1;
            if (charCount >= matchIndex) {
              lineNumber = i + 1;
              break;
            }
          }
          
          // Don't report secrets in .env.example files
          if (checkName === 'exposedSecrets' && filePath.includes('.env.example')) {
            return;
          }
          
          const issue = {
            file: relativePath,
            line: lineNumber,
            message: check.message,
            match: match.substring(0, 100) + (match.length > 100 ? '...' : ''),
            checkName
          };
          
          issues[check.severity].push(issue);
        });
      }
    });
  });
}

// ============================================
// Check for Security Files
// ============================================

function checkSecurityFiles() {
  const requiredFiles = [
    { path: '.env.example', message: 'Missing .env.example file' },
    { path: '.gitignore', message: 'Missing .gitignore file' },
    { path: 'middleware.ts', message: 'Missing middleware.ts (auth protection)' }
  ];
  
  const recommendedFiles = [
    { path: 'SECURITY.md', message: 'Consider adding SECURITY.md' },
    { path: '.github/workflows/security.yml', message: 'Consider adding security workflow' },
    { path: 'docker-compose.yml', message: 'Consider using Docker for consistency' }
  ];
  
  console.log(`\n${colors.blue}📁 Checking security files...${colors.reset}`);
  
  requiredFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file.path));
    if (!exists) {
      issues.high.push({
        file: file.path,
        message: file.message,
        checkName: 'missingSecurityFile'
      });
    }
  });
  
  recommendedFiles.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file.path));
    if (!exists) {
      issues.info.push({
        file: file.path,
        message: file.message,
        checkName: 'recommendedFile'
      });
    }
  });
}

// ============================================
// Check Dependencies
// ============================================

function checkDependencies() {
  console.log(`\n${colors.blue}📦 Checking dependencies...${colors.reset}`);
  
  const packageFiles = glob.sync('**/package.json', {
    ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
  });
  
  packageFiles.forEach(packageFile => {
    const packageJson = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    
    // Check for known vulnerable packages
    const vulnerablePackages = [
      'request', // deprecated
      'node-uuid', // renamed to uuid
      'jade', // renamed to pug
    ];
    
    vulnerablePackages.forEach(pkg => {
      if (allDeps[pkg]) {
        issues.medium.push({
          file: path.relative(process.cwd(), packageFile),
          message: `Deprecated/vulnerable package: ${pkg}`,
          checkName: 'vulnerablePackage'
        });
      }
    });
    
    // Check for missing security packages
    const securityPackages = [
      'helmet',
      'cors',
      'express-rate-limit',
      'bcryptjs',
      'jsonwebtoken'
    ];
    
    const isApiProject = packageFile.includes('apps/api') || 
                         packageFile.includes('services/');
    
    if (isApiProject) {
      securityPackages.forEach(pkg => {
        if (!allDeps[pkg] && !packageFile.includes('web') && !packageFile.includes('admin')) {
          issues.medium.push({
            file: path.relative(process.cwd(), packageFile),
            message: `Missing security package: ${pkg}`,
            checkName: 'missingSecurityPackage'
          });
        }
      });
    }
  });
}

// ============================================
// Check Environment Variables
// ============================================

function checkEnvironmentVariables() {
  console.log(`\n${colors.blue}🔐 Checking environment variables...${colors.reset}`);
  
  // Check if .env files are in gitignore
  if (fs.existsSync('.gitignore')) {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (!gitignore.includes('.env') || !gitignore.includes('*.env')) {
      issues.critical.push({
        file: '.gitignore',
        message: '.env files not properly ignored in git',
        checkName: 'envNotIgnored'
      });
    }
  }
  
  // Check for .env files that shouldn't exist in repo
  const envFiles = glob.sync('**/.env', {
    ignore: ['**/node_modules/**']
  });
  
  envFiles.forEach(envFile => {
    if (!envFile.includes('.env.example')) {
      issues.critical.push({
        file: path.relative(process.cwd(), envFile),
        message: 'Environment file should not be in repository',
        checkName: 'envInRepo'
      });
    }
  });
}

// ============================================
// Main Execution
// ============================================

console.log(`${colors.blue}🔍 Starting security audit...${colors.reset}`);

// Get all source files
const sourceFiles = glob.sync('**/*.{js,jsx,ts,tsx}', {
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/public/**',
    '**/*.min.js'
  ]
});

// Scan each file
console.log(`\n${colors.blue}📝 Scanning ${sourceFiles.length} files...${colors.reset}`);
const startTime = Date.now();

sourceFiles.forEach(file => {
  scanFile(file);
  // Show progress
  if (filesScanned % 100 === 0) {
    process.stdout.write(`\r  Scanned ${filesScanned}/${sourceFiles.length} files...`);
  }
});

process.stdout.write(`\r  Scanned ${filesScanned}/${sourceFiles.length} files... Done!\n`);

// Run additional checks
checkSecurityFiles();
checkDependencies();
checkEnvironmentVariables();

// ============================================
// Report Results
// ============================================

const endTime = Date.now();
const duration = ((endTime - startTime) / 1000).toFixed(2);

console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
console.log(`${colors.bold}📊 AUDIT SUMMARY${colors.reset}`);
console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);

console.log(`
Files scanned: ${filesScanned}
Lines analyzed: ${totalLines.toLocaleString()}
Time taken: ${duration}s
`);

// Count issues
const totalIssues = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);

if (totalIssues === 0) {
  console.log(`${colors.green}${colors.bold}✅ No security issues found! Excellent!${colors.reset}`);
} else {
  // Display issues by severity
  if (issues.critical.length > 0) {
    console.log(`\n${colors.red}${colors.bold}🚨 CRITICAL ISSUES (${issues.critical.length})${colors.reset}`);
    issues.critical.forEach((issue, i) => {
      console.log(`${colors.red}  ${i + 1}. ${issue.file}${issue.line ? ':' + issue.line : ''}`);
      console.log(`     ${issue.message}${colors.reset}`);
      if (issue.match) {
        console.log(`     Found: "${issue.match}"`);
      }
    });
  }
  
  if (issues.high.length > 0) {
    console.log(`\n${colors.red}⚠️  HIGH SEVERITY ISSUES (${issues.high.length})${colors.reset}`);
    issues.high.forEach((issue, i) => {
      console.log(`${colors.red}  ${i + 1}. ${issue.file}${issue.line ? ':' + issue.line : ''}`);
      console.log(`     ${issue.message}${colors.reset}`);
    });
  }
  
  if (issues.medium.length > 0) {
    console.log(`\n${colors.yellow}⚠️  MEDIUM SEVERITY ISSUES (${issues.medium.length})${colors.reset}`);
    const showMax = 10;
    issues.medium.slice(0, showMax).forEach((issue, i) => {
      console.log(`${colors.yellow}  ${i + 1}. ${issue.file}${issue.line ? ':' + issue.line : ''}`);
      console.log(`     ${issue.message}${colors.reset}`);
    });
    if (issues.medium.length > showMax) {
      console.log(`${colors.yellow}  ... and ${issues.medium.length - showMax} more${colors.reset}`);
    }
  }
  
  if (issues.low.length > 0) {
    console.log(`\n${colors.blue}ℹ️  LOW SEVERITY ISSUES (${issues.low.length})${colors.reset}`);
    console.log(`  ${issues.low.length} low priority issues found (run with --verbose to see all)`);
  }
  
  if (issues.info.length > 0) {
    console.log(`\n${colors.cyan}ℹ️  INFORMATIONAL (${issues.info.length})${colors.reset}`);
    console.log(`  ${issues.info.length} informational items found`);
  }
}

// ============================================
// Summary and Recommendations
// ============================================

console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
console.log(`${colors.bold}📋 RECOMMENDATIONS${colors.reset}`);
console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}`);

const recommendations = [];

if (issues.critical.length > 0) {
  recommendations.push('🚨 Fix all CRITICAL issues immediately before deployment');
}

if (issues.high.length > 0) {
  recommendations.push('⚠️  Address HIGH severity issues as soon as possible');
}

if (issues.medium.filter(i => i.checkName === 'consoleLogs').length > 10) {
  recommendations.push('🧹 Remove console.log statements before production');
}

if (issues.low.filter(i => i.checkName === 'anyTypes').length > 20) {
  recommendations.push('📝 Consider adding proper TypeScript types instead of "any"');
}

// General recommendations
recommendations.push('🔒 Run npm audit regularly to check for vulnerabilities');
recommendations.push('📦 Keep dependencies up to date');
recommendations.push('🛡️ Implement rate limiting on all API endpoints');
recommendations.push('🔐 Use environment variables for all sensitive configuration');
recommendations.push('📝 Document security practices in SECURITY.md');

recommendations.forEach(rec => {
  console.log(`  • ${rec}`);
});

// ============================================
// Exit Code
// ============================================

console.log(`\n${colors.cyan}${'═'.repeat(60)}${colors.reset}`);

if (issues.critical.length > 0) {
  console.log(`${colors.red}${colors.bold}❌ Audit failed with critical issues${colors.reset}`);
  process.exit(1);
} else if (issues.high.length > 0) {
  console.log(`${colors.yellow}${colors.bold}⚠️  Audit completed with warnings${colors.reset}`);
  process.exit(0);
} else {
  console.log(`${colors.green}${colors.bold}✅ Audit passed successfully${colors.reset}`);
  process.exit(0);
}

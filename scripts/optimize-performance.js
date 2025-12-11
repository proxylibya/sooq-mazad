/**
 * Enterprise Performance Optimization Script
 * سكريبت تحسين الأداء المتقدم
 *
 * يقوم بـ:
 * 1. تحليل الصور وتقديم توصيات
 * 2. اكتشاف المكونات القابلة للـ Lazy Loading
 * 3. تحليل حجم البندلات
 * 4. تقديم توصيات التحسين
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('   Enterprise Performance Optimization  ');
console.log('========================================\n');

const projectRoot = path.join(__dirname, '..');
const results = {
  timestamp: new Date().toISOString(),
  images: { total: 0, needsOptimization: [], webpCandidates: [] },
  components: { total: 0, lazyLoadCandidates: [] },
  bundles: { estimated: 0 },
  recommendations: [],
  score: 100,
};

// ============================================
// Image Analysis
// ============================================

console.log('1. Analyzing Images...');

function analyzeImages(dir) {
  var images = [];
  var extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'];
  var webpExtensions = ['.webp', '.avif'];

  function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    try {
      var files = fs.readdirSync(currentDir);
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = path.join(currentDir, file);
        var stat = fs.statSync(filePath);

        if (stat.isDirectory() && file.indexOf('node_modules') === -1) {
          walkDir(filePath);
        } else {
          var ext = path.extname(file).toLowerCase();
          if (extensions.indexOf(ext) !== -1) {
            images.push({
              path: path.relative(projectRoot, filePath),
              size: stat.size,
              sizeKB: Math.round(stat.size / 1024),
              extension: ext,
              needsWebP: true,
            });
          } else if (webpExtensions.indexOf(ext) !== -1) {
            images.push({
              path: path.relative(projectRoot, filePath),
              size: stat.size,
              sizeKB: Math.round(stat.size / 1024),
              extension: ext,
              needsWebP: false,
            });
          }
        }
      }
    } catch (e) {}
  }

  walkDir(dir);
  return images;
}

var publicDir = path.join(projectRoot, 'public');
var images = analyzeImages(publicDir);
results.images.total = images.length;

// Find large images (>100KB)
var largeImages = images.filter(function (img) {
  return img.size > 100000;
});
results.images.needsOptimization = largeImages.map(function (img) {
  return img.path + ' (' + img.sizeKB + ' KB)';
});

// Find WebP candidates
var webpCandidates = images.filter(function (img) {
  return img.needsWebP;
});
results.images.webpCandidates = webpCandidates.length;

console.log('   - Total Images: ' + images.length);
console.log('   - Need Compression (>100KB): ' + largeImages.length);
console.log('   - WebP Conversion Candidates: ' + webpCandidates.length);

if (largeImages.length > 10) {
  results.score -= 15;
  results.recommendations.push('Compress ' + largeImages.length + ' large images (>100KB)');
}

if (webpCandidates.length > 20) {
  results.score -= 10;
  results.recommendations.push('Convert ' + webpCandidates.length + ' images to WebP format');
}

// ============================================
// Component Analysis for Lazy Loading
// ============================================

console.log('\n2. Analyzing Components for Lazy Loading...');

function analyzeComponents(dir) {
  var components = [];

  function walkDir(currentDir) {
    if (!fs.existsSync(currentDir)) return;

    try {
      var files = fs.readdirSync(currentDir);
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var filePath = path.join(currentDir, file);
        var stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
          var content = fs.readFileSync(filePath, 'utf-8');
          var hasHeavyDeps =
            content.indexOf('recharts') !== -1 ||
            content.indexOf('chart.js') !== -1 ||
            content.indexOf('leaflet') !== -1 ||
            content.indexOf('mapbox') !== -1 ||
            content.indexOf('quill') !== -1 ||
            content.indexOf('draft-js') !== -1 ||
            content.indexOf('pdf') !== -1;

          if (stat.size > 15000 || hasHeavyDeps) {
            components.push({
              path: path.relative(projectRoot, filePath),
              size: stat.size,
              sizeKB: Math.round(stat.size / 1024),
              hasHeavyDeps: hasHeavyDeps,
              reason: hasHeavyDeps ? 'Heavy Dependencies' : 'Large File Size',
            });
          }
        }
      }
    } catch (e) {}
  }

  var componentsDirs = [
    path.join(projectRoot, 'components'),
    path.join(projectRoot, 'apps', 'web', 'components'),
  ];

  componentsDirs.forEach(function (dir) {
    if (fs.existsSync(dir)) {
      walkDir(dir);
    }
  });

  return components;
}

var lazyLoadCandidates = analyzeComponents(projectRoot);
results.components.total = lazyLoadCandidates.length;
results.components.lazyLoadCandidates = lazyLoadCandidates.map(function (c) {
  return {
    path: c.path,
    size: c.sizeKB + ' KB',
    reason: c.reason,
  };
});

console.log('   - Lazy Load Candidates: ' + lazyLoadCandidates.length);

if (lazyLoadCandidates.length > 5) {
  lazyLoadCandidates.slice(0, 5).forEach(function (c) {
    console.log('     - ' + c.path + ' (' + c.sizeKB + ' KB) - ' + c.reason);
  });
}

if (lazyLoadCandidates.length > 10) {
  results.score -= 10;
  results.recommendations.push(
    'Apply Lazy Loading to ' + lazyLoadCandidates.length + ' components',
  );
}

// ============================================
// Bundle Size Analysis
// ============================================

console.log('\n3. Analyzing Bundle Size...');

var nextDir = path.join(projectRoot, '.next');
var totalBundleSize = 0;

if (fs.existsSync(nextDir)) {
  function getBundleSize(dir) {
    var size = 0;
    try {
      var files = fs.readdirSync(dir);
      files.forEach(function (file) {
        var filePath = path.join(dir, file);
        var stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          size += getBundleSize(filePath);
        } else if (file.endsWith('.js')) {
          size += stat.size;
        }
      });
    } catch (e) {}
    return size;
  }

  totalBundleSize = getBundleSize(path.join(nextDir, 'static'));
}

results.bundles.estimated = Math.round(totalBundleSize / 1024);

console.log('   - Estimated Bundle Size: ' + results.bundles.estimated + ' KB');

if (results.bundles.estimated > 500) {
  results.score -= 15;
  results.recommendations.push(
    'Reduce bundle size (currently ' + results.bundles.estimated + ' KB)',
  );
}

// ============================================
// Additional Checks
// ============================================

console.log('\n4. Checking Configuration...');

// Check next.config.js for optimizations
var nextConfigPath = path.join(projectRoot, 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  var nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');

  var hasImageOptimization = nextConfig.indexOf('images') !== -1;
  var hasCompression = nextConfig.indexOf('compress') !== -1;
  var hasSWC = nextConfig.indexOf('swcMinify') !== -1;

  console.log('   - Image Optimization: ' + (hasImageOptimization ? 'Enabled' : 'Not configured'));
  console.log('   - Compression: ' + (hasCompression ? 'Enabled' : 'Not configured'));
  console.log('   - SWC Minify: ' + (hasSWC ? 'Enabled' : 'Not configured'));

  if (!hasSWC) {
    results.recommendations.push('Enable SWC minification in next.config.js');
  }
}

// ============================================
// Final Score & Recommendations
// ============================================

results.score = Math.max(0, results.score);

console.log('\n========================================');
console.log('Recommendations:');
console.log('========================================\n');

if (results.recommendations.length > 0) {
  results.recommendations.forEach(function (rec, i) {
    console.log(i + 1 + '. ' + rec);
  });
} else {
  console.log('- No critical recommendations - Performance is good!');
}

console.log('\n========================================');
console.log('Performance Score: ' + results.score + '/100');
console.log('========================================\n');

// ============================================
// Save Report
// ============================================

var reportPath = path.join(projectRoot, 'PERFORMANCE_OPTIMIZATION_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
console.log('Report saved to: ' + reportPath + '\n');

// ============================================
// Quick Wins Summary
// ============================================

console.log('========================================');
console.log('Quick Wins to Implement:');
console.log('========================================\n');

console.log('1. Add lazy loading to large components:');
console.log('   import dynamic from "next/dynamic";');
console.log('   const HeavyComponent = dynamic(() => import("./HeavyComponent"), {');
console.log('     loading: () => <Skeleton />,');
console.log('     ssr: false');
console.log('   });\n');

console.log('2. Convert images to WebP:');
console.log('   - Use Sharp library for batch conversion');
console.log('   - Or use online tools like squoosh.app\n');

console.log('3. Enable Image Optimization in next.config.js:');
console.log('   images: {');
console.log('     formats: ["image/avif", "image/webp"],');
console.log('     deviceSizes: [640, 750, 828, 1080, 1200],');
console.log('   }\n');

console.log('4. Use Intersection Observer for lazy loading:');
console.log('   import { LazyWrapper } from "@/lib/performance";\n');

console.log('Done!\n');

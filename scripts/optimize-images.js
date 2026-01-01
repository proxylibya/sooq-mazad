/**
 * Image Optimization Script
 * سكريبت تحسين الصور
 *
 * يقوم بـ:
 * 1. اكتشاف الصور الكبيرة
 * 2. تقديم أوامر التحويل إلى WebP
 * 3. إنشاء manifest للصور المحسنة
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('       Image Optimization Tool          ');
console.log('========================================\n');

const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

// ============================================
// Find All Images
// ============================================

function findImages(dir, extensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp']) {
  var images = [];

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
              path: filePath,
              relativePath: path.relative(projectRoot, filePath),
              name: file,
              size: stat.size,
              sizeKB: Math.round(stat.size / 1024),
              extension: ext,
            });
          }
        }
      }
    } catch (e) {}
  }

  walkDir(dir);
  return images;
}

var images = findImages(publicDir);
var largeImages = images.filter(function (img) {
  return img.size > 100000;
});
var veryLargeImages = images.filter(function (img) {
  return img.size > 500000;
});

// ============================================
// Statistics
// ============================================

var totalSize = images.reduce(function (sum, img) {
  return sum + img.size;
}, 0);
var potentialSavings = largeImages.reduce(function (sum, img) {
  return sum + Math.floor(img.size * 0.6); // Estimate 60% savings with WebP
}, 0);

console.log('Image Analysis Results:');
console.log('========================\n');
console.log('Total Images Found: ' + images.length);
console.log('Total Size: ' + Math.round(totalSize / 1024 / 1024) + ' MB');
console.log('\nImages by Size:');
console.log('  - Very Large (>500KB): ' + veryLargeImages.length);
console.log('  - Large (>100KB): ' + largeImages.length);
console.log('  - Small (<100KB): ' + (images.length - largeImages.length));
console.log(
  '\nPotential Savings with WebP: ~' + Math.round(potentialSavings / 1024 / 1024) + ' MB',
);

// ============================================
// Top 20 Largest Images
// ============================================

console.log('\n========================================');
console.log('Top 20 Largest Images:');
console.log('========================================\n');

var sortedImages = images.sort(function (a, b) {
  return b.size - a.size;
});
var top20 = sortedImages.slice(0, 20);

top20.forEach(function (img, i) {
  var sizeMB = (img.size / 1024 / 1024).toFixed(2);
  console.log(i + 1 + '. ' + img.relativePath);
  console.log('   Size: ' + sizeMB + ' MB | Extension: ' + img.extension);
});

// ============================================
// Image Categories
// ============================================

var categories = {};
images.forEach(function (img) {
  var dir = path.dirname(img.relativePath).split(path.sep)[1] || 'root';
  if (!categories[dir]) {
    categories[dir] = { count: 0, size: 0 };
  }
  categories[dir].count++;
  categories[dir].size += img.size;
});

console.log('\n========================================');
console.log('Images by Directory:');
console.log('========================================\n');

Object.keys(categories)
  .sort(function (a, b) {
    return categories[b].size - categories[a].size;
  })
  .forEach(function (dir) {
    var cat = categories[dir];
    console.log(dir + ': ' + cat.count + ' images (' + Math.round(cat.size / 1024 / 1024) + ' MB)');
  });

// ============================================
// Optimization Commands
// ============================================

console.log('\n========================================');
console.log('Optimization Commands:');
console.log('========================================\n');

console.log('To convert images to WebP format, install Sharp:');
console.log('  npm install sharp\n');

console.log('Then run this command to convert all PNG/JPG to WebP:');
console.log('  node -e "');
console.log("    const sharp = require('sharp');");
console.log("    const fs = require('fs');");
console.log("    const path = require('path');");
console.log('    ');
console.log('    async function convertToWebP(inputPath) {');
console.log("      const outputPath = inputPath.replace(/\\.(png|jpg|jpeg)$/i, '.webp');");
console.log('      await sharp(inputPath)');
console.log('        .webp({ quality: 80 })');
console.log('        .toFile(outputPath);');
console.log("      console.log('Converted:', inputPath);");
console.log('    }');
console.log('  "\n');

console.log('Or use online tools:');
console.log("  - squoosh.app (Google's image compressor)");
console.log('  - tinypng.com (PNG/JPEG compression)');
console.log('  - cloudconvert.com (Batch conversion)\n');

// ============================================
// Create Optimization Manifest
// ============================================

var manifest = {
  timestamp: new Date().toISOString(),
  statistics: {
    totalImages: images.length,
    totalSizeMB: Math.round(totalSize / 1024 / 1024),
    largeImages: largeImages.length,
    potentialSavingsMB: Math.round(potentialSavings / 1024 / 1024),
  },
  top20LargestImages: top20.map(function (img) {
    return {
      path: img.relativePath,
      sizeMB: (img.size / 1024 / 1024).toFixed(2),
      extension: img.extension,
    };
  }),
  byDirectory: categories,
  recommendations: [],
};

// Add recommendations
if (veryLargeImages.length > 0) {
  manifest.recommendations.push({
    priority: 'HIGH',
    message: 'Compress ' + veryLargeImages.length + ' very large images (>500KB)',
    impact: 'High - Significant performance improvement',
  });
}

if (largeImages.length > 20) {
  manifest.recommendations.push({
    priority: 'MEDIUM',
    message: 'Convert ' + largeImages.length + ' images to WebP format',
    impact: 'Medium - ~60% size reduction',
  });
}

var jpegImages = images.filter(function (img) {
  return img.extension === '.jpg' || img.extension === '.jpeg';
});
if (jpegImages.length > 50) {
  manifest.recommendations.push({
    priority: 'LOW',
    message: 'Consider progressive JPEG for ' + jpegImages.length + ' JPEG images',
    impact: 'Low - Better perceived loading',
  });
}

// Save manifest
var manifestPath = path.join(projectRoot, 'IMAGE_OPTIMIZATION_MANIFEST.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log('Manifest saved to: ' + manifestPath + '\n');

// ============================================
// Next Steps
// ============================================

console.log('========================================');
console.log('Next Steps:');
console.log('========================================\n');

console.log('1. Install Sharp for image processing:');
console.log('   npm install sharp --save-dev\n');

console.log('2. Use Next.js Image component:');
console.log('   import Image from "next/image";');
console.log('   <Image src="/image.jpg" width={800} height={600} />\n');

console.log('3. Enable WebP/AVIF in next.config.js:');
console.log('   images: {');
console.log('     formats: ["image/avif", "image/webp"]');
console.log('   }\n');

console.log('4. Use responsive images:');
console.log('   <Image sizes="(max-width: 768px) 100vw, 50vw" />\n');

console.log('Done!\n');

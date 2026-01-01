/**
 * Image Compression Script
 * سكريبت ضغط الصور
 *
 * ملاحظة: يتطلب تثبيت sharp
 * npm install sharp --save-dev
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('   IMAGE COMPRESSION TOOL');
console.log('   أداة ضغط الصور');
console.log('='.repeat(60) + '\n');

// Check if sharp is installed
let sharp;
try {
  sharp = require('sharp');
  console.log('Sharp library found. Ready to compress images.\n');
} catch (e) {
  console.log('Sharp library not found.\n');
  console.log('To enable automatic image compression, run:');
  console.log('  npm install sharp --save-dev\n');
  console.log('For now, here are manual optimization options:\n');

  // Show manual options
  console.log('='.repeat(60));
  console.log('Manual Image Optimization Options:');
  console.log('='.repeat(60) + '\n');

  console.log('1. Online Tools (Free):');
  console.log("   - squoosh.app (Google's tool, excellent quality)");
  console.log('   - tinypng.com (Great for PNG/JPEG)');
  console.log('   - imagecompressor.com');
  console.log('   - cloudconvert.com (Batch conversion)\n');

  console.log('2. Desktop Apps:');
  console.log('   - ImageOptim (Mac)');
  console.log('   - FileOptimizer (Windows)');
  console.log('   - GIMP (Cross-platform)\n');

  console.log('3. Command Line (if ImageMagick installed):');
  console.log('   convert input.png -quality 80 output.webp');
  console.log('   mogrify -format webp -quality 80 *.png\n');

  // Find large images to optimize
  const projectRoot = path.join(__dirname, '..');
  const publicDir = path.join(projectRoot, 'public');

  function findLargeImages(dir, threshold = 100000) {
    const images = [];

    function walk(currentDir) {
      if (!fs.existsSync(currentDir)) return;
      try {
        const files = fs.readdirSync(currentDir);
        files.forEach((file) => {
          const filePath = path.join(currentDir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory() && !file.includes('node_modules')) {
            walk(filePath);
          } else if (/\.(png|jpg|jpeg|gif|bmp)$/i.test(file)) {
            if (stat.size > threshold) {
              images.push({
                path: path.relative(projectRoot, filePath),
                size: stat.size,
                sizeKB: Math.round(stat.size / 1024),
                sizeMB: (stat.size / 1024 / 1024).toFixed(2),
              });
            }
          }
        });
      } catch (e) {}
    }

    walk(dir);
    return images.sort((a, b) => b.size - a.size);
  }

  const largeImages = findLargeImages(publicDir);

  console.log('='.repeat(60));
  console.log('Images Needing Optimization (' + largeImages.length + ' files):');
  console.log('='.repeat(60) + '\n');

  if (largeImages.length === 0) {
    console.log('No large images found. Great!\n');
  } else {
    // Group by directory
    const byDir = {};
    largeImages.forEach((img) => {
      const dir = path.dirname(img.path);
      if (!byDir[dir]) byDir[dir] = [];
      byDir[dir].push(img);
    });

    Object.entries(byDir).forEach(([dir, images]) => {
      console.log('\n' + dir + '/ (' + images.length + ' images):');
      images.slice(0, 5).forEach((img) => {
        const name = path.basename(img.path);
        console.log('  - ' + name + ' (' + img.sizeMB + ' MB)');
      });
      if (images.length > 5) {
        console.log('  ... and ' + (images.length - 5) + ' more');
      }
    });

    // Calculate potential savings
    const totalSize = largeImages.reduce((sum, img) => sum + img.size, 0);
    const potentialSavings = totalSize * 0.6; // Estimate 60% savings

    console.log('\n' + '='.repeat(60));
    console.log('Summary:');
    console.log('  - Total large images: ' + largeImages.length);
    console.log('  - Current total size: ' + (totalSize / 1024 / 1024).toFixed(2) + ' MB');
    console.log('  - Potential savings: ~' + (potentialSavings / 1024 / 1024).toFixed(2) + ' MB');
    console.log('='.repeat(60) + '\n');
  }

  process.exit(0);
}

// If sharp is available, proceed with compression
const projectRoot = path.join(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');

async function compressImage(inputPath, outputPath, options = {}) {
  const { quality = 80, format = 'webp' } = options;

  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    let pipeline = image;

    // Resize if too large
    if (metadata.width > 1920) {
      pipeline = pipeline.resize(1920, null, { withoutEnlargement: true });
    }

    // Convert to WebP
    if (format === 'webp') {
      pipeline = pipeline.webp({ quality });
    } else if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
    }

    await pipeline.toFile(outputPath);

    const inputStats = fs.statSync(inputPath);
    const outputStats = fs.statSync(outputPath);
    const savings = (((inputStats.size - outputStats.size) / inputStats.size) * 100).toFixed(1);

    return {
      success: true,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
      savings: savings + '%',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

async function processImages() {
  const imagesDir = path.join(publicDir, 'images');
  const uploadsDir = path.join(publicDir, 'uploads');

  const results = {
    processed: 0,
    success: 0,
    failed: 0,
    totalSaved: 0,
  };

  async function processDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await processDir(filePath);
      } else if (/\.(png|jpg|jpeg)$/i.test(file) && stat.size > 100000) {
        results.processed++;

        const webpPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

        console.log('Processing: ' + path.relative(projectRoot, filePath));

        const result = await compressImage(filePath, webpPath);

        if (result.success) {
          results.success++;
          results.totalSaved += result.inputSize - result.outputSize;
          console.log('  -> Saved: ' + result.savings);
        } else {
          results.failed++;
          console.log('  -> Error: ' + result.error);
        }
      }
    }
  }

  console.log('Starting image compression...\n');

  await processDir(imagesDir);
  await processDir(uploadsDir);

  console.log('\n' + '='.repeat(60));
  console.log('Compression Complete!');
  console.log('  - Processed: ' + results.processed);
  console.log('  - Success: ' + results.success);
  console.log('  - Failed: ' + results.failed);
  console.log('  - Total Saved: ' + (results.totalSaved / 1024 / 1024).toFixed(2) + ' MB');
  console.log('='.repeat(60) + '\n');

  console.log('Note: Original files are preserved. WebP versions created alongside.\n');
  console.log('To use WebP images in Next.js:');
  console.log('  import Image from "next/image";');
  console.log('  <Image src="/image.webp" alt="..." width={800} height={600} />\n');
}

processImages().catch(console.error);

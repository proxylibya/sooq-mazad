const fs = require('fs');
const path = require('path');

const files = [
  'apps/web/pages/transport/book.tsx',
  'apps/web/pages/transport/browse.tsx',
  'apps/web/pages/transport/calculator.tsx',
  'apps/web/pages/transport/confirmation.tsx',
  'apps/web/pages/transport/dashboard.tsx',
  'apps/web/pages/transport/edit/[id].tsx',
  'apps/web/pages/transport/edit-service/[id].tsx',
  'apps/web/pages/transport/my-bookings.tsx',
  'apps/web/pages/transport/request.tsx',
  'apps/web/pages/transport/setup-profile.tsx',
  'apps/web/pages/transport/track.tsx',
  'apps/web/pages/verify-phone.tsx',
];

let totalFixed = 0;

files.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⏭️  Skipped (not found): ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;
  
  const outlineIcons = [];
  const solidIcons = [];
  
  const lines = content.split('\n');
  const newLines = [];
  
  for (const line of lines) {
    const outlineMatch = line.match(/^import\s+(\w+)\s+from\s+['"]@heroicons\/react\/24\/outline\/\1['"]\s*;?\s*$/);
    const solidMatch = line.match(/^import\s+(\w+)\s+from\s+['"]@heroicons\/react\/24\/solid\/\1['"]\s*;?\s*$/);
    
    if (outlineMatch) {
      outlineIcons.push(outlineMatch[1]);
    } else if (solidMatch) {
      solidIcons.push(solidMatch[1]);
    } else {
      newLines.push(line);
    }
  }
  
  if (outlineIcons.length === 0 && solidIcons.length === 0) {
    console.log(`⏭️  Skipped (no heroicons): ${filePath}`);
    return;
  }
  
  const importStatements = [];
  
  if (outlineIcons.length > 0) {
    if (outlineIcons.length <= 3) {
      importStatements.push(`import { ${outlineIcons.join(', ')} } from '@heroicons/react/24/outline';`);
    } else {
      importStatements.push(`import {\n  ${outlineIcons.join(',\n  ')},\n} from '@heroicons/react/24/outline';`);
    }
  }
  
  if (solidIcons.length > 0) {
    if (solidIcons.length <= 3) {
      importStatements.push(`import { ${solidIcons.join(', ')} } from '@heroicons/react/24/solid';`);
    } else {
      importStatements.push(`import {\n  ${solidIcons.join(',\n  ')},\n} from '@heroicons/react/24/solid';`);
    }
  }
  
  const firstImportIndex = newLines.findIndex(line => line.trim().startsWith('import'));
  
  if (firstImportIndex !== -1) {
    newLines.splice(firstImportIndex, 0, ...importStatements);
  } else {
    newLines.unshift(...importStatements);
  }
  
  const newContent = newLines.join('\n');
  
  fs.writeFileSync(fullPath, newContent, 'utf8');
  console.log(`✅ Fixed: ${filePath} (${outlineIcons.length + solidIcons.length} icons)`);
  totalFixed++;
});

console.log(`\n✅ Total files fixed: ${totalFixed}/${files.length}`);

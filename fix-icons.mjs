import fs from 'fs';
import { glob } from 'glob';

const files = await glob('apps/web/**/*.{tsx,jsx,ts,js}', { 
  ignore: ['**/node_modules/**', '**/.next/**'] 
});

console.log(`Found ${files.length} files to check\n`);

let fixedCount = 0;

for (const filePath of files) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  const wrongImportPattern = /import\s+(\w+)\s+from\s+['"](@ heroicons\/react\/24\/(outline|solid))\/\1['"]\s*;?\s*\n?/g;
  
  if (!wrongImportPattern.test(content)) {
    continue;
  }
  
  const icons = { outline: [], solid: [] };
  const lines = content.split('\n');
  const newLines = [];
  let hasChanges = false;
  
  for (const line of lines) {
    const match = line.match(/^import\s+(\w+)\s+from\s+['"]@heroicons\/react\/24\/(outline|solid)\/\1['"]\s*;?\s*$/);
    
    if (match) {
      const iconName = match[1];
      const variant = match[2];
      icons[variant].push(iconName);
      hasChanges = true;
    } else {
      newLines.push(line);
    }
  }
  
  if (hasChanges) {
    const importLines = [];
    
    if (icons.outline.length > 0) {
      importLines.push(`import { ${icons.outline.join(', ')} } from '@heroicons/react/24/outline';`);
    }
    
    if (icons.solid.length > 0) {
      importLines.push(`import { ${icons.solid.join(', ')} } from '@heroicons/react/24/solid';`);
    }
    
    const firstNonHeroIconImport = newLines.findIndex(line => 
      line.startsWith('import') && !line.includes('@heroicons')
    );
    
    if (firstNonHeroIconImport !== -1) {
      newLines.splice(firstNonHeroIconImport, 0, ...importLines);
    } else {
      newLines.unshift(...importLines);
    }
    
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    console.log(`✓ Fixed: ${filePath} (${icons.outline.length + icons.solid.length} icons)`);
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);

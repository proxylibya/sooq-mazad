const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('apps/web/**/*.{ts,tsx,js,jsx}', { ignore: 'node_modules/**' });

let fixedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  const iconImportRegex = /import\s+(\w+)\s+from\s+['"]@heroicons\/react\/24\/(outline|solid)\/\1['"]\s*;?\s*/g;
  
  const imports = new Map();
  let match;
  
  while ((match = iconImportRegex.exec(content)) !== null) {
    const iconName = match[1];
    const variant = match[2];
    
    if (!imports.has(variant)) {
      imports.set(variant, []);
    }
    imports.get(variant).push(iconName);
  }
  
  if (imports.size > 0) {
    content = content.replace(iconImportRegex, '');
    
    const importStatements = [];
    for (const [variant, icons] of imports) {
      const uniqueIcons = [...new Set(icons)];
      importStatements.push(
        `import {\n  ${uniqueIcons.join(',\n  ')},\n} from '@heroicons/react/24/${variant}';`
      );
    }
    
    const firstImportMatch = content.match(/^import\s+.*?from\s+['"].*?['"];?\s*$/m);
    if (firstImportMatch) {
      const insertPosition = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
      content = content.slice(0, insertPosition) + '\n' + importStatements.join('\n') + content.slice(insertPosition);
    } else {
      content = importStatements.join('\n') + '\n' + content;
    }
    
    fs.writeFileSync(file, content, 'utf8');
    fixedCount++;
    console.log(`✓ Fixed: ${file}`);
  }
});

console.log(`\n✅ Total files fixed: ${fixedCount}`);

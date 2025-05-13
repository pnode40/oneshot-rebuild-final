
# Claude Cursor Maintenance Audit Script

## ✅ Purpose
This script helps Claude (or a developer) regularly audit the `.cursor/` system for:

- Unused or unlinked `.md` docs
- Missing `.mdc` rules for new feature folders
- Broken doc references inside rules
- Redundant or conflicting `.mdc` files

---

## 📂 Step 1: Check for Unlinked Docs

```ts
// In Cursor terminal or Claude context
const fs = require('fs');
const docsPath = './.cursor/docs/';
const rulePaths = ['./.cursor/rules/1-global/', './.cursor/rules/2-domain/', './.cursor/rules/3-features/', './.cursor/rules/4-utils/'];

const allDocs = fs.readdirSync(docsPath).filter(f => f.endsWith('.md'));
const allRuleContents = rulePaths.flatMap(path =>
  fs.readdirSync(path).filter(f => f.endsWith('.mdc')).map(f => fs.readFileSync(path + f, 'utf8'))
);

const unusedDocs = allDocs.filter(doc =>
  !allRuleContents.some(content => content.includes(doc))
);

console.log('🔍 Unused Docs:', unusedDocs);
```

---

## 📂 Step 2: Check for Folders Missing `.mdc` Rules

```ts
const srcFolders = fs.readdirSync('./src/');
const ruleFolders = fs.readdirSync('./.cursor/rules/3-features/');

const missingRules = srcFolders.filter(folder =>
  !ruleFolders.some(rule => rule.toLowerCase().includes(folder.toLowerCase()))
);

console.log('📛 Missing `.mdc` rules for folders:', missingRules);
```

---

## 📂 Step 3: Validate `load.docs = []` References Exist

```ts
const loadedDocs = [];

allRuleContents.forEach(content => {
  const match = content.match(/load\.docs\s*=\s*\[(.*?)\]/s);
  if (match) {
    const entries = match[1].split(',').map(x => x.replace(/["']/g, '').trim());
    loadedDocs.push(...entries);
  }
});

const docsExist = loadedDocs.map(name => ({
  name,
  exists: fs.existsSync(`${docsPath}/${name}`)
}));

console.log('🧾 Load Check:', docsExist);
```

---

## ✅ Summary
Use this script in your local dev terminal or within Cursor automation to keep `.cursor/` clean, scalable, and trusted.


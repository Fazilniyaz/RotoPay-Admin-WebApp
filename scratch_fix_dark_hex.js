const fs = require('fs');
const path = require('path');

function walk(dir) {
  let res = [];
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) res.push(...walk(p));
    else if (p.endsWith('.tsx')) res.push(p);
  });
  return res;
}

const files = walk('app/dashboard');

const replacements = [
  // Backgrounds
  { search: /\bbg-\[\#f5f3f3\](\/[0-9]+)?(?!\s*dark:)/g, replace: (m) => `${m} dark:bg-gray-800${m.includes('/') ? m.split('/')[1] : ''}` },
  { search: /\bbg-\[\#efeded\](\/[0-9]+)?(?!\s*dark:)/g, replace: (m) => `${m} dark:bg-gray-700${m.includes('/') ? m.split('/')[1] : ''}` },
  { search: /\bbg-\[\#dbd9d9\](\/[0-9]+)?(?!\s*dark:)/g, replace: (m) => `${m} dark:bg-gray-700${m.includes('/') ? m.split('/')[1] : ''}` },
  { search: /\bbg-\[\#005ea3\]\/5(?!\s*dark:)/g, replace: 'bg-[#005ea3]/5 dark:bg-[#a0c9ff]/10' },
  { search: /\bbg-\[\#005ea3\]\/10(?!\s*dark:)/g, replace: 'bg-[#005ea3]/10 dark:bg-[#a0c9ff]/20' },
  
  // Hovers
  { search: /\bhover:bg-\[\#efeded\](?!\s*dark:)/g, replace: 'hover:bg-[#efeded] dark:hover:bg-gray-700' },
  { search: /\bhover:bg-\[\#f5f3f3\](?!\s*dark:)/g, replace: 'hover:bg-[#f5f3f3] dark:hover:bg-gray-700/50' },
  { search: /\bhover:text-\[\#005ea3\](?!\s*dark:)/g, replace: 'hover:text-[#005ea3] dark:hover:text-[#a0c9ff]' },

  // Texts
  { search: /\btext-\[\#404752\]\/60(?!\s*dark:)/g, replace: 'text-[#404752]/60 dark:text-gray-400' },
  { search: /\btext-\[\#404752\]\/50(?!\s*dark:)/g, replace: 'text-[#404752]/50 dark:text-gray-400' },
  { search: /\btext-\[\#404752\]\/40(?!\s*dark:)/g, replace: 'text-[#404752]/40 dark:text-gray-500' },
  { search: /\btext-\[\#404752\]\/30(?!\s*dark:)/g, replace: 'text-[#404752]/30 dark:text-gray-500' },
  { search: /\btext-\[\#404752\](?!\s*dark:)/g, replace: 'text-[#404752] dark:text-gray-200' },
  { search: /\btext-\[\#1b1c1c\](?!\s*dark:)/g, replace: 'text-[#1b1c1c] dark:text-white' },

  // Borders
  { search: /\bborder-\[\#c0c7d4\]\/20(?!\s*dark:)/g, replace: 'border-[#c0c7d4]/20 dark:border-gray-700/80' },
  { search: /\bborder-\[\#c0c7d4\]\/30(?!\s*dark:)/g, replace: 'border-[#c0c7d4]/30 dark:border-gray-700/80' },
  { search: /\bborder-\[\#c0c7d4\]\/40(?!\s*dark:)/g, replace: 'border-[#c0c7d4]/40 dark:border-gray-700/80' },
  { search: /\bborder-\[\#e2e8f0\]\/80(?!\s*dark:)/g, replace: 'border-[#e2e8f0]/80 dark:border-gray-700/80' },
  { search: /\bborder-\[\#c0c7d4\](?!\s*dark:)/g, replace: 'border-[#c0c7d4] dark:border-gray-700' },

  // Gray generic fixes for missing employers colors
  { search: /\bbg-gray-100(?!\s*dark:)/g, replace: 'bg-gray-100 dark:bg-gray-800' },
  { search: /\bborder-red-100(?!\s*dark:)/g, replace: 'border-red-100 dark:border-red-900/50' },
  { search: /\bhover:bg-red-50(?!\s*dark:)/g, replace: 'hover:bg-red-50 dark:hover:bg-red-900/50' },
  { search: /\btext-gray-500(?!\s*dark:)/g, replace: 'text-gray-500 dark:text-gray-400' }
];

files.forEach(file => {
  const filePath = path.join('d:/Fazil/Jadvix/rotopay/RotoPay-Admin-WebApp', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    replacements.forEach(({ search, replace }) => {
      if (search.test(content)) {
        content = content.replace(search, replace);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});

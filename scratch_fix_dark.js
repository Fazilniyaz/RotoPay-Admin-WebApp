const fs = require('fs');
const path = require('path');

const files = [
  'app/dashboard/clock/page.tsx',
  'app/dashboard/employers/page.tsx',
  'app/dashboard/reports/page.tsx',
  'app/dashboard/calendar/page.tsx'
];

const replacements = [
  { search: /\bbg-white\b/g, replace: 'bg-white dark:bg-[#1f2937]' },
  { search: /\bbg-white\/85\b/g, replace: 'bg-white/85 dark:bg-[#1f2937]/85' },
  { search: /\bbg-white\/15\b/g, replace: 'bg-white/15 dark:bg-[#1f2937]/15' },
  { search: /\bbg-gray-50\b/g, replace: 'bg-gray-50 dark:bg-gray-800' },
  { search: /\btext-gray-900\b/g, replace: 'text-gray-900 dark:text-white' },
  { search: /\btext-gray-800\b/g, replace: 'text-gray-800 dark:text-gray-200' },
  { search: /\btext-\[\#005ea3\]\b/g, replace: 'text-[#005ea3] dark:text-[#a0c9ff]' },
  { search: /\btext-\[\#404752\]\b/g, replace: 'text-[#404752] dark:text-gray-200' },
  { search: /\bborder-gray-200\/80\b/g, replace: 'border-gray-200/80 dark:border-gray-700/80' },
  { search: /\bborder-gray-200\b/g, replace: 'border-gray-200 dark:border-gray-700' },
  { search: /\bborder-gray-100\b/g, replace: 'border-gray-100 dark:border-gray-700' },
  { search: /\bdivide-gray-100\b/g, replace: 'divide-gray-100 dark:divide-gray-700' },
  { search: /\bhover:bg-gray-50\b/g, replace: 'hover:bg-gray-50 dark:hover:bg-gray-700' },
  { search: /\bborder-\[\#c0c7d4\]\/40\b/g, replace: 'border-[#c0c7d4]/40 dark:border-gray-700/80' },
  { search: /\bborder-\[\#c0c7d4\]\/30\b/g, replace: 'border-[#c0c7d4]/30 dark:border-gray-700/80' },
  { search: /\bborder-\[\#c0c7d4\]\/20\b/g, replace: 'border-[#c0c7d4]/20 dark:border-gray-700/80' },
  { search: /\bborder-\[\#e2e8f0\]\/80\b/g, replace: 'border-[#e2e8f0]/80 dark:border-gray-700/80' }
];

files.forEach(file => {
  const filePath = path.join('d:/Fazil/Jadvix/rotopay/RotoPay-Admin-WebApp', file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if already replaced to avoid double replace
    if (content.includes('dark:bg-[#1f2937]')) {
      console.log(`Skipping ${file} as it seems already modified.`);
      return;
    }

    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

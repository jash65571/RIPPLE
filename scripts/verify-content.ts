import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const ROOT = process.cwd();
const TEXT_ROOTS = ['src', 'docs', 'public', 'about', 'accessibility', 'credits', 'how-to-play', 'play', 'privacy', 'support', 'terms', '404.html', 'index.html'];
const TEXT_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.html', '.md', '.json']);
const PROHIBITED_DASHES = /[\u2013\u2014]/u;

const collectFiles = async (path: string): Promise<readonly string[]> => {
  const entries = await readdir(path, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const child = join(path, entry.name);
    return entry.isDirectory() ? collectFiles(child) : [child];
  }));
  return files.flat();
};

const paths = await Promise.all(TEXT_ROOTS.map(async (root) => {
  const path = join(ROOT, root);
  return extname(path) === '' ? collectFiles(path) : [path];
}));
const files = paths.flat().filter((path) => TEXT_EXTENSIONS.has(extname(path)));
const issues: string[] = [];

for (const path of files) {
  const content = await readFile(path, 'utf8');
  if (PROHIBITED_DASHES.test(content)) issues.push(`${relative(ROOT, path)} contains an em or en dash.`);
}

const visibleSvgFiles = (await Promise.all(['src', 'public'].map((root) => collectFiles(join(ROOT, root))))).flat().filter((path) => extname(path).toLowerCase() === '.svg');
for (const path of visibleSvgFiles) issues.push(`${relative(ROOT, path)} is a first-party SVG asset.`);

if (issues.length > 0) throw new Error(issues.join('\n'));
console.log(`Checked ${files.length} first-party text files and found no prohibited dash characters.`);
console.log('Found no first-party SVG assets.');

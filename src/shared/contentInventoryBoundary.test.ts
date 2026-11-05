import { expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';

function imports(file: string) {
  const source = readFileSync(file, 'utf8');
  return [...source.matchAll(/\b(?:import|export)\s+(?:type\s+)?[^;]*?\bfrom\s*['"]([^'"]+)['"]/g),
    ...source.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g)].map(match => match[1]);
}

it('keeps the inventory JSON contract type-only and independent of tools and runtime initialization', () => {
  const file = 'src/shared/contentInventoryTypes.ts';
  const source = readFileSync(file, 'utf8');
  expect(source).not.toMatch(/\bimport\s+(?!type\b)/);
  expect(source).not.toMatch(/\b(?:const|let|var|function|class|enum)\s/);
  expect(imports(file)).toEqual([
    '../core/chapterAnchors', '../review/types',
  ]);
});

it('keeps review UI independent of Node and tools, including type-only imports', () => {
  const files = readdirSync('src/review').filter(f => f.endsWith('.tsx'));
  for (const name of files) for (const specifier of imports(`src/review/${name}`)) {
    expect(specifier, `${name}: ${specifier}`).not.toMatch(/(^node:|(^|\/)tools\/)/);
  }
  const panelImports = imports('src/review/ContentInventoryPanel.tsx');
  expect(panelImports).toContain('../shared/contentInventoryTypes');
  const apiImports = imports('tools/reviewPlugin.ts');
  expect(apiImports).toContain('./contentInventoryService.js');
  expect(apiImports).not.toContain('./contentInventory.js');
});

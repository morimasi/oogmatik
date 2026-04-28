#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Types that need pedagogicalNote property
const TYPES_TO_FIX = [
  'InfographicGeneratorResult',
  'CompositeWorksheet',
  'InteractiveStoryData',
  'Sinav',
  'MathPuzzleData',
  'RealLifeProblemData',
  'NumberPatternData',
  'LogicGridPuzzleData',
  'WordMemoryData',
  'VisualMemoryData',
  'CharacterMemoryData',
  'ColorWheelMemoryData',
  'ImageComprehensionData',
  'LetterGridTestData',
  'ChaoticNumberSearchData',
  'StroopTestData',
  'AttentionDevelopmentData',
  'AttentionFocusData',
  'NumberLogicRiddleData',
  'NumberSearchData',
  'FindDuplicateData',
  'TargetSearchData',
];

/**
 * Adds pedagogicalNote?: string to interface/type definitions
 */
function fixTypesWithPedagogicalNote() {
  console.log('🔧 Searching for types that need pedagogicalNote...\n');

  let fixedCount = 0;
  const typeFilePath = path.join(projectRoot, 'src/types');

  // Recursively find all TypeScript files
  function findAndFixTypes(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findAndFixTypes(filePath);
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        for (const typeName of TYPES_TO_FIX) {
          // Regex for interface or type definition
          const interfaceRegex = new RegExp(
            `(interface\\s+${typeName}\\s*\\{[^}]*)(\\n\\s*\\})`,
            'g'
          );
          
          if (interfaceRegex.test(content)) {
            // Check if pedagogicalNote already exists
            if (!content.includes(`${typeName}`) || !content.match(new RegExp(`interface\\s+${typeName}`))) {
              continue;
            }

            const hasProperty = content.match(
              new RegExp(`interface\\s+${typeName}\\s*\\{[^}]*pedagogicalNote`, 'g')
            );

            if (!hasProperty) {
              content = content.replace(
                new RegExp(`(interface\\s+${typeName}\\s*\\{[^}]*)(\\n\\s*\\})`, 'g'),
                (match, before, closing) => {
                  // Add pedagogicalNote before closing brace
                  return `${before}\n  pedagogicalNote?: string;${closing}`;
                }
              );
              modified = true;
              fixedCount++;
              console.log(`✅ Fixed: ${typeName} in ${path.relative(projectRoot, filePath)}`);
            }
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf-8');
        }
      }
    }
  }

  findAndFixTypes(typeFilePath);

  console.log(`\n✨ Fixed ${fixedCount} types\n`);
  return fixedCount;
}

/**
 * Adds explicit types to parameters (fixes TS7006)
 */
function fixImplicitAnyParameters() {
  console.log('🔧 Searching for implicit any parameters...\n');

  const commonFixes = {
    // Pattern: .map((s) => => Pattern: .map((s: Type) =>
    '[.(]s\\)': '[.(]s: unknown\\)',
    '[.(]x\\)': '[.(]x: unknown\\)',
    '[.(]state\\)': '[.(]state: unknown\\)',
  };

  let fixedCount = 0;

  function findAndFixFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findAndFixFiles(filePath);
      } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let modified = false;

        // Only fix obvious cases - simple map/filter callbacks
        const patterns = [
          { match: /\.map\(\(s\)\s*=>/g, replace: '.map((s: unknown) =>' },
          { match: /\.filter\(\(s\)\s*=>/g, replace: '.filter((s: unknown) =>' },
          { match: /\.map\(\(state\)\s*=>/g, replace: '.map((state: unknown) =>' },
        ];

        for (const pattern of patterns) {
          if (pattern.match.test(content)) {
            content = content.replace(pattern.match, pattern.replace);
            modified = true;
            fixedCount++;
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf-8');
          console.log(`✅ Fixed implicit any in ${path.relative(projectRoot, filePath)}`);
        }
      }
    }
  }

  findAndFixFiles(path.join(projectRoot, 'src'));

  console.log(`\n✨ Fixed ${fixedCount} implicit any parameters\n`);
  return fixedCount;
}

// Main
console.log('🚀 TypeScript Error Fixer\n');
console.log('=' .repeat(50) + '\n');

const pedagogicalCount = fixTypesWithPedagogicalNote();
const paramCount = fixImplicitAnyParameters();

console.log('=' .repeat(50));
console.log(`\n📊 Summary:\n`);
console.log(`  • pedagogicalNote properties added: ${pedagogicalCount}`);
console.log(`  • implicit any parameters fixed: ${paramCount}`);
console.log(`  • Total fixes: ${pedagogicalCount + paramCount}`);
console.log('\n✅ Done! Run `pnpm exec tsc --noEmit` to verify.\n');

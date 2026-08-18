import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.join(__dirname, 'src');
const AI_DIR = path.join(SRC_DIR, 'services', 'generators');

const noteSchemaStr = ` pedagogicalNote: { type: 'STRING', description: 'Öğretmen için aktivitenin eğitsel amacı ve özel öğrenme güçlüğü olan öğrenciye (Disleksi/DEHB) faydası üzerine pedagojik not' },\n`;

function processAIGenerators(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processAIGenerators(fullPath);
        } else if (file.endsWith('.ts') && file !== 'index.ts' && file !== 'registry.ts') {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            if (content.includes('generate')) {

                if (!content.includes('pedagogicalNote') && content.includes('const prompt')) {
                    const promptSplit = content.split('const schema =');
                    if (promptSplit.length > 1) {
                        // Loop through all parts except the last one to inject prompt and schema modifications
                        for (let i = 0; i < promptSplit.length - 1; i++) {
                            promptSplit[i] = promptSplit[i].replace(/`\s*;\s*$/,
                                `\n    [KRİTİK]: Döndürülen JSON, 'pedagogicalNote' isimli öğretmen geri bildirim notunu kesinlikle içermelidir.\n    \`;\n\n`);

                            let schemaPart = promptSplit[i + 1];
                            let replacedSchema = false;
                            schemaPart = schemaPart.replace(/properties:\s*{/, (match) => {
                                if (!replacedSchema) {
                                    replacedSchema = true;
                                    return `properties: {\n                ${noteSchemaStr}`;
                                }
                                return match;
                            });

                            let replacedReq = false;
                            schemaPart = schemaPart.replace(/required:\s*\[/, (match) => {
                                if (!replacedReq) {
                                    replacedReq = true;
                                    return `required: ['pedagogicalNote', `;
                                }
                                return match;
                            });

                            promptSplit[i + 1] = schemaPart;
                        }

                        content = promptSplit.join('const schema =');
                        modified = true;
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated AI Generator: ${file}`);
            }
        }
    }
}

processAIGenerators(AI_DIR);
console.log('Toplu AI prompt - pedagogicalNote codemod v2 tamamlandı.');

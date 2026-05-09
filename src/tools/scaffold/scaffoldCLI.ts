import * as fs from 'fs';
import * as path from 'path';
import { ActivityScaffoldEngine } from './ActivityScaffoldEngine';

/**
 * Oogmatik Scaffold CLI
 * Kullanım: npx vitest run src/tools/scaffold/scaffoldCLI.ts --blueprint path/to/blueprint.json
 */
async function main() {
  const args = process.argv;
  const blueprintArgIdx = args.indexOf('--blueprint');
  
  if (blueprintArgIdx === -1 || !args[blueprintArgIdx + 1]) {
    console.error('❌ Hata: Blueprint dosyası belirtilmedi.');
    console.log('Kullanım: npm run scaffold -- --blueprint src/tools/scaffold/test-maze.json');
    process.exit(1);
  }

  const blueprintPath = path.resolve(args[blueprintArgIdx + 1]);
  
  if (!fs.existsSync(blueprintPath)) {
    console.error(`❌ Hata: Blueprint dosyası bulunamadı: ${blueprintPath}`);
    process.exit(1);
  }

  try {
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    const workspaceRoot = process.cwd();
    const engine = new ActivityScaffoldEngine(workspaceRoot);
    
    console.log('🚀 Oogmatik Scaffold Engine başlatılıyor...');
    const result = await engine.process(blueprint);
    
    if (result.success) {
      console.log('✅ İşlem başarıyla tamamlandı!');
      console.log(`📂 Modül konumu: ${result.moduleDir}`);
    }
  } catch (error) {
    console.error('💥 Kritik Hata:', error);
    process.exit(1);
  }
}

// Vitest ortamında veya doğrudan node ile çalışırken tetikle
main();

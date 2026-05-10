import * as fs from 'fs';
import * as path from 'path';
import { ActivityScaffoldEngine } from './ActivityScaffoldEngine';
import { ActivityValidator } from './ActivityValidator';
import { AgentOrchestrator } from './AgentOrchestrator';

/**
 * Oogmatik Scaffold CLI v2
 * 
 * Kullanım:
 *   npm run scaffold -- --blueprint path/to/blueprint.json
 *   npm run scaffold -- --blueprint path/to/blueprint.json --dry-run
 *   npm run scaffold -- --blueprint path/to/blueprint.json --verbose
 *   npm run scaffold -- --blueprint path/to/blueprint.json --skip-agents
 */
async function main() {
  const args = process.argv;

  // ─── Argümanlar ───
  const blueprintArgIdx = args.indexOf('--blueprint');
  const dryRun = args.includes('--dry-run');
  const verbose = args.includes('--verbose');
  const skipAgents = args.includes('--skip-agents');

  if (blueprintArgIdx === -1 || !args[blueprintArgIdx + 1]) {
    console.error('❌ Blueprint dosyası belirtilmedi.');
    console.log('\nKullanım:');
    console.log('  npm run scaffold -- --blueprint src/tools/scaffold/test-maze.json');
    console.log('\nSeçenekler:');
    console.log('  --dry-run       Dosya yazmadan önizleme');
    console.log('  --verbose       Detaylı log çıktısı');
    console.log('  --skip-agents   Ajan denetimini atla');
    process.exit(1);
  }

  const blueprintPath = path.resolve(args[blueprintArgIdx + 1]);

  if (!fs.existsSync(blueprintPath)) {
    console.error(`❌ Blueprint dosyası bulunamadı: ${blueprintPath}`);
    process.exit(1);
  }

  try {
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    const workspaceRoot = process.cwd();

    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  🚀 Oogmatik Scaffold Engine v2              ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log(`\n📋 Blueprint: ${blueprint.identity?.title || 'İsimsiz'}`);
    console.log(`🔑 Key: ${blueprint.identity?.key}`);
    console.log(`📂 Hedef: src/modules/activities/${blueprint.identity?.key?.toLowerCase().replace(/_/g, '-')}/`);
    if (dryRun) console.log('🏃 Mod: DRY-RUN (dosya yazılmayacak)');

    // ─── Doğrulama ───
    console.log('\n── Doğrulama ──────────────────────────────────');
    try {
      ActivityValidator.validateBlueprint(blueprint);
      console.log('✅ Yapısal doğrulama geçti');
    } catch (error: any) {
      console.error('❌ Doğrulama başarısız: ' + (error.details || error.message));
      process.exit(1);
    }

    // ─── Ajan Denetimi ───
    if (!skipAgents) {
      console.log('\n── Ajan Denetim Pipeline ───────────────────────');
      const orchestrator = new AgentOrchestrator();
      const agentResult = await orchestrator.evaluate(blueprint);

      const agents = [
        { key: 'pedagogical', name: 'Elif Yıldız', emoji: '👩‍🏫' },
        { key: 'clinical', name: 'Dr. Ahmet Kaya', emoji: '🩺' },
        { key: 'engineering', name: 'Bora Demir', emoji: '⚙️' },
        { key: 'aiQuality', name: 'Selin Arslan', emoji: '🤖' },
      ];

      for (const agent of agents) {
        const approval = agentResult.approvals[agent.key as keyof typeof agentResult.approvals];
        const status = approval?.approved ? '✅' : '❌';
        console.log(`  ${agent.emoji} ${agent.name}: ${status} ${approval?.notes || ''}`);
      }

      if (!agentResult.allApproved) {
        console.error('\n❌ Ajan denetimi geçilemedi. Blueprint düzeltilmeli.');
        process.exit(1);
      }
      console.log('✅ Tüm ajan onayları alındı');
    } else {
      console.log('\n⏭️ Ajan denetimi atlandı (--skip-agents)');
    }

    // ─── Üretim ───
    console.log('\n── Üretim ─────────────────────────────────────');
    const engine = new ActivityScaffoldEngine(workspaceRoot);
    const result = await engine.process(blueprint, { dryRun });

    if (verbose) {
      console.log('\n── Detaylı Loglar ─────────────────────────────');
      result.logs.forEach(log => console.log(`  ${log}`));
    }

    // ─── Sonuçlar ───
    console.log('\n── Sonuç ──────────────────────────────────────');
    console.log(`📂 Modül: ${result.moduleDir}`);
    console.log(`📄 Oluşturulan dosyalar: ${result.generatedFiles.length}`);
    result.generatedFiles.forEach(f => console.log(`  ✅ ${path.relative(workspaceRoot, f)}`));

    console.log(`🔌 Enjeksiyonlar: ${result.injections.length}`);
    result.injections.forEach(inj => {
      const icon = inj.skipped ? '⏭️' : inj.success ? '✅' : '❌';
      console.log(`  ${icon} [${inj.type}] ${inj.key}${inj.error ? ` — ${inj.error}` : ''}`);
    });

    console.log('\n╔══════════════════════════════════════════════╗');
    console.log(`║  ${dryRun ? '🏃 DRY-RUN tamamlandı' : '✅ Üretim başarıyla tamamlandı!'} ${''.padEnd(16)}║`);
    console.log('╚══════════════════════════════════════════════╝');

  } catch (error: unknown) {
    console.error('💥 Kritik Hata:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();

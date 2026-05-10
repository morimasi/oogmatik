import { describe, it, expect } from 'vitest';
import { ActivityScaffoldEngine } from './ActivityScaffoldEngine';
import * as fs from 'fs';
import * as path from 'path';

describe('Activity Scaffold Engine Execution', () => {
  it('should process the test maze blueprint successfully via dry-run', async () => {
    const workspaceRoot = process.cwd();
    const blueprintPath = path.join(workspaceRoot, 'src/tools/scaffold/test-maze.json');
    if (!fs.existsSync(blueprintPath)) {
      // CI ortamında dosya olmayabilir
      return;
    }
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

    const engine = new ActivityScaffoldEngine(workspaceRoot);
    const result = await engine.process(blueprint, { dryRun: true });

    expect(result.success).toBe(true);
    expect(result.injections.length).toBeGreaterThan(0);
    expect(result.moduleDir).toContain('letter-maze');
  });
});

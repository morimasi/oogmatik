import { describe, it } from 'vitest';
import { ActivityScaffoldEngine } from './ActivityScaffoldEngine';
import * as fs from 'fs';
import * as path from 'path';

describe('Activity Scaffold Engine Execution', () => {
  it('should process the test maze blueprint', async () => {
    const workspaceRoot = process.cwd();
    const blueprintPath = path.join(workspaceRoot, 'src/tools/scaffold/test-maze.json');
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

    const engine = new ActivityScaffoldEngine(workspaceRoot);
    const result = await engine.process(blueprint);

    console.log('Scaffold Result:', result);
  });
});

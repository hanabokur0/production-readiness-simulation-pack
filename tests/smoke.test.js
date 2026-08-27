import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadYaml, loadScenarios, simulate } from '../src/engine.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

test('scenario pack contains exactly 30 unique scenarios', () => {
  const scenarios = loadScenarios(path.join(root, 'scenarios'));
  assert.equal(scenarios.length, 30);
  assert.equal(new Set(scenarios.map(s => s.id)).size, 30);
});

test('example manifest produces a deterministic gate class', () => {
  const manifest = loadYaml(path.join(root, 'examples', 'app_manifest.yaml'));
  const scenarios = loadScenarios(path.join(root, 'scenarios'));
  const receipt = simulate(manifest, scenarios);
  assert.equal(receipt.app_id, 'demo-saas');
  assert.equal(receipt.results.length, 30);
  assert.equal(receipt.overall_gate, 'HOLD');
  assert.ok(receipt.summary.HOLD > 0);
});

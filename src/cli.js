import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { loadYaml, loadScenarios, simulate } from './engine.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const manifestPath = path.resolve(process.argv[2] ?? path.join(root, 'examples', 'app_manifest.yaml'));
const scenarioDir = path.join(root, 'scenarios');

const manifest = loadYaml(manifestPath);
const scenarios = loadScenarios(scenarioDir);
const receipt = simulate(manifest, scenarios);
process.stdout.write(yaml.dump(receipt, { noRefs: true, lineWidth: 120 }));

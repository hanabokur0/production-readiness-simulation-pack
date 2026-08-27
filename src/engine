import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';

export function getPath(obj, dotted) {
  return dotted.split('.').reduce((cur, key) => (cur == null ? undefined : cur[key]), obj);
}

export function evaluate(actual, operator, expected) {
  switch (operator) {
    case 'equals': return actual === expected;
    case 'not_equals': return actual !== expected;
    case 'truthy': return Boolean(actual);
    case 'falsy': return !actual;
    case 'exists': return actual !== undefined && actual !== null;
    case 'gte': return typeof actual === 'number' && actual >= expected;
    case 'lte': return typeof actual === 'number' && actual <= expected;
    default: throw new Error(`Unknown operator: ${operator}`);
  }
}

export function applies(manifest, scenario) {
  if (!scenario.applies_when) return true;
  const c = scenario.applies_when;
  return evaluate(getPath(manifest, c.path), c.operator, c.value);
}

export function runScenario(manifest, scenario) {
  if (!applies(manifest, scenario)) {
    return { scenario_id: scenario.id, domain: scenario.domain, title: scenario.title, severity: scenario.severity, status: 'SKIP', reason: 'Scenario does not apply to this manifest.', evidence_required: scenario.evidence_required ?? [] };
  }

  let worst = 'PASS';
  const order = { PASS: 0, REVIEW: 1, HOLD: 2, REJECT: 3 };
  const failures = [];
  for (const check of scenario.checks ?? []) {
    const actual = getPath(manifest, check.path);
    const ok = evaluate(actual, check.operator, check.value);
    if (!ok) {
      const status = check.on_fail ?? 'HOLD';
      if (order[status] > order[worst]) worst = status;
      failures.push(check.reason ?? `${check.path} is not verified for ${check.operator}${check.value !== undefined ? ` ${JSON.stringify(check.value)}` : ''}; actual=${JSON.stringify(actual)}`);
    }
  }

  return {
    scenario_id: scenario.id,
    domain: scenario.domain,
    title: scenario.title,
    severity: scenario.severity,
    status: worst,
    reason: failures.length ? failures.join(' | ') : 'All declared checks pass.',
    evidence_required: scenario.evidence_required ?? []
  };
}

export function overallGate(results) {
  const active = results.filter(r => r.status !== 'SKIP');
  if (active.some(r => r.status === 'REJECT')) return 'REJECT';
  if (active.some(r => r.status === 'HOLD' && r.severity === 'critical')) return 'HOLD';
  if (active.some(r => r.status === 'HOLD')) return 'HOLD';
  if (active.some(r => r.status === 'REVIEW')) return 'REVIEW';
  return 'PASS';
}

export function simulate(manifest, scenarios) {
  const results = scenarios.map(s => runScenario(manifest, s));
  const counts = { PASS: 0, REVIEW: 0, HOLD: 0, REJECT: 0, SKIP: 0 };
  for (const r of results) counts[r.status] += 1;
  return {
    receipt_version: '0.1',
    run_id: `sim-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}`,
    generated_at: new Date().toISOString(),
    app_id: manifest?.app?.id ?? 'unknown',
    app_stage: manifest?.app?.stage ?? 'unknown',
    overall_gate: overallGate(results),
    summary: counts,
    results
  };
}

export function loadYaml(file) {
  return yaml.load(fs.readFileSync(file, 'utf8'));
}

export function loadScenarios(dir) {
  const files = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.ya?ml$/i.test(entry.name)) files.push(full);
    }
  }
  walk(dir);
  return files.sort().map(loadYaml);
}

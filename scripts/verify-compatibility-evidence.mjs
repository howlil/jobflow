import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stdout } from 'node:process';
import { URL } from 'node:url';

const REQUIRED_FAMILIES = [
  'greenhouse',
  'lever',
  'workday',
  'ashby',
  'smartrecruiters',
  'custom',
];
const VALID_FIXTURE_STATUS = new Set(['verified', 'failed']);
const VALID_LIVE_STATUS = new Set(['pending', 'verified', 'failed']);
const VALID_ADAPTER_STATUS = new Set([
  'not-justified',
  'candidate',
  'implemented',
]);

const raw = await readFile(
  new URL('../docs/compatibility-evidence.json', import.meta.url),
  'utf8',
);
const evidence = JSON.parse(raw);

assert.equal(evidence.schemaVersion, 1, 'Unsupported compatibility evidence schema');
assert.ok(Array.isArray(evidence.families), 'families must be an array');

const byId = new Map();
for (const family of evidence.families) {
  assert.equal(typeof family.id, 'string', 'family id must be a string');
  assert.ok(!byId.has(family.id), `Duplicate compatibility family: ${family.id}`);
  assert.ok(
    VALID_FIXTURE_STATUS.has(family.fixtureStatus),
    `Invalid fixture status for ${family.id}`,
  );
  assert.ok(
    VALID_LIVE_STATUS.has(family.liveStatus),
    `Invalid live status for ${family.id}`,
  );
  assert.ok(
    VALID_ADAPTER_STATUS.has(family.adapterStatus),
    `Invalid adapter status for ${family.id}`,
  );

  if (family.adapterStatus !== 'not-justified') {
    assert.equal(
      typeof family.reproducibleFailure,
      'string',
      `${family.id} requires documented reproducibleFailure before adapter work`,
    );
    assert.ok(
      family.reproducibleFailure.trim().length > 0,
      `${family.id} requires non-empty reproducibleFailure before adapter work`,
    );
  }

  if (family.liveStatus === 'verified') {
    assert.equal(
      typeof family.liveEvidence,
      'string',
      `${family.id} cannot claim live verification without liveEvidence`,
    );
    assert.ok(
      family.liveEvidence.trim().length > 0,
      `${family.id} cannot claim live verification without liveEvidence`,
    );
  }

  byId.set(family.id, family);
}

for (const required of REQUIRED_FAMILIES) {
  assert.ok(byId.has(required), `Missing compatibility family: ${required}`);
}

const fixtureVerified = evidence.families.filter(
  (family) => family.fixtureStatus === 'verified',
).length;
const liveVerified = evidence.families.filter(
  (family) => family.liveStatus === 'verified',
).length;
const adapters = evidence.families.filter(
  (family) => family.adapterStatus === 'implemented',
).length;

stdout.write(
  `Compatibility evidence: ${fixtureVerified}/${evidence.families.length} fixture families verified; ${liveVerified}/${evidence.families.length} live verified; ${adapters} adapters implemented.\n`,
);

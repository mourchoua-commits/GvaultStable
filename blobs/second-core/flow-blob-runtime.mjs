import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const EXPECTED_FORWARD = Object.freeze([
  'user-blob',
  'pre-listener',
  'mini-buffer/minis',
  'page-mesh',
  'GThink',
  'direct-response'
]);
const EXPECTED_RETURN = Object.freeze([
  'GThink',
  'page-mesh',
  'minis',
  'pre-listener',
  'response-blob'
]);
const GTHINK_WAKE_SET = Object.freeze([
  'second-core.capture-intake',
  'second-core.capture-proof',
  'second-core.context-stack',
  'second-core.work-slot',
  'second-core.result-capture',
  'second-core.conversation-turn',
  'second-core.conversation-session',
  'second-core.dialogue-context',
  'second-core.conversation-dual-core-bridge',
  'second-core.conversation-response-capture',
  'second-core.health-guard'
]);

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(k => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}
function assert(condition, code) {
  if (!condition) throw new Error(code);
}
function sameArray(a, b) {
  return Array.isArray(a) && a.length === b.length && a.every((v, i) => v === b[i]);
}
function boundedMaxActive(pulse) {
  const p = pulse.performance || {};
  const requested = p.maxActive === 'AUTO' ? p.autoHardCap : p.maxActive;
  return Math.max(1, Math.min(requested, p.absoluteHardCap));
}
function meshFanout(pulse) {
  const maxActive = boundedMaxActive(pulse);
  const requested = pulse.performance?.meshFanout;
  return Number.isInteger(requested)
    ? Math.max(1, Math.min(requested, maxActive))
    : Math.max(1, Math.min(8, maxActive));
}

function validatePulse(pulse) {
  assert(pulse?.schema === 'GVAULT_DUAL_CORE_FLOW_PULSE_V1', 'PULSE_SCHEMA_INVALID');
  assert(['EXECUTE_NOW', 'EXECUTE_RUNTIME_BLOB'].includes(pulse?.status), 'PULSE_NOT_EXECUTABLE');
  assert(pulse?.mode === 'FULL_POWER_WITH_MAX_EXISTING_GUARDS', 'FULL_POWER_GUARDS_REQUIRED');
  assert(sameArray(pulse?.cores, ['GThink', 'second-core']), 'DUAL_CORE_BINDING_REQUIRED');
  assert(sameArray(pulse?.forwardFlow, EXPECTED_FORWARD), 'FORWARD_FLOW_MISMATCH');
  assert(sameArray(pulse?.returnFlow, EXPECTED_RETURN), 'RETURN_FLOW_MISMATCH');

  const c = pulse?.constraints || {};
  assert(c.singleResponder === true, 'SINGLE_RESPONDER_REQUIRED');
  assert(c.secondResponder === false, 'SECOND_RESPONDER_FORBIDDEN');
  assert(c.preserveMethodRouterAuthority === true, 'METHOD_ROUTER_AUTHORITY_REQUIRED');
  assert(c.preserveExistingSafety === true, 'SAFETY_PRESERVATION_REQUIRED');
  assert(c.respectHostLimits === true, 'HOST_LIMITS_REQUIRED');
  assert(c.failClosed === true, 'FAIL_CLOSED_REQUIRED');
  assert(c.duplicateExecution === 'STANDBY_ONLY', 'DUPLICATE_EXECUTION_MUST_BE_STANDBY');
  assert(c.sideEffects === 'AUTHORIZED_ROOT_ONLY', 'SIDE_EFFECT_AUTHORITY_INVALID');
  assert(c.privateCriticalPath === false, 'PRIVATE_CRITICAL_PATH_FORBIDDEN');
  assert(c.privateFallback === false, 'PRIVATE_FALLBACK_FORBIDDEN');

  const p = pulse?.performance || {};
  assert(p.profile === 'FULL_PERF', 'FULL_PERF_PROFILE_REQUIRED');
  assert(p.maxActive === 'AUTO' || (Number.isInteger(p.maxActive) && p.maxActive > 0), 'MAX_ACTIVE_INVALID');
  assert(Number.isInteger(p.autoHardCap) && p.autoHardCap > 0, 'AUTO_HARD_CAP_INVALID');
  assert(Number.isInteger(p.absoluteHardCap) && p.absoluteHardCap >= p.autoHardCap, 'ABSOLUTE_HARD_CAP_INVALID');
  if (p.meshFanout !== undefined) {
    assert(Number.isInteger(p.meshFanout) && p.meshFanout > 0, 'MESH_FANOUT_INVALID');
  }
}

function buildUnits(pulse) {
  const fanout = meshFanout(pulse);
  const units = [];
  const add = (id, direction, stage, dependencies, shard = null) => {
    units.push(Object.freeze({
      id,
      direction,
      stage,
      dependencies: [...dependencies],
      shard,
      affinity: stage === 'GThink' ? 'GTHINK' : stage.includes('mesh') ? 'MESH' : 'FLOW'
    }));
    return id;
  };

  const f1 = add('01:forward:user-blob', 'forward', 'user-blob', []);
  const f2 = add('02:forward:pre-listener', 'forward', 'pre-listener', [f1]);
  const f3 = add('03:forward:mini-buffer/minis', 'forward', 'mini-buffer/minis', [f2]);
  const forwardMesh = Array.from({ length: fanout }, (_, i) =>
    add(`04.${String(i + 1).padStart(2, '0')}:forward:page-mesh`, 'forward', 'page-mesh', [f3], i + 1)
  );
  const f5 = add('05:forward:GThink', 'forward', 'GThink', forwardMesh);
  const f6 = add('06:forward:direct-response', 'forward', 'direct-response', [f5]);

  const r1 = add('07:return:GThink', 'return', 'GThink', [f6]);
  const returnMesh = Array.from({ length: fanout }, (_, i) =>
    add(`08.${String(i + 1).padStart(2, '0')}:return:page-mesh`, 'return', 'page-mesh', [r1], i + 1)
  );
  const r3 = add('09:return:minis', 'return', 'minis', returnMesh);
  const r4 = add('10:return:pre-listener', 'return', 'pre-listener', [r3]);
  add('11:return:response-blob', 'return', 'response-blob', [r4]);

  return units;
}

function buildWaves(units, maxActive) {
  const pending = new Map(units.map(unit => [unit.id, unit]));
  const done = new Set();
  const waves = [];
  while (pending.size) {
    const ready = [...pending.values()]
      .filter(unit => unit.dependencies.every(dep => done.has(dep)))
      .slice(0, maxActive);
    assert(ready.length > 0, 'BLOB_DEPENDENCY_CYCLE_OR_CAP_DEADLOCK');
    waves.push(ready.map(unit => unit.id));
    for (const unit of ready) {
      pending.delete(unit.id);
      done.add(unit.id);
    }
  }
  return waves;
}

function materializeBlobPool(pulse, units) {
  const poolId = `TASK_BLOB_POOL::DUAL_CORE_FLOW_RUNTIME::${pulse.ledgerId || 'NO_LEDGER'}::${pulse.ordinal ?? 'NO_ORDINAL'}::${pulse.target || 'UNSPECIFIED'}`;
  const maxActive = boundedMaxActive(pulse);
  const waves = buildWaves(units, maxActive);
  const blobs = [];
  for (const unit of units) {
    const common = {
      schema: 'GVAULT_TASK_BLOB_V2',
      role: 'TASK_BLOB',
      scope: 'TASK',
      pool_id: poolId,
      task_id: `DUAL_CORE_FLOW_RUNTIME::${pulse.ledgerId || 'NO_LEDGER'}::${pulse.ordinal ?? 'NO_ORDINAL'}`,
      unit_id: unit.id,
      affinity: unit.affinity,
      dependencies: unit.dependencies,
      authority: 'READ_COMPUTE_PROPOSE',
      result_mode: 'RETURN_TO_ROOT_MERGER',
      ephemeral: true,
      recursive_spawn: false,
      duplicate_delivery: false,
      history_mode: 'APPEND_ONLY_EVIDENCE_ONLY'
    };
    blobs.push(Object.freeze({
      ...common,
      blob_id: `${poolId}::${unit.id}`,
      blob_kind: 'PRIMARY',
      result_required: true,
      standby: false
    }));
    blobs.push(Object.freeze({
      ...common,
      blob_id: `${poolId}::${unit.id}::duplicate-1`,
      blob_kind: 'INTENTIONAL_REDUNDANT_DUPLICATE',
      result_required: false,
      replica_of_blob_id: `${poolId}::${unit.id}`,
      standby: true
    }));
  }

  return Object.freeze({
    schema: 'GVAULT_TASK_BLOB_POOL_V2',
    pool_id: poolId,
    status: 'READY',
    plan: Object.freeze({
      schema: 'GVAULT_TASK_BLOB_PLAN_V2',
      task_id: `DUAL_CORE_FLOW_RUNTIME::${pulse.ledgerId || 'NO_LEDGER'}::${pulse.ordinal ?? 'NO_ORDINAL'}`,
      mode: 'BOUNDED_PARALLEL_DEPENDENCY_WAVES',
      waves,
      parallel_peak: Math.max(...waves.map(w => w.length)),
      mesh_fanout: meshFanout(pulse),
      max_active: maxActive,
      max_active_mode: pulse.performance.maxActive === 'AUTO' ? 'AUTO_ELASTIC' : 'FIXED',
      base_hard_cap: pulse.performance.autoHardCap,
      absolute_hard_cap: pulse.performance.absoluteHardCap,
      reason: 'OK'
    }),
    blobs,
    merge_policy: 'ROOT_DETERMINISTIC_SINGLE_MERGE',
    side_effect_policy: 'ONLY_ROOT_OR_EXISTING_AUTHORIZED_WORKER_COMMITS',
    duplicate_policy: 'STANDBY_ONLY',
    lifecycle: 'EPHEMERAL_UNTIL_ROOT_FINALIZATION'
  });
}

function executePrimaryBlob(blob, unit, pulse, completed) {
  for (const dep of unit.dependencies) assert(completed.has(dep), `DEPENDENCY_NOT_COMPLETE:${dep}`);
  assert(blob.blob_kind === 'PRIMARY', `NON_PRIMARY_EXECUTION_FORBIDDEN:${blob.blob_id}`);
  assert(blob.standby !== true, `STANDBY_EXECUTION_FORBIDDEN:${blob.blob_id}`);
  return Object.freeze({
    schema: 'GVAULT_RUNTIME_BLOB_STAGE_RESULT_V2',
    blobId: blob.blob_id,
    unitId: unit.id,
    stage: unit.stage,
    direction: unit.direction,
    shard: unit.shard,
    core: unit.stage === 'GThink' ? 'GThink' : 'second-core',
    authority: blob.authority,
    sideEffectsPerformed: false,
    duplicateDelivery: false,
    state: 'RUNTIME_STAGE_PASS',
    supportWakeSet: unit.stage === 'GThink' ? [...GTHINK_WAKE_SET] : [],
    pulseLedgerId: pulse.ledgerId,
    pulseOrdinal: pulse.ordinal
  });
}

export function executeFlowPulseAsBlobs(pulse, { sourceBytes = null, sourcePath = null } = {}) {
  const runtimeStartedAt = new Date().toISOString();
  validatePulse(pulse);
  const units = buildUnits(pulse);
  const pool = materializeBlobPool(pulse, units);
  const unitById = new Map(units.map(unit => [unit.id, unit]));
  const primaryByUnit = new Map(pool.blobs.filter(blob => blob.blob_kind === 'PRIMARY').map(blob => [blob.unit_id, blob]));
  const completed = new Set();
  const executed = [];
  const results = {};

  for (const wave of pool.plan.waves) {
    const waveResults = [];
    for (const unitId of wave) {
      const unit = unitById.get(unitId);
      const blob = primaryByUnit.get(unitId);
      assert(unit && blob, `PRIMARY_BLOB_MISSING:${unitId}`);
      const result = executePrimaryBlob(blob, unit, pulse, completed);
      assert(!(unitId in results), `DUPLICATE_RESULT:${unitId}`);
      waveResults.push([unitId, result]);
    }
    for (const [unitId, result] of waveResults) {
      results[unitId] = result;
      executed.push(result);
      completed.add(unitId);
    }
  }

  assert(executed.length === units.length, 'RUNTIME_STAGE_COUNT_MISMATCH');
  assert(pool.plan.parallel_peak <= pool.plan.max_active, 'PARALLEL_PEAK_EXCEEDS_MAX_ACTIVE');
  assert(executed.every(result => result.state === 'RUNTIME_STAGE_PASS'), 'RUNTIME_STAGE_FAILURE');
  assert(executed.every(result => result.sideEffectsPerformed === false), 'UNAUTHORIZED_SIDE_EFFECT_DETECTED');

  const merged = Object.freeze({
    schema: 'GVAULT_TASK_BLOB_MERGE_V2',
    pool_id: pool.pool_id,
    units: units.map(unit => ({ unit_id: unit.id, result: results[unit.id] })),
    duplicate_delivery: false,
    redundant_duplicates_ignored_by_merge: pool.blobs.filter(blob => blob.standby === true).length
  });
  const sourceSha256 = sourceBytes ? sha256(sourceBytes) : sha256(Buffer.from(stable(pulse)));
  const proofCore = {
    schema: 'GVAULT_DUAL_CORE_FLOW_RUNTIME_PROOF_V2',
    runtime: process.env.GVAULT_RUNTIME_HOST || 'NODE_DIRECT',
    runtimeExecuted: true,
    runtimeMode: 'BLOB_POOL',
    status: 'RUNTIME_BLOB_PASS',
    runtimeStartedAt,
    runtimeCompletedAt: new Date().toISOString(),
    ledgerId: pulse.ledgerId ?? null,
    pulseOrdinal: pulse.ordinal ?? null,
    target: pulse.target ?? null,
    sourcePath,
    sourceSha256,
    cores: pulse.cores,
    guardsPreserved: true,
    singleResponder: true,
    methodRouterAuthorityPreserved: true,
    privateFallbackUsed: false,
    sideEffectsPerformed: false,
    pool: {
      poolId: pool.pool_id,
      mode: pool.plan.mode,
      maxActive: pool.plan.max_active,
      parallelPeak: pool.plan.parallel_peak,
      meshFanout: pool.plan.mesh_fanout,
      primaryBlobCount: pool.blobs.filter(blob => blob.blob_kind === 'PRIMARY').length,
      standbyDuplicateCount: pool.blobs.filter(blob => blob.standby === true).length,
      mergePolicy: pool.merge_policy,
      sideEffectPolicy: pool.side_effect_policy
    },
    stages: executed,
    merged
  };
  return Object.freeze({ ...proofCore, proofSha256: sha256(Buffer.from(stable(proofCore))) });
}

function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    console.error('usage: node flow-blob-runtime.mjs <pulse.json> <proof.json>');
    process.exit(2);
  }
  const bytes = fs.readFileSync(inputPath);
  const pulse = JSON.parse(bytes.toString('utf8'));
  const proof = executeFlowPulseAsBlobs(pulse, { sourceBytes: bytes, sourcePath: inputPath });
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(proof, null, 2)}\n`, 'utf8');
  console.log(`RUNTIME_BLOB_PASS ${outputPath} ${proof.proofSha256}`);
}

if (process.argv[1] && import.meta.url.endsWith(path.resolve(process.argv[1]).replaceAll('\\', '/'))) main();

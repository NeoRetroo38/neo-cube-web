import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCubeEdges,
  createDecisionGrid,
  createProjector,
  createRunPath,
  isMeasurement,
  measurementToPoint,
  parseRun,
  toSvgPoints,
} from '../dist/index.js';

const run = [
  { phase: 1, row: 1, column: 3 },
  { phase: 2, row: 2, column: 2 },
  { phase: 3, row: 3, column: 1 },
];

test('validates only the exact public measurement shape', () => {
  assert.equal(isMeasurement(run[0]), true);
  assert.equal(isMeasurement({ ...run[0], weight: 4 }), false);
  assert.equal(isMeasurement({ phase: 0, row: 1, column: 1 }), false);
});

test('validates and orders one measurement per phase', () => {
  assert.deepEqual(parseRun([...run].reverse()), run);
  assert.throws(() => parseRun([run[0], run[0], run[2]]), /phases 1, 2, and 3/);
});

test('maps indices to display coordinates without inference', () => {
  assert.deepEqual(measurementToPoint(run[0]), [1, 1, -1]);
  assert.deepEqual(createRunPath(run), [[1, 1, -1], [0, 0, 0], [-1, -1, 1]]);
});

test('creates the public display geometry', () => {
  assert.equal(createDecisionGrid().length, 27);
  assert.equal(createCubeEdges().length, 12);
});

test('projects geometry into SVG points deterministically', () => {
  const project = createProjector({ yaw: 0, pitch: 0, scale: 10, center: [50, 50] });
  assert.equal(toSvgPoints(createRunPath(run), project), '60,40 50,50 40,60');
});

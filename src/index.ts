/** A phase, row, or column in the public 3 × 3 × 3 representation. */
export type Cell = 1 | 2 | 3;
export type Phase = Cell;

/** Public observation returned after completing a run. */
export interface Measurement {
  readonly phase: Phase;
  readonly row: Cell;
  readonly column: Cell;
}

export type Vec2 = readonly [x: number, y: number];
export type Vec3 = readonly [x: number, y: number, z: number];
export type Edge3 = readonly [from: Vec3, to: Vec3];

export interface ProjectionOptions {
  readonly yaw?: number;
  readonly pitch?: number;
  readonly scale?: number;
  readonly center?: Vec2;
}

const CELLS = new Set<number>([1, 2, 3]);

export function isMeasurement(value: unknown): value is Measurement {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return Object.keys(item).length === 3
    && CELLS.has(item.phase as number)
    && CELLS.has(item.row as number)
    && CELLS.has(item.column as number);
}

/**
 * Validates the public transport shape. It does not calculate or infer a result.
 */
export function parseRun(value: unknown): readonly Measurement[] {
  if (!Array.isArray(value) || value.length !== 3 || !value.every(isMeasurement)) {
    throw new TypeError('A run must contain exactly three valid measurements.');
  }
  const ordered = [...value].sort((a, b) => a.phase - b.phase);
  if (!ordered.every((measurement, index) => measurement.phase === index + 1)) {
    throw new TypeError('A run must contain phases 1, 2, and 3 exactly once.');
  }
  return ordered.map(({ phase, row, column }) => ({ phase, row, column }));
}

/** Maps public 1-based indices to a centered Cartesian display coordinate. */
export function measurementToPoint(measurement: Measurement, spacing = 1): Vec3 {
  if (!isMeasurement(measurement)) throw new TypeError('Invalid measurement.');
  if (!Number.isFinite(spacing) || spacing <= 0) throw new RangeError('Spacing must be positive.');
  return [
    (measurement.column - 2) * spacing,
    (2 - measurement.row) * spacing,
    (measurement.phase - 2) * spacing,
  ];
}

/** Returns the 27 visible decision-grid points of the 3 × 3 × 3 cube. */
export function createDecisionGrid(spacing = 1): readonly Vec3[] {
  if (!Number.isFinite(spacing) || spacing <= 0) throw new RangeError('Spacing must be positive.');
  const points: Vec3[] = [];
  for (let phase = 1; phase <= 3; phase += 1) {
    for (let row = 1; row <= 3; row += 1) {
      for (let column = 1; column <= 3; column += 1) {
        points.push(measurementToPoint({ phase: phase as Phase, row: row as Cell, column: column as Cell }, spacing));
      }
    }
  }
  return points;
}

/** Returns the twelve outer edges of a cube centered on the origin. */
export function createCubeEdges(size = 2): readonly Edge3[] {
  if (!Number.isFinite(size) || size <= 0) throw new RangeError('Size must be positive.');
  const h = size / 2;
  const vertices: Vec3[] = [
    [-h, -h, -h], [h, -h, -h], [h, h, -h], [-h, h, -h],
    [-h, -h, h], [h, -h, h], [h, h, h], [-h, h, h],
  ];
  const pairs = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ] as const;
  return pairs.map(([a, b]) => [vertices[a]!, vertices[b]!] as const);
}

/** Produces an orthographic projector suitable for SVG, Canvas, or CSS. */
export function createProjector(options: ProjectionOptions = {}): (point: Vec3) => Vec2 {
  const yaw = options.yaw ?? -Math.PI / 4;
  const pitch = options.pitch ?? Math.PI / 6;
  const scale = options.scale ?? 1;
  const center = options.center ?? [0, 0];
  if (![yaw, pitch, scale, ...center].every(Number.isFinite) || scale <= 0) {
    throw new RangeError('Projection options must contain finite values and a positive scale.');
  }
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  return ([x, y, z]: Vec3): Vec2 => {
    const rotatedX = x * cy - z * sy;
    const rotatedZ = x * sy + z * cy;
    const projectedY = y * cp - rotatedZ * sp;
    return [center[0] + rotatedX * scale, center[1] - projectedY * scale];
  };
}

/** Converts a completed public run into a display-only 3D path. */
export function createRunPath(value: unknown, spacing = 1): readonly Vec3[] {
  return parseRun(value).map(measurement => measurementToPoint(measurement, spacing));
}

/** Formats projected run points for an SVG polyline `points` attribute. */
export function toSvgPoints(points: readonly Vec3[], project = createProjector()): string {
  return points.map(point => project(point).map(number => trim(number)).join(',')).join(' ');
}

function trim(value: number): string {
  return Number(value.toFixed(4)).toString();
}

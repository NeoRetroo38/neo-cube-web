# neo-cube-web

Small, framework-agnostic TypeScript helpers for drawing the public 3 × 3 × 3
representation used by the Neo Cube.

It validates public measurements and turns them into display geometry for SVG,
Canvas, WebGL, Three.js, React, Vue, Svelte, or plain JavaScript. It contains no
inference, scoring, weights, private engine state, or C++ implementation.

## Install from GitHub

```bash
npm install github:NeoRetroo38/neo-cube-web
```

## Example

```ts
import {
  createProjector,
  createRunPath,
  toSvgPoints,
} from '@neoretroo38/neo-cube-web';

const measurements = [
  { phase: 1, row: 1, column: 3 },
  { phase: 2, row: 2, column: 2 },
  { phase: 3, row: 3, column: 1 },
];

const path = createRunPath(measurements);
const project = createProjector({ scale: 48, center: [120, 120] });
const svgPoints = toSvgPoints(path, project);
```

```html
<svg viewBox="0 0 240 240" aria-label="Neo Cube run">
  <polyline
    points="<!-- svgPoints -->"
    fill="none"
    stroke="#39ff14"
    stroke-width="3"
  />
</svg>
```

## API

- `isMeasurement(value)` checks the exact public transport shape.
- `parseRun(value)` validates phases 1–3 and returns them in display order.
- `measurementToPoint(measurement)` maps 1-based indices to centered XYZ.
- `createDecisionGrid()` returns the 27 display points.
- `createCubeEdges()` returns the twelve outer cube edges.
- `createProjector()` creates an orthographic 3D-to-2D projector.
- `createRunPath()` converts a completed run to a display path.
- `toSvgPoints()` formats projected geometry for SVG.

## Design boundary

This package draws data that an application already has. It does not derive a
result from user input, interpret a run, or reproduce the Neo Cube engine. The
engine remains a separate C++ service.

## Development

```bash
npm install
npm run check
npm test
```

MIT © NeoRetroo38

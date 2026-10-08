# Agent boundary

This public package contains display-only geometry for the public Neo Cube
measurement shape: `{ phase, row, column }`, with values 1–3.

- Do not add inference, scoring, centroids, weights, heuristics, probabilities,
  interpretations, or private engine state.
- Do not copy C++ engine code into this repository.
- Keep the runtime framework-agnostic and free of secrets or user data.
- Geometry and projection must remain deterministic and display-only.
- Changes enter `main` through a branch and pull request; never force-push.

# Coordinate Conventions — v0.1.0

## Global Standard
- Right-handed system, `Y` up.
- `X`: East (+) / West (-)
- `Y`: Up (+) / Down (-)
- `Z`: South (+) / North (-)
- Origin at centre of board grid.
- Units: 1 = 1 tile spacing (meters equivalent).

## Board Space
- Grid indices `(row, col)` map to world coordinates via:
  - `worldX = (col - (size - 1) / 2) * tileSpacing`
  - `worldZ = (-(row - (size - 1) / 2)) * tileSpacing`
  - `worldY = 0` (board plane)
- `tileSpacing` defaults to `1`.

## Transform Trace
```
vec_world = model_board * vec_local_tile
vec_view = view_camera * vec_world
vec_ndc = projection * vec_view
```

## UI Representation
- 2D layout reflects `X` (columns) horizontally and `Z` (rows) vertically.
- Debug overlay (later phase) should display `X`, `Y`, `Z` world coords.

## Checklist
- [ ] Coordinate helpers covered by tests.
- [ ] Round-trip conversions verified.
- [ ] Axes helpers toggled in 3D contexts (future work).

Context realigned successfully according to COORDINATE_CONVENTIONS.md.
## Coordinate Conventions

- **Global Reference**: Right-handed, Y-up, origin centered — inherited from Cursor global rules.
- **2048 Board Space** (`board → screen`):
  - `x` increases to the right (column index 0 → 3).
  - `y` increases downward (row index 0 → 3) to match DOM layout.
  - Tile positions are computed in grid units, then mapped to pixels via CSS transforms (local → screen space).
- **Animation Space Trace**
  ```
  vec_screen = layoutMatrix_screen←board * vec_board
  ```
  where `vec_board = [col, row, 1]` (grid units) and `layoutMatrix_screen←board` encodes tile size + gap.
- **Touch Input Space**
  - Swipe deltas interpreted in screen space, converted back to board directions (screen → board).
  - Normalization uses `Math.abs(deltaX)` vs `Math.abs(deltaY)` to resolve axis.

Round-trip verification is handled in tests planned for AC2+ (board ↔ screen).

Context realigned successfully according to COORDINATE_CONVENTIONS.md.


/** A shared cylindrical wall, projected through one camera with even image gaps. */
export function collectionGeometry(
  distance: number,
  stride: number,
  viewport: number,
) {
  const offset =
    Math.abs(distance) < 0.004 ? 0 : Math.max(-3, Math.min(3, distance));
  const step = viewport > 1100 ? 0.07 : viewport > 600 ? 0.045 : 0.018;
  const radius = stride / step;
  const arc = offset * step;
  // Smoothly redistribute arc length to counter perspective crowding toward
  // the edges. All centers still lie on the same cylinder at this angle.
  const angle = arc + 0.5 * arc ** 3;
  const z = radius * (Math.cos(angle) - 1);
  const compensation = 1 - z / 1800;
  // Panel centers lie on one circle and their planes follow its tangents.
  // Uniform scale compensates vertical camera foreshortening without stretching
  // photography; the shallow radius preserves narrow gaps between panels.
  const arcX = radius * Math.sin(angle);
  return {
    x: arcX - offset * stride,
    z,
    rotateY: (angle * 180) / Math.PI,
    scale: compensation,
  };
}

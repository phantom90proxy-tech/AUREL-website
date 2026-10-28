/**
 * Reviewed against the original photographs. Bounds describe the entire watch
 * (including strap), as percentages of the source image, not an image crop.
 * Bounds are used to verify safe editorial crops. Original source files and
 * embedded provenance labels are never retouched or removed.
 */
export interface ImageFraming {
  ratio: number;
  /** Existing clean artwork, when the catalog photograph has an embedded label. */
  cardImage?: string;
  bounds: readonly [x: number, y: number, width: number, height: number];
}
const portrait = 1024 / 1536;
export const imageFraming: Record<string, ImageFraming> = {
  apex: { ratio: portrait, bounds: [12, 13, 78, 74] },
  aster: { ratio: 1023 / 1537, bounds: [18, 17, 65, 66] },
  aurora: { ratio: 928 / 1152, bounds: [6, 25, 88, 59] },
  eclipse: { ratio: 928 / 1152, bounds: [13, 10, 76, 79] },
  summit: { ratio: portrait, bounds: [12, 12, 79, 76] },
  heritage: { ratio: portrait, bounds: [13, 14, 75, 72] },
  "deep-ocean": { ratio: portrait, bounds: [14, 13, 75, 74] },
  chrono: { ratio: portrait, bounds: [10, 12, 80, 78] },
  elan: { ratio: 1, bounds: [19, 7, 62, 82] },
  linea: { ratio: portrait, bounds: [17, 15, 67, 68] },
  monarch: { ratio: portrait, bounds: [13, 14, 76, 74] },
  regent: { ratio: portrait, bounds: [14, 12, 74, 76] },
  titan: { ratio: portrait, bounds: [13, 14, 76, 74] },
  velocity: { ratio: portrait, bounds: [9, 12, 82, 78] },
  fenwick: { ratio: 1, bounds: [22, 8, 57, 81] },
  solace: {
    ratio: 1,
    bounds: [18, 12, 67, 84],
  },
  glen: {
    ratio: 1,
    bounds: [18, 10, 65, 86],
  },
  interval: { ratio: 1, bounds: [17, 8, 66, 81] },
  quay: { ratio: 1, bounds: [17, 8, 66, 80] },
  woven: { ratio: 1, bounds: [18, 8, 65, 80] },
  marlow: { ratio: portrait, bounds: [10, 13, 80, 74] },
  north: { ratio: 1, bounds: [19, 9, 64, 79] },
  alder: { ratio: 1, bounds: [20, 8, 61, 80] },
  pillar: { ratio: 1, bounds: [20, 9, 60, 78] },
  ballast: { ratio: portrait, bounds: [11, 15, 79, 73] },
  ridge: { ratio: 1, bounds: [18, 10, 65, 78] },
  vail: { ratio: 1, bounds: [17, 8, 66, 79] },
  path: { ratio: 1, bounds: [18, 9, 65, 78] },
  still: { ratio: 1, bounds: [20, 8, 62, 80] },
  kindle: { ratio: 1, bounds: [20, 8, 62, 80] },
};

export const CONFIG = {
  // scales (not physical exact but sensible visual)
  SUN_RADIUS_KM: 695700,
  EARTH_RADIUS_KM: 6371,
  MOON_RADIUS_KM: 1737.4,
  D_EARTH_SUN_KM: 149597870,
  D_EARTH_MOON_KM: 384400,

  // visual scales
  sceneScale: 0.0006,        // converts km -> scene units (tweak for view)
  default: {
    moonDistanceScale: 1.0,  // multiplier of average distance
    moonSizeScale: 1.0,
    sunDistanceScale: 1.0,
    timeSpeed: 1.0,
    tiltDeg: 23.44
  },

  // GUI ranges
  ranges: {
    timeSpeed: [0.1, 10],
    moonDistanceScale: [0.7, 1.5],
    moonSizeScale: [0.6, 1.5],
    sunDistanceScale: [0.98, 1.02]
  }
};

import { GUI } from 'https://unpkg.com/lil-gui@0.18.1/dist/lil-gui.esm.min.js';
import { CONFIG } from './config.js';

export function createGUI(state, callbacks){
  // state: object with properties we control
  const gui = new GUI({container: document.getElementById('guiContainer')});
  gui.add(state, 'timeSpeed', CONFIG.ranges.timeSpeed[0], CONFIG.ranges.timeSpeed[1]).name('Time Speed').onChange(v=>callbacks.onSpeed(v));
  gui.add(state, 'moonDistanceScale', CONFIG.ranges.moonDistanceScale[0], CONFIG.ranges.moonDistanceScale[1]).name('Moon Distance').onChange(v=>callbacks.onMoonDist(v));
  gui.add(state, 'moonSizeScale', CONFIG.ranges.moonSizeScale[0], CONFIG.ranges.moonSizeScale[1]).name('Moon Size').onChange(v=>callbacks.onMoonSize(v));
  gui.add(state, 'sunDistanceScale', CONFIG.ranges.sunDistanceScale[0], CONFIG.ranges.sunDistanceScale[1]).name('Sun Distance').onChange(v=>callbacks.onSunDist(v));
  gui.add(state, 'showShadows').name('Show Shadows').onChange(v=>callbacks.onToggleShadows(v));
  gui.add(state, 'showCones').name('Show Umbra/Pen').onChange(v=>callbacks.onToggleCones(v));
  gui.add(state, 'showOrbits').name('Show Orbits').onChange(v=>callbacks.onToggleOrbits(v));
  gui.add({reset:callbacks.onReset}, 'reset').name('Reset Preset');
  return gui;
}

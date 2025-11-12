import { CONFIG } from './config.js';
import { SceneRenderer } from './renderer.js';
import { createGUI } from './controls.js';
import { initCharts, pushFluxData, updateDataPanel } from './ui.js';
import { angularRadiusDeg, kmToScene } from './helpers.js';
import { computeUmbraPenumbraAtDist } from './physics.js';

// state
const APP = {
  time:0,
  running:false,
  state:{
    timeSpeed: 1.0,
    moonDistanceScale: CONFIG.default.moonDistanceScale,
    moonSizeScale: CONFIG.default.moonSizeScale,
    sunDistanceScale: CONFIG.default.sunDistanceScale,
    showShadows:true,
    showCones:true,
    showOrbits:true
  },
  fluxSeries:[]
};

// init renderer
const canvas = document.getElementById('threeCanvas');
const renderer = new SceneRenderer(canvas);
renderer.createBodies();
renderer.createShadowCones();

initCharts();

// create GUI
createGUI(APP.state, {
  onSpeed: v=> APP.state.timeSpeed = v,
  onMoonDist: v=> APP.state.moonDistanceScale = v,
  onMoonSize: v=> APP.state.moonSizeScale = v,
  onSunDist: v=> APP.state.sunDistanceScale = v,
  onToggleShadows: v=> { renderer.sunLight.visible = v; },
  onToggleCones: v=> { renderer.umbraCone.visible = v; renderer.penumbraCone.visible = v; },
  onToggleOrbits: v=> { /* implement orbit helpers if needed */ },
  onReset: ()=> resetSim()
});

// UI buttons
document.getElementById('startBtn').addEventListener('click', ()=> APP.running=true);
document.getElementById('pauseBtn').addEventListener('click', ()=> APP.running=false);
document.getElementById('resetBtn').addEventListener('click', ()=> resetSim());
document.getElementById('presetTotal').addEventListener('click', applyTotalPreset);
document.getElementById('presetAnnular').addEventListener('click', applyAnnularPreset);

document.addEventListener('keydown', (e)=>{
  if (e.code === 'Space'){ APP.running = !APP.running; e.preventDefault(); }
  if (e.key === 'r' || e.key === 'R') resetSim();
});

function resetSim(){
  APP.time = 0; APP.running = false; APP.state.timeSpeed = 1.0;
  APP.state.moonDistanceScale = CONFIG.default.moonDistanceScale;
  APP.state.moonSizeScale = CONFIG.default.moonSizeScale;
  APP.state.sunDistanceScale = CONFIG.default.sunDistanceScale;
  APP.fluxSeries.length = 0;
}

function applyTotalPreset(){
  APP.state.moonDistanceScale = 0.98;
  APP.state.moonSizeScale = 1.06;
  APP.state.sunDistanceScale = 1.0;
}
function applyAnnularPreset(){
  APP.state.moonDistanceScale = 1.22;
  APP.state.moonSizeScale = 0.94;
  APP.state.sunDistanceScale = 1.002;
}

// main animation loop
function animate(){
  requestAnimationFrame(animate);
  if (APP.running) {
    APP.time += 0.002 * APP.state.timeSpeed;
  }

  // compute geometry
  const sunDist_km = CONFIG.D_EARTH_SUN_KM * APP.state.sunDistanceScale;
  const moonDist_km = CONFIG.D_EARTH_MOON_KM * APP.state.moonDistanceScale;
  const sunPos = new THREE.Vector3( kmToScene(sunDist_km*0.0), kmToScene(0), kmToScene(-sunDist_km*0.85) ); // placed visually behind
  const earthPos = new THREE.Vector3(0,0,0);
  const moonX = Math.cos(APP.time*2*Math.PI) * kmToScene(moonDist_km);
  const moonZ = Math.sin(APP.time*2*Math.PI) * kmToScene(moonDist_km*0.22);
  const moonPos = new THREE.Vector3(moonX, 0, moonZ);

  // update meshes positions & scales
  renderer.sunMesh.position.copy(sunPos);
  renderer.earthMesh.position.copy(earthPos);
  renderer.moonMesh.position.copy(moonPos);

  // update sun light
  renderer.updateSunLight(sunPos);

  // compute umb/pen parameters
  const umbPen = computeUmbraPenumbraAtDist(moonDist_km, sunDist_km);
  const umbParams = { radiusAtMoon_km: umbPen.rUmbra || umbPen.rUmbra, length_km: umbPen.Lumbra || umbPen.Lumbra };
  const penParams = { radiusAtMoon_km: umbPen.rPenumbra || umbPen.rPenumbra, length_km: umbPen.Lumbra*1.2 || umbPen.Lumbra*1.2 };

  renderer.setShadowConeTransforms({radiusAtMoon_km: umbPen.rUmbra || umbPen.r_umbra}, {radiusAtMoon_km: umbPen.rPenumbra || umbPen.r_penumbra}, sunPos, moonPos, earthPos);

  // angle calculations (deg)
  const angSun = angularRadiusDeg(CONFIG.SUN_RADIUS_KM, sunDist_km);
  const angMoon = angularRadiusDeg(CONFIG.MOON_RADIUS_KM * APP.state.moonSizeScale, moonDist_km);

  // rough obscuration: compare centers in screen/projected plane (approx)
  const centerSep = moonPos.distanceTo(new THREE.Vector3(0,0,0));
  const sep_km = (centerSep / CONFIG.sceneScale);
  const sunR_km = CONFIG.SUN_RADIUS_KM * (1/APP.state.sunDistanceScale);
  const moonR_km = CONFIG.MOON_RADIUS_KM * APP.state.moonSizeScale;
  // approximate obscuration by angular radii ratio
  let obsc = 0;
  if (angMoon >= angSun) obsc = 1.0; else obsc = Math.min(1, (angMoon/angSun)*0.98);

  // flux sampling approximate (1 - obsc)
  const flux = 1 - obsc;
  pushFluxData(APP.time*1000, flux);
  updateDataPanel(APP.time, angSun, angMoon, obsc, (obsc>0.999? 'Total':'Partial/Annular'));

  // render
  renderer.render();
}

animate();

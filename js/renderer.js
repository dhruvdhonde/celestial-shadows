import * as THREE from "https://unpkg.com/three@0.154.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.154.0/examples/jsm/controls/OrbitControls.js";
import { CONFIG } from './config.js';
import { kmToScene } from './helpers.js';

export class SceneRenderer {
  constructor(canvas){
    this.canvas = canvas;
    this.init();
  }

  init(){
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, w/h, 0.1, 1e7);
    this.camera.position.set(0, kmToScene(1800000), kmToScene(1800000));
    this.renderer = new THREE.WebGLRenderer({canvas:this.canvas, antialias:true});
    this.renderer.setSize(w,h);
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.minDistance = 10; this.controls.maxDistance = 1e7;

    // scene ambient + sun light
    this.ambient = new THREE.AmbientLight(0xffffff, 0.18);
    this.scene.add(this.ambient);

    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.near = 0.1;
    this.sunLight.shadow.camera.far = 1e8;
    this.scene.add(this.sunLight);

    // create groups
    this.groupSun = new THREE.Group(); this.groupEarth = new THREE.Group(); this.groupMoon = new THREE.Group();
    this.scene.add(this.groupSun); this.scene.add(this.groupEarth); this.scene.add(this.groupMoon);

    // visual helpers placeholders
    this.sunMesh = null; this.earthMesh = null; this.moonMesh = null;
    this.umbraCone = null; this.penumbraCone = null;

    // resize handling
    window.addEventListener('resize', ()=> this.onResize());
  }

  onResize(){
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w,h);
  }

  createBodies(textureLoader){
    // Sun
    const sunGeo = new THREE.SphereGeometry(kmToScene(CONFIG.SUN_RADIUS_KM), 48, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffcc, emissive:0xffffcc });
    this.sunMesh = new THREE.Mesh(sunGeo, sunMat);
    this.groupSun.add(this.sunMesh);

    // Earth
    const earthGeo = new THREE.SphereGeometry(kmToScene(CONFIG.EARTH_RADIUS_KM), 48, 32);
    const earthMat = new THREE.MeshStandardMaterial({ color: 0x2266aa, roughness:1 });
    this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthMesh.castShadow = false; this.earthMesh.receiveShadow = true;
    this.groupEarth.add(this.earthMesh);

    // Moon
    const moonGeo = new THREE.SphereGeometry(kmToScene(CONFIG.MOON_RADIUS_KM), 32, 24);
    const moonMat = new THREE.MeshStandardMaterial({ color:0x999999, roughness:1 });
    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.groupMoon.add(this.moonMesh);

    // Add small helper lights to boost visibility
    const sunGlow = new THREE.PointLight(0xfff0b0, 0.4, 0);
    this.sunMesh.add(sunGlow);
  }

  updateSunLight(pos){
    this.sunLight.position.copy(pos);
    // aim the sun light at world origin (earth)
    this.sunLight.target.position.set(0,0,0);
    this.scene.add(this.sunLight.target);
  }

  createShadowCones(){
    // Umbra (dark narrow cone) and penumbra (wider transparent cone)
    if (this.umbraCone) this.scene.remove(this.umbraCone);
    if (this.penumbraCone) this.scene.remove(this.penumbraCone);

    const umbGeo = new THREE.ConeGeometry(1, 1, 24,1,true);
    const umbMat = new THREE.MeshBasicMaterial({color:0x000000, transparent:true, opacity:0.45, depthWrite:false});
    this.umbraCone = new THREE.Mesh(umbGeo, umbMat);
    this.scene.add(this.umbraCone);

    const penGeo = new THREE.ConeGeometry(1, 1, 24,1,true);
    const penMat = new THREE.MeshBasicMaterial({color:0x666666, transparent:true, opacity:0.18, depthWrite:false});
    this.penumbraCone = new THREE.Mesh(penGeo, penMat);
    this.scene.add(this.penumbraCone);
  }

  setShadowConeTransforms(umbraParams, penParams, sunPos, moonPos, earthPos){
    // umbraParams and penParams: {radiusAtMoon_km, length_km}
    // Convert to scene
    const umbRadius = Math.max(1e-6, umbraParams.radiusAtMoon_km) * CONFIG.sceneScale;
    const penRadius = Math.max(1e-6, penParams.radiusAtMoon_km) * CONFIG.sceneScale;
    const distSunMoon = sunPos.distanceTo(moonPos);

    // Position cones so apex at moon and extend toward earth (simple visual)
    const dir = new THREE.Vector3().subVectors(earthPos, moonPos).normalize();
    // Umbra: length scaled visually
    const umbLength = moonPos.distanceTo(earthPos);
    const penLength = umbLength * 1.2;

    this.umbraCone.scale.set(umbRadius*2, umbLength, umbRadius*2);
    this.umbraCone.position.copy(moonPos).add(dir.clone().multiplyScalar(umbLength/2));
    this.umbraCone.lookAt(earthPos);

    this.penumbraCone.scale.set(penRadius*2, penLength, penRadius*2);
    this.penumbraCone.position.copy(moonPos).add(dir.clone().multiplyScalar(penLength/2));
    this.penumbraCone.lookAt(earthPos);
  }

  render(){
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

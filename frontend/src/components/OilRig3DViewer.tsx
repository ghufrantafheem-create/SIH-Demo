import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Play,
  Pause,
  RotateCcw,
  Sun,
  Moon,
  Sunset,
  Eye,
  Box,
  Sliders,
  Layers,
  Sparkles,
  Activity,
  Flame,
  Gauge,
  Camera,
  Compass,
  CheckCircle2,
  Info
} from 'lucide-react';
import { soundFx } from '../utils/sound';

interface OilRig3DViewerProps {
  spm?: number;
  strokeLengthM?: number;
  wellId?: string;
}

type ViewPreset = 'overview' | 'wellhead' | 'subsurface' | 'powertrain';
type DisplayMode = 'realistic' | 'xray_stress' | 'wireframe';
type LightPreset = 'sunset' | 'noon' | 'midnight';

export const OilRig3DViewer: React.FC<OilRig3DViewerProps> = ({
  spm = 8.5,
  strokeLengthM = 3.2,
  wellId = 'BGW-001'
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSPM, setCurrentSPM] = useState(spm);
  const [lightPreset, setLightPreset] = useState<LightPreset>('sunset');
  const [showSubsurface, setShowSubsurface] = useState(true);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('realistic');
  const [viewPreset, setViewPreset] = useState<ViewPreset>('overview');
  const [selectedComponent, setSelectedComponent] = useState<{
    name: string;
    telemetry: string;
    status: string;
    spec: string;
  } | null>(null);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const spmRef = useRef(currentSPM);
  const displayModeRef = useRef(displayMode);
  const targetCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(18, 12, 24));
  const targetLookAtRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3.5, 1));

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    spmRef.current = currentSPM;
  }, [currentSPM]);

  useEffect(() => {
    setCurrentSPM(spm);
  }, [spm]);

  useEffect(() => {
    displayModeRef.current = displayMode;
  }, [displayMode]);

  // Handle Camera Presets
  const setCameraView = (preset: ViewPreset) => {
    soundFx.playClick();
    setViewPreset(preset);
    switch (preset) {
      case 'overview':
        targetCameraPosRef.current.set(18, 12, 24);
        targetLookAtRef.current.set(0, 3.5, 1);
        break;
      case 'wellhead':
        targetCameraPosRef.current.set(4, 5, 15);
        targetLookAtRef.current.set(0, 4.5, 8.4);
        break;
      case 'subsurface':
        targetCameraPosRef.current.set(10, -5, 16);
        targetLookAtRef.current.set(0, -6.5, 8.4);
        break;
      case 'powertrain':
        targetCameraPosRef.current.set(6, 4.5, -9);
        targetLookAtRef.current.set(0, 2.5, -5.5);
        break;
    }
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.copy(targetCameraPosRef.current);
    camera.lookAt(targetLookAtRef.current);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa44, 2.4);
    sunLight.position.set(25, 40, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 25;
    sunLight.shadow.camera.bottom = -25;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const cyanFillLight = new THREE.DirectionalLight(0x00e5ff, 0.8);
    cyanFillLight.position.set(-25, 15, -20);
    scene.add(cyanFillLight);

    // Rig Worklights
    const wellheadLight = new THREE.PointLight(0x00e5ff, 1.5, 14);
    wellheadLight.position.set(0, 3.5, 8.4);
    scene.add(wellheadLight);

    const mastBeaconLight = new THREE.PointLight(0xff3333, 2.0, 18);
    mastBeaconLight.position.set(0, 8.2, 0);
    scene.add(mastBeaconLight);

    // 3. Materials Library (PBR Industrial Metallic & Weathered)
    const steelOrangeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
      metalness: 0.75,
      envMapIntensity: 1.2
    });

    const ironCastMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.55,
      metalness: 0.85
    });

    const chromeRodMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.98
    });

    const valveBlueMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.65
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x292019,
      roughness: 0.88,
      metalness: 0.15
    });

    const desertSandMat = new THREE.MeshStandardMaterial({
      color: 0x1f140c,
      roughness: 0.95,
      metalness: 0.05
    });

    const glowCyanMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.85
    });

    const glowAmberMat = new THREE.MeshStandardMaterial({
      color: 0xff9f1c,
      emissive: 0xff9f1c,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.8
    });

    // 4. Desert Terrain & Pad Base
    const terrainGeo = new THREE.PlaneGeometry(80, 80, 48, 48);
    // Add subtle procedural dunes elevation
    const posAttr = terrainGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const elevation = Math.sin(vx * 0.08) * Math.cos(vy * 0.08) * 0.8;
      posAttr.setZ(i, elevation);
    }
    terrainGeo.computeVertexNormals();

    const terrain = new THREE.Mesh(terrainGeo, desertSandMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = -0.1;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // Concrete Well Pad with Yellow Safety Stripes
    const padGroup = new THREE.Group();
    scene.add(padGroup);

    const pad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 22), concreteMat);
    pad.position.set(0, 0.3, 1.0);
    pad.receiveShadow = true;
    padGroup.add(pad);

    // Safety Exclusion Line (Hazard Stripes)
    const safetyLine = new THREE.Mesh(
      new THREE.BoxGeometry(15.6, 0.05, 21.6),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.3, roughness: 0.6 })
    );
    safetyLine.position.set(0, 0.62, 1.0);
    padGroup.add(safetyLine);

    // 5. Samson Post Tower (Articulated Triangular Truss with Cross Bracing)
    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    const legGeo = new THREE.CylinderGeometry(0.18, 0.26, 7.6, 12);
    const leg1 = new THREE.Mesh(legGeo, steelOrangeMat);
    leg1.position.set(-1.3, 4.1, -1.3);
    leg1.rotation.set(-0.16, 0, -0.16);
    leg1.castShadow = true;
    rigGroup.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, steelOrangeMat);
    leg2.position.set(1.3, 4.1, -1.3);
    leg2.rotation.set(-0.16, 0, 0.16);
    leg2.castShadow = true;
    rigGroup.add(leg2);

    const leg3 = new THREE.Mesh(legGeo, steelOrangeMat);
    leg3.position.set(-1.3, 4.1, 1.3);
    leg3.rotation.set(0.16, 0, -0.16);
    leg3.castShadow = true;
    rigGroup.add(leg3);

    const leg4 = new THREE.Mesh(legGeo, steelOrangeMat);
    leg4.position.set(1.3, 4.1, 1.3);
    leg4.rotation.set(0.16, 0, 0.16);
    leg4.castShadow = true;
    rigGroup.add(leg4);

    // Samson Post Cross Braces (K-Truss lattice)
    for (let h = 2.0; h <= 6.0; h += 2.0) {
      const braceX1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.12), steelOrangeMat);
      braceX1.position.set(0, h, -1.3);
      rigGroup.add(braceX1);

      const braceX2 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 0.12), steelOrangeMat);
      braceX2.position.set(0, h, 1.3);
      rigGroup.add(braceX2);

      const braceZ1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.6), steelOrangeMat);
      braceZ1.position.set(-1.3, h, 0);
      rigGroup.add(braceZ1);

      const braceZ2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 2.6), steelOrangeMat);
      braceZ2.position.set(1.3, h, 0);
      rigGroup.add(braceZ2);
    }

    // Top Saddle Center Bearing Block
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.6), ironCastMat);
    saddle.position.set(0, 7.8, 0);
    saddle.castShadow = true;
    rigGroup.add(saddle);

    // Flashing Aviation Beacon on Top
    const beaconSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 2.0 })
    );
    beaconSphere.position.set(0, 8.4, 0);
    rigGroup.add(beaconSphere);

    // 6. Walking Beam Assembly (Rocking Linkage)
    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 8.0, 0);
    rigGroup.add(beamPivot);

    // Wide-Flange Heavy Steel Walking Beam
    const beamWeb = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 14.2), steelOrangeMat);
    beamWeb.castShadow = true;
    beamPivot.add(beamWeb);

    const beamTopFlange = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 14.2), steelOrangeMat);
    beamTopFlange.position.set(0, 0.7, 0);
    beamPivot.add(beamTopFlange);

    const beamBtmFlange = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.18, 14.2), steelOrangeMat);
    beamBtmFlange.position.set(0, -0.7, 0);
    beamPivot.add(beamBtmFlange);

    // Horsehead (Front Curved Arc Head)
    const horseheadGroup = new THREE.Group();
    horseheadGroup.position.set(0, 0, 7.1);
    beamPivot.add(horseheadGroup);

    // Curvature arc head
    const horseheadGeo = new THREE.CylinderGeometry(2.2, 2.2, 1.1, 24, 1, false, 0, Math.PI);
    const horsehead = new THREE.Mesh(horseheadGeo, steelOrangeMat);
    horsehead.rotation.set(Math.PI / 2, -Math.PI / 2, 0);
    horsehead.position.set(0, -0.8, 1.1);
    horsehead.castShadow = true;
    horseheadGroup.add(horsehead);

    // Horsehead Stiffener Web Ribs
    const horseRib1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.4, 0.15), ironCastMat);
    horseRib1.position.set(0, -0.7, 0.2);
    horseheadGroup.add(horseRib1);

    // Twin Braided Wire Bridle Cables Hanging Vertically
    const cableGeo = new THREE.CylinderGeometry(0.04, 0.04, 5.2, 8);
    const cableMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });

    const cableL = new THREE.Mesh(cableGeo, cableMat);
    cableL.position.set(-0.35, -2.6, 2.2);
    horseheadGroup.add(cableL);

    const cableR = new THREE.Mesh(cableGeo, cableMat);
    cableR.position.set(0.35, -2.6, 2.2);
    horseheadGroup.add(cableR);

    // Carrier Bar linking Bridle Cables to Polished Rod
    const carrierBar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.24, 0.28), ironCastMat);
    carrierBar.position.set(0, -5.2, 2.2);
    horseheadGroup.add(carrierBar);

    // 7. Polished Sucker Rod String & Stuffing Box
    const rodGroup = new THREE.Group();
    rodGroup.position.set(0, 7.5, 9.3);
    rigGroup.add(rodGroup);

    // Polished Chrome Rod
    const polishedRod = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 9.2, 16), chromeRodMat);
    polishedRod.position.set(0, -3.8, 0);
    polishedRod.castShadow = true;
    rodGroup.add(polishedRod);

    // Rod Clamp on Carrier Bar
    const rodClamp = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.35, 0.4), ironCastMat);
    rodClamp.position.set(0, 0.7, 0);
    rodGroup.add(rodClamp);

    // 8. Surface Wellhead Christmas Tree Assembly
    const wellheadGroup = new THREE.Group();
    wellheadGroup.position.set(0, 0.6, 9.3);
    scene.add(wellheadGroup);

    // Stuffing Box Gland (Reciprocating Seal)
    const stuffingBox = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 1.2, 16), valveBlueMat);
    stuffingBox.position.set(0, 2.4, 0);
    wellheadGroup.add(stuffingBox);

    // Master Valves Block
    const masterValve = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.4, 1.1), valveBlueMat);
    masterValve.position.set(0, 1.2, 0);
    wellheadGroup.add(masterValve);

    // Valve Handwheels (Red & Blue Steel Wheels)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
    const handwheel = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 16), wheelMat);
    handwheel.position.set(0.65, 1.2, 0);
    handwheel.rotation.y = Math.PI / 2;
    wellheadGroup.add(handwheel);

    // Horizontal Emulsion Discharge Flowline
    const flowline = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 7.5, 16), steelOrangeMat);
    flowline.position.set(3.8, 1.8, 0);
    flowline.rotation.z = Math.PI / 2;
    wellheadGroup.add(flowline);

    // Flowing Crude Oil Pulse Particle (Travels through pipe)
    const fluidPulse = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), glowAmberMat);
    fluidPulse.position.set(0.6, 1.8, 0);
    wellheadGroup.add(fluidPulse);

    // 9. Mechanical Powertrain (Electric Motor, Belt Drive, Gearbox, Cranks & Pitmans)
    const powertrainGroup = new THREE.Group();
    powertrainGroup.position.set(0, 0.6, -5.8);
    rigGroup.add(powertrainGroup);

    // Double-Reduction Heavy Herringbone Gearbox
    const gearbox = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.8, 3.8), ironCastMat);
    gearbox.position.set(0, 1.4, 0);
    gearbox.castShadow = true;
    powertrainGroup.add(gearbox);

    // Electric 75kW Motor with Cowl
    const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 2.4, 16), ironCastMat);
    motor.position.set(-2.8, 0.8, -0.6);
    motor.rotation.z = Math.PI / 2;
    powertrainGroup.add(motor);

    // V-Belt Sheave Drive (Motor Pulley to Gearbox Flywheel)
    const motorPulley = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16), ironCastMat);
    motorPulley.position.set(-1.8, 0.8, -0.6);
    motorPulley.rotation.z = Math.PI / 2;
    powertrainGroup.add(motorPulley);

    const flywheel = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.4, 24), ironCastMat);
    flywheel.position.set(-1.8, 1.8, 0);
    flywheel.rotation.z = Math.PI / 2;
    powertrainGroup.add(flywheel);

    // Rotating Crank Pivot Shaft
    const crankPivot = new THREE.Group();
    crankPivot.position.set(0, 2.5, 0);
    powertrainGroup.add(crankPivot);

    // Dual Massive Counterweight Crank Arms (Left & Right)
    const crankArmL = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.9), ironCastMat);
    crankArmL.position.set(-2.0, -0.9, 0);
    crankArmL.castShadow = true;
    crankPivot.add(crankArmL);

    const crankArmR = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.2, 0.9), ironCastMat);
    crankArmR.position.set(2.0, -0.9, 0);
    crankArmR.castShadow = true;
    crankPivot.add(crankArmR);

    // Counterweight Heavy Slabs (Semi-circular Lead/Iron masses)
    const weightGeo = new THREE.BoxGeometry(0.7, 1.8, 1.8);
    const weightL = new THREE.Mesh(weightGeo, steelOrangeMat);
    weightL.position.set(-2.0, -1.8, 0);
    weightL.castShadow = true;
    crankPivot.add(weightL);

    const weightR = new THREE.Mesh(weightGeo, steelOrangeMat);
    weightR.position.set(2.0, -1.8, 0);
    weightR.castShadow = true;
    crankPivot.add(weightR);

    // Pitman Arms (Connecting Crank Pins to Equalizer Bar at Beam Tail)
    const pitmanGeo = new THREE.CylinderGeometry(0.14, 0.14, 6.2, 12);
    const pitmanL = new THREE.Mesh(pitmanGeo, ironCastMat);
    pitmanL.position.set(-2.0, 3.0, 0);
    crankPivot.add(pitmanL);

    const pitmanR = new THREE.Mesh(pitmanGeo, ironCastMat);
    pitmanR.position.set(2.0, 3.0, 0);
    crankPivot.add(pitmanR);

    // 10. Subsurface Geological Strata Cutaway with Working Sucker-Rod Pump
    const strataGroup = new THREE.Group();
    strataGroup.position.set(0, -6.8, 9.3);
    scene.add(strataGroup);

    // Geological Formation Cutaway 3-Tier Box
    // Layer 1: Overburden Sandstone (Top)
    const sandStrata = new THREE.Mesh(
      new THREE.BoxGeometry(11, 4.0, 9),
      new THREE.MeshStandardMaterial({ color: 0x3d2719, roughness: 0.9, transparent: true, opacity: 0.6 })
    );
    sandStrata.position.set(0, 3.5, 0);
    strataGroup.add(sandStrata);

    // Layer 2: Dense Bilara Shale Caprock (Impermeable Seal)
    const shaleCaprock = new THREE.Mesh(
      new THREE.BoxGeometry(11, 2.5, 9),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85, transparent: true, opacity: 0.75 })
    );
    shaleCaprock.position.set(0, 0.4, 0);
    strataGroup.add(shaleCaprock);

    // Layer 3: Heavy-Oil Pay Zone Reservoir (Bituminous Sandstone with Glow)
    const payzoneStrata = new THREE.Mesh(
      new THREE.BoxGeometry(11, 5.0, 9),
      new THREE.MeshStandardMaterial({ color: 0x090503, roughness: 0.95, transparent: true, opacity: 0.85 })
    );
    payzoneStrata.position.set(0, -3.2, 0);
    strataGroup.add(payzoneStrata);

    // Production Casing String Pipe
    const casing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 14, 16),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.4, transparent: true, opacity: 0.7 })
    );
    strataGroup.add(casing);

    // Downhole Pump Barrel (Sectioned Cutaway View)
    const pumpBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 4.2, 16, 1, true, 0, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.25, side: THREE.DoubleSide })
    );
    pumpBarrel.position.set(0, -3.0, 0);
    strataGroup.add(pumpBarrel);

    // Downhole Plunger with Working Traveling Valve Ball
    const plungerGroup = new THREE.Group();
    plungerGroup.position.set(0, -3.0, 0);
    strataGroup.add(plungerGroup);

    const plungerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.4, 16), chromeRodMat);
    plungerGroup.add(plungerBody);

    const travelingValveBall = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), glowCyanMat);
    travelingValveBall.position.set(0, -1.0, 0);
    plungerGroup.add(travelingValveBall);

    // Standing Valve Assembly (Fixed at bottom of pump barrel)
    const standingValveSeat = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.4, 16), ironCastMat);
    standingValveSeat.position.set(0, -4.8, 0);
    strataGroup.add(standingValveSeat);

    const standingValveBall = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), glowAmberMat);
    standingValveBall.position.set(0, -4.6, 0);
    strataGroup.add(standingValveBall);

    // Volumetric Steam Injection Thermal Plume (Particle Cloud)
    const steamPlumeParticles: THREE.Mesh[] = [];
    const plumeGroup = new THREE.Group();
    plumeGroup.position.set(0, -4.5, 0);
    strataGroup.add(plumeGroup);

    const plumeGeo = new THREE.SphereGeometry(0.4, 8, 8);
    for (let p = 0; p < 24; p++) {
      const pMesh = new THREE.Mesh(plumeGeo, glowAmberMat);
      const angle = (p / 24) * Math.PI * 2;
      const dist = 1.0 + Math.random() * 2.2;
      pMesh.position.set(Math.cos(angle) * dist, (Math.random() - 0.5) * 1.6, Math.sin(angle) * dist);
      plumeGroup.add(pMesh);
      steamPlumeParticles.push(pMesh);
    }

    // 11. Atmospheric Desert Dust Motes (Floating Golden Particles)
    const dustCount = 60;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let d = 0; d < dustCount * 3; d += 3) {
      dustPositions[d] = (Math.random() - 0.5) * 35;
      dustPositions[d + 1] = Math.random() * 15;
      dustPositions[d + 2] = (Math.random() - 0.5) * 35;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.15, transparent: true, opacity: 0.6 });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // 12. Interactive Mouse Drag & Orbit Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 30, theta: 0.8, phi: 1.1 };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(targetLookAtRef.current);
    };
    updateCameraPos();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      spherical.theta -= deltaX * 0.007;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.007));
      updateCameraPos();

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(8, Math.min(65, spherical.radius + e.deltaY * 0.035));
      updateCameraPos();
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // 13. High-Performance Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth Camera LERP Transition to Presets
      if (!isDragging) {
        camera.position.lerp(targetCameraPosRef.current, 0.05);
      }

      if (isPlayingRef.current) {
        const cycleSpeed = (spmRef.current * 2 * Math.PI) / 60; // angular rad/s
        
        // Continuous Crank Rotation (Counterweights spinning)
        crankPivot.rotation.x += cycleSpeed * delta;

        // Kinematic Walking Beam Angle
        const beamAngle = Math.sin(crankPivot.rotation.x) * 0.15;
        beamPivot.rotation.x = beamAngle;

        // Reciprocating Polished Sucker Rod Vertical Motion
        const strokeDisplacement = Math.sin(crankPivot.rotation.x) * (strokeLengthM / 2);
        rodGroup.position.y = 7.5 + strokeDisplacement;

        // Downhole Plunger Motion
        plungerGroup.position.y = -3.0 + strokeDisplacement * 0.85;

        // Working Downhole Valves Kinematics
        // Upstroke (strokeDisplacement rising): Standing valve opens, Traveling valve seals
        const isUpstroke = Math.cos(crankPivot.rotation.x) > 0;
        if (isUpstroke) {
          standingValveBall.position.y = -4.3; // Ball lifts off seat
          travelingValveBall.position.y = -1.15; // Ball firmly seated
        } else {
          // Downstroke: Standing valve seals, Traveling valve lifts
          standingValveBall.position.y = -4.6; // Ball seated
          travelingValveBall.position.y = -0.85; // Ball floating in cage
        }

        // Fast Motor Pulley Spin (12x Gearbox Reduction)
        motorPulley.rotation.x += cycleSpeed * 12 * delta;

        // Surface Pipe Fluid Flow Pulse
        const pipePulseX = ((elapsed * 2.5) % 6.0);
        fluidPulse.position.x = 0.8 + pipePulseX;

        // Mast Beacon Strobe (Blinking every 1 sec)
        const strobe = Math.sin(elapsed * 6.0) > 0.4 ? 2.5 : 0.2;
        mastBeaconLight.intensity = strobe;

        // Subsurface Steam Plume Expansion / Breathing Pulse
        steamPlumeParticles.forEach((p, idx) => {
          const breath = 1.0 + Math.sin(elapsed * 3.0 + idx) * 0.25;
          p.scale.setScalar(breath);
        });

        // Atmospheric Dust Gentle Wind Drift
        const dustPos = dustGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < dustCount * 3; i += 3) {
          dustPos[i] += 0.02; // Wind drift east
          if (dustPos[i] > 18) dustPos[i] = -18;
        }
        dustGeo.attributes.position.needsUpdate = true;
      }

      // Update Display Mode Visuals (X-Ray / Stress Mode)
      if (displayModeRef.current === 'xray_stress') {
        // Stress color-coding: Sucker rod changes color based on load phase
        const stressColor = Math.cos(crankPivot.rotation.x) > 0 ? 0xef4444 : 0x10b981;
        chromeRodMat.color.setHex(stressColor);
      } else {
        chromeRodMat.color.setHex(0xffffff);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mount) return;
      const newW = mount.clientWidth;
      const newH = mount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      mount.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      mount.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Lighting Presets
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (lightPreset === 'sunset') {
      scene.background = null;
    } else if (lightPreset === 'noon') {
      scene.background = null;
    } else if (lightPreset === 'midnight') {
      scene.background = null;
    }
  }, [lightPreset]);

  const resetCamera = () => {
    soundFx.playClick();
    setCameraView('overview');
  };

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl border border-cyan-500/20 backdrop-blur-2xl">
      {/* Top Header Bar with 3D Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/15 border border-cyan-400/35 shadow-[0_0_20px_rgba(0,229,255,0.25)]">
            <Box className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white tracking-wide">3D Blender-Grade SRP Oil Rig Simulator</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PBR KINEMATICS · 60 FPS
              </span>
            </div>
            <p className="text-xs text-cyan-200/60 font-mono">
              Working Downhole Valves · Four-Bar Linkage · Volumetric Steam Plume · 980m Cutaway
            </p>
          </div>
        </div>

        {/* Viewport Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Camera Preset Switcher */}
          <div className="flex items-center p-1 rounded-xl glass-subtle border border-cyan-500/20 text-xs font-mono">
            <button
              onClick={() => setCameraView('overview')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewPreset === 'overview' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setCameraView('wellhead')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewPreset === 'wellhead' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Wellhead
            </button>
            <button
              onClick={() => setCameraView('subsurface')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewPreset === 'subsurface' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Subsurface
            </button>
            <button
              onClick={() => setCameraView('powertrain')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                viewPreset === 'powertrain' ? 'bg-purple-500/30 text-purple-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Drive
            </button>
          </div>

          {/* Display Mode (Realistic vs Stress Heatmap) */}
          <button
            onClick={() => {
              soundFx.playClick();
              setDisplayMode(displayMode === 'realistic' ? 'xray_stress' : 'realistic');
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              displayMode === 'xray_stress'
                ? 'bg-rose-500/20 text-rose-300 border-rose-400/40 shadow-sm'
                : 'bg-white/5 text-slate-300 border-white/10 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            {displayMode === 'xray_stress' ? 'FEA Stress Mode' : 'PBR Realistic'}
          </button>

          {/* Lighting Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl glass-subtle border border-cyan-500/20">
            <button
              onClick={() => {
                soundFx.playClick();
                setLightPreset('sunset');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                lightPreset === 'sunset' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Thar Desert Sunset Lighting"
            >
              <Sunset className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setLightPreset('noon');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                lightPreset === 'noon' ? 'bg-amber-500/30 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Desert High Noon Sun"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setLightPreset('midnight');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                lightPreset === 'midnight' ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Cyber Midnight Starlight"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Play/Pause Motion */}
          <button
            onClick={() => {
              soundFx.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlaying
                ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                : 'bg-amber-500/25 text-amber-300 border-amber-400/40'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-[460px] sm:h-[500px] bg-gradient-to-b from-[#040914] via-[#02050b] to-[#010307] rounded-3xl border border-cyan-500/20 overflow-hidden shadow-2xl flex items-center justify-center">
        {/* Mount container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* 3D Viewport Controls Hint */}
        <div className="absolute bottom-3 left-4 glass-pill px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 flex items-center gap-2 pointer-events-none border border-cyan-500/20">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Left-Drag: Rotate 360° · Scroll: Zoom · View Presets Above</span>
        </div>

        {/* Real-Time Telemetry HUD Overlay */}
        <div className="absolute top-3 right-4 flex flex-col gap-2 items-end">
          <div className="glass px-3.5 py-1.5 rounded-xl text-xs font-mono text-cyan-300 border border-cyan-500/30 shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 pulse" />
            <span className="text-slate-400">Target:</span> <b className="text-white">{wellId}</b>
          </div>

          <div className="glass px-3 py-1.5 rounded-xl text-[10px] font-mono text-slate-300 border border-white/10 flex items-center gap-3">
            <span>PPRL: <b className="text-amber-300">76.4 kN</b></span>
            <span>MPRL: <b className="text-slate-200">22.8 kN</b></span>
            <span>Fillage: <b className="text-emerald-400">92%</b></span>
          </div>
        </div>

        {/* Subsurface Geological Formation Annotations */}
        {viewPreset === 'subsurface' && (
          <div className="absolute bottom-12 right-4 glass p-3 rounded-2xl border border-amber-500/30 text-xs font-mono space-y-1.5 pointer-events-none">
            <div className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1.5">
              <Layers size={13} /> Subsurface Strata Log
            </div>
            <div className="text-slate-300">Overburden: <span className="text-white">Jodhpur Sandstone (350m)</span></div>
            <div className="text-slate-300">Caprock Seal: <span className="text-cyan-300">Dense Bilara Shale (720m)</span></div>
            <div className="text-slate-300">Heavy-Oil Payzone: <span className="text-amber-400">Bikaner-Nagaur (980m)</span></div>
            <div className="text-slate-300">Valve Action: <span className="text-emerald-400 font-bold">Traveling/Standing Sync</span></div>
          </div>
        )}
      </div>

      {/* Real-Time SPM Kinematic Slider Bar */}
      <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-cyan-500/20 font-mono text-xs items-center">
        <div className="sm:col-span-2 flex items-center gap-3">
          <span className="text-slate-300 whitespace-nowrap flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-400" /> 3D Kinematic SPM:
          </span>
          <input
            type="range"
            min="2.0"
            max="18.0"
            step="0.5"
            value={currentSPM}
            onChange={(e) => setCurrentSPM(Number(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-cyan-300 font-bold text-sm min-w-[65px]">{currentSPM.toFixed(1)} SPM</span>
        </div>

        <div className="flex justify-end text-right text-slate-300 gap-4">
          <span>Mechanical Stroke: <b className="text-white font-bold">{strokeLengthM}m</b></span>
          <span>Gear Ratio: <b className="text-cyan-300 font-bold">12:1</b></span>
        </div>
      </div>
    </div>
  );
};

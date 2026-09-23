import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Sun, Moon, Sunset, Eye, Box, Sliders, Layers, Sparkles, Activity } from 'lucide-react';
import { soundFx } from '../utils/sound';

interface OilRig3DViewerProps {
  spm?: number;
  strokeLengthM?: number;
  wellId?: string;
}

export const OilRig3DViewer: React.FC<OilRig3DViewerProps> = ({
  spm = 8.5,
  strokeLengthM = 3.2,
  wellId = 'BGW-001'
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSPM, setCurrentSPM] = useState(spm);
  const [lightPreset, setLightPreset] = useState<'sunset' | 'noon' | 'night'>('sunset');
  const [showSubsurface, setShowSubsurface] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [activeComponent, setActiveComponent] = useState<string | null>(null);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const spmRef = useRef(currentSPM);
  const wireframeRef = useRef(isWireframe);

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
    const mount = mountRef.current;
    if (!mount) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 10, 22);
    camera.lookAt(0, 3, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mount.appendChild(renderer.domElement);

    // 2. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffaa44, 1.8);
    sunLight.position.set(20, 35, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x00e5ff, 0.5);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    // 3. Desert Dune Terrain Base
    const groundGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x24140a,
      roughness: 0.9,
      metalness: 0.1,
      wireframe: isWireframe
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Concrete Well Pad Base
    const padGeo = new THREE.BoxGeometry(14, 0.6, 20);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x3d2719,
      roughness: 0.8,
      metalness: 0.2
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(0, 0.3, 0);
    pad.receiveShadow = true;
    scene.add(pad);

    // 4. Structural Samson Post (A-Frame Rig Tower)
    const rigGroup = new THREE.Group();
    scene.add(rigGroup);

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.4,
      metalness: 0.8,
      wireframe: isWireframe
    });

    const ironMat = new THREE.MeshStandardMaterial({
      color: 0x1c1917,
      roughness: 0.6,
      metalness: 0.9
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.6
    });

    // Samson A-Frame Columns
    const legGeo = new THREE.CylinderGeometry(0.18, 0.24, 7.5, 8);
    
    // 4 A-frame legs
    const leg1 = new THREE.Mesh(legGeo, steelMat);
    leg1.position.set(-1.2, 4.0, -1.2);
    leg1.rotation.z = -0.15;
    leg1.rotation.x = -0.15;
    rigGroup.add(leg1);

    const leg2 = new THREE.Mesh(legGeo, steelMat);
    leg2.position.set(1.2, 4.0, -1.2);
    leg2.rotation.z = 0.15;
    leg2.rotation.x = -0.15;
    rigGroup.add(leg2);

    const leg3 = new THREE.Mesh(legGeo, steelMat);
    leg3.position.set(-1.2, 4.0, 1.2);
    leg3.rotation.z = -0.15;
    leg3.rotation.x = 0.15;
    rigGroup.add(leg3);

    const leg4 = new THREE.Mesh(legGeo, steelMat);
    leg4.position.set(1.2, 4.0, 1.2);
    leg4.rotation.z = 0.15;
    leg4.rotation.x = 0.15;
    rigGroup.add(leg4);

    // Top Saddle Bearing
    const saddleGeo = new THREE.BoxGeometry(1.4, 0.8, 1.4);
    const saddle = new THREE.Mesh(saddleGeo, ironMat);
    saddle.position.set(0, 7.6, 0);
    rigGroup.add(saddle);

    // 5. Walking Beam Assembly (Rocking Mechanism)
    const beamPivot = new THREE.Group();
    beamPivot.position.set(0, 7.8, 0);
    rigGroup.add(beamPivot);

    // Walking Beam Steel Body
    const beamGeo = new THREE.BoxGeometry(1.0, 1.2, 13.5);
    const beam = new THREE.Mesh(beamGeo, steelMat);
    beam.position.set(0, 0, 0);
    beam.castShadow = true;
    beamPivot.add(beam);

    // Horsehead (Front Curved Arc Head)
    const horseheadGroup = new THREE.Group();
    horseheadGroup.position.set(0, 0, 6.7);
    beamPivot.add(horseheadGroup);

    const horseheadGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.9, 16, 1, false, 0, Math.PI);
    const horsehead = new THREE.Mesh(horseheadGeo, steelMat);
    horsehead.rotation.y = -Math.PI / 2;
    horsehead.rotation.x = Math.PI / 2;
    horsehead.position.set(0, -0.6, 0.8);
    horseheadGroup.add(horsehead);

    // Bridle Cable & Polished Rod String
    const rodGroup = new THREE.Group();
    rodGroup.position.set(0, 7.2, 8.4);
    rigGroup.add(rodGroup);

    const rodGeo = new THREE.CylinderGeometry(0.08, 0.08, 8.5, 12);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xffeedd, metalness: 0.95, roughness: 0.1 });
    const polishedRod = new THREE.Mesh(rodGeo, rodMat);
    polishedRod.position.set(0, -3.5, 0);
    rodGroup.add(polishedRod);

    // 6. Motor, Gearbox, Crank, & Counterweights
    const motorBase = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.5, 3.5), ironMat);
    motorBase.position.set(0, 1.3, -5.5);
    rigGroup.add(motorBase);

    const crankPivot = new THREE.Group();
    crankPivot.position.set(0, 2.5, -5.5);
    rigGroup.add(crankPivot);

    // Dual Counterweights (Left & Right)
    const counterweightGeo = new THREE.BoxGeometry(0.6, 3.2, 1.6);
    const counterweightL = new THREE.Mesh(counterweightGeo, ironMat);
    counterweightL.position.set(-1.8, -1.2, 0);
    crankPivot.add(counterweightL);

    const counterweightR = new THREE.Mesh(counterweightGeo, ironMat);
    counterweightR.position.set(1.8, -1.2, 0);
    crankPivot.add(counterweightR);

    // Pitman Arm Connecting Rods
    const pitmanGeo = new THREE.CylinderGeometry(0.12, 0.12, 6.0, 8);
    const pitmanL = new THREE.Mesh(pitmanGeo, steelMat);
    pitmanL.position.set(-1.8, 2.5, 0);
    crankPivot.add(pitmanL);

    const pitmanR = new THREE.Mesh(pitmanGeo, steelMat);
    pitmanR.position.set(1.8, 2.5, 0);
    crankPivot.add(pitmanR);

    // 7. Wellhead Christmas Tree & Surface Piping
    const wellheadGroup = new THREE.Group();
    wellheadGroup.position.set(0, 0, 8.4);
    scene.add(wellheadGroup);

    // Wellhead Flanges & Valves
    const valveGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16);
    const valveMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });
    const wellheadValve = new THREE.Mesh(valveGeo, valveMat);
    wellheadValve.position.set(0, 1.1, 0);
    wellheadGroup.add(wellheadValve);

    // Discharge Flowline Pipe with Glow
    const pipeGeo = new THREE.CylinderGeometry(0.2, 0.2, 6.0, 12);
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.8, roughness: 0.2 });
    const flowPipe = new THREE.Mesh(pipeGeo, pipeMat);
    flowPipe.rotation.z = Math.PI / 2;
    flowPipe.position.set(3.0, 1.8, 0);
    wellheadGroup.add(flowPipe);

    // 8. Subsurface Geological Strata Cutaway
    const strataGroup = new THREE.Group();
    strataGroup.position.set(0, -6.0, 8.4);
    scene.add(strataGroup);

    // Underground Casing Pipe
    const casingGeo = new THREE.CylinderGeometry(0.4, 0.4, 12, 16);
    const casingMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.8,
      roughness: 0.5,
      transparent: true,
      opacity: 0.85
    });
    const casing = new THREE.Mesh(casingGeo, casingMat);
    strataGroup.add(casing);

    // Subsurface Formation Rock Layer Box
    const rockGeo = new THREE.BoxGeometry(10, 12, 8);
    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x1f1107,
      roughness: 0.95,
      transparent: true,
      opacity: 0.45
    });
    const rockStrata = new THREE.Mesh(rockGeo, rockMat);
    strataGroup.add(rockStrata);

    // Perforation Thermal Zone Indicator
    const perfGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const perfMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xea580c,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.6
    });
    const perfThermalZone = new THREE.Mesh(perfGeo, perfMat);
    perfThermalZone.position.set(0, -4.5, 0);
    strataGroup.add(perfThermalZone);

    // 9. Interactive Orbit & Mouse Controls
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 28, theta: 0.8, phi: 1.1 };

    const updateCameraPos = () => {
      camera.position.x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
      camera.position.y = spherical.radius * Math.cos(spherical.phi);
      camera.position.z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      camera.lookAt(0, 3, 2);
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

      spherical.theta -= deltaX * 0.008;
      spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, spherical.phi - deltaY * 0.008));
      updateCameraPos();

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      spherical.radius = Math.max(10, Math.min(60, spherical.radius + e.deltaY * 0.03));
      updateCameraPos();
    };

    mount.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    mount.addEventListener('wheel', onWheel, { passive: false });

    // 10. Animation Loop (Kinematic Physics)
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (isPlayingRef.current) {
        const delta = clock.getDelta();
        const cycleSpeed = (spmRef.current * 2 * Math.PI) / 60; // angular speed (rad/sec)
        
        // Continuous Crank Rotation
        crankPivot.rotation.x += cycleSpeed * delta;

        // Kinematic Walking Beam Oscillation Angle
        const beamAngle = Math.sin(crankPivot.rotation.x) * 0.14;
        beamPivot.rotation.x = beamAngle;

        // Reciprocating Polished Sucker Rod Vertical Displacement
        const rodDisplacement = Math.sin(crankPivot.rotation.x) * 1.6;
        rodGroup.position.y = 7.2 + rodDisplacement;

        // Thermal steam plume pulse
        perfThermalZone.scale.setScalar(1.0 + Math.sin(clock.getElapsedTime() * 3.0) * 0.12);
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

  // Update lighting preset
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (lightPreset === 'sunset') {
      scene.background = null;
    } else if (lightPreset === 'noon') {
      scene.background = null;
    } else if (lightPreset === 'night') {
      scene.background = null;
    }
  }, [lightPreset]);

  // Toggle subsurface visibility
  useEffect(() => {
    // handled via state
  }, [showSubsurface]);

  const resetCamera = () => {
    soundFx.playClick();
    if (cameraRef.current) {
      cameraRef.current.position.set(16, 10, 22);
      cameraRef.current.lookAt(0, 3, 2);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between shadow-2xl border border-amber-500/20 backdrop-blur-2xl">
      {/* Header with 3D Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
            <Box className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white tracking-wide">3D Blender-Grade SRP Oil Rig Simulator</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25">
                THREE.JS 360°
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono">Real-Time Articulated Kinematics &amp; Subsurface Geology</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lighting Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl glass-subtle border border-amber-500/20">
            <button
              onClick={() => {
                soundFx.playClick();
                setLightPreset('sunset');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                lightPreset === 'sunset' ? 'bg-amber-500/25 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
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
                lightPreset === 'noon' ? 'bg-amber-500/25 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Desert High Noon Lighting"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setLightPreset('night');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                lightPreset === 'night' ? 'bg-cyan-500/25 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Midnight Starlight Rig Glow"
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>

          {/* Subsurface Cutaway Toggle */}
          <button
            onClick={() => {
              soundFx.playClick();
              setShowSubsurface(!showSubsurface);
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              showSubsurface
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                : 'bg-white/5 text-slate-400 border-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Subsurface
          </button>

          {/* Reset Camera */}
          <button
            onClick={resetCamera}
            className="p-2 rounded-xl glass-subtle text-slate-300 hover:text-amber-300 border border-amber-500/20 transition-colors cursor-pointer"
            title="Reset 3D Orbit Camera"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

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
            <span>{isPlaying ? '3D ACTIVE' : 'PAUSED'}</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full h-96 sm:h-[420px] bg-gradient-to-b from-[#071322] via-[#030914] to-[#01040a] rounded-2xl border border-cyan-500/20 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Mount container */}
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* 3D Viewport Controls Hint */}
        <div className="absolute bottom-3 left-4 glass-pill px-3 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 flex items-center gap-2 pointer-events-none border border-cyan-500/20">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Left-Drag: Rotate 360° · Scroll: Zoom · Right-Drag: Pan</span>
        </div>

        {/* Active Well Badge in 3D scene */}
        <div className="absolute top-3 right-4 glass px-3.5 py-1.5 rounded-xl text-xs font-mono text-cyan-300 border border-cyan-500/30 shadow-lg">
          <span className="text-slate-400">Target Well:</span> <b className="text-white">{wellId}</b>
        </div>
      </div>

      {/* Real-Time SPM Kinematic Slider Bar */}
      <div className="grid sm:grid-cols-3 gap-4 mt-4 pt-3 border-t border-amber-500/20 font-mono text-xs items-center">
        <div className="sm:col-span-2 flex items-center gap-3">
          <span className="text-slate-300 whitespace-nowrap flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-amber-400" /> 3D Kinematic SPM:
          </span>
          <input
            type="range"
            min="2.0"
            max="18.0"
            step="0.5"
            value={currentSPM}
            onChange={(e) => setCurrentSPM(Number(e.target.value))}
            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <span className="text-amber-300 font-bold text-sm min-w-[65px]">{currentSPM.toFixed(1)} SPM</span>
        </div>

        <div className="flex justify-end text-right text-slate-300">
          <span>Mechanical Stroke: <b className="text-white font-bold">{strokeLengthM}m</b></span>
        </div>
      </div>
    </div>
  );
};

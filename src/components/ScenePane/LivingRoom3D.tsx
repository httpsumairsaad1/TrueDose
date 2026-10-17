import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbState } from '../../types';

interface LivingRoom3DProps {
  orbState: OrbState;
}

export const LivingRoom3D: React.FC<LivingRoom3DProps> = ({ orbState }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const alexaRingRef = useRef<THREE.Mesh | null>(null);
  const alexaLightRef = useRef<THREE.PointLight | null>(null);
  const grandmaHeadRef = useRef<THREE.Mesh | null>(null);
  const daughterGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const [hasWebGlError, setHasWebGlError] = useState<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability safely
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let waveRing: THREE.Mesh | null = null;

    try {
      const width = Math.max(container.clientWidth, 280);
      const height = Math.max(container.clientHeight, 200);

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf5f7fa);
      scene.fog = new THREE.Fog(0xf5f7fa, 6, 14);

      camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      camera.position.set(-0.6, 1.45, 3.4);
      camera.lookAt(-0.35, 0.65, -0.2);

      renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true, 
        powerPreference: 'high-performance' 
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      container.appendChild(renderer.domElement);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.85);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xfffaed, 1.3);
      keyLight.position.set(2, 4, 3);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 512;
      keyLight.shadow.mapSize.height = 512;
      scene.add(keyLight);

      const doorwayLight = new THREE.DirectionalLight(0xd4eaf7, 0.5);
      doorwayLight.position.set(4, 2, -4);
      scene.add(doorwayLight);

      const alexaPointLight = new THREE.PointLight(0xff9900, 1.8, 2.5);
      alexaPointLight.position.set(0.2, 0.88, 0.1);
      alexaLightRef.current = alexaPointLight;
      scene.add(alexaPointLight);

      // Floor & Wall
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 16),
        new THREE.MeshStandardMaterial({ color: 0xeadcc9, roughness: 0.6, metalness: 0.05 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.receiveShadow = true;
      scene.add(floor);

      const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(10, 4, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xf1f3f5, roughness: 0.8 })
      );
      backWall.position.set(0, 2, -3.8);
      backWall.receiveShadow = true;
      scene.add(backWall);

      const doorFrame = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 2.4, 0.25),
        new THREE.MeshStandardMaterial({ color: 0xd8dde2, roughness: 0.5 })
      );
      doorFrame.position.set(2.4, 1.2, -3.75);
      scene.add(doorFrame);

      // ==============================================================
      // 1. GRANDMA RESTING IN BED (FOREGROUND / MIDGROUND)
      // ==============================================================
      const bedGroup = new THREE.Group();
      bedGroup.position.set(-1.15, 0, -0.1);
      scene.add(bedGroup);

      const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.5 });
      const bedFrame = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.28, 2.2), woodMat);
      bedFrame.position.set(0, 0.14, 0);
      bedFrame.castShadow = true;
      bedFrame.receiveShadow = true;
      bedGroup.add(bedFrame);

      const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.12), woodMat);
      headboard.position.set(0, 0.58, -1.05);
      headboard.castShadow = true;
      bedGroup.add(headboard);

      const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.26, 2.1),
        new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.7 })
      );
      mattress.position.set(0, 0.38, 0);
      mattress.castShadow = true;
      mattress.receiveShadow = true;
      bedGroup.add(mattress);

      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });
      const leftPillow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.2, 0.38), pillowMat);
      leftPillow.position.set(-0.35, 0.6, -0.75);
      leftPillow.rotation.x = 0.35;
      bedGroup.add(leftPillow);

      const rightPillow = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.2, 0.38), pillowMat);
      rightPillow.position.set(0.35, 0.6, -0.75);
      rightPillow.rotation.x = 0.35;
      bedGroup.add(rightPillow);

      const duvet = new THREE.Mesh(
        new THREE.BoxGeometry(1.62, 0.32, 1.45),
        new THREE.MeshStandardMaterial({ color: 0x6b5b95, roughness: 0.65 })
      );
      duvet.position.set(0, 0.48, 0.25);
      duvet.castShadow = true;
      bedGroup.add(duvet);

      const fold = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 1.62, 16),
        new THREE.MeshStandardMaterial({ color: 0xfaf4ea, roughness: 0.7 })
      );
      fold.rotation.z = Math.PI / 2;
      fold.position.set(0, 0.65, -0.45);
      bedGroup.add(fold);

      // Grandma
      const grandmaTorso = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.25, 0.45, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0x534ab7, roughness: 0.6 })
      );
      grandmaTorso.position.set(0, 0.82, -0.6);
      grandmaTorso.rotation.x = 0.25;
      grandmaTorso.castShadow = true;
      bedGroup.add(grandmaTorso);

      const skinMat = new THREE.MeshStandardMaterial({ color: 0xf8d8c6, roughness: 0.6 });
      const grandmaHead = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), skinMat);
      grandmaHead.position.set(0, 1.18, -0.48);
      grandmaHead.castShadow = true;
      grandmaHeadRef.current = grandmaHead;
      bedGroup.add(grandmaHead);

      const hairMat = new THREE.MeshStandardMaterial({ color: 0xd6d6dd, roughness: 0.8 });
      const grandmaHair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), hairMat);
      grandmaHair.position.set(0, 1.25, -0.52);
      bedGroup.add(grandmaHair);

      const bun = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), hairMat);
      bun.position.set(0, 1.36, -0.62);
      bedGroup.add(bun);

      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });
      const glassesGeo = new THREE.TorusGeometry(0.05, 0.01, 8, 16);
      const leftLens = new THREE.Mesh(glassesGeo, goldMat);
      leftLens.position.set(-0.065, 1.18, -0.32);
      bedGroup.add(leftLens);

      const rightLens = new THREE.Mesh(glassesGeo, goldMat);
      rightLens.position.set(0.065, 1.18, -0.32);
      bedGroup.add(rightLens);

      const handGeo = new THREE.SphereGeometry(0.06, 12, 12);
      const leftHand = new THREE.Mesh(handGeo, skinMat);
      leftHand.position.set(-0.25, 0.68, -0.35);
      bedGroup.add(leftHand);

      const rightHand = new THREE.Mesh(handGeo, skinMat);
      rightHand.position.set(0.25, 0.68, -0.35);
      bedGroup.add(rightHand);

      // ==============================================================
      // 2. BESIDE TABLE WITH MEDS & ALEXA (RIGHT BESIDE GRANDMA'S BED)
      // ==============================================================
      const nightstandGroup = new THREE.Group();
      nightstandGroup.position.set(0.25, 0, -0.15);
      scene.add(nightstandGroup);

      const nightstand = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.62, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x9c6634, roughness: 0.4 })
      );
      nightstand.position.set(0, 0.31, 0);
      nightstand.castShadow = true;
      nightstand.receiveShadow = true;
      nightstandGroup.add(nightstand);

      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.03, 0.02), goldMat);
      handle.position.set(0, 0.42, 0.31);
      nightstandGroup.add(handle);

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.04, 16), goldMat);
      lampBase.position.set(0.18, 0.64, -0.12);
      nightstandGroup.add(lampBase);

      const lampShade = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.18, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: 0xfff3db, roughness: 0.3, side: THREE.DoubleSide })
      );
      lampShade.position.set(0.18, 0.82, -0.12);
      nightstandGroup.add(lampShade);

      // Medications on table
      const pillBottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0xc46210, roughness: 0.2, transparent: true, opacity: 0.85 })
      );
      pillBottle.position.set(-0.16, 0.68, 0.08);
      pillBottle.castShadow = true;
      nightstandGroup.add(pillBottle);

      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.03, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
      );
      cap.position.set(-0.16, 0.755, 0.08);
      nightstandGroup.add(cap);

      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.038, 0.13, 16),
        new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, transparent: true, opacity: 0.6 })
      );
      glass.position.set(-0.14, 0.685, -0.1);
      glass.castShadow = true;
      nightstandGroup.add(glass);

      const pillCup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.03, 0.035, 16),
        new THREE.MeshStandardMaterial({ color: 0x067d62, roughness: 0.3 })
      );
      pillCup.position.set(-0.04, 0.64, 0.12);
      nightstandGroup.add(pillCup);

      // Alexa+ on table
      const speaker = new THREE.Mesh(
        new THREE.CylinderGeometry(0.09, 0.095, 0.15, 24),
        new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3, metalness: 0.4 })
      );
      speaker.position.set(0.02, 0.695, 0.08);
      speaker.castShadow = true;
      nightstandGroup.add(speaker);

      const alexaRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.092, 0.012, 10, 28),
        new THREE.MeshBasicMaterial({ color: 0xff9900 })
      );
      alexaRing.rotation.x = Math.PI / 2;
      alexaRing.position.set(0.02, 0.772, 0.08);
      alexaRingRef.current = alexaRing;
      nightstandGroup.add(alexaRing);

      waveRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.008, 8, 24),
        new THREE.MeshBasicMaterial({ color: 0xff9900, transparent: true, opacity: 0.6 })
      );
      waveRing.rotation.x = Math.PI / 2;
      waveRing.position.set(0.02, 0.88, 0.08);
      nightstandGroup.add(waveRing);

      // ==============================================================
      // 3. FARAWAY: DAUGHTER AT DOORWAY WITH SMARTPHONE
      // ==============================================================
      const daughterGroup = new THREE.Group();
      daughterGroup.position.set(2.4, 0, -3.4);
      daughterGroup.scale.set(0.85, 0.85, 0.85);
      daughterGroupRef.current = daughterGroup;
      scene.add(daughterGroup);

      const dLegGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.7, 12);
      const dPantsMat = new THREE.MeshStandardMaterial({ color: 0x222a36, roughness: 0.7 });
      const dLeftLeg = new THREE.Mesh(dLegGeo, dPantsMat);
      dLeftLeg.position.set(-0.1, 0.35, 0);
      daughterGroup.add(dLeftLeg);

      const dRightLeg = new THREE.Mesh(dLegGeo, dPantsMat);
      dRightLeg.position.set(0.1, 0.35, 0);
      daughterGroup.add(dRightLeg);

      const dTorsoMat = new THREE.MeshStandardMaterial({ color: 0x007185, roughness: 0.4 });
      const dTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.5, 6, 12), dTorsoMat);
      dTorso.position.set(0, 0.95, 0);
      daughterGroup.add(dTorso);

      const dHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), skinMat);
      dHead.position.set(0, 1.4, 0.02);
      daughterGroup.add(dHead);

      const dHair = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 14, 14),
        new THREE.MeshStandardMaterial({ color: 0x241812, roughness: 0.8 })
      );
      dHair.position.set(0, 1.45, -0.02);
      daughterGroup.add(dHair);

      const dArmGeo = new THREE.CapsuleGeometry(0.06, 0.32, 6, 10);
      const dLeftArm = new THREE.Mesh(dArmGeo, dTorsoMat);
      dLeftArm.position.set(-0.2, 0.95, 0.16);
      dLeftArm.rotation.x = -0.6;
      daughterGroup.add(dLeftArm);

      const dRightArm = new THREE.Mesh(dArmGeo, dTorsoMat);
      dRightArm.position.set(0.2, 0.95, 0.16);
      dRightArm.rotation.x = -0.6;
      daughterGroup.add(dRightArm);

      const dPhone = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.15, 0.015),
        new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8 })
      );
      dPhone.position.set(0, 0.98, 0.32);
      dPhone.rotation.x = -0.3;
      daughterGroup.add(dPhone);

      const phoneScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.07, 0.13),
        new THREE.MeshBasicMaterial({ color: 0x00c4cc })
      );
      phoneScreen.position.set(0, 0, 0.01);
      dPhone.add(phoneScreen);

      // Interactive Parallax
      const handleMouseMove = (e: MouseEvent) => {
        if (!container || !camera) return;
        const rect = container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

        gsap.to(camera.position, {
          x: -0.6 + x * 0.35,
          y: 1.45 + y * 0.2,
          duration: 0.8,
          ease: 'power2.out',
        });
      };

      container.addEventListener('mousemove', handleMouseMove);

      // Safe Resize Handler
      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newWidth = Math.max(container.clientWidth, 280);
        const newHeight = Math.max(container.clientHeight, 200);
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);

      // Animation Loop
      const animate = () => {
        animFrameIdRef.current = requestAnimationFrame(animate);
        const elapsedTime = clockRef.current.getElapsedTime();

        if (grandmaHeadRef.current) {
          grandmaHeadRef.current.position.y = 1.18 + Math.sin(elapsedTime * 1.8) * 0.008;
        }

        if (daughterGroupRef.current) {
          daughterGroupRef.current.position.y = Math.cos(elapsedTime * 1.2) * 0.008;
        }

        if (alexaRingRef.current) {
          alexaRingRef.current.rotation.z = elapsedTime * 2;
        }

        if (waveRing) {
          waveRing.rotation.z = -elapsedTime * 1.5;
          const waveScale = 1 + Math.sin(elapsedTime * 3) * 0.1;
          waveRing.scale.set(waveScale, waveScale, 1);
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        resizeObserver.disconnect();
        if (animFrameIdRef.current) {
          cancelAnimationFrame(animFrameIdRef.current);
        }
        if (scene) {
          scene.traverse((obj) => {
            if ((obj as THREE.Mesh).isMesh) {
              const mesh = obj as THREE.Mesh;
              mesh.geometry?.dispose();
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((m) => m.dispose());
              } else {
                mesh.material?.dispose();
              }
            }
          });
        }
        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode === container) {
            container.removeChild(renderer.domElement);
          }
        }
      };
    } catch {
      setHasWebGlError(true);
    }
  }, []);

  // GSAP tween management with safe killTweensOf and cleanup
  useEffect(() => {
    if (!alexaRingRef.current || !alexaLightRef.current) return;

    gsap.killTweensOf(alexaLightRef.current);
    gsap.killTweensOf(alexaRingRef.current.scale);
    gsap.killTweensOf(alexaRingRef.current.rotation);

    if (orbState === 'listening') {
      gsap.to(alexaLightRef.current, { intensity: 3.0, duration: 0.3 });
      gsap.to(alexaRingRef.current.scale, { x: 1.35, y: 1.35, z: 1.35, duration: 0.3, ease: 'back.out(2)' });
    } else if (orbState === 'speaking') {
      gsap.to(alexaLightRef.current, {
        intensity: 2.5,
        repeat: -1,
        yoyo: true,
        duration: 0.25,
      });
      gsap.to(alexaRingRef.current.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.25 });
    } else if (orbState === 'thinking') {
      gsap.to(alexaLightRef.current, { intensity: 1.4, duration: 0.3 });
      gsap.to(alexaRingRef.current.rotation, { z: '+=6.28', duration: 0.9, repeat: -1, ease: 'none' });
    } else {
      gsap.to(alexaLightRef.current, { intensity: 1.8, duration: 0.4 });
      gsap.to(alexaRingRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.4 });
    }

    return () => {
      if (alexaLightRef.current) gsap.killTweensOf(alexaLightRef.current);
      if (alexaRingRef.current) {
        gsap.killTweensOf(alexaRingRef.current.scale);
        gsap.killTweensOf(alexaRingRef.current.rotation);
      }
    };
  }, [orbState]);

  // If WebGL is not available, render high-fidelity SVG fallback
  if (hasWebGlError) {
    return (
      <div 
        className="relative w-full h-[230px] rounded-xl overflow-hidden shadow-inner bg-gradient-to-b from-[#eef2f6] to-[#e4e9f0] border border-gray-200 flex flex-col justify-between p-3"
        title="Bedside view: Grandma in bed, nightstand with meds & Alexa, faraway daughter"
      >
        <div className="flex items-center justify-between z-10 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-purple-900 border border-purple-200 shadow-2xs">
              Grandma at Bedside
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-700 border border-gray-200 shadow-2xs">
              Meds & Alexa on Table
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#007185] border border-teal-200 shadow-2xs">
            Daughter (Remote)
          </span>
        </div>

        {/* Fallback Graphic */}
        <div className="flex-1 flex items-center justify-around px-4">
          {/* Bed & Grandma */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-12 rounded-t-xl bg-[#534ab7] flex items-center justify-center text-white text-[11px] font-bold shadow-xs">
              Grandma
            </div>
            <div className="w-24 h-10 rounded-b-lg bg-[#8b5a2b] border-t-4 border-[#6b5b95] flex items-center justify-center text-[10px] text-white">
              Bed
            </div>
          </div>

          {/* Table with Meds & Alexa */}
          <div className="flex flex-col items-center">
            <div className="flex items-end gap-1.5 mb-1">
              <div className="w-4 h-7 bg-amber-600 rounded-sm" title="Meds" />
              <div className="w-6 h-9 bg-[#1f2937] rounded-sm flex flex-col items-center justify-between p-0.5 border border-[#FF9900]">
                <div className="w-3 h-1 bg-[#FF9900] rounded-full animate-pulse" />
                <span className="text-[8px] text-[#FF9900] font-black">Echo</span>
              </div>
            </div>
            <div className="w-14 h-8 bg-[#9c6634] rounded-t-sm" />
          </div>

          {/* Faraway Daughter */}
          <div className="flex flex-col items-center opacity-85">
            <div className="w-8 h-12 rounded-t-lg bg-[#007185] flex items-center justify-center text-white text-[9px] font-bold">
              SMS
            </div>
            <div className="w-7 h-10 bg-[#222a36] rounded-b-sm" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[230px] rounded-xl overflow-hidden shadow-inner bg-[#f5f7fa] border border-gray-200"
      title="Bedside view: Grandma in bed, nightstand with meds & Alexa, faraway daughter"
    >
      {/* Contextual indicators */}
      <div className="absolute top-2 left-3 z-10 pointer-events-none flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-purple-900 border border-purple-200 shadow-2xs">
          Grandma at Bedside
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-gray-700 border border-gray-200 shadow-2xs">
          Meds & Alexa on Table
        </span>
      </div>

      <div className="absolute top-2 right-3 z-10 pointer-events-none flex items-center gap-2">
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-[#007185] border border-teal-200 shadow-2xs">
          Daughter (Remote)
        </span>
      </div>
    </div>
  );
};

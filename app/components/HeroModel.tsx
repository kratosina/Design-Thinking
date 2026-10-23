"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function HeroModel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // SCENE SETUP
    const scene = new THREE.Scene();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 600;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.6);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // LIGHTING SETUP (Cinematic, moody, sculpting the 3D forms)
    const ambientLight = new THREE.AmbientLight(0xdde8f5, 1.6);
    scene.add(ambientLight);

    // Key light (warm golden daylight accent from front-right)
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 3.2);
    keyLight.position.set(2.5, 3.5, 3);
    scene.add(keyLight);

    // Rim/Moonlight (cool ethereal blue from upper left/back matching night library)
    const rimLight = new THREE.DirectionalLight(0x7da4ff, 3.8);
    rimLight.position.set(-3, 2, -2);
    scene.add(rimLight);

    // Soft frontal fill light
    const fillLight = new THREE.DirectionalLight(0x9fc5e8, 1.2);
    fillLight.position.set(0, -1, 2.5);
    scene.add(fillLight);

    // Subtle warm point light under the chin/chest
    const chestGlow = new THREE.PointLight(0xffb366, 1.8, 6);
    chestGlow.position.set(0, -1.2, 1.5);
    scene.add(chestGlow);

    // Model Group for smooth rotations & pivot
    const modelGroup = new THREE.Group();
    // 'YXZ' rotation order ensures pure yaw then pitch without gimbal cross-axis distortion
    modelGroup.rotation.order = "YXZ";
    scene.add(modelGroup);

    // Direct cursor tracking state via window listener for 0-latency 120fps response
    const mousePos = { x: 0, y: 0 };

    const handlePointerMove = (e: PointerEvent) => {
      // Normalize client coordinates to -1 (left/top) to +1 (right/bottom)
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mousePos.x = Math.max(-1, Math.min(1, nx));
      mousePos.y = Math.max(-1, Math.min(1, ny));
    };

    const handlePointerLeave = () => {
      // Return gaze smoothly to center forward
      mousePos.x = 0;
      mousePos.y = 0;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("mouseleave", handlePointerLeave, { passive: true });

    // LOAD GLB MODEL
    const loader = new GLTFLoader();
    let isDisposed = false;

    loader.load(
      "/3D-model/meshy-model.glb",
      (gltf) => {
        if (isDisposed) return;

        const model = gltf.scene;

        // Auto-center geometry bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Shift model so its bottom/pedestal rests naturally at the bottom
        model.position.x = -center.x;
        model.position.y = -center.y - 0.25;
        model.position.z = -center.z;

        // Scale model 10% bigger (from 2.0 to 2.2)
        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredScale = 2.2 / (maxDim || 1);
        model.scale.setScalar(desiredScale);

        // Enhance material properties for premium sculpture look
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;
              mat.roughness = Math.min(mat.roughness || 0.6, 0.7);
              mat.metalness = Math.max(mat.metalness || 0.1, 0.15);
              mat.envMapIntensity = 1.0;
            }
          }
        });

        modelGroup.add(model);
        setIsLoaded(true);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(percent);
        }
      },
      (error) => {
        console.error("Error loading GLB model:", error);
      }
    );

    // ANIMATION & CURSOR-TRACKING LOOP
    let animationFrameId: number;
    let currentRotX = 0;
    let currentRotY = 0;
    let currentPosX = 0;
    let currentPosY = 0;

    const render = () => {
      // PROVEN MATHEMATICAL GAZE ORIENTATION:
      // When cursor goes UP (mousePos.y < 0): targetRotX is negative -> face looks UP (dir.y > 0)
      // When cursor goes DOWN (mousePos.y > 0): targetRotX is positive -> face looks DOWN (dir.y < 0)
      const targetRotX = mousePos.y * 0.55;

      // When cursor goes LEFT (mousePos.x < 0): targetRotY is negative -> face looks LEFT (dir.x < 0)
      // When cursor goes RIGHT (mousePos.x > 0): targetRotY is positive -> face looks RIGHT (dir.x > 0)
      const targetRotY = mousePos.x * 0.6;

      // Subtle parallax position follow
      const targetPosX = mousePos.x * 0.14;
      const targetPosY = -mousePos.y * 0.1;

      // Smooth Lerp easing
      const LERP_FACTOR = 0.08;
      currentRotX += (targetRotX - currentRotX) * LERP_FACTOR;
      currentRotY += (targetRotY - currentRotY) * LERP_FACTOR;
      currentPosX += (targetPosX - currentPosX) * LERP_FACTOR;
      currentPosY += (targetPosY - currentPosY) * LERP_FACTOR;

      // Apply rotations with YXZ order
      modelGroup.rotation.y = currentRotY;
      modelGroup.rotation.x = currentRotX;
      modelGroup.rotation.z = -currentRotY * 0.1;

      // Apply parallax position
      modelGroup.position.x = currentPosX;
      modelGroup.position.y = currentPosY;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // RESIZE OBSERVER
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // CLEANUP
    return () => {
      isDisposed = true;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("mouseleave", handlePointerLeave);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full pointer-events-none select-none flex items-center justify-center">
      {/* Loading indicator while 70MB GLB is buffering */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <div className="w-8 h-8 rounded-full border border-white/20 border-t-white animate-spin mb-3" />
          <span className="text-[10px] uppercase font-mono tracking-[0.25em] text-neutral-400">
            {loadProgress > 0 ? `Loading 3D Model ${loadProgress}%` : "Loading 3D Model..."}
          </span>
        </div>
      )}

      {/* Canvas Mount Container */}
      <div
        ref={mountRef}
        className={`w-full h-full transition-opacity duration-700 ease-out ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

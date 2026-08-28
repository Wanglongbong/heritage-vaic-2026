"use client";

import Image from "next/image";
import { CSSProperties, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { BANK_QR_MATRIX, classifyQrDarkModule } from "@/lib/bank-qr-matrix";
import type { Language } from "@/lib/types";

const text = {
  vi: {
    kicker: "GA CUỐI · CÂY KÝ ỨC",
    title: "Chạm vào ký ức đang sống",
    guide: "Chạm cây để nhìn từ trên · Chạm lần nữa để trở lại",
    treeView: "Chạm để nhìn mã ký ức từ trên",
    topView: "Chạm để trở lại bên cây ký ức",
    loading: "Đang gieo cỏ theo từng ô ký ức…",
    museum: "Mở Phòng trưng bày",
  },
  en: {
    kicker: "FINAL STOP · MEMORY TREE",
    title: "Touch a living memory",
    guide: "Tap the tree for the top view · Tap again to return",
    treeView: "Tap for the top view of the memory code",
    topView: "Tap to return to the memory tree",
    loading: "Growing grass from each memory tile…",
    museum: "Open the gallery",
  },
} as const;

type MemoryTreeCanvasProps = {
  isTop: boolean;
  language: Language;
};

type SceneState = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.OrthographicCamera;
  scene: THREE.Scene;
  root: THREE.Group;
  treeViewGroup: THREE.Group;
  topQrGroup: THREE.Group;
  topQrMaterials: THREE.MeshBasicMaterial[];
  qrShadowMaterial: THREE.MeshBasicMaterial;
  leaves: THREE.InstancedMesh;
  grass: THREE.Group;
  frame: number;
};

function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function cubicEase(value: number) {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function setInstance(
  mesh: THREE.InstancedMesh,
  object: THREE.Object3D,
  index: number,
  position: THREE.Vector3,
  scale: THREE.Vector3,
  rotationY = 0,
) {
  object.position.copy(position);
  object.scale.copy(scale);
  object.rotation.set(0, rotationY, 0);
  object.updateMatrix();
  mesh.setMatrixAt(index, object.matrix);
}

function addBox(
  parent: THREE.Group,
  materials: Map<string, THREE.MeshStandardMaterial>,
  size: [number, number, number],
  position: [number, number, number],
  color: string,
) {
  let material = materials.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.04, flatShading: true });
    materials.set(color, material);
  }
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}

function addBranch(
  parent: THREE.Group,
  material: THREE.MeshStandardMaterial,
  from: THREE.Vector3,
  to: THREE.Vector3,
  width: number,
) {
  const direction = new THREE.Vector3().subVectors(to, from);
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, direction.length(), width), material);
  mesh.position.copy(from).add(to).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  parent.add(mesh);
}

function buildMemoryScene(container: HTMLDivElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x09070a, 0);
  renderer.domElement.className = "memory-tree-canvas";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-30, 30, 30, -30, 0.1, 160);
  const root = new THREE.Group();
  root.rotation.y = -0.1;
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xffe4a4, 0x2b1018, 2.15));
  const keyLight = new THREE.DirectionalLight(0xffc45c, 3.4);
  keyLight.position.set(-18, 32, 24);
  scene.add(keyLight);
  const redFill = new THREE.PointLight(0xc43724, 36, 38, 2);
  redFill.position.set(0, 4, 10);
  scene.add(redFill);

  const plateMaterial = new THREE.MeshStandardMaterial({ color: 0xd3b570, roughness: 1, flatShading: true });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(49, 0.7, 49), plateMaterial);
  plate.position.y = -0.48;
  root.add(plate);

  const tileGeometry = new THREE.BoxGeometry(0.91, 0.1, 0.91);
  const darkPositions: THREE.Vector3[] = [];
  const grassPositions: THREE.Vector3[] = [];
  const leafModulePositions: THREE.Vector3[] = [];
  const trainModulePositions: THREE.Vector3[] = [];
  const centre = (BANK_QR_MATRIX.size - 1) / 2;

  BANK_QR_MATRIX.modules.forEach((row, rowIndex) => {
    row.forEach((dark, columnIndex) => {
      const x = columnIndex - centre;
      const z = rowIndex - centre;
      const position = new THREE.Vector3(x, 0, z);
      if (!dark) return;
      darkPositions.push(position);
      const visualRole = classifyQrDarkModule(rowIndex, columnIndex, BANK_QR_MATRIX.size);
      if (visualRole === "train") trainModulePositions.push(position);
      else if (visualRole === "leaf") leafModulePositions.push(position);
      else if (visualRole === "grass") grassPositions.push(position);
    });
  });

  const dummy = new THREE.Object3D();
  const qrShadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x24140c,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    toneMapped: false,
  });
  const qrShadowTiles = new THREE.InstancedMesh(
    tileGeometry,
    qrShadowMaterial,
    darkPositions.length,
  );
  darkPositions.forEach((position, index) => {
    setInstance(qrShadowTiles, dummy, index, new THREE.Vector3(position.x, 0.02, position.z), new THREE.Vector3(1, 1, 1));
  });
  qrShadowTiles.instanceMatrix.needsUpdate = true;
  root.add(qrShadowTiles);

  const grassGroup = new THREE.Group();
  const patchGeometry = new THREE.BoxGeometry(0.78, 0.18, 0.78);
  const patchMaterial = new THREE.MeshBasicMaterial({ color: 0x5f4015, toneMapped: false });
  const grassPatches = new THREE.InstancedMesh(patchGeometry, patchMaterial, grassPositions.length);
  grassPositions.forEach((position, index) => {
    setInstance(grassPatches, dummy, index, new THREE.Vector3(position.x, 0.21, position.z), new THREE.Vector3(1, 1, 1));
  });
  grassPatches.instanceMatrix.needsUpdate = true;
  grassGroup.add(grassPatches);

  const random = seededRandom(20260828);
  const bladeGeometry = new THREE.BoxGeometry(0.12, 0.78, 0.12);
  const bladeMaterial = new THREE.MeshBasicMaterial({ color: 0x785019, toneMapped: false });
  const bladesPerModule = 3;
  const grassBlades = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, grassPositions.length * bladesPerModule);
  let bladeIndex = 0;
  grassPositions.forEach((position) => {
    for (let blade = 0; blade < bladesPerModule; blade += 1) {
      const height = 0.55 + random() * 0.75;
      const offsetX = (random() - 0.5) * 0.5;
      const offsetZ = (random() - 0.5) * 0.5;
      setInstance(
        grassBlades,
        dummy,
        bladeIndex,
        new THREE.Vector3(position.x + offsetX, 0.35 + height * 0.5, position.z + offsetZ),
        new THREE.Vector3(0.75 + random() * 0.5, height, 0.75 + random() * 0.5),
        random() * Math.PI,
      );
      bladeIndex += 1;
    }
  });
  grassBlades.instanceMatrix.needsUpdate = true;
  grassGroup.add(grassBlades);
  root.add(grassGroup);

  const topQrGroup = new THREE.Group();
  const leafModuleGeometry = new THREE.BoxGeometry(0.74, 0.34, 0.74);
  const leafModuleMaterial = new THREE.MeshBasicMaterial({ color: 0x96600d, transparent: true, opacity: 0, toneMapped: false });
  const leafModules = new THREE.InstancedMesh(leafModuleGeometry, leafModuleMaterial, leafModulePositions.length);
  leafModulePositions.forEach((position, index) => {
    setInstance(leafModules, dummy, index, new THREE.Vector3(position.x, 0.24, position.z), new THREE.Vector3(1, 1, 1));
  });
  leafModules.instanceMatrix.needsUpdate = true;
  topQrGroup.add(leafModules);

  const redModuleGeometry = new THREE.BoxGeometry(0.76, 0.36, 0.76);
  const redModuleMaterial = new THREE.MeshBasicMaterial({ color: 0x74191a, transparent: true, opacity: 0, toneMapped: false });
  const redModules = new THREE.InstancedMesh(redModuleGeometry, redModuleMaterial, trainModulePositions.length);
  trainModulePositions.forEach((position, index) => {
    setInstance(redModules, dummy, index, new THREE.Vector3(position.x, 0.25, position.z), new THREE.Vector3(1, 1, 1));
  });
  redModules.instanceMatrix.needsUpdate = true;
  topQrGroup.add(redModules);
  topQrGroup.visible = false;
  root.add(topQrGroup);

  const treeViewGroup = new THREE.Group();
  root.add(treeViewGroup);
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 1, flatShading: true });
  const trunk = new THREE.Mesh(new THREE.BoxGeometry(1.65, 7.2, 1.65), woodMaterial);
  trunk.position.y = 3.8;
  treeViewGroup.add(trunk);
  const branchPoints: Array<[THREE.Vector3, THREE.Vector3, number]> = [
    [new THREE.Vector3(0, 5.1, 0), new THREE.Vector3(5.8, 8.1, 1.9), 0.75],
    [new THREE.Vector3(0, 5.5, 0), new THREE.Vector3(-5.3, 8.7, 2.2), 0.72],
    [new THREE.Vector3(0, 6.2, 0), new THREE.Vector3(3.7, 9.8, -4.4), 0.62],
    [new THREE.Vector3(0, 6.4, 0), new THREE.Vector3(-4.2, 9.6, -4.1), 0.6],
    [new THREE.Vector3(0, 6.8, 0), new THREE.Vector3(0.8, 11.3, 0.2), 0.58],
  ];
  branchPoints.forEach(([from, to, width]) => addBranch(treeViewGroup, woodMaterial, from, to, width));

  const mobile = window.matchMedia("(max-width: 720px)").matches;
  const leavesPerModule = mobile ? 4 : 7;
  const leafCount = leafModulePositions.length * leavesPerModule;
  const leafGeometry = new THREE.BoxGeometry(0.72, 0.5, 0.72);
  const leafMaterial = new THREE.MeshBasicMaterial({ color: 0xe5a72b, toneMapped: false });
  const leaves = new THREE.InstancedMesh(leafGeometry, leafMaterial, leafCount);
  for (let index = 0; index < leafCount; index += 1) {
    const modulePosition = leafModulePositions[index % leafModulePositions.length];
    const layer = Math.floor(index / leafModulePositions.length);
    const radius = Math.hypot(modulePosition.x, modulePosition.z);
    const dome = 1 - Math.pow(radius / 9.6, 1.65);
    const x = modulePosition.x + (random() - 0.5) * 0.38;
    const z = modulePosition.z + (random() - 0.5) * 0.38;
    const y = 5.8 + dome * 3.5 + layer * 0.34 + (random() - 0.5) * 0.42;
    const scale = 0.58 + random() * 0.76;
    setInstance(
      leaves,
      dummy,
      index,
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(scale * (0.8 + random() * 0.45), scale, scale * (0.8 + random() * 0.45)),
      random() * Math.PI,
    );
  }
  leaves.instanceMatrix.needsUpdate = true;
  treeViewGroup.add(leaves);

  const train = new THREE.Group();
  const trainMaterials = new Map<string, THREE.MeshStandardMaterial>();
  addBox(train, trainMaterials, [14.8, 0.72, 3.2], [0, 0.82, 8], "#35161a");
  addBox(train, trainMaterials, [13.9, 2.35, 2.95], [-0.2, 2.05, 8], "#8c1f20");
  addBox(train, trainMaterials, [13.3, 0.58, 3.28], [-0.35, 3.48, 8], "#27161c");
  addBox(train, trainMaterials, [2.8, 3.18, 3.05], [6.2, 2.45, 8], "#b52c20");
  addBox(train, trainMaterials, [1.35, 1.5, 2.65], [8.08, 1.65, 8], "#c53b21");
  addBox(train, trainMaterials, [0.5, 2.2, 0.55], [8.85, 2.5, 8], "#39201d");
  const windowMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc55, emissive: 0xc15312, emissiveIntensity: 1.5, roughness: 0.5, flatShading: true });
  for (let index = 0; index < 7; index += 1) {
    const window = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.82, 0.12), windowMaterial);
    window.position.set(-5.3 + index * 1.65, 2.35, 9.5);
    train.add(window);
  }
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1616, roughness: 1, flatShading: true });
  [-5.4, -2.6, 1.2, 4.7, 7.2].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.38, 8), wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.56, 9.4);
    train.add(wheel);
  });
  treeViewGroup.add(train);

  const resize = () => {
    // Keep the WebGL backing buffer out of an intrinsic-size feedback loop.
    // Production CSS can otherwise grow the grid item until Chromium reaches
    // its 2^24px layout ceiling, leaving the visible final stop empty.
    const width = Math.max(1, Math.min(container.clientWidth, 740));
    const height = Math.max(1, Math.min(container.clientHeight, 740));
    const aspect = width / height;
    const view = width < 560 ? 60 : 56;
    camera.left = (-view * aspect) / 2;
    camera.right = (view * aspect) / 2;
    camera.top = view / 2;
    camera.bottom = -view / 2;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.8));
    renderer.setSize(width, height, false);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  return {
    state: {
      renderer,
      camera,
      scene,
      root,
      treeViewGroup,
      topQrGroup,
      topQrMaterials: [leafModuleMaterial, redModuleMaterial],
      qrShadowMaterial,
      leaves,
      grass: grassGroup,
      frame: 0,
    } satisfies SceneState,
    resizeObserver,
  };
}

function MemoryTreeCanvas({ isTop, language }: MemoryTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(isTop ? 1 : 0);
  const progressRef = useRef(isTop ? 1 : 0);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    targetRef.current = isTop ? 1 : 0;
  }, [isTop]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sceneState: SceneState | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;
    let readyFrame = 0;

    try {
      const built = buildMemoryScene(container);
      sceneState = built.state;
      resizeObserver = built.resizeObserver;
      readyFrame = requestAnimationFrame(() => {
        if (!disposed) setReady(true);
      });
    } catch (error) {
      console.error("Memory tree 3D fallback", error);
      readyFrame = requestAnimationFrame(() => {
        if (disposed) return;
        setFallback(true);
        setReady(true);
      });
      return () => {
        disposed = true;
        cancelAnimationFrame(readyFrame);
      };
    }

    const isoPosition = new THREE.Vector3(36, 31, 43);
    const topPosition = new THREE.Vector3(0, 61, 0.001);
    const clock = new THREE.Clock();
    const animate = () => {
      if (!sceneState || disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const target = targetRef.current;
      if (reducedMotion) progressRef.current = target;
      else {
        progressRef.current += (target - progressRef.current) * Math.min(1, delta * 4.4);
        if (Math.abs(progressRef.current - target) < 0.001) progressRef.current = target;
      }
      const eased = cubicEase(progressRef.current);
      sceneState.camera.position.lerpVectors(isoPosition, topPosition, eased);
      sceneState.camera.up.set(0, 1 - eased, -eased).normalize();
      sceneState.camera.lookAt(0, 4.2 * (1 - eased), 0);
      sceneState.root.rotation.y = -0.1 * (1 - eased);

      const qrReveal = THREE.MathUtils.smoothstep(eased, 0.28, 0.94);
      sceneState.topQrGroup.visible = qrReveal > 0.01;
      sceneState.treeViewGroup.visible = eased < 0.94;
      sceneState.topQrMaterials.forEach((material) => {
        material.opacity = qrReveal;
      });
      sceneState.qrShadowMaterial.opacity = THREE.MathUtils.lerp(0.16, 0.98, qrReveal);

      const time = performance.now() * 0.001;
      const motion = reducedMotion ? 0 : 1 - eased;
      sceneState.leaves.rotation.y = Math.sin(time * 0.34) * 0.008 * motion;
      sceneState.leaves.rotation.z = Math.sin(time * 0.53) * 0.004 * motion;
      sceneState.grass.rotation.z = Math.sin(time * 0.72) * 0.0028 * motion;
      const transitionBlur = reducedMotion ? 0 : Math.sin(Math.PI * eased) * (window.innerWidth < 720 ? 1.1 : 2.2);
      sceneState.renderer.domElement.style.filter = transitionBlur > 0.05 ? `blur(${transitionBlur}px)` : "none";
      sceneState.renderer.domElement.style.transform = `scale(${1 + Math.sin(Math.PI * eased) * 0.012})`;
      sceneState.renderer.render(sceneState.scene, sceneState.camera);
      sceneState.frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(readyFrame);
      if (sceneState) {
        cancelAnimationFrame(sceneState.frame);
        sceneState.scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        });
        sceneState.renderer.dispose();
        sceneState.renderer.domElement.remove();
      }
      resizeObserver?.disconnect();
    };
  }, []);

  return <div ref={containerRef} className="memory-tree-render" aria-hidden="true">
    {!ready && <div className="memory-tree-loading"><i /><span>{text[language].loading}</span></div>}
    {fallback && <div className="memory-tree-fallback">
      <div className="memory-tree-fallback-code" style={{ "--qr-size": BANK_QR_MATRIX.size } as CSSProperties}>
        {BANK_QR_MATRIX.modules.flatMap((row, rowIndex) => row.map((dark, columnIndex) => {
          if (!dark) return null;
          const role = classifyQrDarkModule(rowIndex, columnIndex, BANK_QR_MATRIX.size);
          return <i key={`${rowIndex}-${columnIndex}`} data-role={role} style={{ gridArea: `${rowIndex + 1} / ${columnIndex + 1}` }} />;
        }))}
      </div>
    </div>}
  </div>;
}

export function ThankYouDiorama({ language }: { language: Language }) {
  const ui = text[language];
  const [isTop, setIsTop] = useState(false);
  const toggleView = useCallback(() => setIsTop((current) => !current), []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleView();
  }

  return <section id="thank-you-stop" className="thank-you-stop final-qr-stop" aria-labelledby="final-qr-title">
    <Image className="thank-you-crane thank-you-crane-left" src="/motifs/crane-stamp-gold.png" alt="" width={180} height={180} unoptimized aria-hidden="true" />
    <Image className="thank-you-crane thank-you-crane-right" src="/motifs/crane-stamp-gold.png" alt="" width={140} height={140} unoptimized aria-hidden="true" />
    <header className="final-qr-heading">
      <span>{ui.kicker}</span>
      <h2 id="final-qr-title">{ui.title}</h2>
      <small>{ui.guide}</small>
    </header>

    <div className="memory-tree-wrap">
      <div
        className="memory-tree-stage"
        data-view={isTop ? "top" : "tree"}
        role="button"
        tabIndex={0}
        aria-pressed={isTop}
        aria-label={isTop ? ui.topView : ui.treeView}
        onClick={toggleView}
        onKeyDown={onKeyDown}
      >
        <MemoryTreeCanvas isTop={isTop} language={language} />
        <div className="memory-tree-grid" aria-hidden="true" />
        <div className="memory-tree-view-badge" aria-hidden="true"><b>{isTop ? "OY" : "3D"}</b><span>{isTop ? "TOP" : "TREE"}</span></div>
        <div className="memory-tree-tap-prompt"><i>{isTop ? "↓" : "↑"}</i><span>{isTop ? ui.topView : ui.treeView}</span></div>
      </div>
      <div className="memory-tree-top-note" data-visible={isTop ? "true" : "false"} aria-hidden="true"><i>↓</i><span>{ui.topView}</span></div>
    </div>

    <a className="thank-you-museum-link" href="#memory-map"><span>{ui.museum}</span><b>↓</b></a>
  </section>;
}

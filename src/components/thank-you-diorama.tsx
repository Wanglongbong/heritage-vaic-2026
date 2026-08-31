"use client";

import { Image } from "./Image";
import { CSSProperties, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import {
  BANK_QR_MATRIX,
  classifyQrDarkModule,
  getQrFinderId,
  isBottomRightAlignmentModule,
  type QrFinderId,
} from "@/lib/bank-qr-matrix";
import type { Language } from "@/lib/types";

const text = {
  vi: {
    kicker: "GA CUỐI · CÂY KÍ ỨC",
    title: "Mô hình Cây Kí Ức & Đoàn Tàu Di Sản",
    guide: "Kéo để xoay 360° · Chạm nút để nhìn mã từ trên",
    treeView: "Chạm để nhìn mã kí ức từ trên",
    topView: "Chạm để trở lại bên cây kí ức",
    orbit: "Kéo xoay 360° · Cuộn chuột thu phóng",
    autoOrbitOn: "Xoay di chuyển xung quanh",
    autoOrbitOff: "Tạm dừng xoay quanh",
    loading: "Đang dựng cây mùa thu và chuyến tàu ký ức…",
    museum: "Mở Phòng trưng bày",
  },
  en: {
    kicker: "FINAL STOP · MEMORY TREE",
    title: "Memory Tree & Heritage Express Model",
    guide: "Drag to orbit 360° · Tap button for top view",
    treeView: "Touch to view memory code from above",
    topView: "Touch to return to memory tree",
    orbit: "Drag to orbit 360° · Scroll to zoom",
    autoOrbitOn: "Orbit / Rotate around",
    autoOrbitOff: "Pause orbit rotation",
    loading: "Building the autumn tree and memory train…",
    museum: "Open the gallery",
  },
} as const;

type MemoryTreeCanvasProps = {
  isTop: boolean;
  isAutoOrbiting?: boolean;
  language: Language;
  viewCommand: number;
  zoomCommand?: { id: number; action: "in" | "out" | "reset" };
  onViewStateChange: (isTop: boolean) => void;
  onCanvasTap?: () => void;
};

type OrbitState = {
  azimuth: number;
  polar: number;
  zoom: number;
  targetAzimuth: number;
  targetPolar: number;
  targetZoom: number;
  scanProgress: number;
  targetScanProgress: number;
  snapping: "top" | "iso" | null;
};

type FallingLeaf = {
  mesh: THREE.Mesh;
  speedY: number;
  flutter: number;
  spinX: number;
  spinY: number;
  spinZ: number;
  seed: number;
};

type GrassBlade = {
  position: THREE.Vector3;
  scale: THREE.Vector3;
  phase: number;
  lean: number;
  windX: number;
  windZ: number;
  rotationY: number;
};

type TrainModuleSupport = "ground" | "carriage" | "cabin" | "nose";

type HedgeCrown = {
  mesh: THREE.InstancedMesh;
  index: number;
  position: THREE.Vector3;
  scale: THREE.Vector3;
  phase: number;
};

type LanternHalo = {
  sprite: THREE.Sprite;
  material: THREE.SpriteMaterial;
  baseScale: number;
  baseOpacity: number;
  phase: number;
  hanging: boolean;
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
  leaves: THREE.Group;
  fallingLeaves: FallingLeaf[];
  fallingLeavesGroup: THREE.Group;
  grass: THREE.Group;
  grassBlades: THREE.InstancedMesh;
  grassBladeData: GrassBlade[];
  grassBladeObject: THREE.Object3D;
  woodMaterial: THREE.MeshStandardMaterial;
  lanternGlowMaterial: THREE.MeshStandardMaterial;
  hangingLanternMaterials: THREE.MeshStandardMaterial[];
  hedgeCrowns: HedgeCrown[];
  hedgeCrownObject: THREE.Object3D;
  lanternHalos: LanternHalo[];
  train: THREE.Group;
  orbit: OrbitState;
  disposeInteraction: () => void;
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

function getTopFitZoom(container: HTMLElement) {
  const rect = container.getBoundingClientRect();
  const width = Math.max(rect.width, 260);
  const height = Math.max(rect.height, 260);
  const view = width < 560 ? 60 : 56;
  const landscapeLightbox = width > height && Boolean(container.closest(".memory-tree-lightbox-card"));
  // Include a generous quiet zone so the outer QR modules never meet the
  // stage border on narrow portrait screens.
  const qrWorldSizeWithQuietZone = landscapeLightbox ? 56 : 58;
  const fitWidth = (view * (width / height)) / qrWorldSizeWithQuietZone;
  const fitHeight = view / qrWorldSizeWithQuietZone;
  return THREE.MathUtils.clamp(Math.min(fitWidth, fitHeight) * (landscapeLightbox ? 0.98 : 0.9), 0.34, landscapeLightbox ? 1.16 : 1);
}

function getTrainModuleSupport(position: THREE.Vector3): TrainModuleSupport {
  if (position.z >= 7 && position.z <= 9 && position.x >= -7 && position.x <= 4) return "carriage";
  if (position.z >= 7 && position.z <= 9 && position.x >= 5 && position.x <= 7) return "cabin";
  if (position.z >= 7 && position.z <= 9 && position.x === 8) return "nose";
  return "ground";
}

function getTrainModuleHeight(position: THREE.Vector3) {
  const support = getTrainModuleSupport(position);
  if (support === "carriage") return 3.76;
  if (support === "cabin") return 4.24;
  if (support === "nose") return 2.68;
  return 0.3;
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

type LanternMaterials = {
  frame: THREE.MeshStandardMaterial;
  glow: THREE.MeshStandardMaterial;
  tassel: THREE.MeshStandardMaterial;
};

function addLantern(
  parent: THREE.Group,
  materials: LanternMaterials,
  position: THREE.Vector3,
  scale = 1,
) {
  const lantern = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.68, 0.54), materials.glow);
  body.position.y = 0.48;
  lantern.add(body);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.7), materials.frame);
  top.position.y = 0.88;
  lantern.add(top);
  const base = top.clone();
  base.position.y = 0.08;
  lantern.add(base);
  const tassel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.38, 0.1), materials.tassel);
  tassel.position.y = -0.16;
  lantern.add(tassel);
  lantern.position.copy(position);
  lantern.scale.setScalar(scale);
  parent.add(lantern);
  return lantern;
}

function createLanternHaloTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d");
  if (context) {
    const gradient = context.createRadialGradient(48, 48, 4, 48, 48, 46);
    gradient.addColorStop(0, "rgba(255,235,158,.92)");
    gradient.addColorStop(0.24, "rgba(255,174,61,.48)");
    gradient.addColorStop(0.62, "rgba(219,77,31,.16)");
    gradient.addColorStop(1, "rgba(219,77,31,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 96, 96);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function addLanternWithHalo(
  parent: THREE.Group,
  materials: LanternMaterials,
  position: THREE.Vector3,
  scale: number,
  haloTexture: THREE.Texture,
  halos: LanternHalo[],
  hanging = false,
) {
  const lantern = addLantern(parent, materials, position, scale);
  const haloMaterial = new THREE.SpriteMaterial({
    map: haloTexture,
    color: 0xffbd5b,
    transparent: true,
    opacity: hanging ? 0.3 : 0.27,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });
  const halo = new THREE.Sprite(haloMaterial);
  const baseScale = 1.8 * scale;
  halo.position.set(position.x, position.y + 0.5 * scale, position.z);
  halo.scale.set(baseScale, baseScale, 1);
  parent.add(halo);
  halos.push({
    sprite: halo,
    material: haloMaterial,
    baseScale,
    baseOpacity: hanging ? 0.3 : 0.27,
    phase: (position.x * 0.37 + position.z * 0.23) % (Math.PI * 2),
    hanging,
  });
  return lantern;
}

function addLotus(
  parent: THREE.Group,
  materials: Map<string, THREE.MeshStandardMaterial>,
  position: THREE.Vector3,
  scale: number,
) {
  addBox(parent, materials, [0.1, 0.46, 0.1], [position.x, 0.58, position.z], "#40512c");
  addBox(parent, materials, [0.58, 0.1, 0.46], [position.x, 0.82, position.z], "#55652f").rotation.y = Math.PI / 4;
  addBox(parent, materials, [0.2, 0.2, 0.2], [position.x, 1.02, position.z], "#d4a246").scale.setScalar(scale);
}

function addBamboo(
  parent: THREE.Group,
  materials: Map<string, THREE.MeshStandardMaterial>,
  position: THREE.Vector3,
  scale: number,
) {
  [-0.16, 0.14].forEach((offset, index) => {
    addBox(parent, materials, [0.11, 1.5 + index * 0.28, 0.11], [position.x + offset, 1.02, position.z], "#4f5c2d");
  });
  addBox(parent, materials, [0.54, 0.12, 0.18], [position.x - 0.08, 1.5, position.z], "#6e7132").rotation.z = 0.35 * scale;
}

function addLandscapeDetail(
  parent: THREE.Group,
  materials: Map<string, THREE.MeshStandardMaterial>,
  position: THREE.Vector3,
  variant: number,
) {
  if (variant === 0) {
    [-0.18, 0, 0.18].forEach((offset, index) => {
      const blade = addBox(parent, materials, [0.08, 0.55 + index * 0.12, 0.08], [position.x + offset, 0.55, position.z], "#a99568");
      blade.rotation.z = (index - 1) * 0.16;
    });
    return;
  }
  if (variant === 1) {
    addBox(parent, materials, [0.58, 0.18, 0.42], [position.x, 0.38, position.z], "#b09b75").rotation.y = Math.PI / 4;
    return;
  }
  if (variant === 2) {
    addBox(parent, materials, [0.68, 0.06, 0.1], [position.x, 0.3, position.z], "#c1ab83");
    addBox(parent, materials, [0.1, 0.06, 0.52], [position.x, 0.31, position.z], "#af9974");
    return;
  }
  addBox(parent, materials, [0.16, 0.62, 0.16], [position.x, 0.58, position.z], "#9c8d69");
  addBox(parent, materials, [0.44, 0.1, 0.22], [position.x + 0.12, 0.84, position.z], "#b3a078").rotation.y = -0.5;
}

function buildMemoryScene(
  container: HTMLDivElement,
  onViewStateChange: (isTop: boolean) => void,
  onCanvasTap?: () => void
) {
  const mobile = window.matchMedia("(max-width: 720px)").matches;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor(0x09070a, 0);
  renderer.domElement.className = "memory-tree-canvas";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-30, 30, 30, -30, 0.1, 160);
  camera.position.set(36, 31, 43);
  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.HemisphereLight(0xffe4a4, 0x2b1018, 2.15));
  const keyLight = new THREE.DirectionalLight(0xffc45c, 3.4);
  keyLight.position.set(-18, 32, 24);
  scene.add(keyLight);
  const redFill = new THREE.PointLight(0xc43724, 36, 38, 2);
  redFill.position.set(0, 4, 10);
  scene.add(redFill);

  const plateMaterial = new THREE.MeshStandardMaterial({ color: 0xf7f3ec, roughness: 1, flatShading: true });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(49, 0.7, 49), plateMaterial);
  plate.position.y = -0.48;
  root.add(plate);

  const tileGeometry = new THREE.BoxGeometry(0.9, 0.1, 0.9);
  const darkPositions: THREE.Vector3[] = [];
  const landscapePositions: THREE.Vector3[] = [];
  const lightReliefPositions: THREE.Vector3[] = [];
  const leafModulePositions: THREE.Vector3[] = [];
  const trainModulePositions: THREE.Vector3[] = [];
  const bareProtectedPositions: THREE.Vector3[] = [];
  const finderDarkPositions: THREE.Vector3[] = [];
  const finderLightPositions: THREE.Vector3[] = [];
  const alignmentDarkPositions: THREE.Vector3[] = [];
  const alignmentLightPositions: THREE.Vector3[] = [];
  const finderPositions: Record<QrFinderId, { dark: THREE.Vector3[]; light: THREE.Vector3[] }> = {
    "north-west": { dark: [], light: [] },
    "north-east": { dark: [], light: [] },
    "south-west": { dark: [], light: [] },
  };
  const centre = (BANK_QR_MATRIX.size - 1) / 2;

  BANK_QR_MATRIX.modules.forEach((row, rowIndex) => {
    row.forEach((dark, columnIndex) => {
      const x = columnIndex - centre;
      const z = rowIndex - centre;
      const position = new THREE.Vector3(x, 0, z);
      const finderId = getQrFinderId(rowIndex, columnIndex, BANK_QR_MATRIX.size);
      if (isBottomRightAlignmentModule(rowIndex, columnIndex, BANK_QR_MATRIX.size)) {
        (dark ? alignmentDarkPositions : alignmentLightPositions).push(position);
      }
      if (finderId) {
        if (dark) {
          finderDarkPositions.push(position);
          finderPositions[finderId].dark.push(position);
        } else {
          finderLightPositions.push(position);
          finderPositions[finderId].light.push(position);
        }
      }
      if (!dark) {
        if (!finderId) lightReliefPositions.push(position);
        return;
      }
      darkPositions.push(position);
      const visualRole = classifyQrDarkModule(rowIndex, columnIndex, BANK_QR_MATRIX.size);
      if (visualRole === "train") trainModulePositions.push(position);
      else if (visualRole === "canopy") leafModulePositions.push(position);
      else if (visualRole === "landscape") landscapePositions.push(position);
      else if (!finderId && !isBottomRightAlignmentModule(rowIndex, columnIndex, BANK_QR_MATRIX.size)) bareProtectedPositions.push(position);
    });
  });

  const groundGrassPositions = [...landscapePositions, ...bareProtectedPositions];

  const dummy = new THREE.Object3D();
  const qrShadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x81763e,
    transparent: true,
    opacity: 0,
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

  const treeViewGroup = new THREE.Group();
  root.add(treeViewGroup);

  const grassGroup = new THREE.Group();
  const patchGeometry = new THREE.BoxGeometry(0.88, 0.11, 0.88);
  const patchMaterial = new THREE.MeshStandardMaterial({ color: 0xa9a06a, roughness: 0.94, flatShading: true });
  const grassPatches = new THREE.InstancedMesh(patchGeometry, patchMaterial, groundGrassPositions.length);
  groundGrassPositions.forEach((position, index) => {
    setInstance(grassPatches, dummy, index, new THREE.Vector3(position.x, 0.165, position.z), new THREE.Vector3(1, 1, 1));
  });
  grassPatches.instanceMatrix.needsUpdate = true;
  grassGroup.add(grassPatches);

  const random = seededRandom(20260828);
  const bladeGeometry = new THREE.BoxGeometry(0.085, 0.72, 0.085);
  const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xc5b66e, roughness: 0.9, flatShading: true });
  const bladeColors = [new THREE.Color(0xb8ad62), new THREE.Color(0xd0bf6e), new THREE.Color(0x9f9858)];
  const bladesPerModule = 3;
  const grassBlades = new THREE.InstancedMesh(
    bladeGeometry,
    bladeMaterial,
    (groundGrassPositions.length + trainModulePositions.length) * bladesPerModule,
  );
  const grassBladeData: GrassBlade[] = [];
  let bladeIndex = 0;
  groundGrassPositions.forEach((position) => {
    for (let blade = 0; blade < bladesPerModule; blade += 1) {
      const height = 0.2 + random() * 0.34;
      const offsetX = (random() - 0.5) * 0.58;
      const offsetZ = (random() - 0.5) * 0.58;
      const bladePosition = new THREE.Vector3(position.x + offsetX, 0.22 + (0.72 * height) / 2, position.z + offsetZ);
      const bladeScale = new THREE.Vector3(0.72 + random() * 0.58, height, 0.72 + random() * 0.58);
      const rotationY = random() * Math.PI;
      setInstance(
        grassBlades,
        dummy,
        bladeIndex,
        bladePosition,
        bladeScale,
        rotationY,
      );
      grassBlades.setColorAt(bladeIndex, bladeColors[(bladeIndex + blade) % bladeColors.length]);
      grassBladeData.push({
        position: bladePosition,
        scale: bladeScale,
        phase: random() * Math.PI * 2,
        lean: 0.065 + random() * 0.055,
        windX: 0.04 + random() * 0.03,
        windZ: 0.026 + random() * 0.022,
        rotationY,
      });
      bladeIndex += 1;
    }
  });
  trainModulePositions.forEach((position) => {
    const roofY = getTrainModuleHeight(position);
    for (let blade = 0; blade < bladesPerModule; blade += 1) {
      const height = 0.15 + random() * 0.17;
      const offsetX = (random() - 0.5) * 0.42;
      const offsetZ = (random() - 0.5) * 0.42;
      const bladePosition = new THREE.Vector3(
        position.x + offsetX,
        roofY + 0.08 + (0.72 * height) / 2,
        position.z + offsetZ,
      );
      const bladeScale = new THREE.Vector3(0.82 + random() * 0.28, height, 0.82 + random() * 0.28);
      const rotationY = random() * Math.PI;
      setInstance(grassBlades, dummy, bladeIndex, bladePosition, bladeScale, rotationY);
      grassBlades.setColorAt(bladeIndex, bladeColors[(bladeIndex + blade) % bladeColors.length]);
      grassBladeData.push({
        position: bladePosition,
        scale: bladeScale,
        phase: random() * Math.PI * 2,
        lean: 0.055 + random() * 0.045,
        windX: 0.034 + random() * 0.024,
        windZ: 0.022 + random() * 0.018,
        rotationY,
      });
      bladeIndex += 1;
    }
  });
  grassBlades.instanceMatrix.needsUpdate = true;
  if (grassBlades.instanceColor) grassBlades.instanceColor.needsUpdate = true;
  grassGroup.add(grassBlades);
  treeViewGroup.add(grassGroup);

  const reliefMaterial = new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 1, flatShading: true });
  const reliefGeometry = new THREE.BoxGeometry(0.94, 0.08, 0.94);
  const lightRelief = new THREE.InstancedMesh(reliefGeometry, reliefMaterial, lightReliefPositions.length);
  lightReliefPositions.forEach((position, index) => {
    setInstance(lightRelief, dummy, index, new THREE.Vector3(position.x, 0.11, position.z), new THREE.Vector3(1, 1, 1));
  });
  lightRelief.instanceMatrix.needsUpdate = true;
  treeViewGroup.add(lightRelief);

  const landscapeDetails = new THREE.Group();
  const landscapeDetailMaterials = new Map<string, THREE.MeshStandardMaterial>();
  landscapePositions.forEach((position, index) => {
    if ((index * 13 + 5) % 7 > 2) return;
    addLandscapeDetail(landscapeDetails, landscapeDetailMaterials, position, index % 4);
  });
  treeViewGroup.add(landscapeDetails);

  const topQrGroup = new THREE.Group();
  const leafModuleGeometry = new THREE.BoxGeometry(0.74, 0.34, 0.74);
  const leafModuleMaterial = new THREE.MeshBasicMaterial({ color: 0x9b7724, transparent: true, opacity: 0.12, toneMapped: false });
  const leafModules = new THREE.InstancedMesh(leafModuleGeometry, leafModuleMaterial, leafModulePositions.length);
  leafModulePositions.forEach((position, index) => {
    setInstance(leafModules, dummy, index, new THREE.Vector3(position.x, 0.24, position.z), new THREE.Vector3(1, 1, 1));
  });
  leafModules.instanceMatrix.needsUpdate = true;
  topQrGroup.add(leafModules);

  const trainModuleGeometry = new THREE.BoxGeometry(0.76, 0.36, 0.76);
  const trainModuleMaterial = new THREE.MeshBasicMaterial({ color: 0xb99632, transparent: true, opacity: 0.12, toneMapped: false });
  const trainModules = new THREE.InstancedMesh(trainModuleGeometry, trainModuleMaterial, trainModulePositions.length);
  trainModulePositions.forEach((position, index) => {
    setInstance(trainModules, dummy, index, new THREE.Vector3(position.x, 0.25, position.z), new THREE.Vector3(1, 1, 1));
  });
  trainModules.instanceMatrix.needsUpdate = true;
  topQrGroup.add(trainModules);

  const finderModuleMaterial = new THREE.MeshBasicMaterial({ color: 0x496b38, transparent: true, opacity: 0.12, toneMapped: false });
  const finderModules = new THREE.InstancedMesh(trainModuleGeometry, finderModuleMaterial, finderDarkPositions.length);
  finderDarkPositions.forEach((position, index) => {
    setInstance(finderModules, dummy, index, new THREE.Vector3(position.x, 0.26, position.z), new THREE.Vector3(1, 1, 1));
  });
  finderModules.instanceMatrix.needsUpdate = true;
  topQrGroup.add(finderModules);

  topQrGroup.visible = true;
  root.add(topQrGroup);
  const lanternMaterials: LanternMaterials = {
    frame: new THREE.MeshStandardMaterial({ color: 0x4a2118, roughness: 0.78, metalness: 0.12, flatShading: true }),
    glow: new THREE.MeshStandardMaterial({ color: 0x9e2b22, emissive: 0xb84b1e, emissiveIntensity: 1.25, roughness: 0.58, flatShading: true }),
    tassel: new THREE.MeshStandardMaterial({ color: 0xc28a35, roughness: 0.8, flatShading: true }),
  };
  const haloTexture = createLanternHaloTexture();
  const lanternHalos: LanternHalo[] = [];
  const hedgeCrowns: HedgeCrown[] = [];

  const finderGardenGroup = new THREE.Group();
  const hedgeMaterial = new THREE.MeshStandardMaterial({
    color: 0x496b38,
    emissive: 0x17250f,
    emissiveIntensity: 0.1,
    roughness: 1,
    flatShading: true,
  });
  const hedgeGeometry = new THREE.BoxGeometry(0.88, 0.56, 0.88);
  const hedgeModules = new THREE.InstancedMesh(hedgeGeometry, hedgeMaterial, finderDarkPositions.length);
  finderDarkPositions.forEach((position, index) => {
    const heightScale = 0.82 + ((index * 7) % 4) * 0.06;
    setInstance(hedgeModules, dummy, index, new THREE.Vector3(position.x, 0.34, position.z), new THREE.Vector3(1, heightScale, 1));
  });
  hedgeModules.instanceMatrix.needsUpdate = true;
  finderGardenGroup.add(hedgeModules);
  const hedgeCrownMaterial = new THREE.MeshStandardMaterial({ color: 0x6f8b45, roughness: 0.94, flatShading: true });
  const hedgeCrownGeometry = new THREE.BoxGeometry(0.68, 0.34, 0.68);
  const finderHedgeCrowns = new THREE.InstancedMesh(hedgeCrownGeometry, hedgeCrownMaterial, finderDarkPositions.length);
  finderDarkPositions.forEach((position, index) => {
    const crownPosition = new THREE.Vector3(position.x, 0.67 + ((index * 3) % 4) * 0.025, position.z);
    const crownScale = new THREE.Vector3(0.92 + (index % 2) * 0.06, 0.86 + ((index * 5) % 3) * 0.08, 0.92 + ((index + 1) % 2) * 0.06);
    setInstance(finderHedgeCrowns, dummy, index, crownPosition, crownScale);
    hedgeCrowns.push({ mesh: finderHedgeCrowns, index, position: crownPosition, scale: crownScale, phase: index * 0.71 });
  });
  finderHedgeCrowns.instanceMatrix.needsUpdate = true;
  finderGardenGroup.add(finderHedgeCrowns);

  const paleGardenMaterial = new THREE.MeshStandardMaterial({ color: 0xfffdf8, roughness: 1, flatShading: true });
  const paleGardenGeometry = new THREE.BoxGeometry(0.92, 0.14, 0.92);
  const paleGardenModules = new THREE.InstancedMesh(paleGardenGeometry, paleGardenMaterial, finderLightPositions.length);
  finderLightPositions.forEach((position, index) => {
    setInstance(paleGardenModules, dummy, index, new THREE.Vector3(position.x, 0.2, position.z), new THREE.Vector3(1, 1, 1));
  });
  paleGardenModules.instanceMatrix.needsUpdate = true;
  finderGardenGroup.add(paleGardenModules);

  const gardenMaterials = new Map<string, THREE.MeshStandardMaterial>();
  const lotusGarden = finderPositions["north-west"].dark.filter((position, index) => index % 6 === 2 && Math.hypot(position.x + 17, position.z + 17) > 1.4);
  lotusGarden.forEach((position, index) => addLotus(finderGardenGroup, gardenMaterials, position, 0.76 + (index % 3) * 0.08));
  addLanternWithHalo(finderGardenGroup, lanternMaterials, new THREE.Vector3(-17, 0.52, -17), 0.96, haloTexture, lanternHalos);

  const bambooGarden = finderPositions["north-east"].dark.filter((position, index) => index % 7 === 1 && Math.hypot(position.x - 17, position.z + 17) > 1.4);
  bambooGarden.forEach((position, index) => addBamboo(finderGardenGroup, gardenMaterials, position, 0.82 + (index % 2) * 0.12));
  addLanternWithHalo(finderGardenGroup, lanternMaterials, new THREE.Vector3(17, 0.52, -17), 0.96, haloTexture, lanternHalos);

  const lanternGarden = finderPositions["south-west"].dark.filter((position, index) => index % 5 === 0 && Math.hypot(position.x + 17, position.z - 17) > 1.4);
  lanternGarden.forEach((position, index) => {
    addLanternWithHalo(finderGardenGroup, lanternMaterials, new THREE.Vector3(position.x, 0.5, position.z), 0.78 + (index % 2) * 0.08, haloTexture, lanternHalos);
  });
  addLanternWithHalo(finderGardenGroup, lanternMaterials, new THREE.Vector3(-17, 0.54, 17), 1.02, haloTexture, lanternHalos);
  treeViewGroup.add(finderGardenGroup);

  const alignmentGardenGroup = new THREE.Group();
  const alignmentHedges = new THREE.InstancedMesh(hedgeGeometry, hedgeMaterial, alignmentDarkPositions.length);
  alignmentDarkPositions.forEach((position, index) => {
    const centreModule = position.x === 14 && position.z === 14;
    setInstance(
      alignmentHedges,
      dummy,
      index,
      new THREE.Vector3(position.x, centreModule ? 0.42 : 0.34, position.z),
      new THREE.Vector3(1, centreModule ? 1.12 : 0.88 + (index % 3) * 0.05, 1),
    );
  });
  alignmentHedges.instanceMatrix.needsUpdate = true;
  alignmentGardenGroup.add(alignmentHedges);
  const alignmentHedgeCrowns = new THREE.InstancedMesh(hedgeCrownGeometry, hedgeCrownMaterial, alignmentDarkPositions.length);
  alignmentDarkPositions.forEach((position, index) => {
    const crownPosition = new THREE.Vector3(position.x, position.x === 14 && position.z === 14 ? 0.79 : 0.67, position.z);
    const crownScale = new THREE.Vector3(0.96, position.x === 14 && position.z === 14 ? 1.16 : 0.92 + (index % 2) * 0.08, 0.96);
    setInstance(alignmentHedgeCrowns, dummy, index, crownPosition, crownScale);
    hedgeCrowns.push({ mesh: alignmentHedgeCrowns, index, position: crownPosition, scale: crownScale, phase: 80 + index * 0.67 });
  });
  alignmentHedgeCrowns.instanceMatrix.needsUpdate = true;
  alignmentGardenGroup.add(alignmentHedgeCrowns);
  const alignmentLightModules = new THREE.InstancedMesh(paleGardenGeometry, paleGardenMaterial, alignmentLightPositions.length);
  alignmentLightPositions.forEach((position, index) => {
    setInstance(alignmentLightModules, dummy, index, new THREE.Vector3(position.x, 0.2, position.z), new THREE.Vector3(1, 1, 1));
  });
  alignmentLightModules.instanceMatrix.needsUpdate = true;
  alignmentGardenGroup.add(alignmentLightModules);
  addLanternWithHalo(alignmentGardenGroup, lanternMaterials, new THREE.Vector3(14, 0.56, 14), 1.02, haloTexture, lanternHalos);
  [[12, 12], [16, 12], [12, 16], [16, 16]].forEach(([x, z]) => {
    addLanternWithHalo(alignmentGardenGroup, lanternMaterials, new THREE.Vector3(x, 0.46, z), 0.58, haloTexture, lanternHalos);
  });
  treeViewGroup.add(alignmentGardenGroup);

  if (!mobile) {
    [[-17, -17], [17, -17], [-17, 17], [14, 14]].forEach(([x, z]) => {
      const gardenLight = new THREE.PointLight(0xffad45, 5.5, 8, 2);
      gardenLight.position.set(x, 2.1, z);
      treeViewGroup.add(gardenLight);
    });
  }

  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x4a220e, roughness: 1, flatShading: true, transparent: true });
  const canopyShadowMaterial = new THREE.MeshBasicMaterial({
    color: 0x7b6f37,
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
    toneMapped: false,
  });
  const canopyShadows = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.035, 0.9), canopyShadowMaterial, leafModulePositions.length);
  leafModulePositions.forEach((position, index) => {
    setInstance(canopyShadows, dummy, index, new THREE.Vector3(position.x, 0.18, position.z), new THREE.Vector3(1, 1, 1));
  });
  canopyShadows.instanceMatrix.needsUpdate = true;
  treeViewGroup.add(canopyShadows);

  const trunk = new THREE.Mesh(new THREE.BoxGeometry(2.05, 11.5, 2.05), woodMaterial);
  trunk.position.y = 5.85;
  treeViewGroup.add(trunk);
  [
    [-1.45, 0.3, 0.72, 0], [1.45, 0.28, 0.72, 0], [0, 0.28, 1.45, Math.PI / 2], [0, 0.28, -1.45, Math.PI / 2],
  ].forEach(([x, y, z, rotation]) => {
    const rootPiece = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.48, 0.62), woodMaterial);
    rootPiece.position.set(x, y, z);
    rootPiece.rotation.y = rotation;
    treeViewGroup.add(rootPiece);
  });
  const branchPoints: Array<[THREE.Vector3, THREE.Vector3, number]> = [
    [new THREE.Vector3(0, 7.2, 0), new THREE.Vector3(7.3, 12.2, 2.8), 0.88],
    [new THREE.Vector3(0, 7.5, 0), new THREE.Vector3(-7.2, 12.7, 3), 0.86],
    [new THREE.Vector3(0, 8.1, 0), new THREE.Vector3(5.2, 14.2, -5.3), 0.78],
    [new THREE.Vector3(0, 8.3, 0), new THREE.Vector3(-5.6, 14, -5.1), 0.76],
    [new THREE.Vector3(0, 8.8, 0), new THREE.Vector3(1, 16.1, 0.3), 0.72],
    [new THREE.Vector3(0, 9.3, 0), new THREE.Vector3(6.6, 14.2, -0.8), 0.6],
    [new THREE.Vector3(0, 9.5, 0), new THREE.Vector3(-6.3, 14.7, -0.5), 0.58],
    [new THREE.Vector3(1.8, 10.5, 0.7), new THREE.Vector3(4.8, 13.3, 4.4), 0.42],
    [new THREE.Vector3(-1.7, 10.7, 0.8), new THREE.Vector3(-4.7, 13.7, 4.2), 0.42],
    [new THREE.Vector3(1.2, 11.3, -1.1), new THREE.Vector3(3.8, 14.8, -4.3), 0.4],
    [new THREE.Vector3(-1.1, 11.4, -1), new THREE.Vector3(-3.9, 14.6, -4.2), 0.4],
    [new THREE.Vector3(0.4, 12, 0.2), new THREE.Vector3(2.2, 15.5, 2.4), 0.36],
    [new THREE.Vector3(-0.4, 12.1, 0.1), new THREE.Vector3(-2.3, 15.3, 2.2), 0.36],
  ];
  branchPoints.forEach(([from, to, width]) => addBranch(treeViewGroup, woodMaterial, from, to, width));

  const hangingLanternGroup = new THREE.Group();
  const hangingLanternMaterials: LanternMaterials = {
    frame: lanternMaterials.frame.clone(),
    glow: lanternMaterials.glow.clone(),
    tassel: lanternMaterials.tassel.clone(),
  };
  const hangingLanternMaterialList = Object.values(hangingLanternMaterials);
  hangingLanternMaterialList.forEach((material) => {
    material.transparent = true;
    material.depthWrite = false;
  });
  const lanternCordMaterial = new THREE.MeshStandardMaterial({ color: 0x3b2418, roughness: 1, transparent: true, depthWrite: false });
  hangingLanternMaterialList.push(lanternCordMaterial);
  const hangingLanternPlacements: Array<[number, number, number, number, number]> = [
    [4.4, 11.1, 2.8, 0.7, 1.05],
    [-4.3, 11.5, 2.7, 0.72, 1.1],
    [3.2, 12.7, -3.5, 0.66, 0.95],
    [-3.4, 12.5, -3.4, 0.68, 1],
    [0.8, 13.8, 0.5, 0.74, 1.15],
  ];
  hangingLanternPlacements.forEach(([x, y, z, scale, cordLength]) => {
    const cord = new THREE.Mesh(new THREE.BoxGeometry(0.055, cordLength, 0.055), lanternCordMaterial);
    cord.position.set(x, y + cordLength * 0.5 + 0.78 * scale, z);
    hangingLanternGroup.add(cord);
    addLanternWithHalo(
      hangingLanternGroup,
      hangingLanternMaterials,
      new THREE.Vector3(x, y, z),
      scale,
      haloTexture,
      lanternHalos,
      true,
    );
  });
  treeViewGroup.add(hangingLanternGroup);

  const leaves = new THREE.Group();
  const leafGeometry = new THREE.BoxGeometry(0.9, 0.48, 0.9);
  const autumnColors = [0xf59e0b, 0xea580c, 0xd97706, 0xfbbf24, 0xb45309];
  const leafMaterials = autumnColors.map((color) => new THREE.MeshStandardMaterial({ color, roughness: 0.92, flatShading: true }));
  leafModulePositions.forEach((modulePosition, moduleIndex) => {
    const radius = Math.hypot(modulePosition.x, modulePosition.z);
    const layers = radius < 5.2 ? 3 : 2;
    for (let layer = 0; layer < layers; layer += 1) {
      const dome = Math.max(0, 1 - Math.pow(radius / 10.6, 1.55));
      const leaf = new THREE.Mesh(leafGeometry, leafMaterials[(moduleIndex + layer * 2) % leafMaterials.length]);
      const spread = 1.2;
      const artPosition = new THREE.Vector3(
        modulePosition.x * spread + (random() - 0.5) * 0.72,
        10.6 + dome * 5.7 + layer * 0.4 + (random() - 0.5) * 0.5,
        modulePosition.z * spread + (random() - 0.5) * 0.72,
      );
      const qrPosition = new THREE.Vector3(modulePosition.x, artPosition.y, modulePosition.z);
      leaf.position.copy(artPosition);
      const scale = 0.78 + random() * 0.5;
      const artScale = new THREE.Vector3(scale * (0.85 + random() * 0.35), scale, scale * (0.85 + random() * 0.35));
      const qrScale = new THREE.Vector3(0.96, scale, 0.96);
      leaf.scale.copy(artScale);
      leaf.rotation.set((random() - 0.5) * 0.35, random() * Math.PI, (random() - 0.5) * 0.25);
      leaf.userData.artPosition = artPosition;
      leaf.userData.qrPosition = qrPosition;
      leaf.userData.artScale = artScale;
      leaf.userData.qrScale = qrScale;
      leaf.userData.artRotation = leaf.rotation.clone();
      leaves.add(leaf);
    }
  });
  treeViewGroup.add(leaves);

  const fallingLeavesGroup = new THREE.Group();
  const fallingLeaves: FallingLeaf[] = [];
  const fallingLeafGeometry = new THREE.BoxGeometry(0.32, 0.04, 0.24);
  const fallingLeafMaterials = autumnColors.slice(0, 4).map((color) => new THREE.MeshBasicMaterial({ color, toneMapped: false }));
  const fallingLeafCount = mobile ? 32 : 65;
  for (let index = 0; index < fallingLeafCount; index += 1) {
    const mesh = new THREE.Mesh(fallingLeafGeometry, fallingLeafMaterials[index % fallingLeafMaterials.length]);
    mesh.position.set((random() - 0.5) * 26, 4 + random() * 14, (random() - 0.5) * 26);
    mesh.rotation.set(random() * Math.PI, random() * Math.PI, random() * Math.PI);
    fallingLeavesGroup.add(mesh);
    fallingLeaves.push({
      mesh,
      speedY: 0.025 + random() * 0.035,
      flutter: 0.4 + random() * 0.8,
      spinX: (random() - 0.5) * 0.035,
      spinY: (random() - 0.5) * 0.045,
      spinZ: (random() - 0.5) * 0.03,
      seed: random() * Math.PI * 2,
    });
  }
  treeViewGroup.add(fallingLeavesGroup);

  const train = new THREE.Group();
  const trainMaterials = new Map<string, THREE.MeshStandardMaterial>();
  addBox(train, trainMaterials, [14.8, 0.68, 3.1], [0, 0.78, 8], "#35161a");
  addBox(train, trainMaterials, [13.9, 2.3, 2.9], [-0.2, 2.05, 8], "#8c1f20");
  addBox(train, trainMaterials, [13.4, 0.52, 3.2], [-0.35, 3.42, 8], "#f7f3ec");
  addBox(train, trainMaterials, [2.8, 3.1, 3], [6.2, 2.45, 8], "#74191a");
  addBox(train, trainMaterials, [3, 0.22, 3.16], [6.2, 4.08, 8], "#f7f3ec");
  addBox(train, trainMaterials, [1.35, 1.5, 2.6], [8.05, 1.65, 8], "#b52c20");
  addBox(train, trainMaterials, [1.5, 0.2, 2.72], [8.05, 2.5, 8], "#f7f3ec");
  addBox(train, trainMaterials, [0.55, 2.1, 0.55], [8.8, 2.45, 8], "#27161c");
  addBox(train, trainMaterials, [0.95, 0.18, 0.95], [8.8, 3.55, 8], "#f7f3ec");
  const windowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffcc55,
    emissive: 0xe6872c,
    emissiveIntensity: 0.72,
    roughness: 0.48,
    flatShading: true,
  });
  const windowFrameMaterial = new THREE.MeshStandardMaterial({ color: 0xc58a38, metalness: 0.2, roughness: 0.62, flatShading: true });
  [6.5, 9.5].forEach((z) => {
    addBox(train, trainMaterials, [14.2, 0.12, 0.12], [-0.1, 1.12, z], "#c58a38");
    addBox(train, trainMaterials, [14.2, 0.09, 0.12], [-0.1, 3.08, z], "#d4a34d");
    for (let index = 0; index < 7; index += 1) {
      const x = -5.3 + index * 1.65;
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.04, 1.02, 0.07), windowFrameMaterial);
      frame.position.set(x, 2.35, z);
      train.add(frame);
      const trainWindow = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.76, 0.1), windowMaterial);
      trainWindow.position.set(x, 2.35, z + (z > 8 ? 0.045 : -0.045));
      train.add(trainWindow);
      const mullion = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.12), windowFrameMaterial);
      mullion.position.set(x, 2.35, z + (z > 8 ? 0.09 : -0.09));
      train.add(mullion);
    }
    const cabinWindow = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.86, 0.1), windowMaterial);
    cabinWindow.position.set(6.28, 2.85, z + (z > 8 ? 0.05 : -0.05));
    train.add(cabinWindow);
    const cabinFrame = new THREE.Mesh(new THREE.BoxGeometry(1.12, 1.08, 0.07), windowFrameMaterial);
    cabinFrame.position.set(6.28, 2.85, z);
    train.add(cabinFrame);
    const door = addBox(train, trainMaterials, [0.88, 1.72, 0.1], [5.02, 1.9, z + (z > 8 ? 0.06 : -0.06)], "#5d1d1c");
    const doorMotif = addBox(train, trainMaterials, [0.3, 0.3, 0.13], [5.02, 1.9, z + (z > 8 ? 0.13 : -0.13)], "#d4a34d");
    doorMotif.rotation.z = Math.PI / 4;
    door.rotation.y = 0;
    [-4.5, -1.2, 2.1].forEach((x) => {
      const motif = addBox(train, trainMaterials, [0.26, 0.26, 0.13], [x, 1.35, z + (z > 8 ? 0.13 : -0.13)], "#d4a34d");
      motif.rotation.z = Math.PI / 4;
    });
  });
  const headlampMaterial = new THREE.MeshStandardMaterial({ color: 0xffd56b, emissive: 0xff9d2f, emissiveIntensity: 1.4, roughness: 0.42 });
  const headlamp = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.58, 0.58), headlampMaterial);
  headlamp.position.set(8.78, 1.82, 8);
  train.add(headlamp);
  addBox(train, trainMaterials, [0.5, 0.22, 0.5], [9.02, 0.76, 8], "#27161c");
  addBox(train, trainMaterials, [0.42, 0.42, 0.42], [9.3, 0.76, 8], "#c58a38");
  trainModulePositions.forEach((position, index) => {
    const roofY = getTrainModuleHeight(position);
    addBox(
      train,
      trainMaterials,
      [0.78, 0.12, 0.78],
      [position.x, roofY, position.z],
      index % 5 === 0 ? "#a77d20" : "#b99632",
    );
  });
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1c1717, roughness: 1, flatShading: true });
  [-5.4, -2.6, 1.2, 4.7, 7.2].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.24, 8), wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.54, 9.38);
    train.add(wheel);
  });
  treeViewGroup.add(train);

  const initialRadius = camera.position.length();
  const orbit: OrbitState = {
    azimuth: Math.atan2(camera.position.x, camera.position.z),
    polar: Math.acos(camera.position.y / initialRadius),
    zoom: 1,
    targetAzimuth: Math.atan2(camera.position.x, camera.position.z),
    targetPolar: Math.acos(camera.position.y / initialRadius),
    targetZoom: 1,
    scanProgress: 0,
    targetScanProgress: 0,
    snapping: null,
  };
  let lastTopFitZoom = getTopFitZoom(container);
  const pointers = new Map<number, { x: number; y: number }>();
  let lastPinchDistance = 0;
  let lastReportedTop = false;
  let pointerDownTime = 0;
  let pointerMovedDist = 0;
  let pointerStartPos = { x: 0, y: 0 };
  let pointerSessionTop = false;

  const reportView = (next: boolean) => {
    if (lastReportedTop === next) return;
    lastReportedTop = next;
    onViewStateChange(next);
  };
  const pointerDistance = () => {
    const values = [...pointers.values()];
    if (values.length < 2) return 0;
    return Math.hypot(values[0].x - values[1].x, values[0].y - values[1].y);
  };
  const onPointerDown = (event: globalThis.PointerEvent) => {
    renderer.domElement.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    pointerDownTime = performance.now();
    pointerStartPos = { x: event.clientX, y: event.clientY };
    pointerMovedDist = 0;
    lastPinchDistance = pointerDistance();
    if (pointers.size === 1) {
      pointerSessionTop = orbit.targetScanProgress > 0.5 || orbit.scanProgress > 0.72;
    }
    orbit.snapping = null;
    if (pointerSessionTop) {
      orbit.targetScanProgress = 1;
      reportView(true);
    } else {
      orbit.targetScanProgress = 0;
      reportView(false);
    }
  };
  const onPointerMove = (event: globalThis.PointerEvent) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    pointerMovedDist += Math.hypot(event.clientX - previous.x, event.clientY - previous.y);
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      if (pointerSessionTop) return;
      orbit.targetAzimuth -= (event.clientX - previous.x) * 0.008;
      orbit.targetPolar = THREE.MathUtils.clamp(orbit.targetPolar + (event.clientY - previous.y) * 0.008, 0.015, 1.46);
      return;
    }
    const nextDistance = pointerDistance();
    if (lastPinchDistance > 0 && nextDistance > 0) {
      orbit.targetZoom = THREE.MathUtils.clamp(orbit.targetZoom * (nextDistance / lastPinchDistance), 0.34, 2.4);
    }
    lastPinchDistance = nextDistance;
  };
  const onPointerUp = (event: globalThis.PointerEvent) => {
    pointers.delete(event.pointerId);
    lastPinchDistance = pointerDistance();
    const elapsed = performance.now() - pointerDownTime;
    if (pointerMovedDist < 8 && elapsed < 400 && pointers.size === 0) {
      onCanvasTap?.();
    }
    if (pointers.size > 0) return;
    reportView(pointerSessionTop);
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    orbit.snapping = null;
    const stayingTop = orbit.targetScanProgress > 0.5 || orbit.scanProgress > 0.72;
    orbit.targetScanProgress = stayingTop ? 1 : 0;
    reportView(stayingTop);
    orbit.targetZoom = THREE.MathUtils.clamp(orbit.targetZoom * Math.exp(-event.deltaY * 0.001), 0.34, 2.4);
  };
  const stage = container.closest<HTMLElement>(".memory-tree-stage");
  const onStageKeyDown = (event: globalThis.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_"].includes(event.key)) return;
    event.preventDefault();
    orbit.snapping = null;
    orbit.targetScanProgress = 0;
    if (event.key === "ArrowLeft") orbit.targetAzimuth -= 0.16;
    if (event.key === "ArrowRight") orbit.targetAzimuth += 0.16;
    if (event.key === "ArrowUp") orbit.targetPolar = Math.max(0.015, orbit.targetPolar - 0.12);
    if (event.key === "ArrowDown") orbit.targetPolar = Math.min(1.46, orbit.targetPolar + 0.12);
    if (event.key === "+" || event.key === "=") orbit.targetZoom = Math.min(2.4, orbit.targetZoom + 0.12);
    if (event.key === "-" || event.key === "_") orbit.targetZoom = Math.max(0.34, orbit.targetZoom - 0.12);
    const stayingTop = orbit.targetScanProgress > 0.5 || orbit.scanProgress > 0.72;
    reportView(stayingTop);
  };
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMove);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);
  renderer.domElement.addEventListener("wheel", onWheel, { passive: false });
  stage?.addEventListener("keydown", onStageKeyDown);
  const disposeInteraction = () => {
    renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    renderer.domElement.removeEventListener("pointermove", onPointerMove);
    renderer.domElement.removeEventListener("pointerup", onPointerUp);
    renderer.domElement.removeEventListener("pointercancel", onPointerUp);
    renderer.domElement.removeEventListener("wheel", onWheel);
    stage?.removeEventListener("keydown", onStageKeyDown);
  };

  const getDimensions = () => {
    const rect = container.getBoundingClientRect();
    const w = rect.width || container.clientWidth || container.offsetWidth || (window.innerWidth < 600 ? 320 : 560);
    const h = rect.height || container.clientHeight || container.offsetHeight || (window.innerWidth < 600 ? 320 : 500);
    return {
      width: Math.max(260, Math.min(w, 1200)),
      height: Math.max(260, Math.min(h, 900)),
    };
  };

  const resize = () => {
    // Keep the WebGL backing buffer out of an intrinsic-size feedback loop.
    const { width, height } = getDimensions();
    const aspect = width / height;
    const view = width < 560 ? 60 : 56;
    camera.left = (-view * aspect) / 2;
    camera.right = (view * aspect) / 2;
    camera.top = view / 2;
    camera.bottom = -view / 2;
    const landscapeLightbox = width > height && Boolean(container.closest(".memory-tree-lightbox-card"));
    const fitWorldSize = landscapeLightbox ? 56 : 58;
    const nextTopFitZoom = THREE.MathUtils.clamp(
      Math.min((view * aspect) / fitWorldSize, view / fitWorldSize) * (landscapeLightbox ? 0.98 : 0.9),
      0.34,
      landscapeLightbox ? 1.16 : 1,
    );
    const isTopView = orbit.targetScanProgress > 0.5 || orbit.scanProgress > 0.72;
    const wasFitted = Math.abs(orbit.targetZoom - lastTopFitZoom) < 0.035;
    if (isTopView && wasFitted) {
      orbit.zoom = nextTopFitZoom;
      orbit.targetZoom = nextTopFitZoom;
    }
    lastTopFitZoom = nextTopFitZoom;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 1.8));
    renderer.setSize(width, height, false);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  // Additional safety resize triggers for modal / portal animations
  const resizeTimer1 = setTimeout(resize, 60);
  const resizeTimer2 = setTimeout(resize, 250);
  window.addEventListener("resize", resize);

  const originalDispose = disposeInteraction;
  const fullDispose = () => {
    clearTimeout(resizeTimer1);
    clearTimeout(resizeTimer2);
    window.removeEventListener("resize", resize);
    originalDispose();
  };

  return {
    state: {
      renderer,
      camera,
      scene,
      root,
      treeViewGroup,
      topQrGroup,
      topQrMaterials: [leafModuleMaterial, trainModuleMaterial, finderModuleMaterial],
      qrShadowMaterial,
      leaves,
      fallingLeaves,
      fallingLeavesGroup,
      grass: grassGroup,
      grassBlades,
      grassBladeData,
      grassBladeObject: new THREE.Object3D(),
      woodMaterial,
      lanternGlowMaterial: lanternMaterials.glow,
      hangingLanternMaterials: hangingLanternMaterialList,
      hedgeCrowns,
      hedgeCrownObject: new THREE.Object3D(),
      lanternHalos,
      train,
      orbit,
      disposeInteraction: fullDispose,
      frame: 0,
    } satisfies SceneState,
    resizeObserver,
  };
}

function MemoryTreeCanvas({ isTop, isAutoOrbiting = false, language, viewCommand, zoomCommand, onViewStateChange, onCanvasTap }: MemoryTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneState | null>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);
  const autoOrbitRef = useRef(isAutoOrbiting);

  useEffect(() => {
    autoOrbitRef.current = isAutoOrbiting;
  }, [isAutoOrbiting]);

  useEffect(() => {
    const sceneState = sceneRef.current;
    if (!sceneState) return;
    if (isTop) {
      sceneState.orbit.targetAzimuth = 0;
      sceneState.orbit.targetPolar = 0.015;
      sceneState.orbit.targetZoom = getTopFitZoom(containerRef.current ?? document.documentElement);
      sceneState.orbit.targetScanProgress = 1;
      sceneState.orbit.snapping = "top";
    } else {
      sceneState.orbit.targetAzimuth = 0.697;
      sceneState.orbit.targetPolar = 1.07;
      sceneState.orbit.targetZoom = 1;
      sceneState.orbit.targetScanProgress = 0;
      sceneState.orbit.snapping = "iso";
    }
  }, [isTop, viewCommand]);

  useEffect(() => {
    const sceneState = sceneRef.current;
    const container = containerRef.current;
    if (!sceneState || !container || !zoomCommand) return;
    sceneState.orbit.snapping = null;
    if (zoomCommand.action === "reset") {
      sceneState.orbit.targetZoom = isTop ? getTopFitZoom(container) : 1;
      return;
    }
    const factor = zoomCommand.action === "in" ? 1.22 : 1 / 1.22;
    sceneState.orbit.targetZoom = THREE.MathUtils.clamp(sceneState.orbit.targetZoom * factor, 0.34, 2.4);
  }, [isTop, zoomCommand]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sceneState: SceneState | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;
    let readyFrame = 0;

    try {
      const built = buildMemoryScene(container, onViewStateChange, onCanvasTap);
      sceneState = built.state;
      sceneRef.current = sceneState;
      resizeObserver = built.resizeObserver;
      if (isTop) {
        sceneState.orbit.azimuth = 0;
        sceneState.orbit.polar = 0.015;
        sceneState.orbit.targetAzimuth = 0;
        sceneState.orbit.targetPolar = 0.015;
        sceneState.orbit.zoom = getTopFitZoom(container);
        sceneState.orbit.targetZoom = sceneState.orbit.zoom;
        sceneState.orbit.scanProgress = 1;
        sceneState.orbit.targetScanProgress = 1;
        sceneState.orbit.snapping = "top";
      }
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

    const clock = new THREE.Clock();
    const animate = () => {
      if (!sceneState || disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const orbit = sceneState.orbit;

      if (autoOrbitRef.current && !isTop && !orbit.snapping) {
        const spinSpeed = reducedMotion ? 0.16 : 0.36;
        orbit.targetAzimuth += delta * spinSpeed;
        orbit.azimuth += delta * spinSpeed;
      }

      const response = reducedMotion ? 1 : Math.min(1, delta * (orbit.snapping ? 5.6 : 11));
      orbit.azimuth += (orbit.targetAzimuth - orbit.azimuth) * response;
      orbit.polar += (orbit.targetPolar - orbit.polar) * response;
      orbit.zoom += (orbit.targetZoom - orbit.zoom) * response;
      orbit.scanProgress += (orbit.targetScanProgress - orbit.scanProgress) * (reducedMotion ? 1 : Math.min(1, delta * 5.8));
      if (orbit.snapping && Math.abs(orbit.polar - orbit.targetPolar) < 0.0015 && Math.abs(orbit.azimuth - orbit.targetAzimuth) < 0.002) {
        orbit.snapping = null;
      }

      const angleAlignment = 1 - THREE.MathUtils.smoothstep(orbit.polar, 0.12, 0.72);
      const qrReveal = Math.max(cubicEase(angleAlignment), cubicEase(orbit.scanProgress));
      const radius = 62;
      const sinPolar = Math.sin(orbit.polar);
      const cosPolar = Math.cos(orbit.polar);
      const sinAzimuth = Math.sin(orbit.azimuth);
      const cosAzimuth = Math.cos(orbit.azimuth);
      const targetY = 4.2 * (1 - qrReveal);
      sceneState.camera.position.set(
        radius * sinPolar * sinAzimuth,
        targetY + radius * cosPolar,
        radius * sinPolar * cosAzimuth,
      );
      sceneState.camera.up.set(-cosPolar * sinAzimuth, sinPolar, -cosPolar * cosAzimuth).normalize();
      sceneState.camera.zoom = orbit.zoom;
      sceneState.camera.updateProjectionMatrix();
      sceneState.camera.lookAt(0, targetY, 0);

      sceneState.topQrGroup.visible = true;
      sceneState.treeViewGroup.visible = true;
      sceneState.treeViewGroup.scale.set(1, 1, 1);
      sceneState.treeViewGroup.position.y = 0;
      sceneState.topQrMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(0.12, 0.7, qrReveal);
      });
      sceneState.qrShadowMaterial.opacity = THREE.MathUtils.lerp(0.04, 0.54, qrReveal);
      sceneState.woodMaterial.opacity = THREE.MathUtils.lerp(1, 0.02, qrReveal);

      const time = performance.now() * 0.001;
      sceneState.lanternGlowMaterial.emissiveIntensity = reducedMotion ? 1.25 : 1.25 * (1 + Math.sin(time * 1.7) * 0.08);
      const hangingOpacity = THREE.MathUtils.lerp(1, 0.05, qrReveal);
      sceneState.hangingLanternMaterials.forEach((material) => {
        material.opacity = hangingOpacity;
      });
      sceneState.lanternHalos.forEach((halo) => {
        const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 1.55 + halo.phase) * 0.1;
        const fade = halo.hanging ? hangingOpacity : 1;
        halo.material.opacity = halo.baseOpacity * fade * (reducedMotion ? 1 : 0.92 + Math.sin(time * 1.55 + halo.phase) * 0.08);
        halo.sprite.scale.set(halo.baseScale * pulse, halo.baseScale * pulse, 1);
      });
      if (!reducedMotion) {
        const changedHedgeMeshes = new Set<THREE.InstancedMesh>();
        sceneState.hedgeCrowns.forEach((crown) => {
          const sway = Math.sin(time * 0.92 + crown.phase) * 0.018 * (1 - qrReveal * 0.45);
          sceneState.hedgeCrownObject.position.copy(crown.position);
          sceneState.hedgeCrownObject.scale.copy(crown.scale);
          sceneState.hedgeCrownObject.rotation.set(sway * 0.45, 0, sway);
          sceneState.hedgeCrownObject.updateMatrix();
          crown.mesh.setMatrixAt(crown.index, sceneState.hedgeCrownObject.matrix);
          changedHedgeMeshes.add(crown.mesh);
        });
        changedHedgeMeshes.forEach((mesh) => {
          mesh.instanceMatrix.needsUpdate = true;
        });
      }
      const motion = reducedMotion ? 0 : 1 - qrReveal * 0.78;
      sceneState.leaves.children.forEach((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        const artPosition = object.userData.artPosition as THREE.Vector3 | undefined;
        const qrPosition = object.userData.qrPosition as THREE.Vector3 | undefined;
        const artRotation = object.userData.artRotation as THREE.Euler | undefined;
        const artScale = object.userData.artScale as THREE.Vector3 | undefined;
        const qrScale = object.userData.qrScale as THREE.Vector3 | undefined;
        if (artPosition && qrPosition) object.position.lerpVectors(artPosition, qrPosition, qrReveal);
        if (artScale && qrScale) object.scale.lerpVectors(artScale, qrScale, qrReveal);
        if (artRotation) {
          object.rotation.x = THREE.MathUtils.lerp(artRotation.x, 0, qrReveal);
          object.rotation.y = THREE.MathUtils.lerp(artRotation.y, 0, qrReveal);
          object.rotation.z = THREE.MathUtils.lerp(artRotation.z, 0, qrReveal);
        }
      });
      sceneState.leaves.rotation.y = Math.sin(time * 0.34) * 0.008 * motion;
      sceneState.leaves.rotation.z = Math.sin(time * 0.53) * 0.004 * motion;
      if (!reducedMotion) {
        sceneState.grassBladeData.forEach((blade, index) => {
          const longWave = Math.sin(time * 1.35 + blade.phase);
          const flutter = Math.sin(time * 3.15 + blade.phase * 1.73);
          const gust = longWave * 0.72 + flutter * 0.28;
          sceneState.grassBladeObject.position.set(
            blade.position.x + gust * blade.windX,
            blade.position.y,
            blade.position.z + (Math.cos(time * 1.08 + blade.phase) * 0.75 + flutter * 0.25) * blade.windZ,
          );
          sceneState.grassBladeObject.scale.set(blade.scale.x, blade.scale.y * (1 + flutter * 0.035), blade.scale.z);
          sceneState.grassBladeObject.rotation.set(gust * blade.lean * 0.4, blade.rotationY, gust * blade.lean);
          sceneState.grassBladeObject.updateMatrix();
          sceneState.grassBlades.setMatrixAt(index, sceneState.grassBladeObject.matrix);
        });
        sceneState.grassBlades.instanceMatrix.needsUpdate = true;
      }
      sceneState.fallingLeavesGroup.visible = !reducedMotion;
      if (!reducedMotion && sceneState.fallingLeavesGroup.visible) {
        const frameFactor = delta * 60;
        const windGust = 1 + Math.sin(time * 0.48) * 0.55;
        const topLeafCount = window.innerWidth < 720 ? 16 : 24;
        sceneState.fallingLeaves.forEach((leaf, index) => {
          leaf.mesh.visible = qrReveal < 0.92 || index < topLeafCount;
          leaf.mesh.position.y -= leaf.speedY * frameFactor;
          leaf.mesh.position.x += Math.sin(time * leaf.flutter + leaf.seed) * 0.015 * windGust * frameFactor;
          leaf.mesh.position.z += Math.cos(time * leaf.flutter * 0.82 + leaf.seed) * 0.013 * windGust * frameFactor;
          if (index < topLeafCount && qrReveal > 0.55) {
            leaf.mesh.position.x = THREE.MathUtils.lerp(leaf.mesh.position.x, THREE.MathUtils.clamp(leaf.mesh.position.x, -7.5, 7.5), qrReveal * 0.05);
            leaf.mesh.position.z = THREE.MathUtils.lerp(leaf.mesh.position.z, THREE.MathUtils.clamp(leaf.mesh.position.z, -7.5, 7.5), qrReveal * 0.05);
          }
          leaf.mesh.rotation.x += leaf.spinX * frameFactor;
          leaf.mesh.rotation.y += leaf.spinY * frameFactor;
          leaf.mesh.rotation.z += leaf.spinZ * frameFactor;
          if (leaf.mesh.position.y < 0.32) {
            const spread = qrReveal > 0.55 && index < topLeafCount ? 14 : 22;
            leaf.mesh.position.set((Math.random() - 0.5) * spread, 12 + Math.random() * 6, (Math.random() - 0.5) * spread);
          }
          leaf.mesh.scale.setScalar(THREE.MathUtils.lerp(1, 0.58, qrReveal));
        });
      }
      const transitionBlur = reducedMotion ? 0 : Math.sin(Math.PI * qrReveal) * (window.innerWidth < 720 ? 0.25 : 0.5);
      sceneState.renderer.domElement.style.filter = transitionBlur > 0.05 ? `blur(${transitionBlur}px)` : "none";
      sceneState.renderer.domElement.style.transform = `scale(${1 + Math.sin(Math.PI * qrReveal) * 0.008})`;
      sceneState.renderer.render(sceneState.scene, sceneState.camera);
      sceneState.frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(readyFrame);
      if (sceneState) {
        cancelAnimationFrame(sceneState.frame);
        sceneState.disposeInteraction();
        sceneState.scene.traverse((object) => {
          if (object instanceof THREE.Mesh) object.geometry.dispose();
          if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.Sprite)) return;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => {
            if ("map" in material && material.map instanceof THREE.Texture) material.map.dispose();
            material.dispose();
          });
        });
        sceneState.renderer.dispose();
        sceneState.renderer.domElement.remove();
      }
      sceneRef.current = null;
      resizeObserver?.disconnect();
    };
  }, [onViewStateChange]);

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

export function ThankYouDiorama({
  language,
  compact = false
}: {
  language: Language;
  compact?: boolean;
}) {
  const ui = text[language];
  const [isTop, setIsTop] = useState(false);
  const [viewCommand, setViewCommand] = useState(0);
  const [isAutoOrbiting, setIsAutoOrbiting] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zoomCommand, setZoomCommand] = useState<{ id: number; action: "in" | "out" | "reset" }>({ id: 0, action: "reset" });

  const requestView = useCallback((next: boolean) => {
    setIsTop(next);
    setViewCommand((current) => current + 1);
  }, []);
  const toggleView = useCallback(() => requestView(!isTop), [isTop, requestView]);
  const toggleAutoOrbit = useCallback(() => setIsAutoOrbiting((prev) => !prev), []);
  const onViewStateChange = useCallback((next: boolean) => setIsTop(next), []);
  const requestZoom = useCallback((action: "in" | "out" | "reset") => {
    setZoomCommand((current) => ({ id: current.id + 1, action }));
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleView();
  }

  function handleCopyBank() {
    if (navigator.clipboard) {
      void navigator.clipboard.writeText("513244");
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

  useEffect(() => {
    function handleGlobalKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && isZoomed) {
        setIsZoomed(false);
      }
    }
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isZoomed]);

  const zoomControls = isTop ? (
    <div className="lightbox-zoom-controls" role="group" aria-label={language === "vi" ? "Thu phóng mã QR" : "QR zoom controls"}>
      <button type="button" onClick={() => requestZoom("out")} aria-label={language === "vi" ? "Thu nhỏ mã QR" : "Zoom QR out"}>−</button>
      <button type="button" className="lightbox-zoom-reset" onClick={() => requestZoom("reset")}>{language === "vi" ? "Vừa khung" : "Fit"}</button>
      <button type="button" onClick={() => requestZoom("in")} aria-label={language === "vi" ? "Phóng to mã QR" : "Zoom QR in"}>+</button>
    </div>
  ) : null;

  if (compact) {
    return (
      <div className="author-diorama-compact-widget">
        <div className="diorama-compact-stage-container">
          <div
            className="memory-tree-stage memory-tree-stage-compact"
            data-view={isTop ? "top" : "tree"}
            role="region"
            tabIndex={0}
            aria-label={isTop ? ui.topView : ui.treeView}
            onKeyDown={onKeyDown}
            onClick={() => setIsZoomed(true)}
            style={{ cursor: "pointer" }}
            title={language === "vi" ? "Nhấp để phóng to toàn màn hình" : "Click to view full screen"}
          >
            <MemoryTreeCanvas
              isTop={isTop}
              isAutoOrbiting={isAutoOrbiting}
              language={language}
              viewCommand={viewCommand}
              zoomCommand={zoomCommand}
              onViewStateChange={onViewStateChange}
              onCanvasTap={() => setIsZoomed(true)}
            />
            <div className="memory-tree-grid" aria-hidden="true" />

            {/* Top Bar Controls */}
            <div className="memory-tree-ctrl-bar">
              <button
                className="memory-tree-view-toggle compact-toggle"
                type="button"
                aria-pressed={isTop}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleView();
                }}
              >
                <span>{isTop ? "📐 " + ui.topView : "👁️ " + ui.treeView}</span>
              </button>

              <button
                className="memory-tree-orbit-toggle compact-orbit"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleAutoOrbit();
                }}
                title={isAutoOrbiting ? ui.autoOrbitOff : ui.autoOrbitOn}
              >
                <span>{isAutoOrbiting ? "⏸️" : "🔄"}</span>
                <b>{isAutoOrbiting ? (language === "vi" ? "Tạm dừng" : "Pause") : (language === "vi" ? "Xoay quanh" : "Orbit")}</b>
              </button>

              <button
                className="memory-tree-zoom-btn compact-zoom"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsZoomed(true);
                }}
                title={language === "vi" ? "Phóng to toàn màn hình" : "Full screen zoom"}
              >
                <span>🔍</span>
                <b>{language === "vi" ? "Toàn màn hình" : "Fullscreen"}</b>
              </button>
            </div>

            {/* Click to Expand Prompt Banner */}
            <div
              className="compact-click-hint"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(true);
              }}
              style={{ cursor: "pointer", pointerEvents: "auto" }}
            >
              <span>✨ {language === "vi" ? "Chạm để phóng to toàn màn hình" : "Tap to enlarge full screen"}</span>
            </div>
          </div>
        </div>

        {/* Bank Details & 1-Click Copy */}
        <div className="compact-bank-card">
          <div className="compact-bank-meta">
            <span className="compact-bank-badge">🏛️ MB BANK</span>
            <span className="compact-bank-acc">STK: <strong>513244</strong></span>
            <span className="compact-bank-name">VŨ ANH QUÂN</span>
          </div>
          <button
            type="button"
            className="compact-copy-btn"
            onClick={handleCopyBank}
          >
            {copied ? (language === "vi" ? "✓ Đã sao chép!" : "✓ Copied!") : (language === "vi" ? "📋 Sao chép STK" : "📋 Copy Acc")}
          </button>
        </div>

        {/* FULLSCREEN LIGHTBOX ZOOM MODAL VIA PORTAL TO BODY */}
        {isZoomed && typeof document !== "undefined" && createPortal(
          <div
            className="memory-tree-lightbox-backdrop animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-label="Cây Kí Ức & Tàu Di Sản Phóng To"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setIsZoomed(false);
            }}
          >
            <div className="memory-tree-lightbox-card">
              <div className="lightbox-header">
                <div className="lightbox-title-group">
                  <span className="lightbox-icon">🌳</span>
                  <div>
                    <h3>{language === "vi" ? "CÂY KÍ ỨC & ĐOÀN TÀU DI SẢN" : "MEMORY TREE & HERITAGE TRAIN"}</h3>
                    <p>{language === "vi" ? "Kéo xoay 360° · Cuộn chuột hoặc chụm tay để thu phóng chi tiết" : "Drag to orbit 360° · Scroll or pinch to zoom in/out"}</p>
                  </div>
                </div>
                <div className="lightbox-header-actions">
                  <button
                    type="button"
                    className="lightbox-orbit-btn"
                    onClick={toggleAutoOrbit}
                  >
                    <span>{isAutoOrbiting ? "⏸️" : "🔄"}</span>
                    <span>{isAutoOrbiting ? ui.autoOrbitOff : ui.autoOrbitOn}</span>
                  </button>
                  <button
                    type="button"
                    className="lightbox-close-btn"
                    onClick={() => setIsZoomed(false)}
                    aria-label={language === "vi" ? "Đóng phóng to" : "Close enlarged view"}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="lightbox-3d-stage-container">
                <div
                  className="memory-tree-stage memory-tree-stage-zoom"
                  data-view={isTop ? "top" : "tree"}
                  role="region"
                  tabIndex={0}
                  aria-label={isTop ? ui.topView : ui.treeView}
                  onKeyDown={onKeyDown}
                >
                  <MemoryTreeCanvas
                    isTop={isTop}
                    isAutoOrbiting={isAutoOrbiting}
                    language={language}
                    viewCommand={viewCommand}
                    zoomCommand={zoomCommand}
                    onViewStateChange={onViewStateChange}
                  />
                  <div className="memory-tree-grid" aria-hidden="true" />
                  <div className="memory-tree-orbit-guide" aria-hidden="true"><i>↔</i><span>{ui.orbit}</span></div>
                </div>
              </div>

              <div className="lightbox-footer">
                <div className="lightbox-bank-info">
                  <span className="bank-logo">🏛️ MB BANK</span>
                  <span className="bank-account">STK: <strong>513244</strong></span>
                  <span className="bank-name">VŨ ANH QUÂN</span>
                  <button
                    type="button"
                    className="bank-copy-btn"
                    onClick={handleCopyBank}
                  >
                    {copied ? (language === "vi" ? "✓ Đã sao chép!" : "✓ Copied!") : (language === "vi" ? "📋 Sao chép STK" : "📋 Copy Acc")}
                  </button>
                </div>
                <div className="lightbox-hints">
                  {zoomControls}
                  <button
                    type="button"
                    className="lightbox-orbit-btn-footer"
                    onClick={toggleAutoOrbit}
                  >
                    <span>{isAutoOrbiting ? "⏸️" : "🔄"}</span>
                    <span>{isAutoOrbiting ? ui.autoOrbitOff : ui.autoOrbitOn}</span>
                  </button>
                  <button
                    type="button"
                    className="lightbox-view-btn"
                    onClick={toggleView}
                    aria-label={isTop ? (language === "vi" ? "Trở về Cây Kí Ức" : "Return to Memory Tree") : (language === "vi" ? "Xem toàn bộ mã QR" : "View the full QR code")}
                  >
                    <span aria-hidden="true">{isTop ? "🌳" : "▦"}</span>
                    <span className="lightbox-view-label">{isTop ? (language === "vi" ? "Về Cây" : "Tree") : (language === "vi" ? "Xem QR" : "View QR")}</span>
                  </button>
                  <button
                    type="button"
                    className="lightbox-dismiss-btn"
                    onClick={() => setIsZoomed(false)}
                  >
                    {language === "vi" ? "Thu nhỏ lại" : "Close View"}
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return <section id="thank-you-stop" className="thank-you-stop final-qr-stop" aria-labelledby="final-qr-title">
    <Image className="thank-you-crane thank-you-crane-left" src="/motifs/crane-stamp-gold.png" alt="" width={180} height={180} unoptimized aria-hidden="true" />
    <Image className="thank-you-crane thank-you-crane-right" src="/motifs/crane-stamp-gold.png" alt="" width={140} height={140} unoptimized aria-hidden="true" />
    <header className="final-qr-heading">
      <span>{ui.kicker}</span>
      <h2 id="final-qr-title">{ui.title}</h2>
      <small>{ui.guide}</small>
    </header>

    <div className="memory-tree-wrap" data-view={isTop ? "top" : "tree"}>
      <div
        className="memory-tree-stage"
        data-view={isTop ? "top" : "tree"}
        role="region"
        tabIndex={0}
        aria-label={isTop ? ui.topView : ui.treeView}
        onKeyDown={onKeyDown}
        onClick={() => setIsZoomed(true)}
      >
        <MemoryTreeCanvas
          isTop={isTop}
          isAutoOrbiting={isAutoOrbiting}
          language={language}
          viewCommand={viewCommand}
          zoomCommand={zoomCommand}
          onViewStateChange={onViewStateChange}
          onCanvasTap={() => setIsZoomed(true)}
        />
        <div className="memory-tree-grid" aria-hidden="true" />

        {/* Action Controls floating on stage */}
        <div className="memory-tree-ctrl-bar">
          <button
            className="memory-tree-view-toggle"
            type="button"
            aria-pressed={isTop}
            onClick={(e) => {
              e.stopPropagation();
              toggleView();
            }}
          >
            <span>{isTop ? "📐 " + ui.topView : "👁️ " + ui.treeView}</span>
          </button>

          <button
            className="memory-tree-orbit-toggle"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAutoOrbit();
            }}
            title={isAutoOrbiting ? ui.autoOrbitOff : ui.autoOrbitOn}
          >
            <span>{isAutoOrbiting ? "⏸️" : "🔄"}</span>
            <b>{isAutoOrbiting ? (language === "vi" ? "Tạm dừng" : "Pause") : (language === "vi" ? "Xoay quanh" : "Orbit")}</b>
          </button>

          <button
            className="memory-tree-zoom-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(true);
            }}
            title={language === "vi" ? "Phóng to toàn màn hình phía trước" : "Enlarge full screen in front"}
          >
            <span>🔍</span>
            <b>{language === "vi" ? "Toàn màn hình" : "Fullscreen"}</b>
          </button>
        </div>

        <div className="memory-tree-orbit-guide" aria-hidden="true"><i>↔</i><span>{ui.orbit}</span></div>
      </div>
      <button className="memory-tree-top-note" type="button" data-visible={isTop ? "true" : "false"} onClick={() => requestView(false)} tabIndex={isTop ? 0 : -1}><i>↓</i><span>{ui.topView}</span></button>
    </div>

    {/* FULLSCREEN LIGHTBOX ZOOM MODAL */}
    {isZoomed && typeof document !== "undefined" && createPortal(
      <div
        className="memory-tree-lightbox-backdrop animate-fade-in"
        role="dialog"
        aria-modal="true"
        aria-label="Cây Kí Ức & Tàu Di Sản Phóng To"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) setIsZoomed(false);
        }}
      >
        <div className="memory-tree-lightbox-card">
          <div className="lightbox-header">
            <div className="lightbox-title-group">
              <span className="lightbox-icon">🌳</span>
              <div>
                <h3>{language === "vi" ? "CÂY KÍ ỨC & ĐOÀN TÀU DI SẢN" : "MEMORY TREE & HERITAGE TRAIN"}</h3>
                <p>{language === "vi" ? "Kéo xoay 360° · Cuộn chuột hoặc chụm tay để thu phóng chi tiết" : "Drag to orbit 360° · Scroll or pinch to zoom in/out"}</p>
              </div>
            </div>
            <div className="lightbox-header-actions">
              <button
                type="button"
                className="lightbox-orbit-btn"
                onClick={toggleAutoOrbit}
              >
                <span>{isAutoOrbiting ? "⏸️" : "🔄"}</span>
                <span>{isAutoOrbiting ? ui.autoOrbitOff : ui.autoOrbitOn}</span>
              </button>
              <button
                type="button"
                className="lightbox-close-btn"
                onClick={() => setIsZoomed(false)}
                aria-label={language === "vi" ? "Đóng phóng to" : "Close enlarged view"}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="lightbox-3d-stage-container">
            <div
              className="memory-tree-stage memory-tree-stage-zoom"
              data-view={isTop ? "top" : "tree"}
              role="region"
              tabIndex={0}
              aria-label={isTop ? ui.topView : ui.treeView}
              onKeyDown={onKeyDown}
            >
              <MemoryTreeCanvas
                isTop={isTop}
                isAutoOrbiting={isAutoOrbiting}
                language={language}
                viewCommand={viewCommand}
                zoomCommand={zoomCommand}
                onViewStateChange={onViewStateChange}
              />
              <div className="memory-tree-grid" aria-hidden="true" />
              <div className="memory-tree-orbit-guide" aria-hidden="true"><i>↔</i><span>{ui.orbit}</span></div>
            </div>
          </div>

          <div className="lightbox-footer">
            <div className="lightbox-bank-info">
              <span className="bank-logo">🏛️ MB BANK</span>
              <span className="bank-account">STK: <strong>513244</strong></span>
              <span className="bank-name">VŨ ANH QUÂN</span>
              <button
                type="button"
                className="bank-copy-btn"
                onClick={handleCopyBank}
              >
                {copied ? (language === "vi" ? "✓ Đã sao chép!" : "✓ Copied!") : (language === "vi" ? "📋 Sao chép STK" : "📋 Copy Acc")}
              </button>
            </div>
            <div className="lightbox-hints">
              {zoomControls}
              <button
                type="button"
                className="lightbox-orbit-btn-footer"
                onClick={toggleAutoOrbit}
              >
                <span>{isAutoOrbiting ? "⏸️" : "🔄"}</span>
                <span>{isAutoOrbiting ? ui.autoOrbitOff : ui.autoOrbitOn}</span>
              </button>
              <button
                type="button"
                className="lightbox-view-btn"
                onClick={toggleView}
                aria-label={isTop ? (language === "vi" ? "Trở về Cây Kí Ức" : "Return to Memory Tree") : (language === "vi" ? "Xem toàn bộ mã QR" : "View the full QR code")}
              >
                <span aria-hidden="true">{isTop ? "🌳" : "▦"}</span>
                <span className="lightbox-view-label">{isTop ? (language === "vi" ? "Về Cây" : "Tree") : (language === "vi" ? "Xem QR" : "View QR")}</span>
              </button>
              <button
                type="button"
                className="lightbox-dismiss-btn"
                onClick={() => setIsZoomed(false)}
              >
                {language === "vi" ? "Thu nhỏ lại" : "Close View"}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
  </section>;
}

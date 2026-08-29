"use client";

import Image from "next/image";
import { CSSProperties, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
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
    kicker: "GA CUỐI · CÂY KÝ ỨC",
    title: "Chạm vào ký ức đang sống",
    guide: "Kéo để xoay 360° · Chạm nút OY để nhìn mã từ trên",
    treeView: "Chạm để nhìn mã ký ức từ trên",
    topView: "Chạm để trở lại bên cây ký ức",
    orbit: "Kéo xoay · Cuộn hoặc chụm để thu phóng",
    loading: "Đang dựng cây mùa thu và chuyến tàu ký ức…",
    museum: "Mở Phòng trưng bày",
  },
  en: {
    kicker: "FINAL STOP · MEMORY TREE",
    title: "Touch a living memory",
    guide: "Drag to orbit 360° · Tap OY for the top view",
    treeView: "Tap for the top view of the memory code",
    topView: "Tap to return to the memory tree",
    orbit: "Drag to orbit · Scroll or pinch to zoom",
    loading: "Building the autumn tree and memory train…",
    museum: "Open the gallery",
  },
} as const;

type MemoryTreeCanvasProps = {
  isTop: boolean;
  language: Language;
  viewCommand: number;
  onViewStateChange: (isTop: boolean) => void;
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

function buildMemoryScene(container: HTMLDivElement, onViewStateChange: (isTop: boolean) => void) {
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
    });
  });

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
  const patchGeometry = new THREE.BoxGeometry(0.88, 0.18, 0.88);
  const patchMaterial = new THREE.MeshStandardMaterial({ color: 0xa9a06a, roughness: 0.94, flatShading: true });
  const grassPatches = new THREE.InstancedMesh(patchGeometry, patchMaterial, landscapePositions.length);
  landscapePositions.forEach((position, index) => {
    setInstance(grassPatches, dummy, index, new THREE.Vector3(position.x, 0.21, position.z), new THREE.Vector3(1, 1, 1));
  });
  grassPatches.instanceMatrix.needsUpdate = true;
  grassGroup.add(grassPatches);

  const random = seededRandom(20260828);
  const bladeGeometry = new THREE.BoxGeometry(0.12, 0.78, 0.12);
  const bladeMaterial = new THREE.MeshStandardMaterial({ color: 0xc5b66e, roughness: 0.9, flatShading: true });
  const bladesPerModule = 2;
  const grassBlades = new THREE.InstancedMesh(
    bladeGeometry,
    bladeMaterial,
    (landscapePositions.length + trainModulePositions.length) * bladesPerModule,
  );
  const grassBladeData: GrassBlade[] = [];
  let bladeIndex = 0;
  landscapePositions.forEach((position) => {
    for (let blade = 0; blade < bladesPerModule; blade += 1) {
      const height = 0.55 + random() * 0.75;
      const offsetX = (random() - 0.5) * 0.5;
      const offsetZ = (random() - 0.5) * 0.5;
      const bladePosition = new THREE.Vector3(position.x + offsetX, 0.35 + height * 0.5, position.z + offsetZ);
      const bladeScale = new THREE.Vector3(0.75 + random() * 0.5, height, 0.75 + random() * 0.5);
      setInstance(
        grassBlades,
        dummy,
        bladeIndex,
        bladePosition,
        bladeScale,
        random() * Math.PI,
      );
      grassBladeData.push({ position: bladePosition, scale: bladeScale, phase: random() * Math.PI * 2, lean: 0.055 + random() * 0.055 });
      bladeIndex += 1;
    }
  });
  trainModulePositions.forEach((position) => {
    const roofY = position.x >= 4.8 ? 4.24 : 3.76;
    for (let blade = 0; blade < bladesPerModule; blade += 1) {
      const height = 0.34 + random() * 0.28;
      const offsetX = (random() - 0.5) * 0.42;
      const offsetZ = (random() - 0.5) * 0.42;
      const bladePosition = new THREE.Vector3(
        position.x + offsetX,
        roofY + 0.08 + (0.78 * height) / 2,
        position.z + offsetZ,
      );
      const bladeScale = new THREE.Vector3(0.82 + random() * 0.28, height, 0.82 + random() * 0.28);
      setInstance(grassBlades, dummy, bladeIndex, bladePosition, bladeScale, random() * Math.PI);
      grassBladeData.push({ position: bladePosition, scale: bladeScale, phase: random() * Math.PI * 2, lean: 0.045 + random() * 0.05 });
      bladeIndex += 1;
    }
  });
  grassBlades.instanceMatrix.needsUpdate = true;
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

  const finderModuleMaterial = new THREE.MeshBasicMaterial({ color: 0x81763e, transparent: true, opacity: 0.12, toneMapped: false });
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

  const finderGardenGroup = new THREE.Group();
  const hedgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xa59a5f,
    emissive: 0x3b2c06,
    emissiveIntensity: 0.08,
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
  addLantern(finderGardenGroup, lanternMaterials, new THREE.Vector3(-17, 0.52, -17), 0.96);

  const bambooGarden = finderPositions["north-east"].dark.filter((position, index) => index % 7 === 1 && Math.hypot(position.x - 17, position.z + 17) > 1.4);
  bambooGarden.forEach((position, index) => addBamboo(finderGardenGroup, gardenMaterials, position, 0.82 + (index % 2) * 0.12));
  addLantern(finderGardenGroup, lanternMaterials, new THREE.Vector3(17, 0.52, -17), 0.96);

  const lanternGarden = finderPositions["south-west"].dark.filter((position, index) => index % 5 === 0 && Math.hypot(position.x + 17, position.z - 17) > 1.4);
  lanternGarden.forEach((position, index) => {
    addLantern(finderGardenGroup, lanternMaterials, new THREE.Vector3(position.x, 0.5, position.z), 0.78 + (index % 2) * 0.08);
  });
  addLantern(finderGardenGroup, lanternMaterials, new THREE.Vector3(-17, 0.54, 17), 1.02);
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
  const alignmentLightModules = new THREE.InstancedMesh(paleGardenGeometry, paleGardenMaterial, alignmentLightPositions.length);
  alignmentLightPositions.forEach((position, index) => {
    setInstance(alignmentLightModules, dummy, index, new THREE.Vector3(position.x, 0.2, position.z), new THREE.Vector3(1, 1, 1));
  });
  alignmentLightModules.instanceMatrix.needsUpdate = true;
  alignmentGardenGroup.add(alignmentLightModules);
  addLantern(alignmentGardenGroup, lanternMaterials, new THREE.Vector3(14, 0.56, 14), 1.02);
  [[12, 12], [16, 12], [12, 16], [16, 16]].forEach(([x, z]) => {
    addLantern(alignmentGardenGroup, lanternMaterials, new THREE.Vector3(x, 0.46, z), 0.58);
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
  addBox(train, trainMaterials, [14.2, 0.12, 0.12], [-0.1, 1.12, 9.48], "#c58a38");
  for (let index = 0; index < 7; index += 1) {
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0xffcc55,
      emissive: 0xe6872c,
      emissiveIntensity: 0.65,
      roughness: 0.52,
      flatShading: true,
    });
    const trainWindow = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.82, 0.08), windowMaterial);
    trainWindow.position.set(-5.3 + index * 1.65, 2.35, 9.48);
    train.add(trainWindow);
  }
  trainModulePositions.forEach((position, index) => {
    const roofY = position.x >= 4.8 ? 4.24 : 3.76;
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
  const pointers = new Map<number, { x: number; y: number }>();
  let lastPinchDistance = 0;
  let lastReportedTop = false;
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
    lastPinchDistance = pointerDistance();
    orbit.snapping = null;
    orbit.targetScanProgress = 0;
    reportView(false);
  };
  const onPointerMove = (event: globalThis.PointerEvent) => {
    const previous = pointers.get(event.pointerId);
    if (!previous) return;
    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.size === 1) {
      orbit.targetAzimuth -= (event.clientX - previous.x) * 0.008;
      orbit.targetPolar = THREE.MathUtils.clamp(orbit.targetPolar + (event.clientY - previous.y) * 0.008, 0.015, 1.46);
      return;
    }
    const nextDistance = pointerDistance();
    if (lastPinchDistance > 0 && nextDistance > 0) {
      orbit.targetZoom = THREE.MathUtils.clamp(orbit.targetZoom * (nextDistance / lastPinchDistance), 0.78, 1.5);
    }
    lastPinchDistance = nextDistance;
  };
  const onPointerUp = (event: globalThis.PointerEvent) => {
    pointers.delete(event.pointerId);
    lastPinchDistance = pointerDistance();
    if (pointers.size > 0) return;
    reportView(false);
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    orbit.snapping = null;
    orbit.targetScanProgress = 0;
    reportView(false);
    orbit.targetZoom = THREE.MathUtils.clamp(orbit.targetZoom * Math.exp(-event.deltaY * 0.001), 0.78, 1.5);
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
    if (event.key === "+" || event.key === "=") orbit.targetZoom = Math.min(1.5, orbit.targetZoom + 0.1);
    if (event.key === "-" || event.key === "_") orbit.targetZoom = Math.max(0.78, orbit.targetZoom - 0.1);
    reportView(false);
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
      train,
      orbit,
      disposeInteraction,
      frame: 0,
    } satisfies SceneState,
    resizeObserver,
  };
}

function MemoryTreeCanvas({ isTop, language, viewCommand, onViewStateChange }: MemoryTreeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SceneState | null>(null);
  const [ready, setReady] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const sceneState = sceneRef.current;
    if (!sceneState) return;
    if (isTop) {
      sceneState.orbit.targetAzimuth = 0;
      sceneState.orbit.targetPolar = 0.015;
      sceneState.orbit.targetZoom = 1;
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
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sceneState: SceneState | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;
    let readyFrame = 0;

    try {
      const built = buildMemoryScene(container, onViewStateChange);
      sceneState = built.state;
      sceneRef.current = sceneState;
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

    const clock = new THREE.Clock();
    const animate = () => {
      if (!sceneState || disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const orbit = sceneState.orbit;
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
      sceneState.qrShadowMaterial.opacity = THREE.MathUtils.lerp(0.04, 0.7, qrReveal);
      sceneState.woodMaterial.opacity = THREE.MathUtils.lerp(1, 0.02, qrReveal);

      const time = performance.now() * 0.001;
      sceneState.lanternGlowMaterial.emissiveIntensity = reducedMotion ? 1.25 : 1.25 * (1 + Math.sin(time * 1.7) * 0.08);
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
          const sway = Math.sin(time * 1.35 + blade.phase) * blade.lean;
          sceneState.grassBladeObject.position.copy(blade.position);
          sceneState.grassBladeObject.scale.copy(blade.scale);
          sceneState.grassBladeObject.rotation.set(sway * 0.35, 0, sway);
          sceneState.grassBladeObject.updateMatrix();
          sceneState.grassBlades.setMatrixAt(index, sceneState.grassBladeObject.matrix);
        });
        sceneState.grassBlades.instanceMatrix.needsUpdate = true;
      }
      sceneState.fallingLeavesGroup.visible = !reducedMotion;
      if (!reducedMotion && sceneState.fallingLeavesGroup.visible) {
        const frameFactor = delta * 60;
        const topLeafCount = window.innerWidth < 720 ? 12 : 18;
        sceneState.fallingLeaves.forEach((leaf, index) => {
          leaf.mesh.visible = qrReveal < 0.92 || index < topLeafCount;
          leaf.mesh.position.y -= leaf.speedY * frameFactor;
          leaf.mesh.position.x += Math.sin(time * leaf.flutter + leaf.seed) * 0.008 * frameFactor;
          leaf.mesh.position.z += Math.cos(time * leaf.flutter * 0.82 + leaf.seed) * 0.006 * frameFactor;
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
          leaf.mesh.scale.setScalar(THREE.MathUtils.lerp(1, 0.48, qrReveal));
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

export function ThankYouDiorama({ language }: { language: Language }) {
  const ui = text[language];
  const [isTop, setIsTop] = useState(false);
  const [viewCommand, setViewCommand] = useState(0);
  const requestView = useCallback((next: boolean) => {
    setIsTop(next);
    setViewCommand((current) => current + 1);
  }, []);
  const toggleView = useCallback(() => requestView(!isTop), [isTop, requestView]);
  const onViewStateChange = useCallback((next: boolean) => setIsTop(next), []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
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

    <div className="memory-tree-wrap" data-view={isTop ? "top" : "tree"}>
      <div
        className="memory-tree-stage"
        data-view={isTop ? "top" : "tree"}
        role="region"
        tabIndex={0}
        aria-label={isTop ? ui.topView : ui.treeView}
        onKeyDown={onKeyDown}
      >
        <MemoryTreeCanvas
          isTop={isTop}
          language={language}
          viewCommand={viewCommand}
          onViewStateChange={onViewStateChange}
        />
        <div className="memory-tree-grid" aria-hidden="true" />
        <button className="memory-tree-view-toggle" type="button" aria-pressed={isTop} onClick={toggleView}>
          <b>{isTop ? "3D" : "OY"}</b>
          <span>{isTop ? ui.topView : ui.treeView}</span>
        </button>
        <div className="memory-tree-orbit-guide" aria-hidden="true"><i>↔</i><span>{ui.orbit}</span></div>
      </div>
      <button className="memory-tree-top-note" type="button" data-visible={isTop ? "true" : "false"} onClick={() => requestView(false)} tabIndex={isTop ? 0 : -1}><i>↓</i><span>{ui.topView}</span></button>
    </div>

    <a className="thank-you-museum-link" href="#memory-map"><span>{ui.museum}</span><b>↓</b></a>
  </section>;
}

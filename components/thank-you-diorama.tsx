"use client";

import Image from "next/image";
import { CSSProperties, KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import {
  BANK_QR_MATRIX,
  classifyQrDarkModule,
  getQrFinderId,
  isTrainArtworkZone,
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
    loading: "Đang gieo cỏ theo từng ô ký ức…",
    museum: "Mở Phòng trưng bày",
  },
  en: {
    kicker: "FINAL STOP · MEMORY TREE",
    title: "Touch a living memory",
    guide: "Drag to orbit 360° · Tap OY for the top view",
    treeView: "Tap for the top view of the memory code",
    topView: "Tap to return to the memory tree",
    orbit: "Drag to orbit · Scroll or pinch to zoom",
    loading: "Growing grass from each memory tile…",
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
  snapping: "top" | "iso" | null;
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
      const blade = addBox(parent, materials, [0.08, 0.55 + index * 0.12, 0.08], [position.x + offset, 0.55, position.z], "#75601f");
      blade.rotation.z = (index - 1) * 0.16;
    });
    return;
  }
  if (variant === 1) {
    addBox(parent, materials, [0.58, 0.18, 0.42], [position.x, 0.38, position.z], "#7a6033").rotation.y = Math.PI / 4;
    return;
  }
  if (variant === 2) {
    addBox(parent, materials, [0.68, 0.06, 0.1], [position.x, 0.3, position.z], "#b88b3e");
    addBox(parent, materials, [0.1, 0.06, 0.52], [position.x, 0.31, position.z], "#8f642e");
    return;
  }
  addBox(parent, materials, [0.16, 0.62, 0.16], [position.x, 0.58, position.z], "#5d672f");
  addBox(parent, materials, [0.44, 0.1, 0.22], [position.x + 0.12, 0.84, position.z], "#8b7d32").rotation.y = -0.5;
}

function buildMemoryScene(container: HTMLDivElement, onViewStateChange: (isTop: boolean) => void) {
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

  const plateMaterial = new THREE.MeshStandardMaterial({ color: 0xd3b570, roughness: 1, flatShading: true });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(49, 0.7, 49), plateMaterial);
  plate.position.y = -0.48;
  root.add(plate);

  const tileGeometry = new THREE.BoxGeometry(0.91, 0.1, 0.91);
  const darkPositions: THREE.Vector3[] = [];
  const landscapePositions: THREE.Vector3[] = [];
  const lightReliefPositions: THREE.Vector3[] = [];
  const leafModulePositions: THREE.Vector3[] = [];
  const trainModulePositions: THREE.Vector3[] = [];
  const trainLightPositions: THREE.Vector3[] = [];
  const finderDarkPositions: THREE.Vector3[] = [];
  const finderLightPositions: THREE.Vector3[] = [];
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
        if (isTrainArtworkZone(rowIndex, columnIndex, BANK_QR_MATRIX.size)) {
          const neighbours = [[-1, 0], [1, 0], [0, -1], [0, 1]];
          const touchesTrainModule = neighbours.some(([rowOffset, columnOffset]) => {
            const neighbourRow = rowIndex + rowOffset;
            const neighbourColumn = columnIndex + columnOffset;
            return Boolean(
              BANK_QR_MATRIX.modules[neighbourRow]?.[neighbourColumn]
              && classifyQrDarkModule(neighbourRow, neighbourColumn, BANK_QR_MATRIX.size) === "train"
            );
          });
          if (touchesTrainModule) trainLightPositions.push(position);
        }
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

  const treeViewGroup = new THREE.Group();
  root.add(treeViewGroup);

  const grassGroup = new THREE.Group();
  const patchGeometry = new THREE.BoxGeometry(0.78, 0.18, 0.78);
  const patchMaterial = new THREE.MeshBasicMaterial({ color: 0x5f4015, toneMapped: false });
  const grassPatches = new THREE.InstancedMesh(patchGeometry, patchMaterial, landscapePositions.length);
  landscapePositions.forEach((position, index) => {
    setInstance(grassPatches, dummy, index, new THREE.Vector3(position.x, 0.21, position.z), new THREE.Vector3(1, 1, 1));
  });
  grassPatches.instanceMatrix.needsUpdate = true;
  grassGroup.add(grassPatches);

  const random = seededRandom(20260828);
  const bladeGeometry = new THREE.BoxGeometry(0.12, 0.78, 0.12);
  const bladeMaterial = new THREE.MeshBasicMaterial({ color: 0x785019, toneMapped: false });
  const bladesPerModule = 2;
  const grassBlades = new THREE.InstancedMesh(bladeGeometry, bladeMaterial, landscapePositions.length * bladesPerModule);
  let bladeIndex = 0;
  landscapePositions.forEach((position) => {
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
  treeViewGroup.add(grassGroup);

  const reliefMaterial = new THREE.MeshStandardMaterial({ color: 0xd7ba72, roughness: 1, flatShading: true });
  const reliefGeometry = new THREE.BoxGeometry(0.76, 0.08, 0.76);
  const lightRelief = new THREE.InstancedMesh(reliefGeometry, reliefMaterial, lightReliefPositions.length);
  lightReliefPositions.forEach((position, index) => {
    const reliefScale = 0.76 + ((index * 17) % 5) * 0.045;
    setInstance(lightRelief, dummy, index, new THREE.Vector3(position.x, 0.11, position.z), new THREE.Vector3(reliefScale, 1, reliefScale));
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

  const finderModuleMaterial = new THREE.MeshBasicMaterial({ color: 0x26391f, transparent: true, opacity: 0, toneMapped: false });
  const finderModules = new THREE.InstancedMesh(redModuleGeometry, finderModuleMaterial, finderDarkPositions.length);
  finderDarkPositions.forEach((position, index) => {
    setInstance(finderModules, dummy, index, new THREE.Vector3(position.x, 0.26, position.z), new THREE.Vector3(1, 1, 1));
  });
  finderModules.instanceMatrix.needsUpdate = true;
  topQrGroup.add(finderModules);

  topQrGroup.visible = false;
  root.add(topQrGroup);
  const lanternMaterials: LanternMaterials = {
    frame: new THREE.MeshStandardMaterial({ color: 0x4a2118, roughness: 0.78, metalness: 0.12, flatShading: true }),
    glow: new THREE.MeshStandardMaterial({ color: 0x9e2b22, emissive: 0xb84b1e, emissiveIntensity: 1.25, roughness: 0.58, flatShading: true }),
    tassel: new THREE.MeshStandardMaterial({ color: 0xc28a35, roughness: 0.8, flatShading: true }),
  };

  const finderGardenGroup = new THREE.Group();
  const hedgeMaterial = new THREE.MeshStandardMaterial({ color: 0x334522, roughness: 1, flatShading: true });
  const hedgeGeometry = new THREE.BoxGeometry(0.78, 0.52, 0.78);
  const hedgeModules = new THREE.InstancedMesh(hedgeGeometry, hedgeMaterial, finderDarkPositions.length);
  finderDarkPositions.forEach((position, index) => {
    setInstance(hedgeModules, dummy, index, new THREE.Vector3(position.x, 0.38, position.z), new THREE.Vector3(1, 1, 1));
  });
  hedgeModules.instanceMatrix.needsUpdate = true;
  finderGardenGroup.add(hedgeModules);

  const paleGardenMaterial = new THREE.MeshStandardMaterial({ color: 0xd9bc72, roughness: 1, flatShading: true });
  const paleGardenGeometry = new THREE.BoxGeometry(0.72, 0.16, 0.72);
  const paleGardenModules = new THREE.InstancedMesh(paleGardenGeometry, paleGardenMaterial, finderLightPositions.length);
  finderLightPositions.forEach((position, index) => {
    setInstance(paleGardenModules, dummy, index, new THREE.Vector3(position.x, 0.2, position.z), new THREE.Vector3(1, 1, 1));
  });
  paleGardenModules.instanceMatrix.needsUpdate = true;
  finderGardenGroup.add(paleGardenModules);

  const gardenMaterials = new Map<string, THREE.MeshStandardMaterial>();
  const lotusGarden = finderPositions["north-west"].dark.filter((_, index) => index % 6 === 2);
  lotusGarden.forEach((position, index) => addLotus(finderGardenGroup, gardenMaterials, position, 0.76 + (index % 3) * 0.08));
  addBox(finderGardenGroup, gardenMaterials, [3.7, 0.12, 3.7], [-17, 0.5, -17], "#6c5a2d");

  const bambooGarden = finderPositions["north-east"].dark.filter((_, index) => index % 7 === 1);
  bambooGarden.forEach((position, index) => addBamboo(finderGardenGroup, gardenMaterials, position, 0.82 + (index % 2) * 0.12));
  addBox(finderGardenGroup, gardenMaterials, [3.7, 0.12, 3.7], [17, 0.5, -17], "#78662f");

  const lanternGarden = finderPositions["south-west"].dark.filter((_, index) => index % 5 === 0);
  lanternGarden.forEach((position, index) => {
    addLantern(finderGardenGroup, lanternMaterials, new THREE.Vector3(position.x, 0.7, position.z), 0.42 + (index % 2) * 0.07);
  });
  addBox(finderGardenGroup, gardenMaterials, [3.7, 0.12, 3.7], [-17, 0.5, 17], "#704225");
  treeViewGroup.add(finderGardenGroup);

  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0x5c2d16, roughness: 1, flatShading: true });
  const canopyShadowGeometry = new THREE.BoxGeometry(0.82, 0.05, 0.82);
  const canopyShadowMaterial = new THREE.MeshBasicMaterial({ color: 0x6f4a17, transparent: true, opacity: 0.72, toneMapped: false });
  const canopyShadows = new THREE.InstancedMesh(canopyShadowGeometry, canopyShadowMaterial, leafModulePositions.length);
  leafModulePositions.forEach((position, index) => {
    setInstance(canopyShadows, dummy, index, new THREE.Vector3(position.x, 0.17, position.z), new THREE.Vector3(1, 1, 1));
  });
  canopyShadows.instanceMatrix.needsUpdate = true;
  treeViewGroup.add(canopyShadows);

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
  const leafCount = leafModulePositions.length;
  const leafGeometry = new THREE.BoxGeometry(0.84, 0.48, 0.84);
  const leafMaterial = new THREE.MeshBasicMaterial({ color: 0xe5a72b, toneMapped: false });
  const leaves = new THREE.InstancedMesh(leafGeometry, leafMaterial, leafCount);
  for (let index = 0; index < leafCount; index += 1) {
    const modulePosition = leafModulePositions[index];
    const radius = Math.hypot(modulePosition.x, modulePosition.z);
    const dome = 1 - Math.pow(radius / 8.8, 1.5);
    const x = modulePosition.x + (random() - 0.5) * 0.16;
    const z = modulePosition.z + (random() - 0.5) * 0.16;
    const y = 6.1 + dome * 3.1 + (random() - 0.5) * 0.26;
    const scale = 0.64 + random() * 0.42;
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
  addBox(train, trainMaterials, [18.4, 0.18, 4.8], [0, 0.28, 8], "#d6b969");
  addBox(train, trainMaterials, [18.1, 0.2, 0.16], [0, 0.62, 10.26], "#8d5c27");
  addBox(train, trainMaterials, [18.1, 0.2, 0.16], [0, 0.62, 5.74], "#b78739");
  trainLightPositions.forEach((position, index) => {
    addBox(train, trainMaterials, [0.74, 0.9, 0.74], [position.x, 0.82, position.z], index % 3 === 0 ? "#ddc77f" : "#caa654");
    addBox(train, trainMaterials, [0.82, 0.12, 0.82], [position.x, 1.34, position.z], "#eed58a");
  });
  trainModulePositions.forEach((position, index) => {
    addBox(train, trainMaterials, [0.72, 1.22, 0.72], [position.x, 0.94, position.z], index % 4 === 0 ? "#7b2922" : "#641e1c");
    addBox(train, trainMaterials, [0.82, 0.18, 0.82], [position.x, 1.62, position.z], "#8f3124");
    if (index % 5 === 0) addLantern(train, lanternMaterials, new THREE.Vector3(position.x, 1.82, position.z), 0.31);
  });
  addBox(train, trainMaterials, [1.12, 1.8, 1.12], [8.25, 1.26, 8], "#8b3428");
  addBox(train, trainMaterials, [0.42, 1.18, 0.42], [8.25, 2.66, 8], "#5a3020");
  addBox(train, trainMaterials, [0.86, 0.16, 0.86], [8.25, 3.25, 8], "#d2a24d");
  const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1b1616, roughness: 1, flatShading: true });
  [-7.1, -4.3, -1.5, 1.5, 4.3, 7.1].forEach((x) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.24, 8), wheelMaterial);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(x, 0.56, 10.36);
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
    if (orbit.targetPolar <= 0.24) {
      orbit.targetAzimuth = 0;
      orbit.targetPolar = 0.015;
      orbit.targetZoom = 1;
      orbit.snapping = "top";
      reportView(true);
    } else {
      reportView(false);
    }
  };
  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    orbit.targetZoom = THREE.MathUtils.clamp(orbit.targetZoom * Math.exp(-event.deltaY * 0.001), 0.78, 1.5);
  };
  const stage = container.closest<HTMLElement>(".memory-tree-stage");
  const onStageKeyDown = (event: globalThis.KeyboardEvent) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "+", "=", "-", "_"].includes(event.key)) return;
    event.preventDefault();
    orbit.snapping = null;
    if (event.key === "ArrowLeft") orbit.targetAzimuth -= 0.16;
    if (event.key === "ArrowRight") orbit.targetAzimuth += 0.16;
    if (event.key === "ArrowUp") orbit.targetPolar = Math.max(0.015, orbit.targetPolar - 0.12);
    if (event.key === "ArrowDown") orbit.targetPolar = Math.min(1.46, orbit.targetPolar + 0.12);
    if (event.key === "+" || event.key === "=") orbit.targetZoom = Math.min(1.5, orbit.targetZoom + 0.1);
    if (event.key === "-" || event.key === "_") orbit.targetZoom = Math.max(0.78, orbit.targetZoom - 0.1);
    if (orbit.targetPolar <= 0.2) {
      orbit.targetAzimuth = 0;
      orbit.targetPolar = 0.015;
      orbit.targetZoom = 1;
      orbit.snapping = "top";
      reportView(true);
    } else {
      reportView(false);
    }
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
      topQrMaterials: [leafModuleMaterial, redModuleMaterial, finderModuleMaterial],
      qrShadowMaterial,
      leaves,
      grass: grassGroup,
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
      sceneState.orbit.snapping = "top";
    } else {
      sceneState.orbit.targetAzimuth = 0.697;
      sceneState.orbit.targetPolar = 1.07;
      sceneState.orbit.targetZoom = 1;
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
      if (orbit.snapping && Math.abs(orbit.polar - orbit.targetPolar) < 0.0015 && Math.abs(orbit.azimuth - orbit.targetAzimuth) < 0.002) {
        orbit.snapping = null;
      }

      const qrReveal = cubicEase(1 - THREE.MathUtils.smoothstep(orbit.polar, 0.04, 0.34));
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

      sceneState.topQrGroup.visible = qrReveal > 0.01;
      sceneState.treeViewGroup.visible = qrReveal < 0.985;
      sceneState.treeViewGroup.scale.y = THREE.MathUtils.lerp(1, 0.06, qrReveal);
      sceneState.treeViewGroup.position.y = THREE.MathUtils.lerp(0, -0.34, qrReveal);
      sceneState.topQrMaterials.forEach((material) => {
        material.opacity = qrReveal;
      });
      sceneState.qrShadowMaterial.opacity = THREE.MathUtils.lerp(0.16, 0.98, qrReveal);

      const time = performance.now() * 0.001;
      const motion = reducedMotion ? 0 : 1 - qrReveal;
      sceneState.leaves.rotation.y = Math.sin(time * 0.34) * 0.008 * motion;
      sceneState.leaves.rotation.z = Math.sin(time * 0.53) * 0.004 * motion;
      sceneState.grass.rotation.z = Math.sin(time * 0.72) * 0.0028 * motion;
      const transitionBlur = reducedMotion ? 0 : Math.sin(Math.PI * qrReveal) * (window.innerWidth < 720 ? 0.7 : 1.4);
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

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { planKey, type LevelDefinition, type Plan, type SimulationResult, type TraversalTraceEvent } from '../game/model';

interface LevelOneHarborSceneProps {
  readonly level: LevelDefinition;
  readonly plan: Plan;
  readonly result: SimulationResult;
  readonly timelineBeat: number;
  readonly selectedActorId: string;
  readonly zoom: number;
  readonly reducedMotion: boolean;
  readonly showRobotRoutes: boolean;
  readonly emphasizeDestinations: boolean;
  readonly bottomSheetOpen: boolean;
  readonly onSelectActor: (actorId: string) => void;
}

interface ActorVisual {
  readonly root: THREE.Group;
  readonly selection: THREE.Mesh;
  readonly waitSignal: THREE.Mesh;
  readonly arrivalSignal: THREE.Mesh;
}

interface ActorFrameState {
  readonly position: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  waiting: boolean;
  arrived: boolean;
}

interface SceneMaterials {
  readonly water: THREE.MeshStandardMaterial;
  readonly shallowWater: THREE.MeshStandardMaterial;
  readonly shoreline: THREE.MeshStandardMaterial;
  readonly limestone: THREE.MeshStandardMaterial;
  readonly pavingA: THREE.MeshStandardMaterial;
  readonly pavingB: THREE.MeshStandardMaterial;
  readonly road: THREE.MeshStandardMaterial;
  readonly roadEdge: THREE.MeshStandardMaterial;
  readonly gardenPath: THREE.MeshStandardMaterial;
  readonly lawn: THREE.MeshStandardMaterial;
  readonly lawnLight: THREE.MeshStandardMaterial;
  readonly gardenDark: THREE.MeshStandardMaterial;
  readonly timber: THREE.MeshStandardMaterial;
  readonly timberDark: THREE.MeshStandardMaterial;
  readonly plaster: THREE.MeshStandardMaterial;
  readonly plasterWarm: THREE.MeshStandardMaterial;
  readonly plasterCoral: THREE.MeshStandardMaterial;
  readonly roofTeal: THREE.MeshStandardMaterial;
  readonly roofCoral: THREE.MeshStandardMaterial;
  readonly glass: THREE.MeshStandardMaterial;
  readonly glassDark: THREE.MeshStandardMaterial;
  readonly ink: THREE.MeshStandardMaterial;
  readonly bus: THREE.MeshStandardMaterial;
  readonly robot: THREE.MeshStandardMaterial;
  readonly cream: THREE.MeshStandardMaterial;
  readonly brass: THREE.MeshStandardMaterial;
}

const COLORS = {
  water: 0x4a9da0,
  waterDeep: 0x2f7e83,
  waterHighlight: 0xa9dbcf,
  shoreline: 0xb99461,
  limestone: 0xe9d3a6,
  pavingA: 0xd9c18e,
  pavingB: 0xe3cca0,
  road: 0x465d61,
  roadEdge: 0xb8b39b,
  gardenPath: 0x758278,
  lawn: 0x76915b,
  lawnLight: 0x8da66a,
  gardenDark: 0x4f7049,
  timber: 0x9a6542,
  timberDark: 0x5f4234,
  plaster: 0xf2e5c2,
  plasterWarm: 0xe5c78f,
  plasterCoral: 0xd86a54,
  roofTeal: 0x3f7775,
  roofCoral: 0xa94f43,
  glass: 0x91c8c2,
  glassDark: 0x294c50,
  ink: 0x203a3a,
  bus: 0xe9a92f,
  robot: 0xd95648,
  cream: 0xfff4d8,
  brass: 0xf2c55c,
} as const;

const ROAD_SURFACE_Y = 1.02;
const VEHICLE_HEIGHT = 1.05;
const CAMERA_FRUSTUM = 22;
const MIN_HORIZONTAL_FRUSTUM = 22.6;
const WATER_VERTEX_MOTION = 0.055;
const CAMERA_POSITION = new THREE.Vector3(18, 30, 24);
const CAMERA_TARGET = new THREE.Vector3(0, 0.6, 0);

const STARTS = {
  R: new THREE.Vector3(-5.6, VEHICLE_HEIGHT, -7.15),
  B: new THREE.Vector3(-5.5, VEHICLE_HEIGHT, 6.85),
} as const;

const ENDS = {
  R: new THREE.Vector3(5.45, VEHICLE_HEIGHT, 6.85),
  B: new THREE.Vector3(5.6, VEHICLE_HEIGHT, -6.75),
} as const;

const CROSSING = new THREE.Vector3(0, VEHICLE_HEIGHT, 0);

const GARDEN_TUFTS = [
  [-5.9, -4.7], [-4.9, -5.7], [-3.8, -4.4], [-2.8, -5.5], [-1.5, -4.5],
  [0.1, -5.6], [1.4, -4.45], [2.6, -5.35], [3.8, -4.2], [4.7, -3.15],
] as const;

const TREE_SPECS = [
  [-6.3, 2.8, 0.82], [-5.5, -3.15, 0.7], [-2.3, -4.2, 0.78],
  [2.4, -4.15, 0.68], [6.3, -2.2, 0.62], [5.9, 4.1, 0.58],
] as const;

const BUOY_SPECS = [[-8.6, 8.8], [2.8, 11.4], [8.7, -1.8], [-7.9, -9.2]] as const;

const standardMaterial = (color: number, roughness: number, metalness = 0): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const createMaterials = (): SceneMaterials => ({
  water: new THREE.MeshStandardMaterial({ color: COLORS.water, roughness: 0.42, metalness: 0.03, vertexColors: true }),
  shallowWater: new THREE.MeshStandardMaterial({ color: COLORS.waterHighlight, roughness: 0.55, transparent: true, opacity: 0.34, depthWrite: false }),
  shoreline: standardMaterial(COLORS.shoreline, 0.92),
  limestone: standardMaterial(COLORS.limestone, 0.9),
  pavingA: standardMaterial(COLORS.pavingA, 0.88),
  pavingB: standardMaterial(COLORS.pavingB, 0.9),
  road: standardMaterial(COLORS.road, 0.9),
  roadEdge: standardMaterial(COLORS.roadEdge, 0.94),
  gardenPath: standardMaterial(COLORS.gardenPath, 0.96),
  lawn: standardMaterial(COLORS.lawn, 1),
  lawnLight: standardMaterial(COLORS.lawnLight, 1),
  gardenDark: standardMaterial(COLORS.gardenDark, 1),
  timber: standardMaterial(COLORS.timber, 0.86),
  timberDark: standardMaterial(COLORS.timberDark, 0.92),
  plaster: standardMaterial(COLORS.plaster, 0.9),
  plasterWarm: standardMaterial(COLORS.plasterWarm, 0.9),
  plasterCoral: standardMaterial(COLORS.plasterCoral, 0.86),
  roofTeal: standardMaterial(COLORS.roofTeal, 0.8),
  roofCoral: standardMaterial(COLORS.roofCoral, 0.82),
  glass: standardMaterial(COLORS.glass, 0.32, 0.04),
  glassDark: standardMaterial(COLORS.glassDark, 0.46),
  ink: standardMaterial(COLORS.ink, 0.82),
  bus: standardMaterial(COLORS.bus, 0.7),
  robot: standardMaterial(COLORS.robot, 0.72),
  cream: standardMaterial(COLORS.cream, 0.86),
  brass: standardMaterial(COLORS.brass, 0.58, 0.08),
});

const roundedBox = (
  size: readonly [number, number, number],
  surface: THREE.Material,
  radius = 0.16,
  segments = 3,
): THREE.Mesh => {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius), surface);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const routeCurves = (routeId: string): Readonly<Record<string, readonly THREE.CatmullRomCurve3[]>> => ({
  R: routeId === 'garden'
    ? [new THREE.CatmullRomCurve3([
        STARTS.R,
        new THREE.Vector3(-4.7, VEHICLE_HEIGHT, -8.05),
        new THREE.Vector3(-1.1, VEHICLE_HEIGHT, -8.45),
        new THREE.Vector3(3.6, VEHICLE_HEIGHT, -7.45),
        new THREE.Vector3(6.4, VEHICLE_HEIGHT, -3.8),
        new THREE.Vector3(6.35, VEHICLE_HEIGHT, 2.7),
        ENDS.R,
      ])]
    : [
        new THREE.CatmullRomCurve3([STARTS.R, new THREE.Vector3(-4.5, VEHICLE_HEIGHT, -4.7), new THREE.Vector3(-2.35, VEHICLE_HEIGHT, -1.85), CROSSING]),
        new THREE.CatmullRomCurve3([CROSSING, new THREE.Vector3(2.2, VEHICLE_HEIGHT, 2.05), new THREE.Vector3(4.45, VEHICLE_HEIGHT, 4.65), ENDS.R]),
      ],
  B: [
    new THREE.CatmullRomCurve3([STARTS.B, new THREE.Vector3(-4.3, VEHICLE_HEIGHT, 4.4), new THREE.Vector3(-2.25, VEHICLE_HEIGHT, 1.7), CROSSING]),
    new THREE.CatmullRomCurve3([CROSSING, new THREE.Vector3(2.3, VEHICLE_HEIGHT, -2), new THREE.Vector3(4.5, VEHICLE_HEIGHT, -4.65), ENDS.B]),
  ],
});

const ROUTE_CURVES = {
  crossing: routeCurves('crossing'),
  garden: routeCurves('garden'),
} as const;

const sampleCurves = (curves: readonly THREE.CatmullRomCurve3[], divisions = 28): THREE.Vector3[] => {
  const points: THREE.Vector3[] = [];
  curves.forEach((curve, curveIndex) => {
    curve.getPoints(divisions).forEach((point, pointIndex) => {
      if (curveIndex > 0 && pointIndex === 0) return;
      points.push(point);
    });
  });
  return points;
};

const createRibbon = (
  curves: readonly THREE.CatmullRomCurve3[],
  width: number,
  y: number,
  surface: THREE.Material,
): THREE.Mesh => {
  const points = sampleCurves(curves);
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  points.forEach((point, index) => {
    const previous = points[Math.max(0, index - 1)]!;
    const next = points[Math.min(points.length - 1, index + 1)]!;
    const direction = new THREE.Vector2(next.x - previous.x, next.z - previous.z).normalize();
    const normalX = -direction.y * width / 2;
    const normalZ = direction.x * width / 2;
    positions.push(point.x + normalX, y, point.z + normalZ, point.x - normalX, y, point.z - normalZ);
    uvs.push(0, index / (points.length - 1), 1, index / (points.length - 1));
    if (index < points.length - 1) {
      const offset = index * 2;
      indices.push(offset, offset + 2, offset + 1, offset + 2, offset + 3, offset + 1);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const ribbon = new THREE.Mesh(geometry, surface);
  ribbon.receiveShadow = true;
  return ribbon;
};

const addRoad = (
  parent: THREE.Object3D,
  curves: readonly THREE.CatmullRomCurve3[],
  width: number,
  materials: SceneMaterials,
  garden = false,
): void => {
  parent.add(
    createRibbon(curves, width + 0.48, ROAD_SURFACE_Y - 0.055, materials.roadEdge),
    createRibbon(curves, width, ROAD_SURFACE_Y, garden ? materials.gardenPath : materials.road),
  );
};

const addPavingArea = (
  instances: { x: number; z: number; size: number; alternate: boolean }[],
  centerX: number,
  centerZ: number,
  columns: number,
  rows: number,
  size = 1.3,
): void => {
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      instances.push({
        x: centerX + (column - (columns - 1) / 2) * size,
        z: centerZ + (row - (rows - 1) / 2) * size,
        size,
        alternate: (row + column) % 3 === 0,
      });
    }
  }
};

const addPavingInstances = (parent: THREE.Object3D, materials: SceneMaterials, specs: readonly { x: number; z: number; size: number; alternate: boolean }[]): void => {
  const geometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.06);
  const primarySpecs = specs.filter((spec) => !spec.alternate);
  const alternateSpecs = specs.filter((spec) => spec.alternate);
  const matrix = new THREE.Matrix4();
  for (const [surface, surfaceSpecs] of [[materials.pavingA, primarySpecs], [materials.pavingB, alternateSpecs]] as const) {
    const slabs = new THREE.InstancedMesh(geometry, surface, surfaceSpecs.length);
    surfaceSpecs.forEach((spec, index) => {
      matrix.compose(new THREE.Vector3(spec.x, 0.98, spec.z), new THREE.Quaternion(), new THREE.Vector3(spec.size - 0.08, 0.12, spec.size - 0.08));
      slabs.setMatrixAt(index, matrix);
    });
    slabs.receiveShadow = true;
    parent.add(slabs);
  }
};

const addLawnBed = (
  parent: THREE.Object3D,
  materials: SceneMaterials,
  x: number,
  z: number,
  width: number,
  depth: number,
  rotation = 0,
): void => {
  const border = roundedBox([width + 0.34, 0.18, depth + 0.34], materials.limestone, 0.35, 4);
  border.position.set(x, 0.98, z);
  border.rotation.y = rotation;
  const lawn = roundedBox([width, 0.17, depth], materials.lawn, 0.3, 4);
  lawn.position.set(x, 1.075, z);
  lawn.rotation.y = rotation;
  const variation = roundedBox([width * 0.44, 0.035, depth * 0.38], materials.lawnLight, 0.22, 3);
  variation.position.set(x - width * 0.18, 1.17, z + depth * 0.12);
  variation.rotation.y = rotation;
  variation.castShadow = false;
  parent.add(border, lawn, variation);
};

const addGardenTufts = (parent: THREE.Object3D, materials: SceneMaterials): void => {
  const geometry = new THREE.ConeGeometry(0.12, 0.55, 5);
  const tufts = new THREE.InstancedMesh(geometry, materials.gardenDark, GARDEN_TUFTS.length * 3);
  const matrix = new THREE.Matrix4();
  let index = 0;
  for (const [x, z] of GARDEN_TUFTS) {
    for (const [offsetX, offsetZ, angle] of [[-0.13, 0, -0.22], [0.12, -0.04, 0.18], [0, 0.13, 0]] as const) {
      matrix.compose(
        new THREE.Vector3(x + offsetX, 1.43, z + offsetZ),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(angle, index * 0.41, angle * 0.5)),
        new THREE.Vector3(1, 1, 0.62),
      );
      tufts.setMatrixAt(index, matrix);
      index += 1;
    }
  }
  tufts.castShadow = true;
  parent.add(tufts);
};

const addTrees = (parent: THREE.Object3D, materials: SceneMaterials): void => {
  const trunkGeometry = new THREE.CylinderGeometry(0.11, 0.17, 0.92, 8);
  const crownGeometry = new THREE.DodecahedronGeometry(1, 1);
  const trunks = new THREE.InstancedMesh(trunkGeometry, materials.timberDark, TREE_SPECS.length);
  const darkCrowns = new THREE.InstancedMesh(crownGeometry, materials.gardenDark, TREE_SPECS.length);
  const lightCrowns = new THREE.InstancedMesh(crownGeometry, materials.lawn, TREE_SPECS.length * 2);
  const canopies = [[0, 1.25, 0, 0.62], [-0.28, 1.08, 0.08, 0.46], [0.25, 1.1, -0.05, 0.5]] as const;
  const matrix = new THREE.Matrix4();
  const rotation = new THREE.Quaternion();
  let lightIndex = 0;
  TREE_SPECS.forEach(([x, z, scale], treeIndex) => {
    matrix.compose(new THREE.Vector3(x, 1.02 + 0.44 * scale, z), rotation, new THREE.Vector3(scale, scale, scale));
    trunks.setMatrixAt(treeIndex, matrix);
    canopies.forEach(([offsetX, offsetY, offsetZ, radius], canopyIndex) => {
      matrix.compose(
        new THREE.Vector3(x + offsetX * scale, 1.02 + offsetY * scale, z + offsetZ * scale),
        rotation,
        new THREE.Vector3(radius * scale, radius * scale * 1.08, radius * scale),
      );
      if (canopyIndex === 0) darkCrowns.setMatrixAt(treeIndex, matrix);
      else {
        lightCrowns.setMatrixAt(lightIndex, matrix);
        lightIndex += 1;
      }
    });
  });
  trunks.castShadow = true;
  darkCrowns.castShadow = true;
  lightCrowns.castShadow = true;
  parent.add(trunks, darkCrowns, lightCrowns);
};

const addBuilding = (
  parent: THREE.Object3D,
  materials: SceneMaterials,
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  wall: THREE.MeshStandardMaterial,
  roof: THREE.MeshStandardMaterial,
  front: 1 | -1,
  awning = false,
): void => {
  const building = new THREE.Group();
  building.position.set(x, 0, z);
  const foundation = roundedBox([width + 0.24, 0.32, depth + 0.24], materials.shoreline, 0.15);
  foundation.position.y = 1.02;
  const body = roundedBox([width, height, depth], wall, 0.2, 4);
  body.position.y = 1.18 + height / 2;
  const roofEdge = roundedBox([width + 0.48, 0.24, depth + 0.48], materials.cream, 0.12, 3);
  roofEdge.position.y = 1.22 + height;
  const roofCap = roundedBox([width + 0.28, 0.38, depth + 0.28], roof, 0.14, 3);
  roofCap.position.y = 1.46 + height;
  building.add(foundation, body, roofEdge, roofCap);

  const facadeZ = front * (depth / 2 + 0.035);
  const doorFrame = roundedBox([0.92, 1.68, 0.1], materials.cream, 0.1, 2);
  doorFrame.position.set(-width * 0.22, 1.92, facadeZ);
  const door = roundedBox([0.67, 1.46, 0.08], materials.glassDark, 0.08, 2);
  door.position.set(-width * 0.22, 1.88, front * (depth / 2 + 0.095));
  const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), materials.brass);
  handle.position.set(-width * 0.06, 1.9, front * (depth / 2 + 0.16));
  building.add(doorFrame, door, handle);

  const offsetX = width * 0.23;
  const recess = roundedBox([0.92, 0.9, 0.1], materials.glassDark, 0.1, 2);
  recess.position.set(offsetX, 2.35, facadeZ);
  const glass = roundedBox([0.7, 0.68, 0.07], materials.glass, 0.07, 2);
  glass.position.set(offsetX, 2.35, front * (depth / 2 + 0.095));
  const sill = roundedBox([1.02, 0.13, 0.24], materials.cream, 0.05, 2);
  sill.position.set(offsetX, 1.87, front * (depth / 2 + 0.15));
  building.add(recess, glass, sill);

  if (awning) {
    const awningTop = roundedBox([1.65, 0.16, 0.62], materials.roofCoral, 0.06, 2);
    awningTop.position.set(-width * 0.02, 3.0, front * (depth / 2 + 0.36));
    awningTop.rotation.x = front * -0.16;
    building.add(awningTop);
  } else {
    const chimney = roundedBox([0.42, 0.82, 0.42], materials.roofCoral, 0.08, 2);
    chimney.position.set(width * 0.27, 1.8 + height, 0);
    building.add(chimney);
  }
  parent.add(building);
};

const addDock = (parent: THREE.Object3D, materials: SceneMaterials): void => {
  const dock = new THREE.Group();
  const plankWidth = 0.72;
  const plankGeometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.07);
  const planks = new THREE.InstancedMesh(plankGeometry, materials.timber, 9);
  const grainGeometry = new RoundedBoxGeometry(1, 1, 1, 1, 0.01);
  const grainLines = new THREE.InstancedMesh(grainGeometry, materials.timberDark, 9);
  const matrix = new THREE.Matrix4();
  for (let index = 0; index < 9; index += 1) {
    const x = -4.9 + index * plankWidth;
    matrix.compose(new THREE.Vector3(x, 0.74 + (index % 3) * 0.012, 10.25), new THREE.Quaternion(), new THREE.Vector3(plankWidth - 0.055, 0.24, 2.65));
    planks.setMatrixAt(index, matrix);
    matrix.compose(new THREE.Vector3(x + 0.15, 0.875, 10.25), new THREE.Quaternion(), new THREE.Vector3(0.035, 0.018, 2.15));
    grainLines.setMatrixAt(index, matrix);
  }
  planks.castShadow = true;
  planks.receiveShadow = true;
  dock.add(planks, grainLines);
  const fascia = roundedBox([6.55, 0.44, 0.28], materials.timberDark, 0.08, 2);
  fascia.position.set(-2.02, 0.69, 11.58);
  dock.add(fascia);
  const supportGeometry = new THREE.CylinderGeometry(0.14, 0.19, 2.25, 10);
  const supports = new THREE.InstancedMesh(supportGeometry, materials.timberDark, 4);
  [-4.8, -2.7, -0.6, 1.0].forEach((x, index) => {
    matrix.makeTranslation(x, -0.05, 11.15);
    supports.setMatrixAt(index, matrix);
  });
  supports.castShadow = true;
  dock.add(supports);
  const step = roundedBox([2.5, 0.28, 0.95], materials.pavingA, 0.1, 2);
  step.position.set(-2.3, 0.9, 8.95);
  dock.add(step);
  parent.add(dock);
};

const createRobot = (materials: SceneMaterials): THREE.Group => {
  const robot = new THREE.Group();
  const contact = new THREE.Mesh(
    new THREE.CircleGeometry(0.72, 24),
    new THREE.MeshBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0.18, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.scale.set(1.15, 0.72, 1);
  contact.position.y = -0.025;
  const lower = roundedBox([1.08, 0.6, 0.9], materials.robot, 0.22, 4);
  lower.position.y = 0.55;
  const body = roundedBox([0.92, 0.7, 0.78], materials.robot, 0.2, 4);
  body.position.y = 1.02;
  const panel = roundedBox([0.08, 0.38, 0.5], materials.plasterCoral, 0.06, 2);
  panel.position.set(0.5, 0.94, 0);
  const head = roundedBox([0.82, 0.55, 0.72], materials.cream, 0.2, 4);
  head.position.set(0.1, 1.55, 0);
  const face = roundedBox([0.085, 0.32, 0.5], materials.glassDark, 0.07, 2);
  face.position.set(0.53, 1.55, 0);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: COLORS.brass });
  for (const z of [-0.14, 0.14]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 8), eyeMaterial);
    eye.position.set(0.585, 1.58, z);
    robot.add(eye);
  }
  const parcel = roundedBox([0.58, 0.62, 0.64], materials.plasterWarm, 0.08, 2);
  parcel.position.set(-0.58, 0.9, 0);
  const parcelBand = roundedBox([0.6, 0.12, 0.66], materials.timberDark, 0.02, 1);
  parcelBand.position.set(-0.58, 0.92, 0);
  for (const z of [-0.48, 0.48]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.16, 18), materials.ink);
    wheel.rotation.x = Math.PI / 2;
    wheel.position.set(-0.05, 0.28, z);
    wheel.castShadow = true;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 14), materials.brass);
    hub.rotation.x = Math.PI / 2;
    hub.position.set(-0.05, 0.28, z * 1.02);
    robot.add(wheel, hub);
  }
  robot.add(contact, lower, body, panel, head, face, parcel, parcelBand);
  return robot;
};

const createBus = (materials: SceneMaterials): THREE.Group => {
  const bus = new THREE.Group();
  const contact = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 28),
    new THREE.MeshBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0.18, depthWrite: false }),
  );
  contact.rotation.x = -Math.PI / 2;
  contact.scale.set(1.15, 0.55, 1);
  contact.position.y = -0.025;
  const chassis = roundedBox([2.45, 0.35, 1.08], materials.ink, 0.13, 3);
  chassis.position.y = 0.42;
  const body = roundedBox([2.4, 1.18, 1.06], materials.bus, 0.27, 4);
  body.position.y = 0.9;
  const lowerBand = roundedBox([2.42, 0.22, 1.075], materials.plasterWarm, 0.08, 2);
  lowerBand.position.y = 0.57;
  const roof = roundedBox([2.05, 0.24, 0.98], materials.cream, 0.13, 3);
  roof.position.set(-0.12, 1.58, 0);
  for (const x of [-0.66, -0.08, 0.5]) {
    for (const z of [-0.535, 0.535]) {
      const recess = roundedBox([0.45, 0.42, 0.065], materials.glassDark, 0.06, 2);
      recess.position.set(x, 1.12, z);
      bus.add(recess);
    }
  }
  const frontWindow = roundedBox([0.07, 0.56, 0.76], materials.glassDark, 0.09, 2);
  frontWindow.position.set(1.215, 1.13, 0);
  const bumper = roundedBox([0.16, 0.2, 0.92], materials.cream, 0.05, 2);
  bumper.position.set(1.29, 0.45, 0);
  const rearBumper = roundedBox([0.16, 0.18, 0.9], materials.cream, 0.05, 2);
  rearBumper.position.set(-1.28, 0.45, 0);
  for (const z of [-0.32, 0.32]) {
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 8), materials.cream);
    light.position.set(1.315, 0.78, z);
    bus.add(light);
  }
  for (const x of [-0.75, 0.72]) {
    for (const z of [-0.56, 0.56]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.16, 18), materials.ink);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.31, z);
      wheel.castShadow = true;
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.18, 14), materials.pavingB);
      hub.rotation.x = Math.PI / 2;
      hub.position.set(x, 0.31, z * 1.02);
      bus.add(wheel, hub);
    }
  }
  bus.add(contact, chassis, body, lowerBand, roof, frontWindow, bumper, rearBumper);
  return bus;
};

const createActorVisual = (actorId: string, materials: SceneMaterials): ActorVisual => {
  const root = new THREE.Group();
  root.userData.actorId = actorId;
  const model = actorId === 'B' ? createBus(materials) : createRobot(materials);
  model.traverse((child) => { child.userData.actorId = actorId; });
  const selection = new THREE.Mesh(
    new THREE.RingGeometry(actorId === 'B' ? 1.35 : 0.86, actorId === 'B' ? 1.52 : 1.02, 40),
    new THREE.MeshBasicMaterial({ color: COLORS.brass, transparent: true, opacity: 0.9, depthWrite: false }),
  );
  selection.rotation.x = -Math.PI / 2;
  selection.position.y = -0.012;
  const waitSignal = new THREE.Mesh(
    new THREE.TorusGeometry(actorId === 'B' ? 1.2 : 0.75, 0.055, 8, 32),
    new THREE.MeshBasicMaterial({ color: COLORS.cream, transparent: true, opacity: 0.8, depthWrite: false }),
  );
  waitSignal.rotation.x = Math.PI / 2;
  waitSignal.position.y = 2.05;
  waitSignal.visible = false;
  const arrivalSignal = new THREE.Mesh(
    new THREE.RingGeometry(actorId === 'B' ? 1.2 : 0.74, actorId === 'B' ? 1.32 : 0.84, 40),
    new THREE.MeshBasicMaterial({ color: actorId === 'B' ? COLORS.bus : COLORS.robot, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  arrivalSignal.rotation.x = -Math.PI / 2;
  arrivalSignal.position.y = 0.015;
  arrivalSignal.visible = false;
  const touchTarget = new THREE.Mesh(
    new THREE.BoxGeometry(actorId === 'B' ? 3.5 : 2.9, 3.1, actorId === 'B' ? 2.5 : 2.9),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
  );
  touchTarget.position.y = 1.05;
  touchTarget.userData.actorId = actorId;
  root.add(model, selection, waitSignal, arrivalSignal, touchTarget);
  return { root, selection, waitSignal, arrivalSignal };
};

const createRouteLine = (curves: readonly THREE.CatmullRomCurve3[]): THREE.Group => {
  const group = new THREE.Group();
  for (const curve of curves) {
    const raisedCurve = new THREE.CatmullRomCurve3(curve.points.map((point) => new THREE.Vector3(point.x, ROAD_SURFACE_Y + 0.075, point.z)));
    const route = new THREE.Mesh(
      new THREE.TubeGeometry(raisedCurve, 44, 0.07, 8, false),
      new THREE.MeshBasicMaterial({ color: COLORS.robot, transparent: true, opacity: 0.34, depthWrite: false }),
    );
    route.renderOrder = 5;
    group.add(route);
  }
  return group;
};

const setRouteStyle = (group: THREE.Group, selected: boolean): void => {
  group.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || !(child.material instanceof THREE.MeshBasicMaterial)) return;
    child.material.color.setHex(selected ? COLORS.robot : COLORS.cream);
    child.material.opacity = selected ? 0.96 : 0.48;
  });
};

const createDestination = (color: number, materials: SceneMaterials): THREE.Group => {
  const destination = new THREE.Group();
  const foundation = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.68, 0.22, 16), materials.roadEdge);
  foundation.position.y = 0.1;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.25, 1.15, 12), standardMaterial(color, 0.72));
  post.position.y = 0.75;
  post.castShadow = true;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.3, 0.22, 12), materials.cream);
  cap.position.y = 1.42;
  cap.castShadow = true;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.7, 0.85, 36),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.88, depthWrite: false }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.025;
  ring.renderOrder = 4;
  destination.add(foundation, post, cap, ring);
  return destination;
};

const updateActorStateAtBeat = (
  state: ActorFrameState,
  curves: readonly THREE.CatmullRomCurve3[],
  actorEvents: readonly TraversalTraceEvent[],
  beat: number,
): void => {
  state.waiting = false;
  state.arrived = false;
  if (actorEvents.length === 0) {
    curves[0]!.getPoint(0, state.position);
    curves[0]!.getTangent(0, state.tangent);
    return;
  }
  for (let index = 0; index < actorEvents.length; index += 1) {
    const event = actorEvents[index]!;
    const curve = curves[event.stepIndex] ?? curves.at(-1)!;
    if (beat < event.start) {
      curve.getPoint(0, state.position);
      curve.getTangent(0, state.tangent);
      state.waiting = beat >= event.readyBeat;
      return;
    }
    if (beat <= event.end) {
      const rawProgress = event.end === event.start ? 1 : (beat - event.start) / (event.end - event.start);
      const progress = THREE.MathUtils.smoothstep(rawProgress, 0, 1);
      curve.getPoint(progress, state.position);
      curve.getTangent(progress, state.tangent);
      return;
    }
  }
  const finalCurve = curves[Math.min(curves.length, actorEvents.length) - 1]!;
  finalCurve.getPoint(1, state.position);
  finalCurve.getTangent(1, state.tangent);
  state.arrived = beat >= actorEvents.at(-1)!.end;
};

const createHarbor = (waterGeometry: THREE.PlaneGeometry, materials: SceneMaterials): THREE.Group => {
  const harbor = new THREE.Group();
  const water = new THREE.Mesh(waterGeometry, materials.water);
  water.receiveShadow = true;
  harbor.add(water);

  const shallow = roundedBox([19.4, 0.12, 22.4], materials.shallowWater, 1.3, 5);
  shallow.position.set(0, -0.32, 0.18);
  shallow.castShadow = false;
  const island = roundedBox([18.3, 1.18, 21.3], materials.shoreline, 1.1, 5);
  island.position.set(0, 0.12, 0);
  const islandTop = roundedBox([17.85, 0.46, 20.85], materials.limestone, 0.94, 5);
  islandTop.position.set(0, 0.75, 0);
  harbor.add(shallow, island, islandTop);

  const pavingInstances: { x: number; z: number; size: number; alternate: boolean }[] = [];
  addPavingArea(pavingInstances, 0, 0, 4, 4, 1.15);
  addPavingArea(pavingInstances, -0.2, 7.1, 4, 2, 1.12);
  addPavingArea(pavingInstances, 4.9, 2.05, 3, 2, 1.08);
  addPavingArea(pavingInstances, -1.0, -5.6, 3, 2, 1.08);
  addPavingInstances(harbor, materials, pavingInstances);

  addLawnBed(harbor, materials, -4.55, -5.15, 2.15, 3.45, -0.18);
  addLawnBed(harbor, materials, -1.75, -4.8, 2.35, 2.7, 0.08);
  addLawnBed(harbor, materials, 1.55, -4.75, 2.45, 2.65, -0.08);
  addLawnBed(harbor, materials, 4.15, -3.9, 1.85, 2.6, -0.35);
  addGardenTufts(harbor, materials);

  addRoad(harbor, ROUTE_CURVES.crossing.R!, 1.72, materials);
  addRoad(harbor, ROUTE_CURVES.crossing.B!, 1.9, materials);
  addRoad(harbor, ROUTE_CURVES.garden.R!, 1.42, materials, true);

  const crossingBase = roundedBox([4.15, 0.2, 4.15], materials.roadEdge, 0.62, 4);
  crossingBase.position.set(0, ROAD_SURFACE_Y - 0.055, 0);
  crossingBase.rotation.y = Math.PI / 4;
  const crossingTop = roundedBox([3.76, 0.16, 3.76], materials.road, 0.55, 4);
  crossingTop.position.set(0, ROAD_SURFACE_Y + 0.02, 0);
  crossingTop.rotation.y = Math.PI / 4;
  harbor.add(crossingBase, crossingTop);
  for (const offset of [-0.72, 0, 0.72]) {
    const crossingMark = roundedBox([0.16, 0.035, 1.42], materials.cream, 0.03, 1);
    crossingMark.position.set(offset, ROAD_SURFACE_Y + 0.115, 0);
    crossingMark.rotation.y = -Math.PI / 4;
    crossingMark.castShadow = false;
    harbor.add(crossingMark);
  }

  addDock(harbor, materials);
  addBuilding(harbor, materials, -0.25, 7.15, 2.7, 2.15, 2.45, materials.plaster, materials.roofTeal, -1);
  addBuilding(harbor, materials, 4.9, 2.1, 2.5, 2.25, 2.3, materials.plasterCoral, materials.roofCoral, -1, true);
  addBuilding(harbor, materials, -1.05, -5.55, 2.35, 2, 2.05, materials.plasterWarm, materials.roofTeal, 1);

  addTrees(harbor, materials);
  for (const [x, z] of BUOY_SPECS) {
    const buoy = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), materials.robot);
    body.scale.y = 1.5;
    body.position.y = -0.15;
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.5, 8), materials.cream);
    tip.position.y = 0.18;
    buoy.position.set(x, 0, z);
    buoy.add(body, tip);
    harbor.add(buoy);
  }
  return harbor;
};

export function LevelOneHarborScene({
  level,
  plan,
  result,
  timelineBeat,
  selectedActorId,
  zoom,
  reducedMotion,
  showRobotRoutes,
  emphasizeDestinations,
  bottomSheetOpen,
  onSelectActor,
}: LevelOneHarborSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ level, plan, result, timelineBeat, selectedActorId, zoom, reducedMotion, showRobotRoutes, emphasizeDestinations, bottomSheetOpen, onSelectActor });
  stateRef.current = { level, plan, result, timelineBeat, selectedActorId, zoom, reducedMotion, showRobotRoutes, emphasizeDestinations, bottomSheetOpen, onSelectActor };

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.waterDeep);
    scene.fog = new THREE.Fog(COLORS.waterDeep, 42, 72);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.replaceChildren(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_TARGET);
    camera.updateMatrixWorld();
    const screenUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
    const cameraOffset = new THREE.Vector3();
    const desiredOffset = new THREE.Vector3();

    const skyFill = new THREE.HemisphereLight(0xfff2d4, 0x225c64, 1.55);
    scene.add(skyFill);
    const sun = new THREE.DirectionalLight(0xffdfaa, 3.35);
    sun.position.set(-14, 24, 13);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -18;
    sun.shadow.camera.right = 18;
    sun.shadow.camera.top = 22;
    sun.shadow.camera.bottom = -22;
    sun.shadow.camera.near = 4;
    sun.shadow.camera.far = 65;
    sun.shadow.bias = -0.00035;
    sun.shadow.normalBias = 0.025;
    sun.shadow.radius = 4;
    sun.shadow.blurSamples = 10;
    scene.add(sun);

    const materials = createMaterials();
    const waterGeometry = new THREE.PlaneGeometry(100, 100, 34, 34);
    waterGeometry.rotateX(-Math.PI / 2);
    const waterPositions = waterGeometry.getAttribute('position') as THREE.BufferAttribute;
    const baseWaterPositions = Float32Array.from(waterPositions.array as ArrayLike<number>);
    const waterColors: number[] = [];
    const deep = new THREE.Color(COLORS.waterDeep);
    const light = new THREE.Color(COLORS.waterHighlight);
    for (let index = 0; index < waterPositions.count; index += 1) {
      const x = waterPositions.getX(index);
      const z = waterPositions.getZ(index);
      const mix = THREE.MathUtils.clamp(0.22 + Math.sin(x * 0.16) * 0.07 + Math.cos(z * 0.13) * 0.06, 0.08, 0.38);
      const color = deep.clone().lerp(light, mix);
      waterColors.push(color.r, color.g, color.b);
    }
    waterGeometry.setAttribute('color', new THREE.Float32BufferAttribute(waterColors, 3));
    scene.add(createHarbor(waterGeometry, materials));

    const actorVisuals = new Map<string, ActorVisual>();
    for (const actorId of ['R', 'B']) {
      const visual = createActorVisual(actorId, materials);
      actorVisuals.set(actorId, visual);
      scene.add(visual.root);
    }

    const crossingRoute = createRouteLine(ROUTE_CURVES.crossing.R!);
    const gardenRoute = createRouteLine(ROUTE_CURVES.garden.R!);
    scene.add(crossingRoute, gardenRoute);

    const robotDestination = createDestination(COLORS.robot, materials);
    robotDestination.position.set(ENDS.R.x, ROAD_SURFACE_Y + 0.02, ENDS.R.z);
    const busDestination = createDestination(COLORS.bus, materials);
    busDestination.position.set(ENDS.B.x, ROAD_SURFACE_Y + 0.02, ENDS.B.z);
    scene.add(robotDestination, busDestination);

    let width = 1;
    let height = 1;
    let currentFrustum = CAMERA_FRUSTUM;
    let cameraInitialized = false;
    const resize = (): void => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      if (!cameraInitialized) {
        const aspect = width / height;
        currentFrustum = Math.max(CAMERA_FRUSTUM / stateRef.current.zoom, MIN_HORIZONTAL_FRUSTUM / aspect);
        cameraInitialized = true;
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const pickActor = (event: PointerEvent): void => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects([...actorVisuals.values()].map((visual) => visual.root), true)
        .find((intersection) => typeof intersection.object.userData.actorId === 'string');
      if (hit !== undefined) stateRef.current.onSelectActor(String(hit.object.userData.actorId));
    };
    renderer.domElement.addEventListener('pointerup', pickActor);

    let frame = 0;
    let frameSampleStart = performance.now();
    let frameSampleCount = 0;
    const timer = new THREE.Timer();
    timer.connect(document);
    const cameraTarget = new THREE.Vector3();
    const actorFrameStates = new Map<string, ActorFrameState>([...actorVisuals.keys()].map((actorId) => [actorId, {
      position: new THREE.Vector3(),
      tangent: new THREE.Vector3(),
      waiting: false,
      arrived: false,
    }]));
    const actorEvents = new Map<string, TraversalTraceEvent[]>();
    const emptyActorEvents: readonly TraversalTraceEvent[] = [];
    let cachedResult: SimulationResult | undefined;
    const animate = (): void => {
      timer.update();
      const elapsed = timer.getElapsed();
      const current = stateRef.current;
      const aspect = width / height;
      const targetFrustum = Math.max(CAMERA_FRUSTUM / current.zoom, MIN_HORIZONTAL_FRUSTUM / aspect) * (current.bottomSheetOpen ? 1.025 : 1);
      const transition = current.reducedMotion ? 1 : 0.12;
      currentFrustum = THREE.MathUtils.lerp(currentFrustum, targetFrustum, transition);
      desiredOffset.copy(screenUp).multiplyScalar(current.bottomSheetOpen ? -1.7 : -0.25);
      cameraOffset.lerp(desiredOffset, transition);
      camera.position.copy(CAMERA_POSITION).add(cameraOffset);
      cameraTarget.copy(CAMERA_TARGET).add(cameraOffset);
      camera.lookAt(cameraTarget);
      camera.left = -currentFrustum * aspect / 2;
      camera.right = currentFrustum * aspect / 2;
      camera.top = currentFrustum / 2;
      camera.bottom = -currentFrustum / 2;
      camera.updateProjectionMatrix();

      const routeValue = current.plan[planKey('R', 'route')];
      const robotRoute = routeValue === 'garden' ? 'garden' : 'crossing';
      const curves = ROUTE_CURVES[robotRoute];
      if (cachedResult !== current.result) {
        actorEvents.clear();
        for (const event of current.result.trace) {
          if (event.kind !== 'traversal') continue;
          const events = actorEvents.get(event.actorId) ?? [];
          events.push(event);
          actorEvents.set(event.actorId, events);
        }
        actorEvents.forEach((events) => events.sort((a, b) => a.stepIndex - b.stepIndex));
        cachedResult = current.result;
      }
      for (const [actorId, visual] of actorVisuals) {
        const state = actorFrameStates.get(actorId)!;
        updateActorStateAtBeat(state, curves[actorId]!, actorEvents.get(actorId) ?? emptyActorEvents, current.timelineBeat);
        visual.root.position.copy(state.position);
        visual.root.rotation.y = -Math.atan2(state.tangent.z, state.tangent.x);
        visual.selection.visible = current.selectedActorId === actorId;
        visual.waitSignal.visible = state.waiting;
        visual.waitSignal.rotation.z = elapsed * 0.8;
        visual.arrivalSignal.visible = state.arrived;
        if (state.arrived) {
          const arrivalPulse = current.reducedMotion ? 1.08 : 1.06 + Math.sin(elapsed * 2.2) * 0.08;
          visual.arrivalSignal.scale.setScalar(arrivalPulse);
        }
        if (!current.reducedMotion) visual.root.position.y += Math.sin(elapsed * 1.8 + (actorId === 'B' ? 1.2 : 0)) * 0.012;
      }

      crossingRoute.visible = current.showRobotRoutes;
      gardenRoute.visible = current.showRobotRoutes;
      setRouteStyle(crossingRoute, robotRoute === 'crossing');
      setRouteStyle(gardenRoute, robotRoute === 'garden');
      const destinationScale = current.emphasizeDestinations && !current.reducedMotion ? 1 + Math.sin(elapsed * 3) * 0.08 : 1;
      robotDestination.scale.setScalar(destinationScale);
      busDestination.scale.setScalar(destinationScale);

      if (!current.reducedMotion) {
        for (let index = 0; index < waterPositions.count; index += 1) {
          const x = baseWaterPositions[index * 3]!;
          const z = baseWaterPositions[index * 3 + 2]!;
          waterPositions.setY(index, Math.sin(x * 0.34 + elapsed * 0.46) * WATER_VERTEX_MOTION + Math.cos(z * 0.27 + elapsed * 0.33) * WATER_VERTEX_MOTION * 0.62 - 0.48);
        }
        waterPositions.needsUpdate = true;
      }

      renderer.render(scene, camera);
      frameSampleCount += 1;
      const sampleDuration = performance.now() - frameSampleStart;
      if (sampleDuration >= 1000) {
        host.dataset.fps = String(Math.round(frameSampleCount * 1000 / sampleDuration));
        host.dataset.frameMs = (sampleDuration / frameSampleCount).toFixed(2);
        host.dataset.drawCalls = String(renderer.info.render.calls);
        host.dataset.triangles = String(renderer.info.render.triangles);
        frameSampleStart = performance.now();
        frameSampleCount = 0;
      }
      frame = window.requestAnimationFrame(animate);
    };
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      timer.dispose();
      renderer.domElement.removeEventListener('pointerup', pickActor);
      const geometries = new Set<THREE.BufferGeometry>();
      const disposableMaterials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh) && !(object instanceof THREE.InstancedMesh)) return;
        geometries.add(object.geometry);
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((objectMaterial) => disposableMaterials.add(objectMaterial));
      });
      geometries.forEach((geometry) => geometry.dispose());
      disposableMaterials.forEach((objectMaterial) => objectMaterial.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      host.replaceChildren();
    };
  }, []);

  return <div className="harbor-scene harbor-scene-3d" ref={hostRef} data-renderer="three-webgl" />;
}

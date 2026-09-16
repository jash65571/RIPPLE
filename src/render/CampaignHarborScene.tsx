import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { levelLayouts, type Point } from '../content/layouts';
import { levelPresentations, type BuildingTone } from '../content/layouts/presentation';
import { planKey, type ActorDefinition, type LevelDefinition, type Plan, type ScenarioDefinition, type SimulationResult, type TraversalTraceEvent } from '../game/model';

interface CampaignHarborSceneProps {
  readonly level: LevelDefinition;
  readonly plan: Plan;
  readonly result: SimulationResult;
  readonly scenario: ScenarioDefinition;
  readonly timelineBeat: number;
  readonly selectedActorId: string;
  readonly showRouteOptions: boolean;
  readonly bottomSheetOpen: boolean;
  readonly reducedMotion: boolean;
  readonly onSelectActor: (actorId: string) => void;
}

interface Materials {
  readonly water: THREE.MeshStandardMaterial;
  readonly shore: THREE.MeshStandardMaterial;
  readonly stone: THREE.MeshStandardMaterial;
  readonly stoneAlt: THREE.MeshStandardMaterial;
  readonly road: THREE.MeshStandardMaterial;
  readonly curb: THREE.MeshStandardMaterial;
  readonly lawn: THREE.MeshStandardMaterial;
  readonly lawnLight: THREE.MeshStandardMaterial;
  readonly foliage: THREE.MeshStandardMaterial;
  readonly timber: THREE.MeshStandardMaterial;
  readonly timberDark: THREE.MeshStandardMaterial;
  readonly cream: THREE.MeshStandardMaterial;
  readonly sand: THREE.MeshStandardMaterial;
  readonly coral: THREE.MeshStandardMaterial;
  readonly roof: THREE.MeshStandardMaterial;
  readonly glass: THREE.MeshStandardMaterial;
  readonly ink: THREE.MeshStandardMaterial;
  readonly yellow: THREE.MeshStandardMaterial;
  readonly robot: THREE.MeshStandardMaterial;
  readonly cart: THREE.MeshStandardMaterial;
  readonly brass: THREE.MeshStandardMaterial;
}

interface RouteVisual {
  readonly actorId: string;
  readonly routeId: string;
  readonly curve: THREE.CatmullRomCurve3;
  readonly durations: readonly number[];
  readonly highlight: THREE.Mesh;
}

interface ActorVisual {
  readonly root: THREE.Group;
  readonly selection: THREE.Mesh;
  readonly wait: THREE.Mesh;
  readonly arrival: THREE.Mesh;
}

interface ActorFrameState {
  readonly position: THREE.Vector3;
  readonly tangent: THREE.Vector3;
  waiting: boolean;
  arrived: boolean;
}

const COLORS = {
  water: 0x4a9da0,
  waterDeep: 0x2f7e83,
  shore: 0xb99461,
  stone: 0xe9d3a6,
  stoneAlt: 0xd9c18e,
  road: 0x465d61,
  curb: 0xb8b39b,
  lawn: 0x76915b,
  lawnLight: 0x8da66a,
  foliage: 0x4f7049,
  timber: 0x9a6542,
  timberDark: 0x5f4234,
  cream: 0xf2e5c2,
  sand: 0xe5c78f,
  coral: 0xd86a54,
  roof: 0x3f7775,
  glass: 0x91c8c2,
  ink: 0x203a3a,
  yellow: 0xe9a92f,
  robot: 0xd95648,
  cart: 0xa86d48,
  brass: 0xf2c55c,
} as const;

const ROAD_Y = 1.02;
const VEHICLE_Y = 1.08;
const CAMERA_POSITION = new THREE.Vector3(10, 29, 26);
const CAMERA_TARGET = new THREE.Vector3(0, 0.4, 0);
const CAMERA_FRUSTUM = 21.8;
const MIN_HORIZONTAL_FRUSTUM = 18;
const ACTOR_COLORS: Readonly<Record<string, number>> = { B: COLORS.yellow, R: COLORS.robot, C: COLORS.cart };

const standardMaterial = (color: number, roughness: number, metalness = 0): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const createMaterials = (): Materials => ({
  water: standardMaterial(COLORS.water, 0.5),
  shore: standardMaterial(COLORS.shore, 0.94),
  stone: standardMaterial(COLORS.stone, 0.91),
  stoneAlt: standardMaterial(COLORS.stoneAlt, 0.94),
  road: standardMaterial(COLORS.road, 0.92),
  curb: standardMaterial(COLORS.curb, 0.96),
  lawn: standardMaterial(COLORS.lawn, 1),
  lawnLight: standardMaterial(COLORS.lawnLight, 1),
  foliage: standardMaterial(COLORS.foliage, 1),
  timber: standardMaterial(COLORS.timber, 0.88),
  timberDark: standardMaterial(COLORS.timberDark, 0.94),
  cream: standardMaterial(COLORS.cream, 0.9),
  sand: standardMaterial(COLORS.sand, 0.91),
  coral: standardMaterial(COLORS.coral, 0.87),
  roof: standardMaterial(COLORS.roof, 0.81),
  glass: standardMaterial(COLORS.glass, 0.38, 0.03),
  ink: standardMaterial(COLORS.ink, 0.84),
  yellow: standardMaterial(COLORS.yellow, 0.72),
  robot: standardMaterial(COLORS.robot, 0.74),
  cart: standardMaterial(COLORS.cart, 0.82),
  brass: standardMaterial(COLORS.brass, 0.61, 0.06),
});

const worldPoint = (point: Point, y = VEHICLE_Y): THREE.Vector3 =>
  new THREE.Vector3((point.x - 50) * 0.18, y, (point.y - 70) * 0.13);

const roundedBox = (geometry: THREE.BufferGeometry, material: THREE.Material, position: readonly [number, number, number], scale: readonly [number, number, number]): THREE.Mesh => {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const buildCurve = (level: LevelDefinition, actor: ActorDefinition, routeId: string): THREE.CatmullRomCurve3 => {
  const layout = levelLayouts[level.id]!;
  const route = actor.routes[routeId]!;
  const configured = layout.routeBends[`${actor.id}.${routeId}`] ?? [];
  const resourcePoints = route
    .map(([resourceId]) => resourceId === null ? undefined : layout.resourcePositions[resourceId])
    .filter((point): point is Point => point !== undefined);
  const middle = configured.length > 0 ? configured : resourcePoints;
  const rawPoints = [layout.actorStarts[actor.id]!, ...middle, layout.actorEnds[actor.id]!];
  const points = rawPoints.filter((point, index) => index === 0 || point.x !== rawPoints[index - 1]!.x || point.y !== rawPoints[index - 1]!.y).map((point) => worldPoint(point));
  if (points.length === 2) points.splice(1, 0, points[0]!.clone().lerp(points[1]!, 0.5));
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal', 0.35);
  return curve;
};

const createRibbon = (curve: THREE.CatmullRomCurve3, width: number, y: number, material: THREE.Material): THREE.Mesh => {
  const points = curve.getPoints(44);
  const positions: number[] = [];
  const indices: number[] = [];
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]!;
    const previous = points[Math.max(0, index - 1)]!;
    const next = points[Math.min(points.length - 1, index + 1)]!;
    const direction = new THREE.Vector2(next.x - previous.x, next.z - previous.z).normalize();
    const normalX = -direction.y * width * 0.5;
    const normalZ = direction.x * width * 0.5;
    positions.push(current.x + normalX, y, current.z + normalZ, current.x - normalX, y, current.z - normalZ);
    if (index < points.length - 1) {
      const base = index * 2;
      indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
};

const createRouteVisual = (level: LevelDefinition, actor: ActorDefinition, routeId: string, materials: Materials): RouteVisual => {
  const curve = buildCurve(level, actor, routeId);
  const curb = createRibbon(curve, actor.id === 'B' ? 1.86 : 1.62, ROAD_Y - 0.025, materials.curb);
  const road = createRibbon(curve, actor.id === 'B' ? 1.58 : 1.35, ROAD_Y, materials.road);
  const highlightMaterial = new THREE.MeshBasicMaterial({ color: ACTOR_COLORS[actor.id] ?? COLORS.coral, transparent: true, opacity: 0, depthWrite: false });
  const highlight = createRibbon(curve, actor.id === 'B' ? 0.18 : 0.14, ROAD_Y + 0.045, highlightMaterial);
  const group = new THREE.Group();
  group.add(curb, road, highlight);
  group.userData.routeGroup = true;
  highlight.userData.parentRoute = group;
  return { actorId: actor.id, routeId, curve, durations: actor.routes[routeId]!.map(([, duration]) => duration), highlight };
};

const createBuilding = (
  spec: { readonly x: number; readonly y: number; readonly width: number; readonly depth: number; readonly height: number; readonly tone: BuildingTone },
  materials: Materials,
  geometries: { readonly unitBox: THREE.BufferGeometry; readonly window: THREE.BufferGeometry },
): THREE.Group => {
  const position = worldPoint({ x: spec.x, y: spec.y }, 0);
  const group = new THREE.Group();
  group.position.set(position.x, 0, position.z);
  const tone = spec.tone === 'coral' ? materials.coral : spec.tone === 'sand' ? materials.sand : materials.cream;
  const foundation = roundedBox(geometries.unitBox, materials.stoneAlt, [0, 1.0, 0], [spec.width + 0.22, 0.38, spec.depth + 0.22]);
  const body = roundedBox(geometries.unitBox, tone, [0, 1.25 + spec.height * 0.5, 0], [spec.width, spec.height, spec.depth]);
  const roof = roundedBox(geometries.unitBox, materials.roof, [0, 1.35 + spec.height, 0], [spec.width + 0.34, 0.28, spec.depth + 0.34]);
  const door = roundedBox(geometries.unitBox, materials.timberDark, [0, 1.63, spec.depth * 0.51], [0.58, 1.22, 0.12]);
  const leftWindow = roundedBox(geometries.window, materials.glass, [-spec.width * 0.27, 2.05, spec.depth * 0.515], [0.6, 0.62, 0.1]);
  const rightWindow = roundedBox(geometries.window, materials.glass, [spec.width * 0.27, 2.05, spec.depth * 0.515], [0.6, 0.62, 0.1]);
  group.add(foundation, body, roof, door, leftWindow, rightWindow);
  return group;
};

const createVehicle = (actorId: string, materials: Materials, unitBox: THREE.BufferGeometry): THREE.Group => {
  const root = new THREE.Group();
  const bodyMaterial = actorId === 'B' ? materials.yellow : actorId === 'C' ? materials.cart : materials.robot;
  const bodyScale: readonly [number, number, number] = actorId === 'B' ? [2.25, 0.75, 1.04] : actorId === 'C' ? [1.75, 0.6, 1.08] : [1.05, 0.72, 0.92];
  const body = roundedBox(unitBox, bodyMaterial, [0, 0.67, 0], bodyScale);
  const cabin = roundedBox(unitBox, actorId === 'R' ? materials.cream : materials.glass, actorId === 'R' ? [-0.15, 1.28, 0] : [-0.18, 1.15, 0], actorId === 'R' ? [0.78, 0.64, 0.78] : [actorId === 'B' ? 1.2 : 0.82, 0.55, 0.88]);
  root.add(body, cabin);
  const wheelGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 12);
  const wheelOffsets = actorId === 'B' ? [-0.72, 0.72] : [-0.45, 0.45];
  for (const x of wheelOffsets) {
    for (const z of [-bodyScale[2] * 0.47, bodyScale[2] * 0.47]) {
      const wheel = new THREE.Mesh(wheelGeometry, materials.ink);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.3, z);
      wheel.castShadow = true;
      root.add(wheel);
    }
  }
  if (actorId === 'R') {
    const face = roundedBox(unitBox, materials.ink, [0.2, 1.31, 0.41], [0.42, 0.25, 0.08]);
    const parcel = roundedBox(unitBox, materials.timber, [-0.55, 0.92, 0], [0.48, 0.5, 0.62]);
    root.add(face, parcel);
  } else if (actorId === 'C') {
    const crateA = roundedBox(unitBox, materials.sand, [-0.46, 1.17, 0], [0.55, 0.48, 0.72]);
    const crateB = roundedBox(unitBox, materials.timber, [0.26, 1.17, 0], [0.56, 0.48, 0.72]);
    root.add(crateA, crateB);
  }
  const contact = new THREE.Mesh(new THREE.CircleGeometry(actorId === 'B' ? 1.18 : 0.82, 24), new THREE.MeshBasicMaterial({ color: COLORS.ink, transparent: true, opacity: 0.17, depthWrite: false }));
  contact.rotation.x = -Math.PI / 2;
  contact.position.y = 0.05;
  root.add(contact);
  return root;
};

const createActorVisual = (actorId: string, materials: Materials, unitBox: THREE.BufferGeometry): ActorVisual => {
  const root = new THREE.Group();
  root.userData.actorId = actorId;
  const vehicle = createVehicle(actorId, materials, unitBox);
  vehicle.traverse((object) => { object.userData.actorId = actorId; });
  root.add(vehicle);
  const radius = actorId === 'B' ? 1.35 : 1.0;
  const selection = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 0.15, 32), new THREE.MeshBasicMaterial({ color: COLORS.brass, transparent: true, opacity: 0.88, depthWrite: false }));
  selection.rotation.x = -Math.PI / 2;
  selection.position.y = 0.07;
  root.add(selection);
  const wait = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.86, 0.06, 8, 28), new THREE.MeshBasicMaterial({ color: COLORS.cream, transparent: true, opacity: 0.86, depthWrite: false }));
  wait.rotation.x = Math.PI / 2;
  wait.position.y = 1.85;
  root.add(wait);
  const arrival = new THREE.Mesh(new THREE.RingGeometry(radius * 0.82, radius * 0.93, 32), new THREE.MeshBasicMaterial({ color: ACTOR_COLORS[actorId] ?? COLORS.coral, transparent: true, opacity: 0.8, depthWrite: false }));
  arrival.rotation.x = -Math.PI / 2;
  arrival.position.y = 0.08;
  root.add(arrival);
  const touch = new THREE.Mesh(new THREE.BoxGeometry(actorId === 'B' ? 3.4 : 2.8, 3.2, actorId === 'B' ? 2.5 : 2.8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
  touch.position.y = 1.25;
  touch.userData.actorId = actorId;
  root.add(touch);
  return { root, selection, wait, arrival };
};

const createDestination = (actorId: string, materials: Materials): THREE.Group => {
  const color = ACTOR_COLORS[actorId] ?? COLORS.coral;
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.56, 0.65, 0.2, 14), materials.curb);
  base.position.y = 0.1;
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.0, 12), standardMaterial(color, 0.7));
  post.position.y = 0.65;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.28, 0.2, 12), materials.cream);
  cap.position.y = 1.22;
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.68, 0.82, 30), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.86, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.03;
  group.add(base, post, cap, ring);
  return group;
};

const updateActorState = (
  state: ActorFrameState,
  route: RouteVisual,
  events: readonly TraversalTraceEvent[],
  beat: number,
): void => {
  state.waiting = false;
  state.arrived = false;
  const totalDuration = route.durations.reduce((sum, duration) => sum + duration, 0);
  if (events.length === 0 || totalDuration === 0) {
    route.curve.getPointAt(0, state.position);
    route.curve.getTangentAt(0, state.tangent);
    return;
  }
  let elapsedDuration = 0;
  for (const event of events) {
    const duration = route.durations[event.stepIndex] ?? 0;
    const startProgress = elapsedDuration / totalDuration;
    const endProgress = (elapsedDuration + duration) / totalDuration;
    if (beat < event.start) {
      route.curve.getPointAt(startProgress, state.position);
      route.curve.getTangentAt(startProgress, state.tangent);
      state.waiting = beat >= event.readyBeat;
      return;
    }
    if (beat <= event.end) {
      const raw = event.end === event.start ? 1 : (beat - event.start) / (event.end - event.start);
      const progress = THREE.MathUtils.lerp(startProgress, endProgress, THREE.MathUtils.smoothstep(raw, 0, 1));
      route.curve.getPointAt(progress, state.position);
      route.curve.getTangentAt(progress, state.tangent);
      return;
    }
    elapsedDuration += duration;
  }
  route.curve.getPointAt(1, state.position);
  route.curve.getTangentAt(1, state.tangent);
  state.arrived = beat >= events.at(-1)!.end;
};

export function CampaignHarborScene({ level, plan, result, scenario, timelineBeat, selectedActorId, showRouteOptions, bottomSheetOpen, reducedMotion, onSelectActor }: CampaignHarborSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ plan, result, scenario, timelineBeat, selectedActorId, showRouteOptions, bottomSheetOpen, reducedMotion, onSelectActor });
  stateRef.current = { plan, result, scenario, timelineBeat, selectedActorId, showRouteOptions, bottomSheetOpen, reducedMotion, onSelectActor };

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    const layout = levelLayouts[level.id]!;
    const presentation = levelPresentations[level.id]!;
    const materials = createMaterials();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.waterDeep);
    scene.fog = new THREE.Fog(COLORS.waterDeep, 39, 66);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.replaceChildren(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 90);
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_TARGET);
    camera.updateMatrixWorld();
    const screenUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();
    const cameraOffset = new THREE.Vector3();
    const desiredOffset = new THREE.Vector3();
    const cameraTarget = new THREE.Vector3();
    scene.add(new THREE.HemisphereLight(0xfff2d4, 0x225c64, 1.5));
    const sun = new THREE.DirectionalLight(0xffdfaa, 3.2);
    sun.position.set(-13, 25, -16);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -17;
    sun.shadow.camera.right = 17;
    sun.shadow.camera.top = 19;
    sun.shadow.camera.bottom = -19;
    sun.shadow.camera.near = 4;
    sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.00035;
    scene.add(sun);

    const unitBox = new RoundedBoxGeometry(1, 1, 1, 3, 0.1);
    const windowGeometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.12);
    const waterGeometry = new THREE.PlaneGeometry(90, 90, 24, 24);
    const water = new THREE.Mesh(waterGeometry, materials.water);
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.48;
    water.receiveShadow = true;
    scene.add(water);
    const waterPositions = waterGeometry.getAttribute('position');
    const waterBase = Float32Array.from(waterPositions.array as ArrayLike<number>);

    const shoreline = roundedBox(unitBox, materials.shore, [0, 0.04, 0], [19.6 - presentation.shorelineInset * 0.12, 1.0, 21.2]);
    const island = roundedBox(unitBox, materials.stone, [0, 0.68, 0], [19.0 - presentation.shorelineInset * 0.12, 0.42, 20.6]);
    scene.add(shoreline, island);

    const slabGeometry = new RoundedBoxGeometry(1, 1, 1, 2, 0.06);
    const slabs = new THREE.InstancedMesh(slabGeometry, materials.stoneAlt, 30);
    const slabMatrix = new THREE.Matrix4();
    let slabIndex = 0;
    for (let row = 0; row < 6; row += 1) {
      for (let column = 0; column < 5; column += 1) {
        slabMatrix.compose(new THREE.Vector3(-4.7 + column * 2.32, 0.93, -5.8 + row * 2.25), new THREE.Quaternion(), new THREE.Vector3(2.12, 0.12, 2.03));
        slabs.setMatrixAt(slabIndex, slabMatrix);
        slabIndex += 1;
      }
    }
    slabs.receiveShadow = true;
    scene.add(slabs);

    const routeVisuals = new Map<string, RouteVisual>();
    for (const actor of level.actors) {
      for (const routeId of Object.keys(actor.routes)) {
        const route = createRouteVisual(level, actor, routeId, materials);
        routeVisuals.set(`${actor.id}.${routeId}`, route);
        scene.add(route.highlight.parent as THREE.Group);
      }
    }
    for (const [resourceId, point] of Object.entries(layout.resourcePositions)) {
      const position = worldPoint(point, ROAD_Y - 0.01);
      const plazaSize = resourceId === 'U' ? 1.7 : 2.05;
      const plaza = roundedBox(unitBox, materials.road, [position.x, position.y, position.z], [plazaSize, 0.1, plazaSize]);
      plaza.receiveShadow = true;
      scene.add(plaza);
    }

    for (const garden of presentation.gardens) {
      const position = worldPoint({ x: garden.x, y: garden.y }, 1.02);
      const border = roundedBox(unitBox, materials.curb, [position.x, 1.02, position.z], [garden.width + 0.25, 0.2, garden.depth + 0.25]);
      const lawn = roundedBox(unitBox, materials.lawn, [position.x, 1.15, position.z], [garden.width, 0.16, garden.depth]);
      scene.add(border, lawn);
    }
    const tuftGeometry = new THREE.ConeGeometry(0.11, 0.48, 5);
    const tuftCount = presentation.gardens.length * 8;
    const tufts = new THREE.InstancedMesh(tuftGeometry, materials.foliage, tuftCount);
    let tuftIndex = 0;
    for (const [gardenIndex, garden] of presentation.gardens.entries()) {
      const center = worldPoint({ x: garden.x, y: garden.y }, 1.46);
      for (let index = 0; index < 8; index += 1) {
        const x = center.x + ((index % 4) - 1.5) * garden.width * 0.19;
        const z = center.z + (Math.floor(index / 4) - 0.5) * garden.depth * 0.34;
        slabMatrix.compose(new THREE.Vector3(x, 1.45, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, index * 0.7 + gardenIndex, 0)), new THREE.Vector3(1, 1, 0.72));
        tufts.setMatrixAt(tuftIndex, slabMatrix);
        tuftIndex += 1;
      }
    }
    tufts.castShadow = true;
    scene.add(tufts);

    for (const building of presentation.buildings) scene.add(createBuilding(building, materials, { unitBox, window: windowGeometry }));

    const trunkGeometry = new THREE.CylinderGeometry(0.12, 0.17, 0.9, 8);
    const crownGeometry = new THREE.DodecahedronGeometry(0.62, 1);
    const trunks = new THREE.InstancedMesh(trunkGeometry, materials.timberDark, layout.trees.length);
    const crowns = new THREE.InstancedMesh(crownGeometry, materials.foliage, layout.trees.length);
    layout.trees.forEach((point, index) => {
      const position = worldPoint(point, 1.4);
      slabMatrix.compose(position, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
      trunks.setMatrixAt(index, slabMatrix);
      slabMatrix.compose(new THREE.Vector3(position.x, 2.25, position.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, index * 0.7, 0)), new THREE.Vector3(1, 1.1, 1));
      crowns.setMatrixAt(index, slabMatrix);
    });
    trunks.castShadow = true;
    crowns.castShadow = true;
    scene.add(trunks, crowns);

    const waterSide = layout.waterEdge === 'left' ? -1 : 1;
    const dockZ = presentation.dockPosition === 'north' ? -5.6 : presentation.dockPosition === 'south' ? 5.7 : 0.3;
    const dock = new THREE.Group();
    dock.position.set(waterSide * 9.2, 0.86, dockZ);
    for (let index = 0; index < 6; index += 1) {
      const plank = roundedBox(unitBox, materials.timber, [-waterSide * (0.55 + index * 0.42), 0, 0], [0.36, 0.22, 3.2]);
      dock.add(plank);
    }
    const fascia = roundedBox(unitBox, materials.timberDark, [-waterSide * 1.6, -0.18, 0], [2.9, 0.28, 3.35]);
    dock.add(fascia);
    scene.add(dock);

    let bridgePivot: THREE.Group | undefined;
    if (presentation.district === 'bridge') {
      const bridgeResource = layout.resourcePositions.U ?? layout.resourcePositions.X;
      if (bridgeResource !== undefined) {
        const bridgePosition = worldPoint(bridgeResource, 1.22);
        bridgePivot = new THREE.Group();
        bridgePivot.position.copy(bridgePosition);
        const deck = roundedBox(unitBox, materials.timber, [1.25, 0, 0], [2.5, 0.28, 1.35]);
        const railA = roundedBox(unitBox, materials.timberDark, [1.25, 0.35, -0.61], [2.6, 0.12, 0.1]);
        const railB = roundedBox(unitBox, materials.timberDark, [1.25, 0.35, 0.61], [2.6, 0.12, 0.1]);
        bridgePivot.add(deck, railA, railB);
        scene.add(bridgePivot);
      }
    }

    if (level.id === '04') {
      const handoffPoint = worldPoint(layout.actorEnds.R!, 1.33);
      const crate = roundedBox(unitBox, materials.timber, [handoffPoint.x, handoffPoint.y, handoffPoint.z], [0.7, 0.62, 0.7]);
      scene.add(crate);
    }

    const actorVisuals = new Map<string, ActorVisual>();
    for (const actor of level.actors) {
      const visual = createActorVisual(actor.id, materials, unitBox);
      actorVisuals.set(actor.id, visual);
      scene.add(visual.root);
      const destination = createDestination(actor.id, materials);
      destination.position.copy(worldPoint(layout.actorEnds[actor.id]!, ROAD_Y + 0.02));
      scene.add(destination);
    }

    let width = 1;
    let height = 1;
    let currentFrustum = CAMERA_FRUSTUM;
    let cameraInitialized = false;
    const resize = (): void => {
      width = Math.max(1, host.clientWidth);
      height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      if (!cameraInitialized) {
        currentFrustum = Math.max(CAMERA_FRUSTUM, MIN_HORIZONTAL_FRUSTUM / (width / height));
        cameraInitialized = true;
      }
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const actorRoots = [...actorVisuals.values()].map((visual) => visual.root);
    const pickActor = (event: PointerEvent): void => {
      const bounds = renderer.domElement.getBoundingClientRect();
      pointer.set(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -((event.clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(actorRoots, true).find((intersection) => typeof intersection.object.userData.actorId === 'string');
      if (hit !== undefined) stateRef.current.onSelectActor(String(hit.object.userData.actorId));
    };
    renderer.domElement.addEventListener('pointerup', pickActor);

    const frameStates = new Map<string, ActorFrameState>(level.actors.map((actor) => [actor.id, { position: new THREE.Vector3(), tangent: new THREE.Vector3(), waiting: false, arrived: false }]));
    const actorEvents = new Map<string, TraversalTraceEvent[]>();
    const emptyEvents: readonly TraversalTraceEvent[] = [];
    let cachedResult: SimulationResult | undefined;
    let frame = 0;
    let frameSampleStart = performance.now();
    let frameSampleCount = 0;
    const timer = new THREE.Timer();
    timer.connect(document);
    const animate = (): void => {
      timer.update();
      const elapsed = timer.getElapsed();
      const current = stateRef.current;
      const aspect = width / height;
      const targetFrustum = Math.max(CAMERA_FRUSTUM, MIN_HORIZONTAL_FRUSTUM / aspect) * (current.bottomSheetOpen ? 1.07 : 1);
      const transition = current.reducedMotion ? 1 : 0.12;
      currentFrustum = THREE.MathUtils.lerp(currentFrustum, targetFrustum, transition);
      desiredOffset.copy(screenUp).multiplyScalar(current.bottomSheetOpen ? -1.1 : -0.15);
      cameraOffset.lerp(desiredOffset, transition);
      camera.position.copy(CAMERA_POSITION).add(cameraOffset);
      cameraTarget.copy(CAMERA_TARGET).add(cameraOffset);
      camera.lookAt(cameraTarget);
      camera.left = -currentFrustum * aspect * 0.5;
      camera.right = currentFrustum * aspect * 0.5;
      camera.top = currentFrustum * 0.5;
      camera.bottom = -currentFrustum * 0.5;
      camera.updateProjectionMatrix();

      if (cachedResult !== current.result) {
        actorEvents.clear();
        for (const event of current.result.trace) {
          if (event.kind !== 'traversal') continue;
          const events = actorEvents.get(event.actorId) ?? [];
          events.push(event);
          actorEvents.set(event.actorId, events);
        }
        actorEvents.forEach((events) => events.sort((left, right) => left.stepIndex - right.stepIndex));
        cachedResult = current.result;
      }

      for (const actor of level.actors) {
        const selectedRoute = current.plan[planKey(actor.id, 'route')];
        const routeId = typeof selectedRoute === 'string' ? selectedRoute : actor.defaultRoute;
        const route = routeVisuals.get(`${actor.id}.${routeId}`)!;
        const state = frameStates.get(actor.id)!;
        updateActorState(state, route, actorEvents.get(actor.id) ?? emptyEvents, current.timelineBeat);
        const visual = actorVisuals.get(actor.id)!;
        visual.root.position.copy(state.position);
        visual.root.rotation.y = -Math.atan2(state.tangent.z, state.tangent.x);
        visual.selection.visible = current.selectedActorId === actor.id;
        visual.wait.visible = state.waiting;
        visual.wait.rotation.z = elapsed * 0.8;
        visual.arrival.visible = state.arrived;
        if (!current.reducedMotion) visual.root.position.y += Math.sin(elapsed * 1.8 + actor.priority) * 0.01;
      }

      for (const route of routeVisuals.values()) {
        const selectedValue = current.plan[planKey(route.actorId, 'route')];
        const actor = level.actors.find((candidate) => candidate.id === route.actorId)!;
        const selectedRoute = typeof selectedValue === 'string' ? selectedValue : actor.defaultRoute;
        const visible = current.showRouteOptions && current.selectedActorId === route.actorId;
        const material = route.highlight.material as THREE.MeshBasicMaterial;
        material.opacity = visible ? route.routeId === selectedRoute ? 0.92 : 0.28 : 0;
        material.color.setHex(route.routeId === selectedRoute ? ACTOR_COLORS[route.actorId] ?? COLORS.coral : COLORS.cream);
        route.highlight.visible = visible;
      }

      if (bridgePivot !== undefined) {
        const closureResource = current.scenario.closures.U !== undefined ? 'U' : 'X';
        const closed = (current.scenario.closures[closureResource] ?? []).some(([start, end]) => current.timelineBeat >= start && current.timelineBeat < end);
        const targetAngle = closed ? -0.62 : 0;
        bridgePivot.rotation.z = current.reducedMotion ? targetAngle : THREE.MathUtils.lerp(bridgePivot.rotation.z, targetAngle, 0.12);
      }

      if (!current.reducedMotion) {
        for (let index = 0; index < waterPositions.count; index += 1) {
          const x = waterBase[index * 3]!;
          const z = waterBase[index * 3 + 1]!;
          waterPositions.setZ(index, Math.sin(x * 0.3 + elapsed * 0.45) * 0.045 + Math.cos(z * 0.24 + elapsed * 0.3) * 0.025);
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
        if (!(object instanceof THREE.Mesh)) return;
        geometries.add(object.geometry);
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((material) => disposableMaterials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      disposableMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      host.replaceChildren();
    };
  }, [level]);

  return <div className="harbor-scene harbor-scene-3d campaign-harbor-scene" ref={hostRef} data-renderer="three-webgl" />;
}

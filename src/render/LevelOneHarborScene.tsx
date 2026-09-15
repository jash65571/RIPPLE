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
  readonly onSelectActor: (actorId: string) => void;
}

interface ActorVisual {
  readonly root: THREE.Group;
  readonly selection: THREE.Mesh;
  readonly waitSignal: THREE.Mesh;
}

const SCENE_COLORS = {
  water: 0x7bb8b7,
  waterDeep: 0x3c777d,
  stone: 0xe1c9aa,
  stoneSide: 0xb9916b,
  road: 0x52636c,
  roadEdge: 0xe6d8bd,
  dock: 0x98684c,
  bus: 0xefac3f,
  robot: 0xe85c4b,
  robotLight: 0xffd799,
  roofBlue: 0x3b7280,
  roofRed: 0xb85345,
  foliage: 0x547b5a,
  foliageLight: 0x7f9b66,
  window: 0xb9e4df,
  crossing: 0xf2c564,
  ink: 0x27383d,
  white: 0xfff8e9,
} as const;

const CAMERA_FRUSTUM = 23;
const VEHICLE_HEIGHT = 1.18;
const WATER_VERTEX_MOTION = 0.08;
const CAMERA_POSITION = new THREE.Vector3(20, 20, 23);
const CAMERA_TARGET = new THREE.Vector3(0, 0.2, 0);

const STARTS = {
  R: new THREE.Vector3(-8.2, VEHICLE_HEIGHT, -2.5),
  B: new THREE.Vector3(-7.4, VEHICLE_HEIGHT, 5.4),
} as const;

const ENDS = {
  R: new THREE.Vector3(7.4, VEHICLE_HEIGHT, 3.7),
  B: new THREE.Vector3(7.8, VEHICLE_HEIGHT, -3.9),
} as const;

const CROSSING = new THREE.Vector3(0.15, VEHICLE_HEIGHT + 0.24, 0.15);

const material = (color: number, roughness = 0.78, metalness = 0): THREE.MeshStandardMaterial =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

const roundedBox = (
  size: readonly [number, number, number],
  color: number,
  radius = 0.18,
  segments = 3,
): THREE.Mesh => {
  const mesh = new THREE.Mesh(
    new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius),
    material(color),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
};

const addRoadSegment = (
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  width: number,
  color: number = SCENE_COLORS.road,
  height = 0.38,
): void => {
  const length = start.distanceTo(end);
  const road = roundedBox([length, height, width], color, Math.min(0.28, width * 0.1));
  road.position.set((start.x + end.x) / 2, 0.82, (start.z + end.z) / 2);
  road.rotation.y = -Math.atan2(end.z - start.z, end.x - start.x);
  parent.add(road);
};

const addBuilding = (
  parent: THREE.Object3D,
  x: number,
  z: number,
  width: number,
  depth: number,
  height: number,
  wallColor: number,
  roofColor: number,
): void => {
  const building = new THREE.Group();
  building.position.set(x, 0, z);
  const body = roundedBox([width, height, depth], wallColor, 0.22);
  body.position.y = 1 + height / 2;
  const roof = roundedBox([width + 0.28, 0.34, depth + 0.28], roofColor, 0.16);
  roof.position.y = 1.18 + height;
  building.add(body, roof);

  const windowMaterial = material(SCENE_COLORS.window, 0.25, 0.05);
  const front = z > 0 ? -1 : 1;
  for (const offset of [-0.28, 0.28]) {
    const windowMesh = new THREE.Mesh(new RoundedBoxGeometry(width * 0.25, height * 0.22, 0.08, 2, 0.06), windowMaterial);
    windowMesh.position.set(offset * width, 1 + height * 0.58, front * (depth / 2 + 0.04));
    building.add(windowMesh);
  }
  parent.add(building);
};

const addTree = (parent: THREE.Object3D, x: number, z: number, scale = 1): void => {
  const tree = new THREE.Group();
  tree.position.set(x, 1, z);
  tree.scale.setScalar(scale);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 0.85, 8), material(SCENE_COLORS.dock));
  trunk.position.y = 0.38;
  trunk.castShadow = true;
  const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 1), material(SCENE_COLORS.foliage));
  crown.position.y = 1.13;
  crown.scale.set(0.85, 1.1, 0.85);
  crown.castShadow = true;
  tree.add(trunk, crown);
  parent.add(tree);
};

const createRobot = (): THREE.Group => {
  const robot = new THREE.Group();
  const body = roundedBox([1.05, 1.05, 0.85], SCENE_COLORS.robot, 0.24);
  body.position.y = 0.72;
  const head = roundedBox([0.78, 0.52, 0.72], SCENE_COLORS.white, 0.2);
  head.position.set(0.12, 1.48, 0);
  const face = roundedBox([0.09, 0.29, 0.5], SCENE_COLORS.ink, 0.08);
  face.position.set(0.53, 1.48, 0);
  const eyeMaterial = new THREE.MeshBasicMaterial({ color: SCENE_COLORS.robotLight });
  for (const z of [-0.14, 0.14]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8), eyeMaterial);
    eye.position.set(0.585, 1.51, z);
    robot.add(eye);
  }
  const parcel = roundedBox([0.52, 0.52, 0.52], 0xd9a46e, 0.08);
  parcel.position.set(-0.53, 0.85, 0);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.62, 16), material(SCENE_COLORS.ink, 0.65, 0.05));
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(-0.08, 0.25, 0);
  robot.add(body, head, face, parcel, wheel);
  return robot;
};

const createBus = (): THREE.Group => {
  const bus = new THREE.Group();
  const body = roundedBox([2.3, 1.15, 1.03], SCENE_COLORS.bus, 0.28);
  body.position.y = 0.84;
  const roof = roundedBox([1.8, 0.25, 0.94], SCENE_COLORS.white, 0.13);
  roof.position.set(-0.12, 1.52, 0);
  const glass = material(SCENE_COLORS.window, 0.22, 0.08);
  for (const x of [-0.58, 0.02, 0.62]) {
    for (const z of [-0.53, 0.53]) {
      const windowMesh = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.38, 0.07, 2, 0.07), glass);
      windowMesh.position.set(x, 1.03, z);
      bus.add(windowMesh);
    }
  }
  const frontWindow = new THREE.Mesh(new RoundedBoxGeometry(0.07, 0.52, 0.72, 2, 0.1), glass);
  frontWindow.position.set(1.17, 1.04, 0);
  const wheelMaterial = material(SCENE_COLORS.ink, 0.8);
  for (const x of [-0.72, 0.72]) {
    for (const z of [-0.53, 0.53]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.23, 0.13, 16), wheelMaterial);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(x, 0.33, z);
      wheel.castShadow = true;
      bus.add(wheel);
    }
  }
  bus.add(body, roof, frontWindow);
  return bus;
};

const createActorVisual = (actorId: string): ActorVisual => {
  const root = new THREE.Group();
  root.userData.actorId = actorId;
  const model = actorId === 'B' ? createBus() : createRobot();
  model.traverse((child) => { child.userData.actorId = actorId; });
  const selectionMaterial = new THREE.MeshBasicMaterial({ color: SCENE_COLORS.crossing, transparent: true, opacity: 0.85, depthWrite: false });
  const selection = new THREE.Mesh(new THREE.RingGeometry(actorId === 'B' ? 1.25 : 0.78, actorId === 'B' ? 1.4 : 0.92, 40), selectionMaterial);
  selection.rotation.x = -Math.PI / 2;
  selection.position.y = 0.05;
  const waitSignal = new THREE.Mesh(
    new THREE.TorusGeometry(actorId === 'B' ? 1.12 : 0.7, 0.055, 8, 32),
    new THREE.MeshBasicMaterial({ color: SCENE_COLORS.white, transparent: true, opacity: 0.75, depthWrite: false }),
  );
  waitSignal.rotation.x = Math.PI / 2;
  waitSignal.position.y = 1.95;
  waitSignal.visible = false;
  root.add(model, selection, waitSignal);
  return { root, selection, waitSignal };
};

const routeCurves = (routeId: string): Readonly<Record<string, readonly THREE.CatmullRomCurve3[]>> => ({
  R: routeId === 'garden'
    ? [new THREE.CatmullRomCurve3([
        STARTS.R,
        new THREE.Vector3(-6.8, VEHICLE_HEIGHT, -5.7),
        new THREE.Vector3(-2.2, VEHICLE_HEIGHT, -6.8),
        new THREE.Vector3(3.5, VEHICLE_HEIGHT, -6.1),
        ENDS.R,
      ])]
    : [
        new THREE.CatmullRomCurve3([STARTS.R, new THREE.Vector3(-4.5, VEHICLE_HEIGHT, -2.1), new THREE.Vector3(-1.25, VEHICLE_HEIGHT + 0.2, -0.45), CROSSING]),
        new THREE.CatmullRomCurve3([CROSSING, new THREE.Vector3(3.5, VEHICLE_HEIGHT, 1.1), ENDS.R]),
      ],
  B: [
    new THREE.CatmullRomCurve3([STARTS.B, new THREE.Vector3(-4.8, VEHICLE_HEIGHT, 3.8), new THREE.Vector3(-1.15, VEHICLE_HEIGHT + 0.2, 0.9), CROSSING]),
    new THREE.CatmullRomCurve3([CROSSING, new THREE.Vector3(3.8, VEHICLE_HEIGHT, -1.65), ENDS.B]),
  ],
});

const actorStateAtBeat = (
  actorId: string,
  curves: readonly THREE.CatmullRomCurve3[],
  events: readonly TraversalTraceEvent[],
  beat: number,
): { readonly position: THREE.Vector3; readonly tangent: THREE.Vector3; readonly waiting: boolean } => {
  const actorEvents = events.filter((event) => event.actorId === actorId).sort((a, b) => a.stepIndex - b.stepIndex);
  if (actorEvents.length === 0) {
    return { position: curves[0]!.getPoint(0), tangent: curves[0]!.getTangent(0), waiting: false };
  }
  for (let index = 0; index < actorEvents.length; index += 1) {
    const event = actorEvents[index]!;
    const curve = curves[event.stepIndex] ?? curves.at(-1)!;
    if (beat < event.start) {
      return { position: curve.getPoint(0), tangent: curve.getTangent(0), waiting: beat >= event.readyBeat };
    }
    if (beat <= event.end) {
      const rawProgress = event.end === event.start ? 1 : (beat - event.start) / (event.end - event.start);
      const progress = THREE.MathUtils.smoothstep(rawProgress, 0, 1);
      return { position: curve.getPoint(progress), tangent: curve.getTangent(progress), waiting: false };
    }
  }
  const finalCurve = curves[Math.min(curves.length, actorEvents.length) - 1]!;
  return { position: finalCurve.getPoint(1), tangent: finalCurve.getTangent(1), waiting: false };
};

const createHarbor = (waterGeometry: THREE.PlaneGeometry): THREE.Group => {
  const harbor = new THREE.Group();
  const water = new THREE.Mesh(waterGeometry, material(SCENE_COLORS.water, 0.28, 0.05));
  water.receiveShadow = true;
  harbor.add(water);

  const island = roundedBox([21, 1.15, 16], SCENE_COLORS.stoneSide, 0.8, 5);
  island.position.set(0, 0.1, 0);
  const islandTop = roundedBox([20.6, 0.42, 15.6], SCENE_COLORS.stone, 0.72, 5);
  islandTop.position.set(0, 0.72, 0);
  harbor.add(island, islandTop);

  addRoadSegment(harbor, new THREE.Vector3(-9.2, 0, -2.5), new THREE.Vector3(-4.4, 0, -2.2), 2.2);
  addRoadSegment(harbor, new THREE.Vector3(-4.4, 0, -2.2), new THREE.Vector3(0.2, 0, 0.15), 2.2);
  addRoadSegment(harbor, new THREE.Vector3(-8.3, 0, 5.4), new THREE.Vector3(-4.2, 0, 3.6), 2.35);
  addRoadSegment(harbor, new THREE.Vector3(-4.2, 0, 3.6), new THREE.Vector3(0.2, 0, 0.15), 2.35);
  addRoadSegment(harbor, new THREE.Vector3(0.2, 0, 0.15), new THREE.Vector3(7.9, 0, -4), 2.35);
  addRoadSegment(harbor, new THREE.Vector3(0.2, 0, 0.15), new THREE.Vector3(7.5, 0, 3.8), 2.2);
  addRoadSegment(harbor, new THREE.Vector3(-8.6, 0, -2.7), new THREE.Vector3(-7, 0, -6), 1.65, 0x687b72, 0.28);
  addRoadSegment(harbor, new THREE.Vector3(-7, 0, -6), new THREE.Vector3(3.5, 0, -6.2), 1.65, 0x687b72, 0.28);
  addRoadSegment(harbor, new THREE.Vector3(3.5, 0, -6.2), new THREE.Vector3(7.5, 0, 3.8), 1.65, 0x687b72, 0.28);

  const canal = roundedBox([4.5, 0.62, 3.5], SCENE_COLORS.waterDeep, 0.42);
  canal.position.set(0.2, 0.92, 0.1);
  canal.receiveShadow = true;
  const bridge = roundedBox([4.7, 0.48, 1.58], SCENE_COLORS.crossing, 0.28);
  bridge.position.set(0.15, 1.16, 0.15);
  bridge.rotation.y = -0.48;
  harbor.add(canal, bridge);
  for (const offset of [-1, 0, 1]) {
    const stripe = roundedBox([0.12, 0.05, 1.22], SCENE_COLORS.white, 0.03, 2);
    stripe.position.set(0.15 + offset * 0.65, 1.43, 0.15 - offset * 0.34);
    stripe.rotation.y = -0.48;
    stripe.castShadow = false;
    harbor.add(stripe);
  }

  const dock = roundedBox([7.4, 0.46, 2.2], SCENE_COLORS.dock, 0.24);
  dock.position.set(-1.6, 0.95, 8.1);
  harbor.add(dock);
  for (const x of [-4.6, -2.1, 0.4, 1.4]) {
    const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 2, 10), material(SCENE_COLORS.ink));
    piling.position.set(x, 0.15, 8.65);
    piling.castShadow = true;
    harbor.add(piling);
  }

  addBuilding(harbor, 6.6, 6.4, 2.35, 1.9, 2.15, 0xf1d5a5, SCENE_COLORS.roofBlue);
  addBuilding(harbor, 7, 0.5, 2.1, 2.2, 2.25, 0xd9be9b, SCENE_COLORS.roofRed);
  addBuilding(harbor, -4.8, -5, 2.2, 1.75, 1.9, 0xe7d9bd, SCENE_COLORS.roofBlue);

  addTree(harbor, -8.3, 2.2, 0.85);
  addTree(harbor, -6.9, -5.8, 0.72);
  addTree(harbor, -2.4, -5.4, 0.8);
  addTree(harbor, 1.6, -5.5, 0.68);
  addTree(harbor, 8.5, -0.5, 0.64);
  addTree(harbor, 9, 5.4, 0.58);

  const buoyMaterial = material(SCENE_COLORS.robot, 0.55);
  for (const [x, z] of [[-8.5, 9.5], [4.2, 9.4], [10.8, 3.1]] as const) {
    const buoy = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), buoyMaterial);
    buoy.scale.y = 1.4;
    buoy.position.set(x, 0.18, z);
    buoy.castShadow = true;
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
  onSelectActor,
}: LevelOneHarborSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ level, plan, result, timelineBeat, selectedActorId, zoom, reducedMotion, onSelectActor });
  stateRef.current = { level, plan, result, timelineBeat, selectedActorId, zoom, reducedMotion, onSelectActor };

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce5df);
    scene.fog = new THREE.Fog(0xdce5df, 31, 54);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.domElement.setAttribute('aria-hidden', 'true');
    host.replaceChildren(renderer.domElement);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 90);
    camera.position.copy(CAMERA_POSITION);
    camera.lookAt(CAMERA_TARGET);

    const hemisphere = new THREE.HemisphereLight(0xf8efe0, 0x456c71, 2.1);
    scene.add(hemisphere);
    const sun = new THREE.DirectionalLight(0xffe6bf, 4.3);
    sun.position.set(-11, 22, 13);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.camera.near = 2;
    sun.shadow.camera.far = 60;
    sun.shadow.bias = -0.0006;
    sun.shadow.radius = 3;
    sun.shadow.blurSamples = 12;
    scene.add(sun);

    const waterGeometry = new THREE.PlaneGeometry(62, 48, 32, 24);
    waterGeometry.rotateX(-Math.PI / 2);
    const waterPositions = waterGeometry.getAttribute('position') as THREE.BufferAttribute;
    const baseWaterPositions = Float32Array.from(waterPositions.array as ArrayLike<number>);
    scene.add(createHarbor(waterGeometry));

    const actorVisuals = new Map<string, ActorVisual>();
    for (const actorId of ['R', 'B']) {
      const visual = createActorVisual(actorId);
      actorVisuals.set(actorId, visual);
      scene.add(visual.root);
    }

    const resize = (): void => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      const aspect = width / height;
      const frustum = CAMERA_FRUSTUM / stateRef.current.zoom;
      camera.left = -frustum * aspect / 2;
      camera.right = frustum * aspect / 2;
      camera.top = frustum / 2;
      camera.bottom = -frustum / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();
    let renderedZoom = stateRef.current.zoom;

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
    const animate = (): void => {
      timer.update();
      const elapsed = timer.getElapsed();
      const current = stateRef.current;
      if (current.zoom !== renderedZoom) {
        renderedZoom = current.zoom;
        resize();
      }
      const routeValue = current.plan[planKey('R', 'route')];
      const robotRoute = typeof routeValue === 'string' ? routeValue : 'crossing';
      const curves = routeCurves(robotRoute);
      const events = current.result.trace.filter((event): event is TraversalTraceEvent => event.kind === 'traversal');

      for (const [actorId, visual] of actorVisuals) {
        const state = actorStateAtBeat(actorId, curves[actorId]!, events, current.timelineBeat);
        visual.root.position.copy(state.position);
        visual.root.rotation.y = -Math.atan2(state.tangent.z, state.tangent.x);
        const selected = current.selectedActorId === actorId;
        visual.selection.visible = selected;
        visual.waitSignal.visible = state.waiting;
        if (!current.reducedMotion) {
          visual.root.position.y += Math.sin(elapsed * 2.2 + (actorId === 'B' ? 1.4 : 0)) * 0.025;
          visual.selection.scale.setScalar(1 + Math.sin(elapsed * 2.5) * 0.04);
          visual.waitSignal.rotation.z = elapsed * 0.8;
        }
      }

      if (!current.reducedMotion) {
        const positions = waterGeometry.getAttribute('position') as THREE.BufferAttribute;
        for (let index = 0; index < positions.count; index += 1) {
          const x = baseWaterPositions[index * 3]!;
          const z = baseWaterPositions[index * 3 + 2]!;
          positions.setY(index, Math.sin(x * 0.42 + elapsed * 0.52) * WATER_VERTEX_MOTION + Math.cos(z * 0.5 + elapsed * 0.35) * WATER_VERTEX_MOTION * 0.55 - 0.55);
        }
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
      frameSampleCount += 1;
      if (performance.now() - frameSampleStart >= 1000) {
        host.dataset.fps = String(Math.round(frameSampleCount * 1000 / (performance.now() - frameSampleStart)));
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
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material];
        objectMaterials.forEach((objectMaterial) => objectMaterial.dispose());
      });
      renderer.dispose();
      renderer.forceContextLoss();
      host.replaceChildren();
    };
  }, []);

  return <div className="harbor-scene harbor-scene-3d" ref={hostRef} data-renderer="three-webgl" />;
}

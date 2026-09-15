import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';
import { levelLayouts, type Point } from '../content/layouts';
import { planKey, type LevelDefinition, type Plan, type SimulationResult } from '../game/model';
import { ACTOR_LABELS } from '../config/product';

interface HarborSceneProps {
  readonly level: LevelDefinition;
  readonly plan: Plan;
  readonly result: SimulationResult;
  readonly eventIndex: number;
}

const WIDTH = 700;
const HEIGHT = 820;
const SCALE_X = WIDTH / 100;
const SCALE_Y = HEIGHT / 140;
const COLOR = {
  sky: 0xf7f8fc,
  water: 0xb9dfe5,
  waterLine: 0x89c4cf,
  paving: 0xe7e4dc,
  lane: 0xc7cbd2,
  laneEdge: 0x8c94a1,
  route: 0x2952cc,
  resource: 0xf6bf5a,
  ink: 0x1f2937,
  tree: 0x6d9b78,
  treeDark: 0x3f7052,
  bus: 0xe3a62f,
  robot: 0x4f72d8,
  cart: 0xc36d4b,
  white: 0xffffff,
} as const;

const point = (value: Point): Point => ({ x: value.x * SCALE_X, y: value.y * SCALE_Y });

const interpolatePath = (path: readonly Point[], progress: number): Point => {
  if (path.length < 2) {
    return path[0] ?? { x: 0, y: 0 };
  }
  const lengths = path.slice(1).map((next, index) => {
    const prior = path[index]!;
    return Math.hypot(next.x - prior.x, next.y - prior.y);
  });
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let remaining = Math.max(0, Math.min(1, progress)) * total;
  for (let index = 0; index < lengths.length; index += 1) {
    const length = lengths[index]!;
    if (remaining <= length) {
      const prior = path[index]!;
      const next = path[index + 1]!;
      const ratio = length === 0 ? 0 : remaining / length;
      return { x: prior.x + (next.x - prior.x) * ratio, y: prior.y + (next.y - prior.y) * ratio };
    }
    remaining -= length;
  }
  return path.at(-1)!;
};

const drawRoute = (container: Container, path: readonly Point[], selected: boolean): void => {
  const route = new Graphics();
  route.moveTo(path[0]!.x, path[0]!.y);
  for (const pathPoint of path.slice(1)) {
    route.lineTo(pathPoint.x, pathPoint.y);
  }
  route.stroke({ color: selected ? COLOR.route : COLOR.laneEdge, width: selected ? 8 : 4, alpha: selected ? 0.9 : 0.45 });
  container.addChild(route);
};

const drawBus = (position: Point): Container => {
  const bus = new Container({ x: position.x, y: position.y });
  const body = new Graphics().roundRect(-28, -16, 56, 32, 11).fill(COLOR.bus).stroke({ color: COLOR.ink, width: 3 });
  const windows = new Graphics()
    .roundRect(-18, -11, 13, 12, 3).fill(0xeaf7f8)
    .roundRect(1, -11, 13, 12, 3).fill(0xeaf7f8)
    .circle(-16, 17, 5).fill(COLOR.ink)
    .circle(16, 17, 5).fill(COLOR.ink);
  bus.addChild(body, windows);
  return bus;
};

const drawRobot = (position: Point): Container => {
  const robot = new Container({ x: position.x, y: position.y });
  const body = new Graphics()
    .roundRect(-18, -17, 36, 34, 10).fill(COLOR.robot).stroke({ color: COLOR.ink, width: 3 })
    .roundRect(-10, -25, 20, 13, 5).fill(COLOR.white).stroke({ color: COLOR.ink, width: 3 })
    .circle(-6, -19, 2).fill(COLOR.ink)
    .circle(6, -19, 2).fill(COLOR.ink)
    .roundRect(-12, 17, 24, 9, 4).fill(0x3a4657);
  const parcel = new Graphics().roundRect(10, -10, 17, 17, 3).fill(0xd9a66b).stroke({ color: 0x7a5132, width: 2 });
  robot.addChild(body, parcel);
  return robot;
};

const drawCart = (position: Point): Container => {
  const cart = new Container({ x: position.x, y: position.y });
  const body = new Graphics()
    .roundRect(-23, -14, 46, 28, 8).fill(COLOR.cart).stroke({ color: COLOR.ink, width: 3 })
    .circle(-14, 16, 5).fill(COLOR.ink)
    .circle(14, 16, 5).fill(COLOR.ink);
  const crates = new Graphics()
    .roundRect(-16, -21, 14, 13, 2).fill(0xe7bd75).stroke({ color: 0x7a5132, width: 2 })
    .roundRect(2, -21, 14, 13, 2).fill(0xdca963).stroke({ color: 0x7a5132, width: 2 });
  cart.addChild(body, crates);
  return cart;
};

const drawActor = (actorId: string, position: Point): Container => {
  if (actorId === 'B') return drawBus(position);
  if (actorId === 'R') return drawRobot(position);
  return drawCart(position);
};

const drawLandmark = (container: Container, kind: string): void => {
  const base = new Graphics();
  if (kind === 'market') {
    base.roundRect(380, 540, 130, 90, 10).fill(0xfff7e5).stroke({ color: 0x7a6b58, width: 3 });
    for (let index = 0; index < 5; index += 1) {
      base.rect(380 + index * 26, 540, 13, 24).fill(index % 2 === 0 ? 0xd4685b : COLOR.white);
    }
  } else if (kind === 'bridge') {
    base.roundRect(274, 300, 150, 38, 8).fill(0xb37a52).stroke({ color: 0x68472f, width: 4 });
    base.rect(292, 266, 12, 72).fill(0x68472f).rect(394, 266, 12, 72).fill(0x68472f);
  } else if (kind === 'pier') {
    base.roundRect(486, 585, 135, 42, 6).fill(0xb4845b).stroke({ color: 0x68472f, width: 3 });
    base.roundRect(548, 530, 105, 42, 18).fill(0xf2f5f6).stroke({ color: 0x526074, width: 3 });
  } else {
    base.roundRect(390, 550, 120, 78, 10).fill(0xe8dfd2).stroke({ color: 0x75695c, width: 3 });
    base.roundRect(423, 578, 54, 50, 6).fill(0x8da4ac);
  }
  container.addChild(base);
};

const createScene = (
  level: LevelDefinition,
  plan: Plan,
  result: SimulationResult,
  eventIndex: number,
): Container => {
  const layout = levelLayouts[level.id]!;
  const scene = new Container();
  const ground = new Graphics().rect(0, 0, WIDTH, HEIGHT).fill(COLOR.sky);
  const waterX = layout.waterEdge === 'left' ? 0 : WIDTH - 125;
  ground.rect(waterX, 0, 125, HEIGHT).fill(COLOR.water);
  for (let y = 24; y < HEIGHT; y += 42) {
    ground.moveTo(waterX + 15, y).bezierCurveTo(waterX + 40, y - 9, waterX + 75, y + 9, waterX + 106, y)
      .stroke({ color: COLOR.waterLine, width: 3, alpha: 0.55 });
  }
  ground.roundRect(92, 70, 510, 690, 34).fill(COLOR.paving).stroke({ color: 0xd1cfc8, width: 3 });
  scene.addChild(ground);

  drawLandmark(scene, layout.landmark);
  for (const treePoint of layout.trees) {
    const position = point(treePoint);
    const tree = new Graphics()
      .roundRect(position.x - 5, position.y, 10, 28, 4).fill(0x7e5a3b)
      .circle(position.x, position.y - 7, 22).fill(COLOR.treeDark)
      .circle(position.x - 12, position.y - 14, 16).fill(COLOR.tree)
      .circle(position.x + 13, position.y - 13, 17).fill(COLOR.tree);
    scene.addChild(tree);
  }

  for (const [resourceId, rawPosition] of Object.entries(layout.resourcePositions)) {
    const position = point(rawPosition);
    const resource = new Graphics()
      .roundRect(position.x - 42, position.y - 25, 84, 50, 13)
      .fill({ color: COLOR.resource, alpha: 0.72 })
      .stroke({ color: 0x8e641d, width: 3 });
    const label = new Text({ text: resourceId, style: { fill: COLOR.ink, fontFamily: 'system-ui', fontSize: 18, fontWeight: '700' } });
    label.anchor.set(0.5);
    label.position.set(position.x, position.y);
    scene.addChild(resource, label);
  }

  const currentEvent = result.trace.filter((event) => event.kind === 'traversal')[eventIndex];
  const currentBeat = currentEvent?.end ?? 0;
  for (const actor of level.actors) {
    const chosenRoute = plan[planKey(actor.id, 'route')];
    const routeId = typeof chosenRoute === 'string' ? chosenRoute : actor.defaultRoute;
    const route = actor.routes[routeId]!;
    const configuredBends = layout.routeBends[`${actor.id}.${routeId}`] ?? [];
    const resourcePoints = route
      .map(([resourceId]) => resourceId === null ? undefined : layout.resourcePositions[resourceId])
      .filter((value): value is Point => value !== undefined);
    const rawPath = [layout.actorStarts[actor.id]!, ...(configuredBends.length > 0 ? configuredBends : resourcePoints), layout.actorEnds[actor.id]!];
    const path = rawPath.map(point);
    drawRoute(scene, path, true);
    const arrival = result.arrivals[actor.id]!;
    const position = interpolatePath(path, arrival === 0 ? 1 : currentBeat / arrival);
    const actorGraphic = drawActor(actor.id, position);
    const actorLabel = new Text({ text: ACTOR_LABELS[actor.id] ?? actor.id, style: { fill: COLOR.ink, fontFamily: 'system-ui', fontSize: 16, fontWeight: '600' } });
    actorLabel.anchor.set(0.5, 1);
    actorLabel.position.set(position.x, position.y - 31);
    scene.addChild(actorGraphic, actorLabel);
  }
  return scene;
};

export function HarborScene({ level, plan, result, eventIndex }: HarborSceneProps) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    let disposed = false;
    const app = new Application();

    void (async () => {
      await app.init({ width: WIDTH, height: HEIGHT, antialias: true, background: '#F7F8FC', autoStart: false, resolution: Math.min(window.devicePixelRatio, 2) });
      if (disposed) {
        app.destroy(true);
        return;
      }
      app.canvas.setAttribute('aria-hidden', 'true');
      host.replaceChildren(app.canvas);
      app.stage.addChild(createScene(level, plan, result, eventIndex));
      app.render();
    })();

    return () => {
      disposed = true;
      app.destroy(true, { children: true });
    };
  }, [eventIndex, level, plan, result]);

  return <div className="harbor-scene" ref={hostRef} />;
}

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { deflateSync } from 'node:zlib';

type Color = readonly [number, number, number, number];
const COLORS = {
  background: [247, 248, 252, 255], water: [185, 223, 229, 255], blue: [41, 82, 204, 255],
  ink: [31, 41, 55, 255], yellow: [227, 166, 47, 255], coral: [195, 109, 75, 255], white: [255, 255, 255, 255],
} as const satisfies Record<string, Color>;

const crcTable = Array.from({ length: 256 }, (_, value) => {
  let current = value;
  for (let bit = 0; bit < 8; bit += 1) current = (current & 1) === 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
  return current >>> 0;
});

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (name: string, data: Uint8Array): Buffer => {
  const type = Buffer.from(name, 'ascii');
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc32(Buffer.concat([type, data])));
  return Buffer.concat([size, type, data, checksum]);
};

class Canvas {
  readonly pixels: Uint8Array;
  constructor(readonly width: number, readonly height: number, color: Color) {
    this.pixels = new Uint8Array(width * height * 4);
    for (let index = 0; index < width * height; index += 1) this.setPixel(index % width, Math.floor(index / width), color);
  }
  setPixel(x: number, y: number, color: Color): void {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const index = (Math.floor(y) * this.width + Math.floor(x)) * 4;
    this.pixels.set(color, index);
  }
  rect(x: number, y: number, width: number, height: number, color: Color): void {
    for (let py = y; py < y + height; py += 1) for (let px = x; px < x + width; px += 1) this.setPixel(px, py, color);
  }
  circle(cx: number, cy: number, radius: number, color: Color): void {
    for (let y = cy - radius; y <= cy + radius; y += 1) for (let x = cx - radius; x <= cx + radius; x += 1) if ((x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2) this.setPixel(x, y, color);
  }
  ring(cx: number, cy: number, radius: number, thickness: number, color: Color): void {
    const inner = (radius - thickness) ** 2; const outer = radius ** 2;
    for (let y = cy - radius; y <= cy + radius; y += 1) for (let x = cx - radius; x <= cx + radius; x += 1) { const distance = (x - cx) ** 2 + (y - cy) ** 2; if (distance >= inner && distance <= outer) this.setPixel(x, y, color); }
  }
  png(): Buffer {
    const header = Buffer.alloc(13); header.writeUInt32BE(this.width, 0); header.writeUInt32BE(this.height, 4); header.set([8, 6, 0, 0, 0], 8);
    const raw = Buffer.alloc((this.width * 4 + 1) * this.height);
    for (let y = 0; y < this.height; y += 1) { const offset = y * (this.width * 4 + 1); raw[offset] = 0; raw.set(this.pixels.subarray(y * this.width * 4, (y + 1) * this.width * 4), offset + 1); }
    return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array())]);
  }
}

const createIcon = (size: number, maskable: boolean): Buffer => {
  const canvas = new Canvas(size, size, COLORS.blue); const center = size / 2; const scale = maskable ? 0.72 : 0.9;
  canvas.circle(center, center, size * 0.34 * scale, COLORS.background);
  canvas.ring(center, center, size * 0.25 * scale, size * 0.035, COLORS.water);
  canvas.ring(center, center, size * 0.15 * scale, size * 0.035, COLORS.blue);
  canvas.circle(center, center, size * 0.04 * scale, COLORS.yellow);
  return canvas.png();
};

const writeAsset = async (path: string, data: Buffer): Promise<void> => { await mkdir(dirname(path), { recursive: true }); await writeFile(path, data); };
const root = process.cwd();
await writeAsset(join(root, 'public/icons/icon-192.png'), createIcon(192, false));
await writeAsset(join(root, 'public/icons/icon-512.png'), createIcon(512, false));
await writeAsset(join(root, 'public/icons/icon-maskable-192.png'), createIcon(192, true));
await writeAsset(join(root, 'public/icons/icon-maskable-512.png'), createIcon(512, true));
await writeAsset(join(root, 'public/favicon.png'), createIcon(64, false));
await writeAsset(join(root, 'public/favicon-32.png'), createIcon(32, false));
await writeAsset(join(root, 'public/apple-touch-icon.png'), createIcon(180, false));
console.log('Generated original RIPPLE PNG icons.');

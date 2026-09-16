import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { basename, join, relative, sep } from 'node:path';
import { PRODUCT } from '../src/config/product';

interface ZipEntry {
  readonly path: string;
  readonly data: Buffer;
  readonly crc: number;
  readonly offset: number;
}

const RELEASE_DIR = 'release/packages';
const ROOT_RELEASE_DIR = 'release';
const CRC_TABLE = Array.from({ length: 256 }, (_, value) => {
  let crc = value;
  for (let bit = 0; bit < 8; bit += 1) crc = (crc & 1) === 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});

const crc32 = (data: Buffer): number => {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

const collect = async (root: string, path = root): Promise<readonly { path: string; data: Buffer }[]> => {
  const entries = await readdir(path);
  const files = await Promise.all(entries.sort().map(async (name) => {
    const child = join(path, name);
    return (await stat(child)).isDirectory() ? collect(root, child) : [{ path: relative(root, child).split(sep).join('/'), data: await readFile(child) }];
  }));
  return files.flat();
};

const makeZip = (files: readonly { path: string; data: Buffer }[]): Buffer => {
  const localParts: Buffer[] = [];
  const entries: ZipEntry[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.path);
    const crc = crc32(file.data);
    const header = Buffer.alloc(30);
    header.writeUInt32LE(0x04034b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt32LE(crc, 14);
    header.writeUInt32LE(file.data.length, 18);
    header.writeUInt32LE(file.data.length, 22);
    header.writeUInt16LE(name.length, 26);
    localParts.push(header, name, file.data);
    entries.push({ ...file, crc, offset });
    offset += header.length + name.length + file.data.length;
  }
  const centralParts: Buffer[] = [];
  let centralSize = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.path);
    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt32LE(entry.crc, 16);
    header.writeUInt32LE(entry.data.length, 20);
    header.writeUInt32LE(entry.data.length, 24);
    header.writeUInt16LE(name.length, 28);
    header.writeUInt32LE(entry.offset, 42);
    centralParts.push(header, name);
    centralSize += header.length + name.length;
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralSize, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...localParts, ...centralParts, end]);
};

const licensePackages = ['three', 'react', 'react-dom', 'workbox-core', 'workbox-window'];
const notices: string[] = ['RIPPLE third-party notices', ''];
for (const packageName of licensePackages) {
  const packageDirectory = join('node_modules', ...packageName.split('/'));
  const licensePath = join(packageDirectory, 'LICENSE');
  try {
    notices.push(`# ${packageName}`, '', await readFile(licensePath, 'utf8'), '');
  } catch {
    notices.push(`# ${packageName}`, '', `See the ${packageName} package metadata for its license.`, '');
  }
}

await mkdir(RELEASE_DIR, { recursive: true });
const noticesData = Buffer.from(`${notices.join('\n').trim()}\n`);
const webFiles = [...await collect('dist'), { path: 'THIRD_PARTY_NOTICES.txt', data: noticesData }];
const itchFiles = (await collect('dist-itch')).map((file) => ({ ...file, path: file.path === 'itch.html' ? 'index.html' : file.path }));
itchFiles.push({ path: 'THIRD_PARTY_NOTICES.txt', data: noticesData });

const archives = [
  { name: `ripple-web-${PRODUCT.version}.zip`, releaseName: 'ripple-web-v1.zip', data: makeZip(webFiles) },
  { name: `ripple-itch-html5-${PRODUCT.version}.zip`, releaseName: 'ripple-itch-html5-v1.zip', data: makeZip(itchFiles) },
];
const manifest = archives.map(({ name, data }) => ({ file: name, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') }));
for (const archive of archives) await writeFile(join(RELEASE_DIR, archive.name), archive.data);
await writeFile(join(RELEASE_DIR, 'release-manifest.json'), `${JSON.stringify({ version: PRODUCT.version, files: manifest }, null, 2)}\n`);
await writeFile(join(RELEASE_DIR, 'SHA256SUMS.txt'), `${manifest.map((item) => `${item.sha256}  ${basename(item.file)}`).join('\n')}\n`);
const rootManifest = archives.map(({ releaseName, data }) => ({ file: releaseName, bytes: data.length, sha256: createHash('sha256').update(data).digest('hex') }));
for (const archive of archives) await writeFile(join(ROOT_RELEASE_DIR, archive.releaseName), archive.data);
await writeFile(join(ROOT_RELEASE_DIR, 'release-manifest.json'), `${JSON.stringify({ version: PRODUCT.version, files: rootManifest }, null, 2)}\n`);
await writeFile(join(ROOT_RELEASE_DIR, 'SHA256SUMS.txt'), `${rootManifest.map((item) => `${item.sha256}  ${basename(item.file)}`).join('\n')}\n`);
console.log(`Packaged ${archives.length} release archives with checksums.`);

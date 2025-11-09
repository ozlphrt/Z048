const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

const OUTPUT_DIR = path.resolve(__dirname, "../apps/web_app/public/icons");

function crc32(buf) {
  let crc = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return ~crc >>> 0;
}

function pngChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const chunkType = Buffer.from(type, "ascii");
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc32(Buffer.concat([chunkType, data])), 0);
  return Buffer.concat([length, chunkType, data, crcBuffer]);
}

function gradientColor(x, y, size) {
  const t = (x + y) / (2 * (size - 1));
  const start = [110, 168, 255];
  const mid = [143, 132, 255];
  const end = [255, 140, 107];
  const blend = t < 0.5 ? mid.map((m, i) => start[i] + (m - start[i]) * (t / 0.5)) : end.map(
    (e, i) => mid[i] + (e - mid[i]) * ((t - 0.5) / 0.5)
  );
  return blend.map((value) => Math.round(Math.max(0, Math.min(255, value))));
}

function createIcon(size, filename) {
  const bytesPerPixel = 4;
  const stride = bytesPerPixel * size + 1;
  const raw = Buffer.alloc(stride * size);

  for (let y = 0; y < size; y += 1) {
    const rowOffset = y * stride;
    raw[rowOffset] = 0; // filter type 0
    for (let x = 0; x < size; x += 1) {
      const offset = rowOffset + 1 + x * bytesPerPixel;
      const [r, g, b] = gradientColor(x, y, size);
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const compressed = zlib.deflateSync(raw, { level: 9 });

  const pngBuffers = [
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0))
  ];

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, filename), Buffer.concat(pngBuffers));
}

createIcon(192, "icon-192.png");
createIcon(512, "icon-512.png");

console.log("Generated PWA icons:", path.relative(process.cwd(), OUTPUT_DIR));


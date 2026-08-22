export interface Hotspot {
  number: number;
  x: number; // パーセント(0-100)
  y: number; // パーセント(0-100)
}

interface ZoneHotspot {
  zone: number;
  x: number;
  y: number;
}

// 会場全体マップ(overview.png)の①〜⑧エリアの位置
// ①はギャラリーブース、②はストリートブース、③〜⑧はスカイブースへ
export const OVERVIEW_HOTSPOTS: ZoneHotspot[] = [
  { zone: 1, x: 26.9, y: 59.8 },
  { zone: 2, x: 49.2, y: 47.9 },
  { zone: 3, x: 43.2, y: 59.8 },
  { zone: 4, x: 41.4, y: 55.4 },
  { zone: 5, x: 56.2, y: 63.8 },
  { zone: 6, x: 55.3, y: 58.6 },
  { zone: 7, x: 45.8, y: 37.3 },
  { zone: 8, x: 48.1, y: 32.4 },
];

export function zoneTarget(zone: number): string {
  if (zone === 1) return "/map/gallery";
  if (zone === 2) return "/map/street";
  if (zone === 3 || zone === 4) return "/map/sky-3-4";
  if (zone === 5 || zone === 6) return "/map/sky-5-6";
  return "/map/sky-7-8";
}

// ① ギャラリーブース(1〜40番): 整然としたグリッド配置
function buildGalleryHotspots(): Hotspot[] {
  const colX = [33.1, 41.15, 60.1, 68.4]; // 1-10 / 11-20 / 21-30 / 31-40
  const rowY = [29.4, 35.15, 41.0, 46.85, 52.45, 58.55, 64.25, 69.9, 75.55, 81.25];
  const hotspots: Hotspot[] = [];
  colX.forEach((x, colIdx) => {
    rowY.forEach((y, rowIdx) => {
      hotspots.push({ number: colIdx * 10 + rowIdx + 1, x, y });
    });
  });
  return hotspots;
}
export const GALLERY_HOTSPOTS: Hotspot[] = buildGalleryHotspots();

// ② ストリートブース(41〜90番): 複数のクラスタに分かれた配置
export const STREET_HOTSPOTS: Hotspot[] = [
  { number: 41, x: 7.13, y: 42.87 }, { number: 42, x: 9.43, y: 42.86 }, { number: 43, x: 11.57, y: 42.81 },
  { number: 44, x: 13.82, y: 42.85 }, { number: 45, x: 16.02, y: 42.86 }, { number: 46, x: 18.19, y: 42.86 },
  { number: 47, x: 20.39, y: 42.85 }, { number: 48, x: 22.70, y: 42.86 }, { number: 49, x: 24.82, y: 42.80 },
  { number: 50, x: 27.11, y: 42.82 }, { number: 51, x: 29.17, y: 42.79 }, { number: 52, x: 31.44, y: 42.89 },
  { number: 53, x: 33.64, y: 42.85 }, { number: 54, x: 35.93, y: 42.87 }, { number: 55, x: 38.11, y: 42.86 },
  { number: 56, x: 45.98, y: 42.68 }, { number: 57, x: 48.22, y: 42.58 }, { number: 58, x: 50.49, y: 42.65 },
  { number: 59, x: 52.69, y: 42.59 }, { number: 60, x: 54.92, y: 42.68 }, { number: 61, x: 57.04, y: 42.73 },
  { number: 62, x: 59.83, y: 46.43 }, { number: 63, x: 59.85, y: 49.18 }, { number: 64, x: 59.82, y: 51.99 },
  { number: 65, x: 59.88, y: 54.70 },
  { number: 66, x: 62.02, y: 57.69 }, { number: 67, x: 64.18, y: 57.63 }, { number: 68, x: 66.37, y: 57.61 },
  { number: 69, x: 68.58, y: 57.57 }, { number: 70, x: 72.11, y: 57.59 }, { number: 71, x: 74.22, y: 57.54 },
  { number: 72, x: 76.45, y: 57.57 }, { number: 73, x: 78.62, y: 57.55 }, { number: 74, x: 80.83, y: 57.60 },
  { number: 75, x: 83.06, y: 57.60 }, { number: 76, x: 85.20, y: 57.60 }, { number: 77, x: 87.32, y: 57.52 },
  { number: 78, x: 89.60, y: 57.60 }, { number: 79, x: 91.73, y: 57.57 }, { number: 80, x: 93.86, y: 57.62 },
  { number: 81, x: 69.88, y: 65.40 }, { number: 82, x: 69.88, y: 68.19 }, { number: 83, x: 69.88, y: 70.95 },
  { number: 84, x: 69.90, y: 73.81 }, { number: 85, x: 69.88, y: 76.68 }, { number: 86, x: 69.86, y: 79.46 },
  { number: 87, x: 69.86, y: 82.18 }, { number: 88, x: 69.88, y: 84.98 }, { number: 89, x: 69.88, y: 87.74 },
  { number: 90, x: 69.91, y: 90.45 },
];

// ③④ スカイブース(91〜100番): sky-3-4.jpg
export const SKY_3_4_HOTSPOTS: Hotspot[] = [
  { number: 96, x: 30.5, y: 29.1 },
  { number: 95, x: 37.7, y: 29.1 },
  { number: 94, x: 44.7, y: 29.2 },
  { number: 93, x: 63.9, y: 28.4 },
  { number: 92, x: 64.0, y: 33.5 },
  { number: 91, x: 63.5, y: 38.4 },
  { number: 97, x: 49.2, y: 71.1 },
  { number: 99, x: 69.6, y: 71.0 },
  { number: 98, x: 49.3, y: 77.7 },
  { number: 100, x: 69.6, y: 77.9 },
];

// ⑤⑥ スカイブース(101〜114番): sky-5-6.jpg
export const SKY_5_6_HOTSPOTS: Hotspot[] = [
  { number: 111, x: 31.1, y: 25.3 },
  { number: 112, x: 41.3, y: 25.4 },
  { number: 113, x: 51.0, y: 25.5 },
  { number: 114, x: 60.5, y: 25.4 },
  { number: 109, x: 44.2, y: 37.7 },
  { number: 110, x: 51.5, y: 37.7 },
  { number: 108, x: 31.7, y: 50.2 },
  { number: 107, x: 41.1, y: 50.1 },
  { number: 106, x: 50.7, y: 50.2 },
  { number: 103, x: 73.1, y: 61.9 },
  { number: 101, x: 53.5, y: 68.2 },
  { number: 104, x: 72.9, y: 68.3 },
  { number: 102, x: 53.8, y: 74.6 },
  { number: 105, x: 73.0, y: 74.6 },
];

// ⑦⑧ スカイブース(115〜135番): sky-7-8.jpg
export const SKY_7_8_HOTSPOTS: Hotspot[] = [
  { number: 124, x: 28.5, y: 28.1 },
  { number: 135, x: 72.8, y: 28.0 },
  { number: 123, x: 28.5, y: 34.8 },
  { number: 127, x: 47.0, y: 34.7 },
  { number: 130, x: 54.2, y: 34.8 },
  { number: 134, x: 72.7, y: 34.9 },
  { number: 122, x: 28.4, y: 41.5 },
  { number: 126, x: 47.1, y: 41.6 },
  { number: 129, x: 54.1, y: 41.6 },
  { number: 133, x: 72.7, y: 41.5 },
  { number: 121, x: 28.0, y: 48.2 },
  { number: 125, x: 47.1, y: 48.3 },
  { number: 128, x: 54.1, y: 48.3 },
  { number: 132, x: 72.6, y: 48.3 },
  { number: 120, x: 28.5, y: 55.0 },
  { number: 131, x: 72.2, y: 55.0 },
  { number: 116, x: 28.4, y: 69.7 },
  { number: 119, x: 53.5, y: 71.9 },
  { number: 115, x: 28.6, y: 76.1 },
  { number: 118, x: 53.6, y: 78.7 },
  { number: 117, x: 53.2, y: 85.5 },
];

export function getBoothMapUrl(boothNumber: string | number): string {
  const n = Number(boothNumber);
  if (n >= 1 && n <= 40) return `/map/gallery?booth=${n}`;
  if (n >= 41 && n <= 90) return `/map/street?booth=${n}`;
  if (n >= 91 && n <= 100) return `/map/sky-3-4?booth=${n}`;
  if (n >= 101 && n <= 114) return `/map/sky-5-6?booth=${n}`;
  return `/map/sky-7-8?booth=${n}`;
}

export function findHotspot(boothNumber: number): Hotspot | null {
  const all = [...GALLERY_HOTSPOTS, ...STREET_HOTSPOTS, ...SKY_3_4_HOTSPOTS, ...SKY_5_6_HOTSPOTS, ...SKY_7_8_HOTSPOTS];
  return all.find(h => h.number === boothNumber) ?? null;
}

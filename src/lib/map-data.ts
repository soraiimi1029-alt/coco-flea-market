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

function linspace(start: number, end: number, count: number): number[] {
  if (count === 1) return [start];
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, i) => start + step * i);
}

// 会場全体マップ(overview.png)の①〜⑦エリアの位置
// ①はギャラリーブース、②はストリートブース、③〜⑦はスカイブースへ
export const OVERVIEW_HOTSPOTS: ZoneHotspot[] = [
  { zone: 1, x: 30.5, y: 58.0 },
  { zone: 2, x: 53.3, y: 42.5 },
  { zone: 2, x: 44.6, y: 58.8 },
  { zone: 3, x: 43.5, y: 52.9 },
  { zone: 4, x: 55.8, y: 60.7 },
  { zone: 5, x: 54.8, y: 56.5 },
  { zone: 6, x: 47.0, y: 39.5 },
  { zone: 7, x: 48.8, y: 35.3 },
];

export function zoneTarget(zone: number): string {
  if (zone === 1) return "/map/gallery";
  if (zone === 2) return "/map/street";
  return "/map/sky";
}

// ① ギャラリーブース(1〜40番): 整然としたグリッド配置
function buildGalleryHotspots(): Hotspot[] {
  const colX = [34.2, 43.3, 62.7, 71.7]; // 1-10 / 11-20 / 21-30 / 31-40
  const rowY = linspace(27.2, 84.1, 10);
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
function buildStreetHotspots(): Hotspot[] {
  const hotspots: Hotspot[] = [];
  linspace(5.4, 37, 15).forEach((x, i) => hotspots.push({ number: 41 + i, x, y: 50.6 }));
  linspace(42.6, 54.8, 6).forEach((x, i) => hotspots.push({ number: 56 + i, x, y: 50.6 }));
  linspace(49.3, 60.5, 4).forEach((y, i) => hotspots.push({ number: 62 + i, x: 59.2, y }));
  linspace(59.2, 68, 4).forEach((x, i) => hotspots.push({ number: 66 + i, x, y: 62.0 }));
  linspace(70.2, 93.8, 11).forEach((x, i) => hotspots.push({ number: 70 + i, x, y: 62.0 }));
  linspace(70.1, 97.2, 10).forEach((y, i) => hotspots.push({ number: 81 + i, x: 69.1, y }));
  return hotspots;
}
export const STREET_HOTSPOTS: Hotspot[] = buildStreetHotspots();

// ③〜⑦ スカイブース(91〜135番): 3つのグループに分かれた配置
function buildSkyHotspots(): Hotspot[] {
  const hotspots: Hotspot[] = [];

  // グループ3(91-100)
  [96, 95, 94].forEach((num, i) => hotspots.push({ number: num, x: linspace(9.6, 15.2, 3)[i], y: 34.8 }));
  [93, 92, 91].forEach((num, i) => hotspots.push({ number: num, x: 23.2, y: [34.1, 38.2, 42.7][i] }));
  hotspots.push({ number: 97, x: 16.8, y: 71.2 });
  hotspots.push({ number: 99, x: 25.3, y: 71.2 });
  hotspots.push({ number: 98, x: 16.8, y: 75.7 });
  hotspots.push({ number: 100, x: 25.3, y: 75.7 });

  // グループ5(101-114)
  [111, 112, 113, 114].forEach((num, i) => hotspots.push({ number: num, x: linspace(42.1, 54.3, 4)[i], y: 34.8 }));
  [109, 110].forEach((num, i) => hotspots.push({ number: num, x: [46.4, 49.7][i], y: 45.2 }));
  [108, 107, 106].forEach((num, i) => hotspots.push({ number: num, x: linspace(42.1, 50.2, 3)[i], y: 55.9 }));
  [103, 104, 105].forEach((num, i) => hotspots.push({ number: num, x: 59.5, y: [66.4, 71.8, 77.3][i] }));
  [101, 102].forEach((num, i) => hotspots.push({ number: num, x: 51.5, y: [71.8, 77.3][i] }));

  // グループ7(115-135)
  hotspots.push({ number: 124, x: 73.5, y: 36.4 });
  [123, 122, 121, 120].forEach((num, i) => hotspots.push({ number: num, x: 73.5, y: [41.8, 47.1, 52.5, 57.7][i] }));
  hotspots.push({ number: 135, x: 91.7, y: 36.4 });
  [134, 133, 132, 131].forEach((num, i) => hotspots.push({ number: num, x: 91.7, y: [41.8, 47.1, 52.5, 57.7][i] }));
  [127, 130].forEach((num, i) => hotspots.push({ number: num, x: [80.6, 84.0][i], y: 41.8 }));
  [126, 129].forEach((num, i) => hotspots.push({ number: num, x: [80.6, 84.0][i], y: 47.1 }));
  [125, 128].forEach((num, i) => hotspots.push({ number: num, x: [80.6, 84.0][i], y: 52.5 }));
  hotspots.push({ number: 116, x: 73.5, y: 72.5 });
  hotspots.push({ number: 115, x: 73.5, y: 78.0 });
  [119, 118, 117].forEach((num, i) => hotspots.push({ number: num, x: 83.1, y: [74.4, 79.8, 85.3][i] }));

  return hotspots;
}
export const SKY_HOTSPOTS: Hotspot[] = buildSkyHotspots();

export function getBoothMapUrl(boothNumber: string | number): string {
  const n = Number(boothNumber);
  if (n >= 1 && n <= 40) return `/map/gallery?booth=${n}`;
  if (n >= 41 && n <= 90) return `/map/street?booth=${n}`;
  return `/map/sky?booth=${n}`;
}

export function findHotspot(boothNumber: number): Hotspot | null {
  const all = [...GALLERY_HOTSPOTS, ...STREET_HOTSPOTS, ...SKY_HOTSPOTS];
  return all.find(h => h.number === boothNumber) ?? null;
}

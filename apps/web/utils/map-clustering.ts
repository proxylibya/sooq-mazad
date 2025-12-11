/**
 * نظام Clustering للخرائط لتحسين الأداء مع البيانات الكبيرة
 */

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  data?: any;
}

export interface Cluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  points: MapPoint[];
}

export interface Bounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * حساب المسافة بين نقطتين (بالكيلومتر)
 */
export function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * تحقق من وجود نقطة ضمن حدود معينة
 */
export function isPointInBounds(point: MapPoint, bounds: Bounds): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

/**
 * حساب مستوى التكبير المناسب لعدد النقاط
 */
export function calculateOptimalZoom(pointCount: number): number {
  if (pointCount <= 10) return 12;
  if (pointCount <= 50) return 10;
  if (pointCount <= 200) return 8;
  if (pointCount <= 1000) return 6;
  return 5;
}

/**
 * Grid-based clustering - سريع وفعال
 */
export class GridClusterer {
  private gridSize: number;

  constructor(gridSize: number = 60) {
    this.gridSize = gridSize;
  }

  /**
   * تجميع النقاط في clusters
   */
  cluster(points: MapPoint[], zoom: number): Cluster[] {
    const clusters = new Map<string, Cluster>();

    // حساب حجم الشبكة بناءً على مستوى التكبير
    const adjustedGridSize = this.gridSize / Math.pow(2, zoom);

    points.forEach((point) => {
      // حساب مفتاح الشبكة
      const gridX = Math.floor(point.lat / adjustedGridSize);
      const gridY = Math.floor(point.lng / adjustedGridSize);
      const gridKey = `${gridX}_${gridY}`;

      if (clusters.has(gridKey)) {
        const cluster = clusters.get(gridKey)!;
        cluster.count++;
        cluster.points.push(point);

        // تحديث مركز الـ cluster
        cluster.lat = cluster.points.reduce((sum, p) => sum + p.lat, 0) / cluster.points.length;
        cluster.lng = cluster.points.reduce((sum, p) => sum + p.lng, 0) / cluster.points.length;
      } else {
        clusters.set(gridKey, {
          id: gridKey,
          lat: point.lat,
          lng: point.lng,
          count: 1,
          points: [point],
        });
      }
    });

    return Array.from(clusters.values());
  }

  /**
   * تصفية النقاط ضمن حدود معينة
   */
  filterByBounds(points: MapPoint[], bounds: Bounds): MapPoint[] {
    return points.filter((point) => isPointInBounds(point, bounds));
  }
}

/**
 * K-means clustering - أكثر دقة لكن أبطأ
 */
export class KMeansClusterer {
  private maxIterations: number;

  constructor(maxIterations: number = 10) {
    this.maxIterations = maxIterations;
  }

  /**
   * تجميع النقاط باستخدام K-means
   */
  cluster(points: MapPoint[], k: number): Cluster[] {
    if (points.length === 0) return [];
    if (points.length <= k) {
      return points.map((point) => ({
        id: point.id,
        lat: point.lat,
        lng: point.lng,
        count: 1,
        points: [point],
      }));
    }

    // اختيار مراكز أولية عشوائية
    let centroids = this.initializeCentroids(points, k);
    let clusters: Cluster[] = [];

    for (let i = 0; i < this.maxIterations; i++) {
      // تعيين النقاط إلى أقرب مركز
      clusters = this.assignPointsToCentroids(points, centroids);

      // حساب مراكز جديدة
      const newCentroids = clusters.map((cluster) => ({
        lat: cluster.points.reduce((sum, p) => sum + p.lat, 0) / cluster.points.length,
        lng: cluster.points.reduce((sum, p) => sum + p.lng, 0) / cluster.points.length,
      }));

      // التحقق من التقارب
      if (this.hasConverged(centroids, newCentroids)) {
        break;
      }

      centroids = newCentroids;
    }

    return clusters;
  }

  private initializeCentroids(points: MapPoint[], k: number) {
    const shuffled = [...points].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, k).map((p) => ({ lat: p.lat, lng: p.lng }));
  }

  private assignPointsToCentroids(
    points: MapPoint[],
    centroids: { lat: number; lng: number }[],
  ): Cluster[] {
    const clusters: Cluster[] = centroids.map((c, i) => ({
      id: `cluster_${i}`,
      lat: c.lat,
      lng: c.lng,
      count: 0,
      points: [],
    }));

    points.forEach((point) => {
      let minDistance = Infinity;
      let closestClusterIndex = 0;

      centroids.forEach((centroid, i) => {
        const distance = getDistance(point.lat, point.lng, centroid.lat, centroid.lng);
        if (distance < minDistance) {
          minDistance = distance;
          closestClusterIndex = i;
        }
      });

      clusters[closestClusterIndex].points.push(point);
      clusters[closestClusterIndex].count++;
    });

    return clusters.filter((c) => c.count > 0);
  }

  private hasConverged(
    oldCentroids: { lat: number; lng: number }[],
    newCentroids: { lat: number; lng: number }[],
  ): boolean {
    const threshold = 0.0001;
    return oldCentroids.every((old, i) => {
      const distance = getDistance(old.lat, old.lng, newCentroids[i].lat, newCentroids[i].lng);
      return distance < threshold;
    });
  }
}

/**
 * مدير الـ clustering الذكي
 */
export class SmartClusterManager {
  private gridClusterer: GridClusterer;
  private cache: Map<string, Cluster[]>;

  constructor(gridSize: number = 60) {
    this.gridClusterer = new GridClusterer(gridSize);
    this.cache = new Map();
  }

  /**
   * تجميع النقاط بناءً على مستوى التكبير
   */
  clusterPoints(points: MapPoint[], zoom: number, bounds?: Bounds): Cluster[] {
    // تصفية النقاط إذا كانت هناك حدود
    const filteredPoints = bounds ? this.gridClusterer.filterByBounds(points, bounds) : points;

    // التحقق من الـ cache
    const cacheKey = this.getCacheKey(filteredPoints, zoom);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // اختيار استراتيجية التجميع بناءً على عدد النقاط ومستوى التكبير
    let clusters: Cluster[];

    if (filteredPoints.length > 1000 || zoom < 10) {
      // استخدام Grid clustering للبيانات الكبيرة
      clusters = this.gridClusterer.cluster(filteredPoints, zoom);
    } else if (zoom >= 14) {
      // عرض النقاط الفردية في التكبير العالي
      clusters = filteredPoints.map((point) => ({
        id: point.id,
        lat: point.lat,
        lng: point.lng,
        count: 1,
        points: [point],
      }));
    } else {
      // استخدام Grid clustering للمستويات المتوسطة
      clusters = this.gridClusterer.cluster(filteredPoints, zoom);
    }

    // حفظ في الـ cache
    this.cache.set(cacheKey, clusters);

    // تنظيف الـ cache إذا كان كبيرًا جدًا
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    return clusters;
  }

  private getCacheKey(points: MapPoint[], zoom: number): string {
    return `${points.length}_${zoom}`;
  }

  /**
   * مسح الـ cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

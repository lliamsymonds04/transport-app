declare module 'leaflet.markercluster' {
  import * as L from 'leaflet';
  
  export interface MarkerClusterGroupOptions extends L.LayerOptions {
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    spiderfyOnMaxZoom?: boolean;
    removeOutsideVisibleBounds?: boolean;
    animate?: boolean;
    animateAddingMarkers?: boolean;
    disableClusteringAtZoom?: number;
    maxClusterRadius?: number | ((zoom: number) => number);
    polygonOptions?: L.PolylineOptions;
    singleMarkerMode?: boolean;
    spiderLegPolylineOptions?: L.PolylineOptions;
    spiderfyDistanceMultiplier?: number;
    iconCreateFunction?: (cluster: L.MarkerCluster) => L.Icon | L.DivIcon;
    chunkedLoading?: boolean;
    chunkDelay?: number;
    chunkProgress?: (processed: number, total: number, elapsed: number) => void;
  }

  export interface MarkerCluster extends L.Marker {
    getChildCount(): number;
    getAllChildMarkers(): L.Marker[];
    zoomToBounds(options?: L.FitBoundsOptions): void;
  }

  export interface MarkerClusterGroup extends L.FeatureGroup {
    addLayer(layer: L.Layer): this;
    removeLayer(layer: L.Layer): this;
    clearLayers(): this;
    hasLayer(layer: L.Layer): boolean;
    refreshClusters(layers?: L.Layer | L.Layer[]): this;
    getVisibleParent(marker: L.Marker): L.Marker;
    zoomToShowLayer(layer: L.Layer, callback?: () => void): void;
  }

  export function markerClusterGroup(options?: MarkerClusterGroupOptions): MarkerClusterGroup;
}
//
// declare module 'leaflet' {
//   export function markerClusterGroup(options?: import('leaflet.markercluster').MarkerClusterGroupOptions): import('leaflet.markercluster').MarkerClusterGroup;
// }

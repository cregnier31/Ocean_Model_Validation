import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { drifters, eddies } from '../data';

type Props = { mode: 'overview' | 'lagrangian' | 'eddy' | 'diagnostics'; };
const lineFeatures = drifters.map(d => ({
  type: 'Feature' as const,
  properties: { name: d.name, color: d.color },
  geometry: { type: 'LineString' as const, coordinates: d.coordinates },
}));
const circlePolygon = (lon: number, lat: number, radiusKm: number) => {
  const coords: number[][] = [];
  for (let i=0;i<=64;i++) {
    const angle = i / 64 * Math.PI * 2;
    coords.push([lon + Math.cos(angle) * radiusKm / (111.32 * Math.cos(lat * Math.PI / 180)),lat + Math.sin(angle) * radiusKm / 111.32]);
  }
  return coords;
};

export default function OceanMap({mode}: Props) {
  const el = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  useEffect(() => {
    if (!el.current) return;
    const map = new maplibregl.Map({
      container: el.current,
      style: {
        version: 8,
        sources: { osm: {type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256, attribution: '© OpenStreetMap contributors'} },
        layers: [{id: 'osm', type: 'raster', source: 'osm', paint: {'raster-opacity': 0.76}}],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
      },
      center: [-52, 36], zoom: 2.75, attributionControl: false
    });
    map.addControl(new maplibregl.NavigationControl({showCompass: false}), 'top-right');
    map.addControl(new maplibregl.AttributionControl({compact: true}), 'bottom-right');
    map.on('load', () => {
      map.addSource('drifter-lines', {type:'geojson', data: {type: 'FeatureCollection', features: lineFeatures}});
      map.addLayer({id:'drifter-lines', type:'line', source:'drifter-lines', layout:{'line-join':'round','line-cap':'round'},paint:{'line-width':3.5,'line-color':['get','color'],'line-opacity':0.85}});
      map.addSource('eddy-polygons', {type:'geojson', data: {type:'FeatureCollection', features: eddies.map(e=>({
        type:'Feature' as const, properties:{id:e.id,kind:e.kind},
        geometry:{type:'Polygon' as const,coordinates:[circlePolygon(e.center[0],e.center[1],e.radius/1000)]}
      }))}});
      map.addLayer({id:'eddy-fill',type:'fill',source:'eddy-polygons',paint:{'fill-color':['match',['get','kind'],'Cyclonic','#a78bfa','#2dd4bf'],'fill-opacity':0.30}});
      map.addLayer({id:'eddy-outline',type:'line',source:'eddy-polygons',paint:{'line-color':['match',['get','kind'],'Cyclonic','#a78bfa','#2dd4bf'],'line-width':2}});
      map.on('click','eddy-fill',e=>{const feature=e.features?.[0];if (feature) new maplibregl.Popup().setLngLat(e.lngLat).setHTML('<strong>'+feature.properties?.id+'</strong><div>'+feature.properties?.kind+'</div>').addTo(map);});
      mapRef.current=map;
    });
    return () => {mapRef.current=null; map.remove();};
  }, []);
  useEffect(() => {
    const map=mapRef.current;
    if (!map) return;
    const trajectories = mode === 'lagrangian' || mode === 'overview';
    const showEddies = mode === 'eddy' || mode === 'overview' || mode === 'diagnostics';
    for (const layer of ['drifter-lines']) if(map.getLayer(layer)) map.setLayoutProperty(layer,'visibility',trajectories?'visible':'none');
    for (const layer of ['eddy-fill','eddy-outline']) if(map.getLayer(layer)) map.setLayoutProperty(layer,'visibility',showEddies?'visible':'none');
  },[mode]);
  return <div className="map-canvas" ref={el} role="img" aria-label="Map showing illustrative ocean drifter tracks and eddy polygons" />;
}

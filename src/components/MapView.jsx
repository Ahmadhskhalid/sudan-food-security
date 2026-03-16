import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { STATES, IPC_CONFIG, COMMODITY_COLORS, PRICE_LEVELS } from "../data/stateData";

const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR = '&copy; <a href="https://carto.com">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

function getColor(stateId, layer) {
  const sd = STATES.find(s => s.id === stateId);
  if (!sd) return "#444";
  if (layer === "ipc")       return IPC_CONFIG[sd.ipc]?.color ?? "#555";
  if (layer === "commodity") return COMMODITY_COLORS[sd.dominantCrop] ?? COMMODITY_COLORS.default;
  if (layer === "price")     return PRICE_LEVELS[sd.priceVolatility]?.color ?? "#555";
  if (layer === "supply") {
    const v = sd.supplyChain.processors.length + sd.supplyChain.markets.length;
    const t = Math.min(v / 10, 1);
    return `hsl(${210 + t*20}, ${60+t*30}%, ${25+t*30}%)`;
  }
  return "#444";
}

function matchState(feature) {
  const name = feature?.properties?.shapeName ?? "";
  return STATES.find(s =>
    s.name === name ||
    name.toLowerCase().includes(s.name.toLowerCase()) ||
    s.name.toLowerCase().includes(name.toLowerCase())
  );
}

export default function MapView({ layer, selected, onSelect, search, regionFilter }) {
  const [geojson, setGeojson] = useState(null);
  const geoRef = useRef(null);

  useEffect(() => {
    fetch("/sudan-states.geojson")
      .then(r => r.json())
      .then(setGeojson)
      .catch(console.error);
  }, []);

  // Re-style when layer/search/region/selection changes
  useEffect(() => {
    if (!geoRef.current) return;
    geoRef.current.eachLayer(layer_ => {
      const sd = matchState(layer_.feature);
      geoRef.current.resetStyle(layer_);
    });
  }, [layer, selected, search, regionFilter]);

  function style(feature) {
    const sd = matchState(feature);
    if (!sd) return { fillColor:"#333", fillOpacity:.4, color:"#222", weight:.5 };

    const isSelected = selected?.id === sd.id;
    const matchSearch = search
      ? sd.name.toLowerCase().includes(search.toLowerCase()) ||
        sd.commodities.some(c => c.name.toLowerCase().includes(search.toLowerCase()))
      : true;
    const matchRegion = regionFilter === "All" ? true : sd.region === regionFilter;
    const dimmed = (!matchSearch || !matchRegion) && !isSelected;

    return {
      fillColor:    getColor(sd.id, layer),
      fillOpacity:  dimmed ? 0.08 : isSelected ? 0.95 : 0.72,
      color:        isSelected ? "#58a6ff" : sd.conflict ? "#ff4444" : "#111827",
      weight:       isSelected ? 3 : sd.conflict ? 1.8 : 0.8,
      dashArray:    sd.conflict && !isSelected ? "5,3" : null,
    };
  }

  function onEachFeature(feature, leafLayer) {
    const sd = matchState(feature);
    if (!sd) return;
    leafLayer.on({
      click: () => onSelect(sd),
      mouseover: e => { e.target.setStyle({ weight: 2.5, fillOpacity: 0.92 }); e.target.bringToFront(); },
      mouseout:  e => { if (geoRef.current) geoRef.current.resetStyle(e.target); },
    });
    leafLayer.bindTooltip(`
      <div style="font-size:12px;font-weight:700">${sd.name} ${sd.conflict?'⚔️':''}</div>
      <div style="color:${IPC_CONFIG[sd.ipc].color};font-weight:600">${IPC_CONFIG[sd.ipc].full}</div>
      <div style="font-size:11px;color:#888">Food insecure: <b style="color:#e6edf3">${sd.foodInsecurePct}%</b></div>
      <div style="font-size:11px;color:#888">Dominant: <b style="color:#e6edf3">${sd.dominantCrop}</b></div>
    `, {
      sticky: true,
      className: "custom-tooltip",
    });
  }

  const LAYER_LABELS = {
    ipc:"🚨 IPC Food Security", commodity:"🌾 Dominant Commodity",
    price:"📈 Price Volatility", supply:"🔗 Supply Chain Nodes"
  };

  return (
    <div className="map-wrap">
      <MapContainer center={[14.5, 30]} zoom={5} minZoom={4} maxZoom={10}
        style={{width:"100%",height:"100%"}} scrollWheelZoom zoomControl>
        <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
        {geojson && (
          <GeoJSON
            ref={geoRef}
            key={`${layer}-${selected?.id}-${search}-${regionFilter}`}
            data={geojson}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      <div className="map-badge">{LAYER_LABELS[layer]}</div>
      {!geojson && <div className="map-loading">Loading map boundaries…</div>}
    </div>
  );
}

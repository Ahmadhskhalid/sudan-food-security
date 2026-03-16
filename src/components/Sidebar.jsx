import { useMemo } from "react";
import { STATES, IPC_CONFIG, COMMODITY_COLORS, PRICE_LEVELS, REGIONS } from "../data/stateData";

const LAYERS = [
  { id:"ipc",       icon:"🚨", label:"IPC Food Security"  },
  { id:"commodity", icon:"🌾", label:"Dominant Commodity"  },
  { id:"price",     icon:"📈", label:"Price Volatility"    },
  { id:"supply",    icon:"🔗", label:"Supply Chain Nodes"  },
];

function Legend({ layer }) {
  if (layer === "ipc") return (
    <div className="legend">
      {Object.entries(IPC_CONFIG).map(([k,v]) => (
        <div key={k} className="legend-row">
          <div className="legend-dot" style={{background:v.color}}/>
          <span>{v.full}</span>
        </div>
      ))}
      <div className="legend-row" style={{marginTop:6}}>
        <div className="legend-dot" style={{background:"repeating-linear-gradient(45deg,#ff4444,#ff4444 2px,transparent 2px,transparent 6px)"}}/>
        <span style={{color:"#8b949e"}}>⚔️ Conflict-affected (dashed border)</span>
      </div>
    </div>
  );
  if (layer === "commodity") return (
    <div className="legend">
      {["Sorghum","Wheat","Millet","Sesame","Groundnuts","Gum Arabic","Livestock","Sugar Cane","Urban hub"].map(c => (
        <div key={c} className="legend-row">
          <div className="legend-dot" style={{background:COMMODITY_COLORS[c]??COMMODITY_COLORS.default}}/>
          <span>{c}</span>
        </div>
      ))}
    </div>
  );
  if (layer === "price") return (
    <div className="legend">
      {Object.entries(PRICE_LEVELS).map(([k,v]) => (
        <div key={k} className="legend-row">
          <div className="legend-dot" style={{background:v.color}}/>
          <span>{v.label} volatility</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="legend">
      <div className="legend-row"><div className="legend-dot" style={{background:"#21459e"}}/><span>Low node density</span></div>
      <div className="legend-row"><div className="legend-dot" style={{background:"#58a6ff"}}/><span>High node density</span></div>
    </div>
  );
}

export default function Sidebar({ selected, onSelect, layer, onLayerChange, search, onSearch, regionFilter, onRegionFilter }) {
  const filtered = useMemo(() => {
    let s = STATES;
    if (regionFilter !== "All") s = s.filter(st => st.region === regionFilter);
    if (search) {
      const q = search.toLowerCase();
      s = s.filter(st =>
        st.name.toLowerCase().includes(q) ||
        st.commodities.some(c => c.name.toLowerCase().includes(q))
      );
    }
    return [...s].sort((a,b) => b.ipc - a.ipc);
  }, [search, regionFilter]);

  return (
    <aside className="sidebar">
      {/* Layer switches */}
      <div className="sb-section">
        <div className="sb-label">MAP LAYER</div>
        {LAYERS.map(l => (
          <button key={l.id} className={`layer-btn ${layer===l.id?"active":""}`} onClick={() => onLayerChange(l.id)}>
            <span>{l.icon}</span> {l.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="sb-section">
        <div className="sb-label">LEGEND</div>
        <Legend layer={layer} />
      </div>

      {/* Search */}
      <div className="sb-section">
        <div className="sb-label">SEARCH STATES</div>
        <input
          className="search-input"
          placeholder="State or commodity…"
          value={search}
          onChange={e => onSearch(e.target.value)}
        />
        <div className="region-chips">
          {REGIONS.map(r => (
            <button key={r} className={`chip ${regionFilter===r?"active":""}`} onClick={() => onRegionFilter(r)}>{r}</button>
          ))}
        </div>
      </div>

      {/* State list */}
      <div className="sb-section" style={{flex:1,overflowY:"auto",paddingRight:4}}>
        <div className="sb-label">STATES ({filtered.length})</div>
        {filtered.map(s => {
          const ipc = IPC_CONFIG[s.ipc];
          const isActive = selected?.id === s.id;
          return (
            <div key={s.id} className={`state-card ${isActive?"active":""}`} onClick={() => onSelect(s)}>
              <div className="state-card-top">
                <span className="state-card-name">
                  {s.name}
                  {s.conflict && <span className="conflict-tag">⚔️</span>}
                  {s.ipc===5 && <span className="famine-tag">FAMINE</span>}
                </span>
                <span className="ipc-pill" style={{background:ipc.bg,color:ipc.color,border:`1px solid ${ipc.color}44`}}>
                  IPC {s.ipc}
                </span>
              </div>
              <div className="state-card-meta">
                <span>🌾 {s.dominantCrop}</span>
                <span style={{color: s.foodInsecurePct>60?"#c0392b":s.foodInsecurePct>40?"#f0a500":"#79c267"}}>
                  ⚠️ {s.foodInsecurePct}%
                </span>
                <span>Idx {s.priceIndex}</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

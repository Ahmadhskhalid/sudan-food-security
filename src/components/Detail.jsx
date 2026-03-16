import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { IPC_CONFIG, COMMODITY_COLORS } from "../data/stateData";

function PriceBar({ label, value, max=1200 }) {
  const pct = Math.min((value/max)*100, 100);
  const col = value>700?"#c0392b":value>500?"#e05c00":value>400?"#f0a500":"#3fb950";
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3}}>
        <span style={{color:"#8b949e"}}>{label}</span>
        <span style={{fontWeight:700,color:col}}>{value} SDG/kg</span>
      </div>
      <div style={{height:5,background:"#21262d",borderRadius:3}}>
        <div style={{height:"100%",width:`${pct}%`,background:col,borderRadius:3,transition:"width .4s"}}/>
      </div>
    </div>
  );
}

function TrendIcon({ trend }) {
  if (trend==="increasing") return <span style={{color:"#3fb950",fontSize:11}}>↑</span>;
  if (trend==="declining")  return <span style={{color:"#c0392b",fontSize:11}}>↓</span>;
  return <span style={{color:"#8b949e",fontSize:11}}>→</span>;
}

export default function Detail({ state }) {
  if (!state) return (
    <aside className="detail empty">
      <div className="detail-placeholder">
        <div style={{fontSize:42,opacity:.25}}>🗺️</div>
        <div>Click a state on the map</div>
        <div style={{fontSize:11,opacity:.5}}>Commodities · IPC · Prices · Supply Chain</div>
      </div>
    </aside>
  );

  const ipc = IPC_CONFIG[state.ipc];
  const priceEntries = Object.entries(state.prices);
  const radarData = state.commodities.slice(0,5).map(c => ({
    subject: c.name.length > 8 ? c.name.slice(0,8)+"…" : c.name,
    value: Math.min(Math.round(c.production / (c.unit==="head"?100000:10000)), 10),
  }));

  return (
    <aside className="detail">
      {/* Header */}
      <div className="detail-head">
        <div>
          <div className="detail-title">
            {state.name}
            {state.conflict && <span className="conflict-tag">⚔️</span>}
            {state.ipc===5 && <span className="famine-tag">FAMINE</span>}
          </div>
          <div className="detail-sub">{state.name_ar} · {state.region} · {(state.population/1e6).toFixed(1)}M pop.</div>
          <div className="ipc-pill large" style={{background:ipc.bg,color:ipc.color,border:`1px solid ${ipc.color}44`,marginTop:6}}>
            {ipc.full}
          </div>
        </div>
      </div>

      <div className="detail-body">
        <p className="detail-note">{state.notes}</p>

        {/* Stats grid */}
        <div className="detail-section">
          <div className="sec-label">📊 KEY STATISTICS</div>
          <div className="stats-grid">
            {[
              ["Food Insecure",    `${state.foodInsecurePct}%`,     state.foodInsecurePct>60?"#c0392b":state.foodInsecurePct>40?"#f0a500":"#3fb950"],
              ["People Affected",  `${Math.round(state.population*state.foodInsecurePct/100/1000)}K`, ipc.color],
              ["Price Index",      state.priceIndex,                state.priceIndex>200?"#c0392b":state.priceIndex>150?"#f0a500":"#3fb950"],
              ["Conflict Impact",  state.conflict?"Yes":"No",       state.conflict?"#c0392b":"#3fb950"],
            ].map(([l,v,c]) => (
              <div key={l} className="stat-box">
                <div className="stat-lbl">{l}</div>
                <div className="stat-val" style={{color:c}}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Commodities */}
        <div className="detail-section">
          <div className="sec-label">🌾 COMMODITIES & PRODUCTION</div>
          {state.commodities.map(c => (
            <div key={c.name} className="commodity-row">
              <div className="commodity-dot" style={{background:COMMODITY_COLORS[c.name]??COMMODITY_COLORS.default}}/>
              <span className="commodity-name">{c.name}</span>
              <span className="commodity-amt">{c.production.toLocaleString()} {c.unit}</span>
              <TrendIcon trend={c.trend}/>
            </div>
          ))}

          {radarData.length >= 3 && (
            <div style={{height:130,marginTop:8}}>
              <ResponsiveContainer>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#30363d"/>
                  <PolarAngleAxis dataKey="subject" tick={{fill:"#8b949e",fontSize:9}}/>
                  <PolarRadiusAxis domain={[0,10]} tick={false}/>
                  <Radar dataKey="value" stroke={ipc.color} fill={ipc.color} fillOpacity={0.25}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Prices */}
        <div className="detail-section">
          <div className="sec-label">📈 MARKET PRICES (SDG/kg, Jan 2025)</div>
          {priceEntries.map(([k,v]) => <PriceBar key={k} label={k} value={v}/>)}
        </div>

        {/* Supply Chain */}
        <div className="detail-section">
          <div className="sec-label">🔗 SUPPLY CHAIN TRANSPARENCY</div>
          {["processors","exporters","markets","ports"].map(cat => (
            state.supplyChain[cat]?.length > 0 && (
              <div key={cat} style={{marginBottom:8}}>
                <div style={{fontSize:10,color:"#8b949e",marginBottom:3,textTransform:"uppercase",letterSpacing:.5}}>
                  {{processors:"🏭 Processors",exporters:"📦 Exporters",markets:"🛒 Markets",ports:"🚢 Export ports"}[cat]}
                </div>
                {state.supplyChain[cat].map(item => (
                  <div key={item} className="supply-node">{item}</div>
                ))}
              </div>
            )
          ))}
        </div>

        {/* References */}
        <div className="detail-section">
          <div className="sec-label">📚 DATA SOURCES</div>
          {state.refs.map((r,i) => (
            <div key={i} className="ref-row">📄 {r}</div>
          ))}
        </div>
      </div>
    </aside>
  );
}

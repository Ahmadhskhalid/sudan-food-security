export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <span className="flag">🇸🇩</span>
        <div>
          <div className="header-title">
            Sudan Food Security &amp; Commodity Transparency Map
            <span className="badge">MVP v1.0</span>
          </div>
          <div className="header-sub">
            18 States · Real-time Leaflet Map · IPC Classification · Supply Chain · Price Volatility
          </div>
        </div>
      </div>
      <div className="header-stats">
        <div className="hstat"><span className="hstat-val" style={{color:"#c0392b"}}>~18M</span><span className="hstat-lbl">food insecure</span></div>
        <div className="hstat"><span className="hstat-val" style={{color:"#c0392b"}}>11</span><span className="hstat-lbl">Phase 4–5 states</span></div>
        <div className="hstat"><span className="hstat-val" style={{color:"#7b0000"}}>2</span><span className="hstat-lbl">Famine states</span></div>
        <div className="hstat"><span className="hstat-val" style={{color:"#f0a500"}}>14/18</span><span className="hstat-lbl">conflict-affected</span></div>
      </div>
    </header>
  );
}

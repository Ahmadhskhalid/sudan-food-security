import { useState, useCallback } from "react";
import MapView  from "./components/MapView";
import Sidebar  from "./components/Sidebar";
import Detail   from "./components/Detail";
import Header   from "./components/Header";
import Footer   from "./components/Footer";
import "leaflet/dist/leaflet.css";
import "./App.css";

export default function App() {
  const [selected,     setSelected]     = useState(null);
  const [layer,        setLayer]        = useState("ipc");
  const [search,       setSearch]       = useState("");
  const [regionFilter, setRegionFilter] = useState("All");

  const handleSelect = useCallback((state) => setSelected(state), []);

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar
          selected={selected}
          onSelect={handleSelect}
          layer={layer}
          onLayerChange={setLayer}
          search={search}
          onSearch={setSearch}
          regionFilter={regionFilter}
          onRegionFilter={setRegionFilter}
        />
        <MapView
          layer={layer}
          selected={selected}
          onSelect={handleSelect}
          search={search}
          regionFilter={regionFilter}
        />
        <Detail state={selected} />
      </div>
      <Footer />
    </div>
  );
}

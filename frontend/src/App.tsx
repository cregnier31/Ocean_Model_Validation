import { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Activity, Anchor, ArrowUpRight, BarChart3, ChevronDown, CircleDot, Compass, Database, GitCompareArrows, Layers, Menu, Route, Waves } from 'lucide-react';
import OceanMap from './components/OceanMap';
import { classes, demoSeries, eddies, metrics, models, regions, score, sections, variables, type Metric, type Section } from './data';

const iconMap: Record<Section, typeof Activity> = {
  Overview: Layers,
  'Class 1–4 Validation': BarChart3,
  'Model Intercomparison': GitCompareArrows,
  'Lagrangian Analysis': Route,
  'Eddy Tracking': CircleDot,
  'Ocean Dynamics Diagnostics': Activity,
};
const blue = '#48bdf5';
const colors = ['#48bdf5', '#2dd4bf', '#fbbf24'];
const format = (value: number) => value.toFixed(3);

function MetricCard({label, value, note, accent}: {label:string; value:string; note:string;accent?:string}) {
  return <div className="metric-card"><span className="muted label">{label}</span><div className="metric-value" style={{color:accent}}>{value}</div><span className="muted small">{note}</span></div>;
}
function Selector({label, value, options, change}: {label:string;value:string;options:readonly string[];change:(v:string)=>void}) {
  return <label className="selector"><span className="muted small">{label}</span><span className="select-wrap"><select value={value} onChange={e=>change(e.target.value)}>{options.map(o=><option key={o} value={o}>{o}</option>)}</select><ChevronDown size={14}/></span></label>;
}
function Chart({selectedMetric, selectedModels, height=290}: {selectedMetric:Metric; selectedModels:string[];height?:number}) {
  return <Plot data={selectedModels.map((m,i)=>({...demoSeries(m,selectedMetric),type:'scatter' as const,mode:'lines' as const,name:m,line:{color:colors[i % colors.length],width:2.5,shape:'spline' as const}}))}
    layout={{height, autosize:true,paper_bgcolor:'rgba(0,0,0,0)',plot_bgcolor:'rgba(0,0,0,0)',font:{color:'#9ab2c6',size:11},margin:{l:48,r:20,b:42,t:14},xaxis:{gridcolor:'#24465a',tickfont:{size:10}},yaxis:{gridcolor:'#24465a',title:{text:selectedMetric, font:{size:11}}},legend:{orientation:'h',y:-0.28,x:0},hovermode:'x unified'}}
    useResizeHandler style={{width:'100%'}} config={{responsive:true,displaylogo:false,modeBarButtonsToRemove:['lasso2d','select2d']}} />;
}

export default function App() {
  const [section,setSection] = useState<Section>('Overview');
  const [model,setModel] = useState<string>(models[0]);
  const [region,setRegion] = useState<string>(regions[0]);
  const [variable,setVariable] = useState<string>(variables[0]);
  const [metric,setMetric] = useState<Metric>('RMSE');
  const [metricClass,setMetricClass] = useState<string>(classes[0]);
  const [menu,setMenu] = useState(false);
  const [apiStatus,setApiStatus] = useState<'demo'|'connected'>('demo');
  useEffect(()=>{const url=import.meta.env.VITE_API_URL as string | undefined;if(!url)return;
    fetch(url+'/health').then(r=>{if(r.ok)setApiStatus('connected');}).catch(()=>setApiStatus('demo'));
  },[]);
  const isCompare=section==='Model Intercomparison';
  const isLagrangian=section==='Lagrangian Analysis';
  const isEddy=section==='Eddy Tracking';
  const isDynamics=section==='Ocean Dynamics Diagnostics';
  const isValidation=section==='Class 1–4 Validation';
  const mapMode = isLagrangian?'lagrangian':isEddy?'eddy':isDynamics?'diagnostics':'overview';
  const description: Record<Section,string> = {
    Overview:'Performance at a glance across ocean forecasting systems',
    'Class 1–4 Validation':'Explore forecast accuracy across validation categories',
    'Model Intercomparison':'Compare forecasting systems against common references',
    'Lagrangian Analysis':'Explore simulated drifter paths and trajectory statistics',
    'Eddy Tracking':'Inspect mesoscale eddies and their evolution',
    'Ocean Dynamics Diagnostics':'Investigate circulation and flow diagnostics',
  };
  return <div className="app">
    <aside className={'sidebar '+(menu?'open':'')}>
      <div className="brand"><div className="brand-icon"><Waves size={25}/></div><div><strong>OCEAN MODEL</strong><span>VALIDATION</span></div></div>
      <div className="sidebar-heading">WORKSPACE</div>
      <nav aria-label="Main navigation">{sections.map(s=>{const Icon=iconMap[s];return <button key={s} className={'nav-item '+(section===s?'active':'')} onClick={()=>{setSection(s);setMenu(false)}}><Icon size={18}/><span>{s}</span></button>})}</nav>
      <div className="sidebar-footer"><div className="sidebar-foot-icon"><Database size={17}/></div><div><strong>Scientific workspace</strong><span>{apiStatus==='connected'?'API available':'Local demonstration'}</span></div></div>
    </aside>
    {menu&&<button className="backdrop" aria-label="Close menu" onClick={()=>setMenu(false)}/>}
    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={()=>setMenu(!menu)} aria-label="Toggle menu"><Menu size={22}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{section}</strong></div><div className="top-meta"><span className="status-indicator"/>{apiStatus==='connected'?'API connected · demo metrics':'Demo data · no live observations'}</div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow"><Waves size={15}/> OCEAN SCIENCE PLATFORM</div><h1>{section}</h1><p>{description[section]}</p></div><div className="demo-pill">● SYNTHETIC DATA</div></div>
        <div className="filter-bar"><Selector label="Forecast model" value={model} options={models} change={setModel}/><Selector label="Ocean region" value={region} options={regions} change={setRegion}/><Selector label="Variable" value={variable} options={variables} change={setVariable}/><Selector label="Metric" value={metric} options={metrics} change={v=>setMetric(v as Metric)}/></div>
        {isValidation&&<div className="class-tabs">{classes.map(c=><button key={c} className={'class-tab '+(metricClass===c?'selected':'')} onClick={()=>setMetricClass(c)}>{c}</button>)}</div>}
        <div className="metrics-grid">
          <MetricCard label={isLagrangian?'Demonstration tracks':isEddy?'Detected eddies':isDynamics?'Mean EKE (illustrative)':isCompare?'Models evaluated':'Mean RMSE'} value={isLagrangian?'3':isEddy?String(eddies.length):isDynamics?'0.087':isCompare?String(models.length):format(score(model,'RMSE'))} note={isLagrangian?'Illustrative trajectories':isEddy?'Synthetic feature catalog':isDynamics?'m²/s² · demo':isCompare?'Synthetic comparison':'Synthetic score only'} accent={blue}/>
          <MetricCard label={isLagrangian?'Track separation':isEddy?'Mean eddy radius':isDynamics?'Mean vorticity':'Correlation'} value={isLagrangian?'14.8 km':isEddy?'81 km':isDynamics?'0.024':format(score(model,'Correlation'))} note={isLagrangian?'Demo diagnostic':isEddy?'Illustrative polygons':isDynamics?'s⁻¹ × 10⁻⁵ · demo':'Synthetic score only'}/>
          <MetricCard label={isLagrangian?'Tracked interval':isEddy?'Mean lifetime':isDynamics?'Divergence':'Skill score'} value={isLagrangian?'30 days':isEddy?'42 days':isDynamics?'0.013':format(score(model,'Skill Score'))} note={isLagrangian?'Demonstration only':isEddy?'Synthetic catalog':isDynamics?'s⁻¹ × 10⁻⁵ · demo':'Synthetic score only'}/>
          <MetricCard label="Data status" value="DEMO" note="Not validated scientific measurements" accent="#fbbf24"/>
        </div>
        <div className="visual-grid">
          <section className="panel map-panel"><div className="panel-heading"><div><h2>{isLagrangian?'Lagrangian trajectories':isEddy?'Mesoscale eddy detection':isDynamics?'Ocean circulation features':'Ocean spatial explorer'}</h2><p>North Atlantic · illustrative geospatial overlays</p></div><Compass size={19}/></div><OceanMap mode={mapMode}/><div className="map-caption"><span><span className="dot teal"/> Drifter tracks</span><span><span className="dot violet"/> Eddy features</span><span className="muted">Illustrative locations</span></div></section>
          <section className="panel chart-panel"><div className="panel-heading"><div><h2>{isCompare?'Model performance comparison':isDynamics?'Diagnostics time series':isValidation?metricClass+' · '+metric:'Validation time series'}</h2><p>{isCompare?'Three synthetic model series':model+' · '+metric}</p></div><BarChart3 size={19}/></div><Chart selectedMetric={metric} selectedModels={isCompare?[...models]:[model]} /><div className="chart-note">All plotted scores are generated demonstration values, not model verification.</div></section>
        </div>
        <div className="bottom-grid"><section className="panel table-panel"><div className="panel-heading"><div><h2>{isEddy?'Eddy feature catalog':isLagrangian?'Lagrangian tracks':'Model scorecard'}</h2><p>{isCompare?'Common metric comparison':isEddy?'Synthetic eddy statistics':'Illustrative validation output'}</p></div><ArrowUpRight size={18}/></div><div className="table-scroll"><table><thead><tr>{(isEddy?['Feature','Type','Radius','Lifetime']:isLagrangian?['Track','Status','Region','Source']:['Model','RMSE','Correlation','Skill score']).map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>{isEddy?eddies.map(e=><tr key={e.id}><td>{e.id}</td><td>{e.kind}</td><td>{e.radius/1000} km</td><td>{e.lifetime} d</td></tr>):isLagrangian?['A','B','C'].map(n=><tr key={n}><td>Drifter {n}</td><td>Illustrative</td><td>North Atlantic</td><td>Demo</td></tr>):models.map(m=><tr key={m}><td>{m}</td><td>{format(score(m,'RMSE'))}</td><td>{format(score(m,'Correlation'))}</td><td>{format(score(m,'Skill Score'))}</td></tr>)}</tbody></table></div></section>
        <section className="panel about-panel"><div className="panel-heading"><div><h2>Analysis workspace</h2><p>Available modules</p></div><Anchor size={19}/></div><div className="quick-links">{sections.filter(s=>s!==section).slice(0,4).map(s=>{const Icon=iconMap[s];return <button key={s} onClick={()=>setSection(s)}><span><Icon size={15}/>{s}</span><ArrowUpRight size={15}/></button>})}</div></section></div>
        <footer className="footer"><span>Ocean Model Validation · prototype v0.1</span><span>For scientific development · Synthetic data only</span></footer>
      </div>
    </main>
  </div>;
}

import { useEffect, useState } from 'react';
import { Activity, BarChart3, CircleDot, Ship, Database, Layers, Menu, Route, Waves } from 'lucide-react';
import ScientificFigures, { type FigureGroup } from './ScientificFigures';
import { classes, sections, type Section } from './data';

const iconMap: Record<Section, typeof Activity> = {
  Overview: Layers,
  'Class 1–4 Validation': BarChart3,
  'SST Drifters': Ship,
  'Lagrangian Analysis': Route,
  'Eddy Tracking': CircleDot,
  'Ocean Dynamics Diagnostics': Activity,
};
const groupNames: Record<FigureGroup,string> = {
  class1:'Other Class 1',class1_timeseries:'Class 1 time series',class1_maps:'Class 1 maps',profiles:'Profiles',radar:'Radar diagrams',sst_drifters:'SST drifters',
  uv_drifters:'Drifter velocity',aice:'Sea ice',lagrangian:'Lagrangian',eddy_tracking:'Eddy tracking',ocean_dynamics:'Ocean dynamics',overview:'Overview videos',surface_maps:'Surface maps',surface_timeseries:'Annual time series'
};
const class4Groups: Exclude<FigureGroup,'class1'|'class1_timeseries'|'class1_maps'|'lagrangian'|'eddy_tracking'|'ocean_dynamics'|'overview'>[] = ['profiles','radar','uv_drifters','aice'];
type Catalog = Partial<Record<FigureGroup, {url:string;type?:string}[]>>;
export default function App() {
  const [section,setSection] = useState<Section>('Overview');
  const [metricClass,setMetricClass] = useState<string>('Class 1');
  const [class1View,setClass1View] = useState<'class1_timeseries'|'class1_maps'|'class1'>('class1_timeseries');
  const [class4View,setClass4View] = useState<typeof class4Groups[number]>('profiles');
  const [dynamicsView,setDynamicsView] = useState<'surface_maps'|'surface_timeseries'|'ocean_dynamics'>('surface_maps');
  const [menu,setMenu] = useState(false);
  const [catalog,setCatalog] = useState<Catalog>({});
  const [loaded,setLoaded] = useState(false);
  useEffect(()=>{
    let mounted=true;
    fetch('/figures-manifest.json',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw new Error('Missing manifest');return r.json() as Promise<Catalog>})
      .then(d=>{if(mounted){setCatalog(d);setLoaded(true)}})
      .catch(()=>{if(mounted)setLoaded(true)});
    return ()=>{mounted=false};
  },[]);
  const total=Object.values(catalog).reduce((n,arr)=>n+(arr?.length??0),0);
  const videos=Object.values(catalog).reduce((n,arr)=>n+(arr?.filter(item=>item.type==='video').length??0),0);
  const count=(group:FigureGroup)=>catalog[group]?.length??0;
  const description:Record<Section,string>={
    Overview:'Indexed scientific plots and videos from your local collection',
    'Class 1–4 Validation':'Browse available Class 1 and Class 4 verification plots',
    'SST Drifters':'Sea-surface-temperature and drifter validation figures',
    'Lagrangian Analysis':'Trajectory diagnostics and separation statistics from supplied figures',
    'Eddy Tracking':'Eddy-tracking plots and illustrative videos, when available',
    'Ocean Dynamics Diagnostics':'Ocean-dynamics plots and illustrative videos, when available'
  };
  return <div className="app">
    <aside className={'sidebar '+(menu?'open':'')}>
      <div className="brand"><div className="brand-icon"><Waves size={25}/></div><div><strong>OCEAN MODEL</strong><span>VALIDATION</span></div></div>
      <div className="sidebar-heading">WORKSPACE</div>
      <nav aria-label="Main navigation">{sections.map(item=>{const Icon=iconMap[item];return <button key={item} className={'nav-item '+(section===item?'active':'')} onClick={()=>{setSection(item);setMenu(false)}}><Icon size={18}/><span>{item}</span></button>})}</nav>
      <div className="sidebar-footer"><div className="sidebar-foot-icon"><Database size={17}/></div><div><strong>Scientific figures</strong><span>{loaded?total+' indexed media files':'Loading figure catalog'}</span></div></div>
    </aside>
    {menu&&<button className="backdrop" aria-label="Close menu" onClick={()=>setMenu(false)}/>}
    <main className="main">
      <header className="topbar"><button className="menu-button" onClick={()=>setMenu(!menu)} aria-label="Toggle menu"><Menu size={22}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{section}</strong></div><div className="top-meta">{loaded?total+' media files indexed · '+videos+' videos':'Loading figure catalog'}</div></header>
      <div className="content">
        <div className="page-heading"><div><div className="eyebrow"><Waves size={15}/> OCEAN SCIENCE PLATFORM</div><h1>{section}</h1><p>{description[section]}</p></div></div>
        {section==='Overview'&&<>
          <div className="metrics-grid">
            <div className="metric-card"><span className="muted label">Class 1 media</span><div className="metric-value">{count('class1')+count('class1_timeseries')+count('class1_maps')}</div><span className="muted small">Indexed media files</span></div>
            <div className="metric-card"><span className="muted label">Class 4 media</span><div className="metric-value">{class4Groups.reduce((n,g)=>n+count(g),count('sst_drifters'))}</div><span className="muted small">Indexed image files</span></div>
            <div className="metric-card"><span className="muted label">Lagrangian media</span><div className="metric-value">{count('lagrangian')}</div><span className="muted small">Indexed image files</span></div>
            <div className="metric-card"><span className="muted label">Eddy tracking media</span><div className="metric-value">{count('eddy_tracking')}</div><span className="muted small">Indexed media files</span></div>
          </div>
          <section className="panel"><div className="panel-heading"><div><h2>Available results</h2><p>Counts describe supplied plots and videos, not calculated performance metrics</p></div></div>
            <div className="figure-summary">{(['class1_timeseries','class1_maps','class1',...class4Groups,'sst_drifters','lagrangian','eddy_tracking','surface_maps','surface_timeseries','ocean_dynamics','overview'] as FigureGroup[]).map(g=><button key={g} onClick={()=>{setSection(g==='sst_drifters'?'SST Drifters':g==='lagrangian'?'Lagrangian Analysis':g==='eddy_tracking'?'Eddy Tracking':(['ocean_dynamics','surface_maps','surface_timeseries'].includes(g))?'Ocean Dynamics Diagnostics':g==='overview'?'Overview':'Class 1–4 Validation');if(g==='surface_maps'||g==='surface_timeseries'||g==='ocean_dynamics')setDynamicsView(g);if(g==='class1'||g==='class1_timeseries'||g==='class1_maps'){setMetricClass('Class 1');setClass1View(g)}else if(class4Groups.includes(g as typeof class4Groups[number])){setMetricClass('Class 4');setClass4View(g as typeof class4Groups[number]);}}}><span>{groupNames[g]}</span><strong>{count(g)}</strong></button>)}</div>
          </section>
          {count('overview')>0&&<ScientificFigures group="overview"/>}
          {total===0&&<p className="figure-empty">No indexed figures found. Run <code>python scripts/sync_figures.py imgs</code> from the repository root and refresh.</p>}
        </>}
        {section==='Class 1–4 Validation'&&<>
          <div className="class-tabs">{classes.map(c=><button key={c} className={'class-tab '+(metricClass===c?'selected':'')} onClick={()=>setMetricClass(c)}>{c}</button>)}</div>
          {metricClass==='Class 1'&&<div className="class-tabs">{([['class1_timeseries','Time series'],['class1_maps','Maps'],['class1','Other figures']] as const).map(([g,label])=><button key={g} className={'class-tab '+(class1View===g?'selected':'')} onClick={()=>setClass1View(g)}>{label}</button>)}</div>}
          {metricClass==='Class 4'&&<div className="class-tabs">{class4Groups.map(g=><button key={g} className={'class-tab '+(class4View===g?'selected':'')} onClick={()=>setClass4View(g)}>{groupNames[g]}</button>)}</div>}
          {metricClass==='Class 1'||metricClass==='Class 4'?<ScientificFigures key={metricClass==='Class 1'?class1View:class4View} group={metricClass==='Class 1'?class1View:class4View}/>:<section className="panel figure-empty">No {metricClass} validation figures have been provided.</section>}
        </>}
        {section==='SST Drifters'&&<ScientificFigures group="sst_drifters"/>}
        {section==='Lagrangian Analysis'&&<ScientificFigures group="lagrangian"/>}
        {section==='Eddy Tracking'&&<ScientificFigures group="eddy_tracking"/>}
        {section==='Ocean Dynamics Diagnostics'&&<><div className="class-tabs">{([['surface_maps','Surface maps'],['surface_timeseries','Annual time series'],['ocean_dynamics','Other diagnostics / videos']] as const).map(([g,label])=><button key={g} className={'class-tab '+(dynamicsView===g?'selected':'')} onClick={()=>setDynamicsView(g)}>{label}</button>)}</div><ScientificFigures key={dynamicsView} group={dynamicsView}/></>}
        <footer className="footer"><span>Ocean Model Validation · figure-based scientific workspace</span><span>Supplied plots and videos only · No synthetic metrics</span></footer>
      </div>
    </main>
  </div>;
}

import { useEffect, useState } from 'react';
import { Activity, BarChart3, CircleDot, Database, GitCompareArrows, Layers, Menu, Route, Waves } from 'lucide-react';
import ScientificFigures, { type FigureGroup } from './ScientificFigures';
import { classes, sections, type Section } from './data';

const iconMap: Record<Section, typeof Activity> = {
  Overview: Layers,
  'Class 1–4 Validation': BarChart3,
  'Model Intercomparison': GitCompareArrows,
  'Lagrangian Analysis': Route,
  'Eddy Tracking': CircleDot,
  'Ocean Dynamics Diagnostics': Activity,
};
const groupNames: Record<FigureGroup,string> = {
  class1:'Class 1',profiles:'Profiles',radar:'Radar diagrams',sst_drifters:'Regional scores',
  uv_drifters:'Drifter velocity',aice:'Sea ice',lagrangian:'Lagrangian',eddy_tracking:'Eddy tracking',ocean_dynamics:'Ocean dynamics',overview:'Overview videos'
};
const class4Groups: Exclude<FigureGroup,'class1'|'lagrangian'|'eddy_tracking'|'ocean_dynamics'|'overview'>[] = ['profiles','radar','sst_drifters','uv_drifters','aice'];
type Catalog = Partial<Record<FigureGroup, {url:string;type?:string}[]>>;
export default function App() {
  const [section,setSection] = useState<Section>('Overview');
  const [metricClass,setMetricClass] = useState<string>('Class 1');
  const [class4View,setClass4View] = useState<Exclude<FigureGroup,'class1'|'lagrangian'|'eddy_tracking'>>('profiles');
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
    'Model Intercomparison':'Model comparison figures from the supplied validation results',
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
            <div className="metric-card"><span className="muted label">Class 1 figures</span><div className="metric-value">{count('class1')}</div><span className="muted small">Indexed image files</span></div>
            <div className="metric-card"><span className="muted label">Class 4 figures</span><div className="metric-value">{class4Groups.reduce((n,g)=>n+count(g),0)}</div><span className="muted small">Indexed image files</span></div>
            <div className="metric-card"><span className="muted label">Lagrangian figures</span><div className="metric-value">{count('lagrangian')}</div><span className="muted small">Indexed image files</span></div>
            <div className="metric-card"><span className="muted label">Eddy tracking media</span><div className="metric-value">{count('eddy_tracking')}</div><span className="muted small">Indexed media files</span></div>
          </div>
          <section className="panel"><div className="panel-heading"><div><h2>Available results</h2><p>Counts describe supplied plots and videos, not calculated performance metrics</p></div></div>
            <div className="figure-summary">{(['class1',...class4Groups,'lagrangian','eddy_tracking','ocean_dynamics','overview'] as FigureGroup[]).map(g=><button key={g} onClick={()=>{setSection(g==='lagrangian'?'Lagrangian Analysis':g==='eddy_tracking'?'Eddy Tracking':g==='ocean_dynamics'?'Ocean Dynamics Diagnostics':g==='overview'?'Overview':'Class 1–4 Validation');if(g==='class1')setMetricClass('Class 1');else if(class4Groups.includes(g as typeof class4Groups[number])){setMetricClass('Class 4');setClass4View(g as typeof class4Groups[number]);}}}><span>{groupNames[g]}</span><strong>{count(g)}</strong></button>)}</div>
          </section>
          {count('overview')>0&&<ScientificFigures group="overview"/>}
          {total===0&&<p className="figure-empty">No indexed figures found. Run <code>python scripts/sync_figures.py imgs</code> from the repository root and refresh.</p>}
        </>}
        {section==='Class 1–4 Validation'&&<>
          <div className="class-tabs">{classes.map(c=><button key={c} className={'class-tab '+(metricClass===c?'selected':'')} onClick={()=>setMetricClass(c)}>{c}</button>)}</div>
          {metricClass==='Class 4'&&<div className="class-tabs">{class4Groups.map(g=><button key={g} className={'class-tab '+(class4View===g?'selected':'')} onClick={()=>setClass4View(g)}>{groupNames[g]}</button>)}</div>}
          {metricClass==='Class 1'||metricClass==='Class 4'?<ScientificFigures key={metricClass+class4View} group={metricClass==='Class 1'?'class1':class4View}/>:<section className="panel figure-empty">No {metricClass} validation figures have been provided.</section>}
        </>}
        {section==='Model Intercomparison'&&<ScientificFigures group="sst_drifters"/>}
        {section==='Lagrangian Analysis'&&<ScientificFigures group="lagrangian"/>}
        {section==='Eddy Tracking'&&<ScientificFigures group="eddy_tracking"/>}
        {section==='Ocean Dynamics Diagnostics'&&<ScientificFigures group="ocean_dynamics"/>}
        <footer className="footer"><span>Ocean Model Validation · figure-based scientific workspace</span><span>Supplied plots and videos only · No synthetic metrics</span></footer>
      </div>
    </main>
  </div>;
}

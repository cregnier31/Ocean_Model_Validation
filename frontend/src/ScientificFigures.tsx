import { useEffect, useMemo, useState } from 'react';

export type FigureGroup = 'class1' | 'class1_timeseries' | 'class1_maps' | 'profiles' | 'radar' | 'sst_drifters' | 'uv_drifters' | 'aice' | 'lagrangian' | 'eddy_tracking' | 'ocean_dynamics' | 'overview' | 'surface_maps' | 'surface_timeseries';
type Figure = { type?: "image" | "video"; url: string; file: string; label: string; region: string; variable: string; lead?: string };
type Catalog = Partial<Record<FigureGroup, Figure[]>>;
const groups: Record<FigureGroup, {title:string;description:string}> = {
  class1:{title:'Class 1 · Other figures',description:'Class 1 figures placed directly in the CLASS1 folder'},
  class1_timeseries:{title:'Class 1 · Time series',description:'Class 1 validation time-series plots'},
  class1_maps:{title:'Class 1 · Maps',description:'Class 1 spatial validation maps'},
  profiles:{title:'Class 4 · Vertical profiles',description:'Temperature and salinity profiles by region'},
  radar:{title:'Class 4 · Radar diagrams',description:'Regional model skill and PR/PF diagnostics'},
  sst_drifters:{title:'Class 4 · SST and drifter scores',description:'Intercomparison, profile and drifter skill scores'},
  uv_drifters:{title:'Class 4 · UV drifter scores',description:'Regional zonal and meridional current RMSD and bias'},
  aice:{title:'Class 4 · Sea-ice concentration',description:'Sea-ice concentration validation scores'},
  lagrangian:{title:'Lagrangian diagnostics',description:'Trajectory separation, Liu scores, observation counts and statistics'},
  eddy_tracking:{title:'Eddy tracking',description:'Supplied eddy tracking figures and animations'},
  ocean_dynamics:{title:'Ocean dynamics',description:'Supplied circulation diagnostics and animations'},
  overview:{title:'Scientific animations',description:'Videos illustrating ocean model validation'},
  surface_maps:{title:'Global surface dynamics · Maps',description:'Global velocity diagnostics at depth 0'},
  surface_timeseries:{title:'Global surface dynamics · Annual time series',description:'Annual RMS diagnostics of global velocity fields'}
};
export default function ScientificFigures({group}:{group:FigureGroup}) {
  const [catalog,setCatalog] = useState<Catalog>({});
  const [error,setError] = useState(false);
  const [region,setRegion] = useState('All regions');
  const [variable,setVariable] = useState('All variables');
  const [active,setActive] = useState<string | null>(null);
  const [lead,setLead] = useState('All leads');
  const [mediaType,setMediaType] = useState<'all'|'image'|'video'>('all');
  useEffect(()=>{
    let mounted=true;
    fetch('/figures-manifest.json',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw new Error('No figure manifest');return r.json() as Promise<Catalog>})
      .then(data=>{if(mounted){setCatalog(data);setError(false)}})
      .catch(()=>{if(mounted)setError(true)});
    return ()=>{mounted=false};
  },[]);
  const figures=catalog[group]??[];
  const regions=useMemo(()=>['All regions',...Array.from(new Set(figures.map(f=>f.region))).sort()], [figures]);
  const leads=useMemo(()=>['All leads',...Array.from(new Set(figures.map(f=>f.lead??'All leads').filter(l=>l!=='All leads'))).sort()], [figures]);
  const variables=useMemo(()=>['All variables',...Array.from(new Set(figures.map(f=>f.variable))).sort()], [figures]);
  const filtered=figures.filter(f=>(region==='All regions'||f.region===region)&&(variable==='All variables'||f.variable===variable)&&(lead==='All leads'||(f.lead??'All leads')===lead)&&(mediaType==='all'||(f.type??'image')===mediaType));
  const selected=filtered.find(f=>f.url===active)??filtered[0];
  return <section className="panel scientific-gallery">
    <div className="panel-heading"><div><h2>{groups[group].title}</h2><p>{groups[group].description} · {figures.length} media files</p></div></div>
    {error||figures.length===0?<p className="figure-empty">No plots or videos indexed for this category. From the repository root, run <code>python scripts/sync_figures.py imgs</code> (or provide the full path to your <code>imgs</code> directory), then refresh the page.</p>:<>
      <div className="figure-filters">
        <label>Region <select value={regions.includes(region)?region:'All regions'} onChange={e=>{setRegion(e.target.value);setActive(null)}}>{regions.map(r=><option key={r}>{r}</option>)}</select></label>
        <label>Variable <select value={variables.includes(variable)?variable:'All variables'} onChange={e=>{setVariable(e.target.value);setActive(null)}}>{variables.map(v=><option key={v}>{v}</option>)}</select></label>
        {leads.length>1&&<label>Forecast lead <select value={leads.includes(lead)?lead:'All leads'} onChange={e=>{setLead(e.target.value);setActive(null)}}>{leads.map(l=><option key={l}>{l}</option>)}</select></label>}
        <label>Media <select value={mediaType} onChange={e=>{setMediaType(e.target.value as typeof mediaType);setActive(null)}}><option value="all">All media</option><option value="image">Plots</option><option value="video">Videos</option></select></label><span>{filtered.length} matching files</span>
      </div>
      <div className="figure-layout">
        <div className="figure-controls">{filtered.map(f=><button className={selected?.url===f.url?'selected':''} key={f.url} onClick={()=>setActive(f.url)} title={f.file}>{f.lead&&f.lead!=='All leads'?f.lead+' · ':''}{f.region} · {f.variable}<small>{f.file}</small></button>)}</div>
        {selected?<div className="figure-preview"><div className="figure-title">{selected.lead&&selected.lead!=="All leads"?selected.lead+" · ":""}{selected.file}</div>{selected.type==='video'?<video key={selected.url} className="figure-video" controls playsInline preload="metadata"><source src={selected.url}/><a href={selected.url}>Open video</a></video>:<a href={selected.url} target="_blank" rel="noreferrer" title="Open full-size figure"><img src={selected.url} alt={selected.label}/></a>}<div className="figure-meta">Region: {selected.region} · Variable: {selected.variable} · {selected.type==="video"?"Use player controls to watch":"Click figure to enlarge"}</div></div>:<p className="figure-empty">No media files match these filters.</p>}
      </div>
    </>}
  </section>;
}

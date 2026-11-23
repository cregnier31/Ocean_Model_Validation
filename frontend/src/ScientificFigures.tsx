import { useEffect, useMemo, useState } from 'react';

export type FigureGroup = 'class1' | 'profiles' | 'radar' | 'sst_drifters' | 'uv_drifters' | 'aice';
type Figure = { url: string; file: string; label: string; region: string; variable: string };
type Catalog = Partial<Record<FigureGroup, Figure[]>>;
const groups: Record<FigureGroup, {title:string;description:string}> = {
  class1:{title:'Class 1 · SST ensemble validation',description:'Ensemble SST comparisons against OSTIA'},
  profiles:{title:'Class 4 · Vertical profiles',description:'Temperature and salinity profiles by region'},
  radar:{title:'Class 4 · Radar diagrams',description:'Regional model skill and PR/PF diagnostics'},
  sst_drifters:{title:'Class 4 · SST and drifter scores',description:'Intercomparison, profile and drifter skill scores'},
  uv_drifters:{title:'Class 4 · UV drifter scores',description:'Regional zonal and meridional current RMSD and bias'},
  aice:{title:'Class 4 · Sea-ice concentration',description:'Sea-ice concentration validation scores'}
};
export default function ScientificFigures({group}:{group:FigureGroup}) {
  const [catalog,setCatalog] = useState<Catalog>({});
  const [error,setError] = useState(false);
  const [region,setRegion] = useState('All regions');
  const [variable,setVariable] = useState('All variables');
  const [active,setActive] = useState<string | null>(null);
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
  const variables=useMemo(()=>['All variables',...Array.from(new Set(figures.map(f=>f.variable))).sort()], [figures]);
  const filtered=figures.filter(f=>(region==='All regions'||f.region===region)&&(variable==='All variables'||f.variable===variable));
  const selected=filtered.find(f=>f.file===active)??filtered[0];
  return <section className="panel scientific-gallery">
    <div className="panel-heading"><div><h2>{groups[group].title}</h2><p>{groups[group].description} · {figures.length} figures</p></div></div>
    {error||figures.length===0?<p className="figure-empty">No images indexed for this category. From the repository root, run <code>python scripts/sync_figures.py imgs</code> (or provide the full path to your <code>imgs</code> directory), then refresh the page.</p>:<>
      <div className="figure-filters">
        <label>Region <select value={regions.includes(region)?region:'All regions'} onChange={e=>{setRegion(e.target.value);setActive(null)}}>{regions.map(r=><option key={r}>{r}</option>)}</select></label>
        <label>Variable <select value={variables.includes(variable)?variable:'All variables'} onChange={e=>{setVariable(e.target.value);setActive(null)}}>{variables.map(v=><option key={v}>{v}</option>)}</select></label>
        <span>{filtered.length} matching figures</span>
      </div>
      <div className="figure-layout">
        <div className="figure-controls">{filtered.map(f=><button className={selected?.file===f.file?'selected':''} key={f.url} onClick={()=>setActive(f.file)} title={f.file}>{f.region} · {f.variable}<small>{f.file}</small></button>)}</div>
        {selected?<div className="figure-preview"><div className="figure-title">{selected.file}</div><a href={selected.url} target="_blank" rel="noreferrer" title="Open full-size figure"><img src={selected.url} alt={selected.label}/></a><div className="figure-meta">Region: {selected.region} · Variable: {selected.variable} · Click figure to enlarge</div></div>:<p className="figure-empty">No figures match these filters.</p>}
      </div>
    </>}
  </section>;
}

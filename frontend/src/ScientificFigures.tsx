import { useState } from 'react';
import manifest from './figure-manifest.json';

type Group = 'class1' | 'class4' | 'profiles';
type Figure = { file: string; label: string; region: string; variable: string };
const groups: Record<Group, { title: string; description: string }> = {
  class1: {title:'Class 1 · SST ensemble validation',description:'OSTIA comparison figures, ensemble envelope, MAE and RMSD (2024)'},
  class4: {title:'Class 4 · Profile scores',description:'Regional RMSD and bias scores and model intercomparison'},
  profiles: {title:'Class 4 · Vertical profiles',description:'Temperature and salinity profile diagnostics by ocean region (2024)'}
};
export default function ScientificFigures({group}:{group:Group}) {
  const [active,setActive]=useState<string | null>(null);
  const figures = (manifest as Record<Group, Figure[]>)[group];
  const selected = figures.find(f=>f.file===active) ?? figures[0];
  if (!selected) return <section className="panel scientific-gallery"><div className="panel-heading"><div><h2>{groups[group].title}</h2><p>{groups[group].description}</p></div></div><p style={{padding:'0 20px 20px',color:'#a9c2d2'}}>Figures are ready to import. Extract the supplied image bundle into the repository or run <code>python scripts/import_figures.py /path/to/archives</code>.</p></section>;
  return <section className="panel scientific-gallery">
    <div className="panel-heading"><div><h2>{groups[group].title}</h2><p>{groups[group].description} · {figures.length} figures</p></div></div>
    <div className="figure-layout">
      <div className="figure-controls">{figures.map(f=><button className={selected.file===f.file?'selected':''} key={f.file} onClick={()=>setActive(f.file)} title={f.label}>{f.label}</button>)}</div>
      <div className="figure-preview"><div className="figure-title">{selected.label}</div>
        <a href={'/figures/'+group+'/'+selected.file} target="_blank" rel="noreferrer" title="Open full-size figure"><img src={'/figures/'+group+'/'+selected.file} alt={selected.label} onError={e=>{e.currentTarget.style.display='none';e.currentTarget.nextElementSibling?.removeAttribute('hidden')}}/><p hidden className="figure-missing">Image asset not installed yet. Run <code>python scripts/import_figures.py</code> with the supplied TAR archives.</p></a>
        <div className="figure-meta">Region: {selected.region} · Variable: {selected.variable} · Click figure to enlarge</div>
      </div>
    </div>
  </section>;
}

import { useEffect, useState } from 'react';
const sections = [
  {
    "region": "Global",
    "name": "EQU",
    "no": 1
  },
  {
    "region": "Arctic",
    "name": "Labrador_WOCE_A01W",
    "no": 2
  },
  {
    "region": "Arctic",
    "name": "Fram_strait",
    "no": 3
  },
  {
    "region": "Arctic",
    "name": "Barentssea",
    "no": 4
  },
  {
    "region": "Arctic",
    "name": "Labradorgreenland",
    "no": 5
  },
  {
    "region": "Mediterranean",
    "name": "Gibraltar",
    "no": 6
  },
  {
    "region": "Mediterranean",
    "name": "Mediterranean_OE",
    "no": 7
  },
  {
    "region": "Mediterranean",
    "name": "Sete-Tunis",
    "no": 8
  },
  {
    "region": "Mediterranean",
    "name": "Cretan_Passage",
    "no": 9
  },
  {
    "region": "Mediterranean",
    "name": "Gulf_de_Cadiz_WOCE_AR16D",
    "no": 10
  },
  {
    "region": "Pacific",
    "name": "ECHV90W",
    "no": 11
  },
  {
    "region": "Pacific",
    "name": "ECHV10S",
    "no": 12
  },
  {
    "region": "Pacific",
    "name": "Bering_strait",
    "no": 13
  },
  {
    "region": "Pacific",
    "name": "Pacific_137E",
    "no": 14
  },
  {
    "region": "Pacific",
    "name": "Pacific-Equator",
    "no": 15
  },
  {
    "region": "Pacific",
    "name": "Hawai-NewZealand",
    "no": 16
  },
  {
    "region": "Pacific",
    "name": "PAC155W",
    "no": 17
  },
  {
    "region": "Pacific",
    "name": "Kuroshio",
    "no": 18
  },
  {
    "region": "Pacific",
    "name": "PACTEST",
    "no": 19
  },
  {
    "region": "Indian",
    "name": "Indian-Equator",
    "no": 20
  },
  {
    "region": "Indian",
    "name": "Indian_Fremantle-SuLabradorndraStait",
    "no": 21
  },
  {
    "region": "Indian",
    "name": "Indian_Moonson_Reversal",
    "no": 22
  },
  {
    "region": "Indian",
    "name": "Indian-Mada",
    "no": 23
  },
  {
    "region": "Indian",
    "name": "Indonesiaw1",
    "no": 24
  },
  {
    "region": "Indian",
    "name": "Indonesiaw2",
    "no": 25
  },
  {
    "region": "Atlantic",
    "name": "Drake_Passage_Atlantic",
    "no": 26
  },
  {
    "region": "Atlantic",
    "name": "Florida_strait",
    "no": 27
  },
  {
    "region": "Atlantic",
    "name": "Hudson_strait",
    "no": 28
  },
  {
    "region": "Atlantic",
    "name": "English_channel",
    "no": 29
  },
  {
    "region": "Atlantic",
    "name": "NewfoundlandIberia",
    "no": 30
  },
  {
    "region": "Atlantic",
    "name": "Davis_strait",
    "no": 31
  },
  {
    "region": "Atlantic",
    "name": "Denmark_strait",
    "no": 32
  },
  {
    "region": "Atlantic",
    "name": "OVIDE_CLIVAR_A25",
    "no": 33
  },
  {
    "region": "Atlantic",
    "name": "Cuba-Florida",
    "no": 34
  },
  {
    "region": "Atlantic",
    "name": "Agulhas_current",
    "no": 35
  },
  {
    "region": "Atlantic",
    "name": "Atlantique_67W",
    "no": 36
  },
  {
    "region": "Atlantic",
    "name": "Yucatan_strait_KANEC",
    "no": 37
  },
  {
    "region": "Atlantic",
    "name": "Atlantic-Equator",
    "no": 38
  },
  {
    "region": "Atlantic",
    "name": "0E WOCEA12_CLIVAR_A13",
    "no": 39
  },
  {
    "region": "Atlantic",
    "name": "Gulf_Guinea_6E",
    "no": 40
  },
  {
    "region": "Atlantic",
    "name": "Cross_equatorial Atlantic",
    "no": 41
  },
  {
    "region": "Atlantic",
    "name": "Biscay_WOCE_AR12D",
    "no": 42
  },
  {
    "region": "Atlantic",
    "name": "NATL30W",
    "no": 43
  },
  {
    "region": "Atlantic",
    "name": "Norge",
    "no": 44
  },
  {
    "region": "Antarctic",
    "name": "Le_Cap-Antarctic",
    "no": 45
  },
  {
    "region": "Antarctic",
    "name": "Tasmania-Antarctic",
    "no": 46
  },
  {
    "region": "Antarctic",
    "name": "Hobart-DumontDurville",
    "no": 47
  },
  {
    "region": "Antarctic",
    "name": "Drake_Passage",
    "no": 48
  },
  {
    "region": "Antarctic",
    "name": "Madagascar_antarctica",
    "no": 49
  },
  {
    "region": "Antarctic",
    "name": "Southafrica_antarctica",
    "no": 50
  },
  {
    "region": "Antarctic",
    "name": "Australia_antarctica",
    "no": 51
  },
  {
    "region": "Arctic",
    "name": "Trans_arc",
    "no": 52
  }
];
type Media={url:string;file:string;type?:string};
const normalize=(s:string)=>s.toLowerCase().replace(/[^a-z0-9]/g,'');
const parts=(f:Media)=>f.url.split('/').filter(Boolean).map(p=>{try{return decodeURIComponent(p)}catch{return p}});
const monthLabel=(m:string)=>new Date(Number(m.slice(0,4)),Number(m.slice(4))-1,1).toLocaleDateString('en-GB',{month:'short',year:'numeric'});
const asset=(url:string)=>import.meta.env.BASE_URL+url.replace(/^\//,'').split('/').map(p=>encodeURIComponent(p)).join('/');
export default function Class3Sections(){
 const [region,setRegion]=useState('All regions');
 const [section,setSection]=useState('');
 const [month,setMonth]=useState('');
 const [media,setMedia]=useState<Media[]>([]);
 const [status,setStatus]=useState('loading');
 const [missing,setMissing]=useState(false);
 useEffect(()=>{let live=true;fetch(import.meta.env.BASE_URL+'figures-manifest.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Missing manifest');return r.json()}).then(d=>{if(live){setMedia(d.class3??[]);setStatus('ready')}}).catch(()=>{if(live)setStatus('error')});return()=>{live=false}},[]);
 const regions=['All regions',...Array.from(new Set(sections.map(s=>s.region)))];
 const visible=sections.filter(s=>region==='All regions'||s.region===region);
 const monthly=media.flatMap(f=>{const p=parts(f);const i=p.findIndex(x=>x.toUpperCase()==='CLASS3');const m=p[i+2];return i>=0&&p.length>i+3&&/^\d{4}(0[1-9]|1[0-2])$/.test(m)?[{...f,section:p[i+1],month:m}]:[]});
 const sectionMedia=monthly.filter(f=>normalize(f.section)===normalize(section));
 const months=Array.from(new Set(sectionMedia.map(f=>f.month))).sort();
 const selectedMonth=months.includes(month)?month:months[0];
 const index=months.indexOf(selectedMonth);
 const figures=sectionMedia.filter(f=>f.month===selectedMonth).sort((a,b)=>a.file.localeCompare(b.file));
 const mapUrl=import.meta.env.BASE_URL+'imgs/CLASS3/all_sections_map.png';
 return <section className="panel scientific-gallery">
 <div className="panel-heading"><div><h2>Class 3 · Ocean sections</h2><p>52 sections across 7 regions</p></div></div>
 <div className="figure-filters"><label>Region <select value={region} onChange={e=>{setRegion(e.target.value);setSection('');setMonth('')}}>{regions.map(r=><option key={r}>{r}</option>)}</select></label><span>{visible.length} sections</span></div>
 <div className="figure-layout class3-layout"><div className="class3-directory figure-controls"><button className={!section?'selected':''} onClick={()=>setSection('')}>All sections · Overview map</button>{visible.map(s=><button key={s.no} className={section===s.name?'selected':''} onClick={()=>{setSection(s.name);setMonth('')}}><strong>{s.no}. {s.name}</strong><small>{s.region} · {new Set(monthly.filter(f=>normalize(f.section)===normalize(s.name)).map(f=>f.month)).size} months</small></button>)}</div>
 <div className="figure-preview">{!section?<>{missing?<p>Map not found. Run python scripts/sync_figures.py imgs and refresh.</p>:<a href={mapUrl} target="_blank" rel="noreferrer"><img src={mapUrl} alt="Overview map of all 52 ocean sections" onError={()=>setMissing(true)}/></a>}<div className="figure-meta">Select a section to browse monthly figures.</div></>:<>
 <div className="class3-heading"><strong>{section}</strong><span>{selectedMonth?monthLabel(selectedMonth):''}</span></div>
 {months.length>0?<><div className="class3-months" aria-label="Available months"><button aria-label="Previous month" disabled={index<=0} onClick={()=>setMonth(months[index-1])}>‹</button>{months.map(m=><button key={m} aria-pressed={m===selectedMonth} className={m===selectedMonth?'selected':''} onClick={()=>setMonth(m)}>{monthLabel(m)}</button>)}<button aria-label="Next month" disabled={index>=months.length-1} onClick={()=>setMonth(months[index+1])}>›</button></div>
 {figures.map(f=>f.type==='video'?<video key={f.url} className="figure-video" src={asset(f.url)} controls preload="metadata"/>:<a key={f.url} href={asset(f.url)} target="_blank" rel="noreferrer"><img src={asset(f.url)} alt={f.file}/></a>)}</>:<p>{status==='loading'?'Loading monthly figures…':status==='error'?'Unable to load the figure manifest. Run python scripts/sync_figures.py imgs.':'No monthly figures indexed for this section.'}</p>}</>}</div></div>
 </section>;
}

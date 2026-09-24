'use client';

import {useMemo,useState} from 'react';
import {products,categories,categoryCriteria,Criterion} from '@/lib/data';
import ProductCard from '@/components/ProductCard';

type FilterValue={min?:string;max?:string;values?:string[]};

export default function Products(){
 const [query,setQuery]=useState('');
 const [cat,setCat]=useState('Tüm kategoriler');
 const [brand,setBrand]=useState('Tüm markalar');
 const [criteriaFilters,setCriteriaFilters]=useState<Record<string,FilterValue>>({});

 const brands=[...new Set(products.map(p=>p.brand))];
 const activeCriteria=cat==='Tüm kategoriler'?[]:(categoryCriteria[cat]||[]).filter(c=>c.filterable!==false);
 const setFilter=(key:string,value:FilterValue)=>setCriteriaFilters(v=>({...v,[key]:value}));
 const toggleMulti=(key:string,value:string)=>{
   const current=criteriaFilters[key]?.values||[];
   const values=current.includes(value)?current.filter(v=>v!==value):[...current,value];
   setFilter(key,{...criteriaFilters[key],values});
 };
 const getValues=(c:Criterion)=>{
   if(c.type==='number') return [];
   const candidates=products.filter(p=>cat==='Tüm kategoriler'||p.cat===cat).filter(p=>{
     if(!c.dependsOn)return true;
     const selected=criteriaFilters[c.dependsOn]?.values?.[0];
     if(!selected)return false;
     const technical=(p as typeof p & {technical?:Record<string,unknown>}).technical||{};
     return String(technical[c.dependsOn]||'')===selected;
   });
   const values=candidates.flatMap(p=>{
     const technical=(p as typeof p & {technical?:Record<string,unknown>}).technical||{};
     const value=technical[c.key];
     return Array.isArray(value)?value.map(String):value===undefined||value===null?[]:[String(value)];
   });
   return [...new Set(values)];
 };

 const filtered=useMemo(()=>products.filter(p=>{
   const q=query.toLowerCase();
   const text=(p.name+' '+p.brand+' '+p.spec).toLowerCase();
   if(q&&!text.includes(q))return false;
   if(brand!=='Tüm markalar'&&p.brand!==brand)return false;
   if(cat!=='Tüm kategoriler'&&p.cat!==cat)return false;
   const technical=(p as typeof p & {technical?:Record<string,unknown>}).technical||{};
   return activeCriteria.every(c=>{
     const filter=criteriaFilters[c.key]; if(!filter)return true;
     const value=technical[c.key]; if(value===undefined||value===null)return false;
     if(c.type==='number'){
       const numeric=Number(value);
       if(filter.min!==undefined&&filter.min!==''&&numeric<Number(filter.min))return false;
       if(filter.max!==undefined&&filter.max!==''&&numeric>Number(filter.max))return false;
       return true;
     }
     
     if(c.type==='multiselect'){
       const selected=filter.values||[]; if(selected.length===0)return true;
       const productValues=Array.isArray(value)?value:[String(value)];
       return selected.some(v=>productValues.includes(v));
     }
     const selected=filter.values?.[0]||'';
     return !selected||String(value)===selected;
   });
 }),[query,cat,brand,criteriaFilters,activeCriteria]);

 const renderCriterion=(c:Criterion)=>{
   const filter=criteriaFilters[c.key]||{};
   if(c.type==='number') return <div key={c.key} style={{marginBottom:14}}><p style={{marginBottom:6,fontWeight:700}}>{c.label}{c.unit?' ('+c.unit+')':''}</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}><input type="number" value={filter.min||''} onChange={e=>setFilter(c.key,{...filter,min:e.target.value})} placeholder="Min" style={{width:'100%',padding:8}}/><input type="number" value={filter.max||''} onChange={e=>setFilter(c.key,{...filter,max:e.target.value})} placeholder="Max" style={{width:'100%',padding:8}}/></div></div>;
   const values=getValues(c);
   if(c.dependsOn&&!criteriaFilters[c.dependsOn]?.values?.[0]) return <div key={c.key} style={{marginBottom:14,opacity:.6}}><p style={{marginBottom:6,fontWeight:700}}>{c.label}</p><div style={{padding:8,border:'1px solid #ddd',borderRadius:6}}>Önce {categoryCriteria[cat]?.find(x=>x.key===c.dependsOn)?.label} seçin</div></div>;
   if(c.type==='multiselect') return <div key={c.key} style={{marginBottom:14}}><p style={{marginBottom:6,fontWeight:700}}>{c.label}</p><div style={{display:'grid',gap:5}}>{values.map(v=><label key={v} style={{fontSize:13,display:'flex',gap:7,alignItems:'center'}}><input type="checkbox" checked={(filter.values||[]).includes(v)} onChange={()=>toggleMulti(c.key,v)}/>{v}</label>)}</div></div>;
   return <div key={c.key} style={{marginBottom:14}}><p style={{marginBottom:6,fontWeight:700}}>{c.label}</p><select value={filter.values?.[0]||''} onChange={e=>setFilter(c.key,{values:e.target.value?[e.target.value]:[]})} style={{width:'100%',padding:8}}><option value="">Tümü</option>{values.map(v=><option key={v}>{v}</option>)}</select></div>;
 };

 return <main className="container" style={{paddingTop:35}}><h1>Ürün Kataloğu</h1><p style={{color:'var(--muted)'}}>Kategori seçildiğinde admin tarafından tanımlanan kriterler, satıcı ürün değerleri üzerinden filtrelenir.</p><div style={{marginTop:20}}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ürün, marka, model veya parça kodu ara..." style={{width:'100%',padding:14,border:'1px solid #d8deea',borderRadius:10}}/></div><div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:24,marginTop:25}}><aside className="card" style={{padding:20}}><b>Filtreler</b><hr/><p>Kategori</p><select value={cat} onChange={e=>{setCat(e.target.value);setCriteriaFilters({})}} style={{width:'100%',padding:10}}><option>Tüm kategoriler</option>{categories.map(x=><option key={x.name}>{x.name}</option>)}</select><p>Marka</p><select value={brand} onChange={e=>setBrand(e.target.value)} style={{width:'100%',padding:10}}><option>Tüm markalar</option>{brands.map(x=><option key={x}>{x}</option>)}</select>{cat!=='Tüm kategoriler'&&<><hr/><p style={{fontWeight:800}}>{cat} Teknik Filtreleri ({activeCriteria.length})</p>{activeCriteria.map(renderCriterion)}</>}<p style={{marginTop:18,color:'var(--muted)',fontSize:13}}>Gösterilen ürün: {filtered.length}</p></aside><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>{filtered.map(p=><ProductCard key={p.id} p={p}/>)}</div></div></main>
}

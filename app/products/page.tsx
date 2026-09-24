'use client';
import {useMemo,useState} from 'react';
import {products,categories,categoryCriteria} from '@/lib/data';
import ProductCard from '@/components/ProductCard';
export default function Products(){
 const [query,setQuery]=useState(''); const [cat,setCat]=useState('Tüm kategoriler'); const [brand,setBrand]=useState('Tüm markalar'); const [criteriaFilters,setCriteriaFilters]=useState<Record<string,string>>({});
 const brands=[...new Set(products.map(p=>p.brand))]; const activeCriteria=cat==='Tüm kategoriler'?[]:(categoryCriteria[cat]||[]).filter(c=>c.filterable!==false);
 const setFilter=(key:string,value:string)=>setCriteriaFilters(v=>({...v,[key]:value}));
 const filtered=useMemo(()=>products.filter(p=>{const q=query.toLowerCase(); const text=(p.name+' '+p.brand+' '+p.spec).toLowerCase(); if(q&&!text.includes(q))return false; if(brand!=='Tüm markalar'&&p.brand!==brand)return false; if(cat!=='Tüm kategoriler'&&p.cat!==cat)return false; return activeCriteria.every(c=>{const wanted=criteriaFilters[c.key]; if(!wanted)return true; const value=(p as typeof p & {technical?:Record<string,unknown>}).technical?.[c.key]; if(Array.isArray(value))return value.includes(wanted); return String(value??'')===wanted;});}),[query,cat,brand,criteriaFilters,activeCriteria]);
 return <main className="container" style={{paddingTop:35}}><h1>Ürün Kataloğu</h1><p style={{color:'var(--muted)'}}>Kategoriye göre değişen teknik kriterlerle ürün bulun, filtreleyin ve karşılaştırın.</p>
 <div style={{marginTop:20}}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ürün, marka veya model ara..." style={{width:'100%',padding:14,border:'1px solid #d8deea',borderRadius:10}}/></div>
 <div style={{display:'grid',gridTemplateColumns:'270px 1fr',gap:24,marginTop:25}}><aside className="card" style={{padding:20}}><b>Filtreler</b><hr/>
 <p>Kategori</p><select value={cat} onChange={e=>{setCat(e.target.value);setCriteriaFilters({})}} style={{width:'100%',padding:10}}><option>Tüm kategoriler</option>{categories.map(x=><option key={x.name}>{x.name}</option>)}</select>
 <p>Marka</p><select value={brand} onChange={e=>setBrand(e.target.value)} style={{width:'100%',padding:10}}><option>Tüm markalar</option>{brands.map(x=><option key={x}>{x}</option>)}</select>
 {activeCriteria.map(c=><div key={c.key}><p>{c.label}{c.unit?' ('+c.unit+')':''}</p>{c.type==='number'?<input type="number" value={criteriaFilters[c.key]||''} onChange={e=>setFilter(c.key,e.target.value)} placeholder="Değer" style={{width:'100%',padding:9}}/>:<select value={criteriaFilters[c.key]||''} onChange={e=>setFilter(c.key,e.target.value)} style={{width:'100%',padding:9}}><option value="">Tümü</option>{(c.values||[]).map(v=><option key={v}>{v}</option>)}</select>}</div>)}
 <p style={{marginTop:18,color:'var(--muted)',fontSize:13}}>Gösterilen ürün: {filtered.length}</p></aside>
 <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>{filtered.map(p=><ProductCard key={p.id} p={p}/>)}</div></div></main>}

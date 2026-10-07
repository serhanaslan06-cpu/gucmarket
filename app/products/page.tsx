'use client';

import {useEffect,useMemo,useState} from 'react';
import {products as fallbackProducts,categories as fallbackCategories,categoryCriteria} from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

type FilterValue={min?:string;max?:string;values?:string[]};
type DbCategory={id:string;name:string;parentId?:string|null;criteria:any[]};
type CatalogProduct={id:string;name:string;brand:string;cat:string;spec:string;price:string;city:string;seller:string;technical:Record<string,any>};

const HISTORY_KEY='gucmarket:viewed-products';
function stableRank(id:string,seed:number){let value=seed;for(let i=0;i<id.length;i++)value=(value*31+id.charCodeAt(i))|0;return value>>>0;}

export default function Products(){
 const [query,setQuery]=useState('');
 const [cat,setCat]=useState('Tüm kategoriler');
 const [brand,setBrand]=useState('Tüm markalar');
 const [criteriaFilters,setCriteriaFilters]=useState<Record<string,FilterValue>>({});
 const [allProducts,setAllProducts]=useState<CatalogProduct[]>(fallbackProducts as CatalogProduct[]);
 const [dbCategories,setDbCategories]=useState<DbCategory[]>([]);
 const [dbReady,setDbReady]=useState(false);
 const [viewedIds,setViewedIds]=useState<string[]>([]);

 useEffect(()=>{
   try{const stored=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');if(Array.isArray(stored))setViewedIds(stored.filter((id:any)=>typeof id==='string').slice(0,20));}catch{}
   Promise.all([
     fetch('/api/categories',{cache:'no-store'}).then(r=>r.ok?r.json():[]),
     fetch('/api/products',{cache:'no-store'}).then(r=>r.ok?r.json():[])
   ]).then(([cats,data])=>{
     if(Array.isArray(cats)&&cats.length)setDbCategories(cats);
     if(Array.isArray(data))setAllProducts(data.map((p:any)=>({
       id:p.id,name:p.name,brand:p.brand?.name||'',cat:p.category?.name||'',spec:p.description||'',
       price:p.price?String(p.price)+' '+(p.currency||'TRY'):'Fiyat için teklif al',
       city:p.city||'',seller:p.supplier?.companyName||'',
       technical:Object.fromEntries((p.technical||[]).map((v:any)=>[v.criterion?.key,v.value]))
     })));
     setDbReady(true);
   }).catch(()=>setDbReady(true));
 },[]);

 const categoryNames=dbCategories.length?dbCategories.map(c=>c.name):fallbackCategories.map(c=>c.name);
 const brands=[...new Set(allProducts.map(p=>p.brand).filter(Boolean))];
 const activeDbCategory=dbCategories.find(c=>c.name===cat);
 const activeCriteria:any[]=cat==='Tüm kategoriler'?[]:(activeDbCategory?.criteria||categoryCriteria[cat]||[]).filter((c:any)=>c.filterable!==false);
 const setFilter=(key:string,value:FilterValue)=>setCriteriaFilters(v=>({...v,[key]:value}));
 const getValues=(c:any)=>{
   const candidates=allProducts.filter(p=>cat==='Tüm kategoriler'||p.cat===cat);
   const values=candidates.flatMap(p=>{const value=(p.technical||{})[c.key];return Array.isArray(value)?value.map(String):value==null?[]:[String(value)];});
   return [...new Set(values)];
 };

 const filtered=useMemo(()=>allProducts.filter(p=>{
   const q=query.toLowerCase();
   const text=(p.name+' '+p.brand+' '+p.spec).toLowerCase();
   if(q&&!text.includes(q))return false;
   if(brand!=='Tüm markalar'&&p.brand!==brand)return false;
   if(cat!=='Tüm kategoriler'&&p.cat!==cat)return false;
   const technical=p.technical||{};
   return activeCriteria.every((c:any)=>{
     const filter=criteriaFilters[c.key];if(!filter)return true;
     const value=technical[c.key];if(value==null)return false;
     if(c.dataType==='NUMBER'||c.type==='number'){
       const numeric=Number(value);
       if(filter.min!==undefined&&filter.min!==''&&numeric<Number(filter.min))return false;
       if(filter.max!==undefined&&filter.max!==''&&numeric>Number(filter.max))return false;
       return true;
     }
     if(c.dataType==='MULTISELECT'||c.type==='multiselect'){
       const selected=filter.values||[];if(!selected.length)return true;
       const productValues=Array.isArray(value)?value:String(value).split(',');
       return selected.some(v=>productValues.includes(v));
     }
     const selected=filter.values?.[0]||'';
     return !selected||String(value)===selected;
   });
 }),[query,cat,brand,criteriaFilters,activeCriteria,allProducts]);

 const recommendations=useMemo(()=>{
   const byId=new Map(allProducts.map(p=>[String(p.id),p]));
   const history=viewedIds.map(id=>byId.get(id)).filter(Boolean) as CatalogProduct[];
   const seed=Number(new Date().toISOString().slice(0,10).replaceAll('-',''));
   return allProducts.map(p=>{
     const similarity=history.reduce((score,seen)=>score+(String(p.id)===String(seen.id)?0:(p.cat===seen.cat?3:0)+(p.brand&&p.brand===seen.brand?2:0)),0);
     const categoryBoost=!history.length&&cat!=='Tüm kategoriler'&&p.cat===cat?2:0;
     return {product:p,score:similarity+categoryBoost,rank:stableRank(String(p.id),seed)};
   }).filter(item=>!history.length||item.score>0)
     .sort((a,b)=>b.score-a.score||a.rank-b.rank)
     .slice(0,4).map(item=>item.product);
 },[allProducts,viewedIds,cat]);
 const hasMatchingHistory=allProducts.some(p=>viewedIds.includes(String(p.id)));
 const recommendationTitle=hasMatchingHistory?'İncelediklerinize benzer':'Öne çıkan ürünler';

 const renderCriterion=(c:any)=>{
   const filter=criteriaFilters[c.key]||{};
   const isNumber=c.dataType==='NUMBER'||c.type==='number';
   const values=getValues(c);
   if(isNumber)return <div key={c.key} style={{marginBottom:14}}><p style={{marginBottom:6,fontWeight:700}}>{c.label}{c.unit?' ('+c.unit+')':''}</p><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}><input type="number" value={filter.min||''} onChange={e=>setFilter(c.key,{...filter,min:e.target.value})} placeholder="Min" style={{width:'100%',padding:8}}/><input type="number" value={filter.max||''} onChange={e=>setFilter(c.key,{...filter,max:e.target.value})} placeholder="Max" style={{width:'100%',padding:8}}/></div></div>;
   if(c.dataType==='MULTISELECT'||c.type==='multiselect')return <div key={c.key} style={{marginBottom:14}}><p style={{marginBottom:6,fontWeight:700}}>{c.label}</p>{values.map((v:string)=><label key={v} style={{fontSize:13,display:'flex',gap:7,marginBottom:5}}><input type="checkbox" checked={(filter.values||[]).includes(v)} onChange={()=>{const cur=filter.values||[];setFilter(c.key,{values:cur.includes(v)?cur.filter(x=>x!==v):[...cur,v]})}}/>{v}</label>)}</div>;
   return <div key={c.key} style={{marginBottom:14}}><p style={{marginBottom:6,fontWeight:700}}>{c.label}</p><select value={filter.values?.[0]||''} onChange={e=>setFilter(c.key,{values:e.target.value?[e.target.value]:[]})} style={{width:'100%',padding:8}}><option value="">Tümü</option>{values.map((v:string)=><option key={v}>{v}</option>)}</select></div>;
 };

 return <main className="container" style={{paddingTop:35}}>
   <h1>Ürün Kataloğu</h1><p style={{color:'var(--muted)'}}>Kategori seçildiğinde Admin tarafından tanımlanan teknik kriterler, veritabanındaki ürün değerleri üzerinden filtrelenir.</p>
   <div style={{marginTop:20}}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ürün, marka, model veya parça kodu ara..." style={{width:'100%',padding:14,border:'1px solid #d8deea',borderRadius:10}}/></div>
   <div className="product-catalog-layout" style={{marginTop:25}}>
    <aside className="card" style={{padding:20}}><b>Filtreler</b><hr/><p>Kategori</p><select value={cat} onChange={e=>{setCat(e.target.value);setCriteriaFilters({})}} style={{width:'100%',padding:10}}><option>Tüm kategoriler</option>{categoryNames.map(x=><option key={x}>{x}</option>)}</select><p>Marka</p><select value={brand} onChange={e=>setBrand(e.target.value)} style={{width:'100%',padding:10}}><option>Tüm markalar</option>{brands.map(x=><option key={x}>{x}</option>)}</select>{cat!=='Tüm kategoriler'&&<><hr/><p style={{fontWeight:800}}>{cat} Teknik Filtreleri ({activeCriteria.length})</p>{activeCriteria.map(renderCriterion)}</>}<p style={{marginTop:18,color:'var(--muted)',fontSize:13}}>Gösterilen ürün: {filtered.length}</p>{dbReady&&dbCategories.length===0&&<p style={{fontSize:12,color:'var(--muted)'}}>DB kategorileri bulunamadı; mevcut demo kategori listesi gösteriliyor.</p>}</aside>
    <section className="product-results" aria-label="Ürünler">{filtered.length?<div className="product-results-grid">{filtered.map(p=><ProductCard key={p.id} p={p}/>)}</div>:<div className="card" style={{padding:24,color:'var(--muted)'}}>Aramanızla eşleşen ürün bulunamadı.</div>}</section>
    <aside className="card product-recommendations" aria-label="Ürün önerileri">
      <div style={{marginBottom:16}}><div style={{fontSize:12,fontWeight:800,color:'#17856f',letterSpacing:'.04em'}}>GÜÇMARKET SEÇKİSİ</div><h2 style={{fontSize:20,margin:'6px 0'}}>{recommendationTitle}</h2><p style={{fontSize:13,color:'var(--muted)',margin:0}}>{hasMatchingHistory?'Kategori ve marka benzerliğine göre seçildi.':'Sizin için seçtiğimiz ürünlere göz atın.'}</p></div>
      {recommendations.length?recommendations.map(p=><article key={p.id} className="product-recommendation-item">
        <Link href={`/products/${p.id}`} className="recommendation-link" onClick={()=>{try{const old=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');localStorage.setItem(HISTORY_KEY,JSON.stringify([String(p.id),...old.filter((id:string)=>id!==String(p.id))].slice(0,20)));}catch{}}}>
          <div className="recommendation-thumb">▣</div><div style={{minWidth:0}}><div style={{fontSize:11,color:'#17856f',fontWeight:800}}>{p.cat}</div><strong className="recommendation-name">{p.name}</strong><div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>{p.brand||p.seller}</div><div style={{fontSize:14,fontWeight:800,marginTop:6}}>{p.price}</div></div>
        </Link>
      </article>):<p style={{fontSize:13,color:'var(--muted)'}}>Öneri göstermek için ürün bulunamadı.</p>}
    </aside>
   </div>
 </main>;
}

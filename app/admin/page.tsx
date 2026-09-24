'use client';

import {useState} from 'react';
import {categories as initialCategories,categoryCriteria as initialCriteria,Criterion,products as initialProducts} from '@/lib/data';

type ProductForm={name:string;brand:string;cat:string;price:string;city:string;seller:string;spec:string;technical:Record<string,string|string[]>};

export default function Admin(){
 const [categories,setCategories]=useState(initialCategories);
 const [criteria,setCriteria]=useState(initialCriteria);
 const [selected,setSelected]=useState(initialCategories[0].name);
 const [name,setName]=useState('');
 const [type,setType]=useState<Criterion['type']>('select');
 const [newCategory,setNewCategory]=useState('');
 const [product,setProduct]=useState<ProductForm>({name:'',brand:'',cat:initialCategories[0].name,price:'',city:'',seller:'',spec:'',technical:{}});
 const [saved,setSaved]=useState(false);

 const addCategory=()=>{
   const n=newCategory.trim(); if(!n||categories.some(c=>c.name===n))return;
   setCategories([...categories,{name:n,desc:'Yeni ürün kategorisi',icon:'▣'}]);
   setCriteria(v=>({...v,[n]:[]})); setSelected(n); setNewCategory('');
 };

 const addCriterion=()=>{
   if(!name.trim())return;
   const key=name.toLowerCase().replace(/[^a-z0-9]+/g,'_');
   setCriteria(v=>({...v,[selected]:[...(v[selected]||[]),{key,label:name,type,values:type==='boolean'?['Var','Yok']:[]}]}));
   setName('');
 };

 const activeCriteria=criteria[product.cat]||[];

 const setTechnical=(key:string,value:string|string[])=>{
   setProduct(v=>({...v,technical:{...v.technical,[key]:value}}));
 };

 const saveProduct=()=>{
   if(!product.name.trim()||!product.brand.trim()||!product.seller.trim())return;
   const id='supplier-'+Date.now();
   const item={id,...product};
   const existing=JSON.parse(localStorage.getItem('gucmarket_products')||'[]');
   localStorage.setItem('gucmarket_products',JSON.stringify([...existing,item]));
   setSaved(true);
 };

 const resetProduct=()=>{
   setProduct({name:'',brand:'',cat:categories[0].name,price:'',city:'',seller:'',spec:'',technical:{}});
   setSaved(false);
 };

 return <main className="container" style={{paddingTop:35,paddingBottom:60}}>
   <h1>Admin Paneli</h1>

   <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:15,marginTop:20}}>
     {[['Toplam Firma','438'],['Aktif Abone','327'],['Toplam Ürün',String(initialProducts.length)],['Teklif Talepleri','2.384']].map(x=><div className="card" style={{padding:22}} key={x[0]}><div style={{color:'var(--muted)'}}>{x[0]}</div><div style={{fontSize:28,fontWeight:800,marginTop:8}}>{x[1]}</div></div>)}
   </div>

   <div className="card" style={{padding:22,marginTop:25}}>
     <h2>Ürün Kategorileri</h2>
     <p style={{color:'var(--muted)'}}>Admin kategorileri ve her kategoriye ait teknik kriterleri yönetir.</p>
     <div style={{display:'flex',gap:10}}>
       <input value={newCategory} onChange={e=>setNewCategory(e.target.value)} placeholder="Yeni kategori adı" style={{flex:1,padding:11}}/>
       <button onClick={addCategory} style={{padding:'11px 18px'}}>Kategori Ekle</button>
     </div>
     <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:15}}>
       {categories.map(c=><button key={c.name} onClick={()=>setSelected(c.name)} style={{padding:'9px 12px',fontWeight:selected===c.name?800:400}}>{c.icon} {c.name}</button>)}
     </div>
   </div>

   <div className="card" style={{padding:22,marginTop:25}}>
     <h2>{selected} — Teknik Özellikler</h2>
     <p style={{color:'var(--muted)'}}>Admin'in tanımladığı kriterler, tedarikçi ürün girişinde otomatik kullanılacaktır.</p>
     <div style={{display:'flex',gap:10,margin:'18px 0'}}>
       <input value={name} onChange={e=>setName(e.target.value)} placeholder="Yeni teknik özellik adı" style={{flex:1,padding:11}}/>
       <select value={type} onChange={e=>setType(e.target.value as Criterion['type'])} style={{padding:11}}><option value="select">Seçim</option><option value="number">Sayısal</option><option value="boolean">Evet/Hayır</option><option value="multiselect">Çoklu seçim</option></select>
       <button onClick={addCriterion} style={{padding:'11px 18px'}}>Özellik Ekle</button>
     </div>
     <div style={{display:'grid',gridTemplateColumns:'1fr 150px',gap:8}}>{(criteria[selected]||[]).map(c=><div key={c.key} style={{display:'contents'}}><div style={{padding:10,borderBottom:'1px solid #edf0f5'}}>{c.label}</div><div style={{padding:10,borderBottom:'1px solid #edf0f5',color:'var(--muted)'}}>{c.type}</div></div>)}</div>
   </div>

   <div className="card" style={{padding:22,marginTop:25}}>
     <h2>Ürün Ekle</h2>
     <p style={{color:'var(--muted)'}}>Bu aşama test amaçlıdır. Ürün, tarayıcıdaki yerel test alanına kaydedilir; henüz veritabanına yazılmaz.</p>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
       <input placeholder="Ürün adı / model" value={product.name} onChange={e=>setProduct(v=>({...v,name:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Marka" value={product.brand} onChange={e=>setProduct(v=>({...v,brand:e.target.value}))} style={{padding:11}}/>
       <select value={product.cat} onChange={e=>setProduct(v=>({...v,cat:e.target.value,technical:{}}))} style={{padding:11}}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select>
       <input placeholder="Satıcı / Tedarikçi" value={product.seller} onChange={e=>setProduct(v=>({...v,seller:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Fiyat" value={product.price} onChange={e=>setProduct(v=>({...v,price:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Şehir" value={product.city} onChange={e=>setProduct(v=>({...v,city:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Kısa teknik özet" value={product.spec} onChange={e=>setProduct(v=>({...v,spec:e.target.value}))} style={{padding:11,gridColumn:'1 / -1'}}/>
     </div>
     <hr style={{margin:'22px 0'}}/>
     <h3>{product.cat} Teknik Değerleri</h3>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
       {activeCriteria.map(c=>{
         if(c.type==='number') return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}{c.unit?' ('+c.unit+')':''}</span><input type="number" value={String(product.technical[c.key]||'')} onChange={e=>setTechnical(c.key,e.target.value)} style={{padding:10}}/></label>;
         if(c.type==='multiselect') return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}</span><select multiple value={Array.isArray(product.technical[c.key])?product.technical[c.key] as string[]:[]} onChange={e=>setTechnical(c.key,Array.from(e.target.selectedOptions).map(o=>o.value))} style={{padding:10,minHeight:80}}>{(c.values||[]).map(v=><option key={v}>{v}</option>)}</select></label>;
         return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}</span><select value={String(product.technical[c.key]||'')} onChange={e=>setTechnical(c.key,e.target.value)} style={{padding:10}}><option value="">Seçiniz</option>{(c.values||[]).map(v=><option key={v}>{v}</option>)}</select></label>;
       })}
     </div>
     <div style={{display:'flex',gap:10,marginTop:22}}>
       <button onClick={saveProduct} style={{padding:'12px 22px',fontWeight:700}}>Ürünü Kaydet</button>
       <button onClick={resetProduct} style={{padding:'12px 22px'}}>Temizle</button>
     </div>
     {saved&&<p style={{marginTop:12,fontWeight:700}}>✓ Test ürünü yerel test alanına kaydedildi.</p>}
   </div>
 </main>
}

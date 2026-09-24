'use client';
import {useMemo,useState} from 'react';
import {products,upsCriteria} from '@/lib/data';
import ProductCard from '@/components/ProductCard';
export default function Products(){
 const [query,setQuery]=useState(''); const [cat,setCat]=useState('Tüm kategoriler'); const [brand,setBrand]=useState('Tüm markalar'); const [topology,setTopology]=useState('Tümü');
 const brands=[...new Set(products.map(p=>p.brand))];
 const filtered=useMemo(()=>products.filter(p=>{const q=query.toLowerCase(); const text=(p.name+' '+p.brand+' '+p.spec).toLowerCase(); return (!q||text.includes(q))&&(cat==='Tüm kategoriler'||p.cat===cat)&&(brand==='Tüm markalar'||p.brand===brand)&&(topology==='Tümü'||p.technical?.topology===topology)}),[query,cat,brand,topology]);
 return <main className="container" style={{paddingTop:35}}><h1>Ürün Kataloğu</h1><p style={{color:'var(--muted)'}}>UPS, akü, OEM yedek parça, solar ve güç elektroniği ürünlerini teknik kriterlerle bulun.</p>
 <div style={{marginTop:20}}><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ürün, marka veya model ara..." style={{width:'100%',padding:14,border:'1px solid #d8deea',borderRadius:10}}/></div>
 <div style={{display:'grid',gridTemplateColumns:'240px 1fr',gap:24,marginTop:25}}><aside className="card" style={{padding:20}}><b>Filtreler</b><hr/>
 <p>Kategori</p><select value={cat} onChange={e=>setCat(e.target.value)} style={{width:'100%',padding:10}}><option>Tüm kategoriler</option>{[...new Set(products.map(p=>p.cat))].map(x=><option key={x}>{x}</option>)}</select>
 <p>Marka</p><select value={brand} onChange={e=>setBrand(e.target.value)} style={{width:'100%',padding:10}}><option>Tüm markalar</option>{brands.map(x=><option key={x}>{x}</option>)}</select>
 <p>UPS Topolojisi</p><select value={topology} onChange={e=>setTopology(e.target.value)} style={{width:'100%',padding:10}}><option>Tümü</option><option>Online</option><option>Line-interactive</option><option>Offline</option></select>
 <p style={{marginTop:18,color:'var(--muted)',fontSize:13}}>Gösterilen ürün: {filtered.length}</p></aside>
 <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>{filtered.map(p=><ProductCard key={p.id} p={p}/>)}</div></div></main>}

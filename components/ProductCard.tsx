'use client';

import Link from 'next/link';

const HISTORY_KEY='gucmarket:viewed-products';
function rememberProduct(id:string){
  try{
    const stored=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');
    const history=Array.isArray(stored)?stored.filter((value:any)=>typeof value==='string'):[];
    localStorage.setItem(HISTORY_KEY,JSON.stringify([id,...history.filter((value:string)=>value!==id)].slice(0,20)));
  }catch{}
}

export default function ProductCard({ p }: any) {
  const handleView=()=>rememberProduct(String(p.id));
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{height:150,borderRadius:12,background:'linear-gradient(135deg,#eaf1fb,#fff)',display:'grid',placeItems:'center',fontSize:55}}>▣</div>
      <div style={{marginTop:14,fontSize:12,color:'#17856f',fontWeight:800}}>{p.cat}</div>
      <h3 style={{fontSize:17,margin:'7px 0'}}>{p.name}</h3>
      <div style={{fontSize:13,color:'var(--muted)'}}>{p.spec}</div>
      <div style={{fontSize:20,fontWeight:800,marginTop:12}}>{p.price}</div>
      <div style={{fontSize:12,color:'var(--muted)'}}>+ KDV'den başlayan</div>
      <div style={{fontSize:12,marginTop:10}}>📍 {p.city} 🏢 {p.seller}</div>
      <div style={{display:'flex',gap:8,marginTop:14}}>
        <Link href={`/products/${p.id}`} onClick={handleView} style={{flex:1,textAlign:'center',padding:11,borderRadius:9,background:'var(--blue)',color:'#fff',fontWeight:700,textDecoration:'none'}}>Teklif Al</Link>
        <Link href={`/products/${p.id}`} onClick={handleView} style={{flex:1,textAlign:'center',padding:11,borderRadius:9,border:'1px solid #cdd6e4',fontWeight:700,textDecoration:'none'}}>İncele</Link>
      </div>
    </div>
  );
}

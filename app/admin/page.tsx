'use client';

import {useState} from 'react';
import {categories as initialCategories,categoryCriteria as initialCriteria,Criterion,products as initialProducts} from '@/lib/data';

type ProductForm={name:string;brand:string;cat:string;price:string;city:string;seller:string;spec:string;technical:Record<string,string|string[]>};

export default function Admin(){
 const [categories,setCategories]=useState(initialCategories);
 const [criteria,setCriteria]=useState(initialCriteria);
 const [selectedCategory,setSelectedCategory]=useState(initialCategories[0].name);
 const [newCategoryName,setNewCategoryName]=useState('');
 const [newCategoryDesc,setNewCategoryDesc]=useState('');
 const [newCriterionName,setNewCriterionName]=useState('');
 const [newCriterionType,setNewCriterionType]=useState<Criterion['type']>('select');
 const [newCriterionUnit,setNewCriterionUnit]=useState('');
 const [newCriterionOptions,setNewCriterionOptions]=useState<string[]>(['']);
 const [categorySaved,setCategorySaved]=useState(false);
 const [criterionSaved,setCriterionSaved]=useState(false);
 const [productSaved,setProductSaved]=useState(false);
 const [supplierMode,setSupplierMode]=useState<'admin'|'supplier'>('admin');

 const [product,setProduct]=useState<ProductForm>({
   name:'',brand:'',cat:initialCategories[0].name,price:'',city:'',seller:'',spec:'',technical:{}
 });

 const createCategory=()=>{
   const name=newCategoryName.trim();
   if(!name||categories.some(c=>c.name===name))return;
   const category={name,desc:newCategoryDesc.trim()||'Yeni ürün kategorisi',icon:'▣'};
   setCategories(v=>[...v,category]);
   setCriteria(v=>({...v,[name]:[]}));
   setSelectedCategory(name);
   setNewCategoryName('');
   setNewCategoryDesc('');
   setCategorySaved(true);
   setCriterionSaved(false);
 };

 const addCriterion=()=>{
   const label=newCriterionName.trim();
   if(!label)return;
   const key=label.toLowerCase().replace(/[^a-z0-9]+/g,'_');
   const values=newCriterionType==='boolean'?['Evet','Hayır']:(newCriterionType==='select'||newCriterionType==='multiselect')?newCriterionOptions.map(v=>v.trim()).filter(Boolean):undefined;
   if((newCriterionType==='select'||newCriterionType==='multiselect')&&(!values||values.length===0))return;
   const criterion:Criterion={key,label,type:newCriterionType,unit:newCriterionUnit.trim()||undefined,values};
   setCriteria(v=>({...v,[selectedCategory]:[...(v[selectedCategory]||[]),criterion]}));
   setNewCriterionName('');
   setNewCriterionUnit('');
   setNewCriterionOptions(['']);
   setCriterionSaved(true);
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
   setProductSaved(true);
 };

 const resetProduct=()=>{
   setProduct({name:'',brand:'',cat:categories[0]?.name||'',price:'',city:'',seller:'',spec:'',technical:{}});
   setProductSaved(false);
 };

 return <main className="container" style={{paddingTop:35,paddingBottom:60}}>
   <h1>GüçMarket Yönetim Paneli</h1>
   <div style={{display:'flex',gap:10,marginTop:15}}><button type="button" onClick={()=>setSupplierMode('admin')} style={{padding:'10px 18px',fontWeight:supplierMode==='admin'?800:400}}>Admin</button><button type="button" onClick={()=>setSupplierMode('supplier')} style={{padding:'10px 18px',fontWeight:supplierMode==='supplier'?800:400}}>Tedarikçi Ürün Girişi</button></div>
   <p style={{color:'var(--muted)'}}>Kategori tanımlama ve ürün ekleme birbirinden ayrı işlemlerdir. Önce kategori ve teknik formu Admin oluşturur; ürün daha sonra mevcut formlardan biri seçilerek eklenir.</p>

   <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:15,marginTop:20}}>
     {[['Toplam Firma','438'],['Aktif Abone','327'],['Toplam Ürün',String(initialProducts.length)],['Teklif Talepleri','2.384']].map(x=><div className="card" style={{padding:22}} key={x[0]}><div style={{color:'var(--muted)'}}>{x[0]}</div><div style={{fontSize:28,fontWeight:800,marginTop:8}}>{x[1]}</div></div>)}
   </div>

   {supplierMode==='admin' ? <>
   <section className="card" style={{padding:22,marginTop:25}}>
     <h2>1. Kategori Tanımla</h2>
     <p style={{color:'var(--muted)'}}>Kategori, ürün formundan bağımsız olarak Admin tarafından oluşturulur.</p>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:10,alignItems:'end'}}>
       <label style={{display:'grid',gap:5}}><span>Kategori Adı</span><input value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} placeholder="Örn. Jeneratörler" style={{padding:11}}/></label>
       <label style={{display:'grid',gap:5}}><span>Açıklama</span><input value={newCategoryDesc} onChange={e=>setNewCategoryDesc(e.target.value)} placeholder="Kategori açıklaması" style={{padding:11}}/></label>
       <button type="button" onClick={createCategory} style={{padding:'11px 18px',fontWeight:700}}>Kategoriyi Kaydet</button>
     </div>
     {categorySaved&&<p style={{fontWeight:700}}>✓ Kategori oluşturuldu.</p>}
   </section>
   <section className="card" style={{padding:22,marginTop:25}}>
     <h2>2. Teknik Formu Oluştur</h2>
     <p style={{color:'var(--muted)'}}>Admin, her kategori için ürün ilanında kullanılacak teknik alanları tanımlar.</p>
     <label style={{display:'grid',gap:5,maxWidth:520}}><span>Kategori</span><select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} style={{padding:11}}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label>
     <div style={{display:'grid',gridTemplateColumns:'1fr 180px 1fr auto',gap:10,marginTop:15,alignItems:'end'}}>
       <label style={{display:'grid',gap:5}}><span>Özellik Adı</span><input value={newCriterionName} onChange={e=>setNewCriterionName(e.target.value)} placeholder="Örn. Yakıt Tipi" style={{padding:11}}/></label>
       <label style={{display:'grid',gap:5}}><span>Veri Tipi</span><select value={newCriterionType} onChange={e=>setNewCriterionType(e.target.value as Criterion['type'])} style={{padding:11}}><option value="text">Metin</option><option value="select">Tekli Seçim</option><option value="number">Sayısal</option><option value="boolean">Evet / Hayır</option><option value="multiselect">Çoklu Seçim</option></select></label>
       <label style={{display:'grid',gap:5}}><span>Birim (opsiyonel)</span><input value={newCriterionUnit} onChange={e=>setNewCriterionUnit(e.target.value)} placeholder="Örn. kVA, V, Ah" style={{padding:11}}/></label>
       <button type="button" onClick={addCriterion} style={{padding:'11px 18px'}}>Özellik Ekle</button>
     </div>
     {(newCriterionType==='select'||newCriterionType==='multiselect')&&<div style={{marginTop:15}}>
       <div style={{fontWeight:700,marginBottom:8}}>Seçenekler</div>
       {newCriterionOptions.map((value,i)=><div key={i} style={{display:'flex',gap:8,marginBottom:8}}>
         <input value={value} onChange={e=>setNewCriterionOptions(v=>v.map((x,j)=>j===i?e.target.value:x))} placeholder={`Seçenek ${i+1}`} style={{padding:10,flex:1}}/>
         <button type="button" onClick={()=>setNewCriterionOptions(v=>v.length>1?v.filter((_,j)=>j!==i):v)} disabled={newCriterionOptions.length===1}>Sil</button>
       </div>)}
       <button type="button" onClick={()=>setNewCriterionOptions(v=>[...v,''])}>+ Seçenek Ekle</button>
     </div>}
     {criterionSaved&&<p style={{fontWeight:700}}>✓ Teknik alan forma eklendi.</p>}
     {(criteria[selectedCategory]||[]).map(c=><div key={c.key} style={{display:'flex',justifyContent:'space-between',padding:10,borderBottom:'1px solid #edf0f5'}}><span>{c.label}</span><span style={{color:'var(--muted)'}}>{c.type}</span></div>)}
   </section>
   </> : <>
   <section className="card" style={{padding:22,marginTop:25}}>
     <h2>Ürün Ekle</h2>
     <p style={{color:'var(--muted)'}}>Tedarikçi yalnızca Admin'in oluşturduğu mevcut kategori ve teknik formu kullanabilir. Yeni kategori veya teknik kriter oluşturamaz.</p>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
       <input placeholder="Ürün adı / model" value={product.name} onChange={e=>setProduct(v=>({...v,name:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Marka" value={product.brand} onChange={e=>setProduct(v=>({...v,brand:e.target.value}))} style={{padding:11}}/>
       <label style={{display:'grid',gap:5}}><span>Mevcut Kategori</span><select value={product.cat} onChange={e=>setProduct(v=>({...v,cat:e.target.value,technical:{}}))} style={{padding:11}}>{categories.map(c=><option key={c.name}>{c.name}</option>)}</select></label>
       <input placeholder="Satıcı / Tedarikçi" value={product.seller} onChange={e=>setProduct(v=>({...v,seller:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Fiyat" value={product.price} onChange={e=>setProduct(v=>({...v,price:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Şehir" value={product.city} onChange={e=>setProduct(v=>({...v,city:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Kısa teknik özet" value={product.spec} onChange={e=>setProduct(v=>({...v,spec:e.target.value}))} style={{padding:11,gridColumn:'1 / -1'}}/>
     </div>
     <hr style={{margin:'22px 0'}}/>
     <h3>{product.cat} — Teknik Form</h3>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
       {activeCriteria.map(c=>{
         if(c.type==='number') return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}{c.unit?' ('+c.unit+')':''}</span><input type="number" value={String(product.technical[c.key]||'')} onChange={e=>setTechnical(c.key,e.target.value)} style={{padding:10}}/></label>;
         if(c.type==='multiselect') return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}</span><select multiple value={Array.isArray(product.technical[c.key])?product.technical[c.key] as string[]:[]} onChange={e=>setTechnical(c.key,Array.from(e.target.selectedOptions).map(o=>o.value))} style={{padding:10,minHeight:80}}>{(c.values||[]).map(v=><option key={v}>{v}</option>)}</select></label>;
         return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}</span><select value={String(product.technical[c.key]||'')} onChange={e=>setTechnical(c.key,e.target.value)} style={{padding:10}}><option value="">Seçiniz</option>{(c.values||[]).map(v=><option key={v}>{v}</option>)}</select></label>;
       })}
     </div>
     <button type="button" onClick={saveProduct} style={{marginTop:22,padding:'12px 22px',fontWeight:700}}>Ürünü Kaydet</button>
     {productSaved&&<p style={{fontWeight:700}}>✓ Test ürünü kaydedildi.</p>}
   </section>
   </>} </main>
}

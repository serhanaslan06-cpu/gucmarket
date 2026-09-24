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
 const [categorySaved,setCategorySaved]=useState(false);
 const [criterionSaved,setCriterionSaved]=useState(false);
 const [productSaved,setProductSaved]=useState(false);

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
   const criterion:Criterion={
     key,label,type:newCriterionType,
     values:newCriterionType==='boolean'?['Var','Yok']:undefined
   };
   setCriteria(v=>({...v,[selectedCategory]:[...(v[selectedCategory]||[]),criterion]}));
   setNewCriterionName('');
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
   <h1>Admin Paneli</h1>
   <p style={{color:'var(--muted)'}}>Kategori tanımlama ve ürün ekleme birbirinden ayrı işlemlerdir. Önce kategori ve teknik formu Admin oluşturur; ürün daha sonra mevcut formlardan biri seçilerek eklenir.</p>

   <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:15,marginTop:20}}>
     {[['Toplam Firma','438'],['Aktif Abone','327'],['Toplam Ürün',String(initialProducts.length)],['Teklif Talepleri','2.384']].map(x=><div className="card" style={{padding:22}} key={x[0]}><div style={{color:'var(--muted)'}}>{x[0]}</div><div style={{fontSize:28,fontWeight:800,marginTop:8}}>{x[1]}</div></div>)}
   </div>

   <section className="card" style={{padding:22,marginTop:25}}>
     <h2>1. Kategori Tanımla</h2>
     <p style={{color:'var(--muted)'}}>Yeni ürün kategorisi Admin tarafından ayrı bir form ile oluşturulur.</p>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:10,alignItems:'end'}}>
       <label style={{display:'grid',gap:5}}><span>Kategori Adı</span><input value={newCategoryName} onChange={e=>setNewCategoryName(e.target.value)} placeholder="Örn. Jeneratörler" style={{padding:11}}/></label>
       <label style={{display:'grid',gap:5}}><span>Açıklama</span><input value={newCategoryDesc} onChange={e=>setNewCategoryDesc(e.target.value)} placeholder="Kategori açıklaması" style={{padding:11}}/></label>
       <button type="button" onClick={createCategory} style={{padding:'11px 18px',fontWeight:700}}>Kategoriyi Kaydet</button>
     </div>
     {categorySaved&&<p style={{fontWeight:700}}>✓ Kategori oluşturuldu. Şimdi bu kategori için teknik formu tanımlayabilirsiniz.</p>}
   </section>

   <section className="card" style={{padding:22,marginTop:25}}>
     <h2>2. Kategori Teknik Formunu Tanımla</h2>
     <p style={{color:'var(--muted)'}}>Burada Admin, seçilen kategori için ürün girişinde kullanılacak teknik alanları oluşturur. Tedarikçi bu alanları değiştiremez.</p>
     <label style={{display:'grid',gap:5,maxWidth:520}}><span>Kategori</span><select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} style={{padding:11}}>{categories.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select></label>
     <div style={{display:'grid',gridTemplateColumns:'1fr 180px auto',gap:10,marginTop:15,alignItems:'end'}}>
       <label style={{display:'grid',gap:5}}><span>Yeni Teknik Özellik</span><input value={newCriterionName} onChange={e=>setNewCriterionName(e.target.value)} placeholder="Örn. Yakıt Tipi" style={{padding:11}}/></label>
       <label style={{display:'grid',gap:5}}><span>Veri Tipi</span><select value={newCriterionType} onChange={e=>setNewCriterionType(e.target.value as Criterion['type'])} style={{padding:11}}><option value="select">Seçim</option><option value="number">Sayısal</option><option value="boolean">Evet / Hayır</option><option value="multiselect">Çoklu Seçim</option></select></label>
       <button type="button" onClick={addCriterion} style={{padding:'11px 18px',fontWeight:700}}>Özellik Ekle</button>
     </div>
     {criterionSaved&&<p style={{fontWeight:700}}>✓ Teknik özellik forma eklendi.</p>}
     <div style={{marginTop:18}}>
       {(criteria[selectedCategory]||[]).map(c=><div key={c.key} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #edf0f5'}}><span>{c.label}</span><span style={{color:'var(--muted)'}}>{c.type}</span></div>)}
     </div>
   </section>

   <section className="card" style={{padding:22,marginTop:25}}>
     <h2>3. Ürün Ekle</h2>
     <p style={{color:'var(--muted)'}}>Ürün ekleme, Admin'in daha önce oluşturduğu mevcut kategori ve teknik form üzerinden yapılır. Bu bölümden yeni kategori veya yeni teknik kriter oluşturulamaz.</p>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
       <input placeholder="Ürün adı / model" value={product.name} onChange={e=>setProduct(v=>({...v,name:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Marka" value={product.brand} onChange={e=>setProduct(v=>({...v,brand:e.target.value}))} style={{padding:11}}/>
       <label style={{display:'grid',gap:5}}><span>Mevcut Kategori</span><select value={product.cat} onChange={e=>setProduct(v=>({...v,cat:e.target.value,technical:{}}))} style={{padding:11}}>{categories.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select></label>
       <input placeholder="Satıcı / Tedarikçi" value={product.seller} onChange={e=>setProduct(v=>({...v,seller:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Fiyat" value={product.price} onChange={e=>setProduct(v=>({...v,price:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Şehir" value={product.city} onChange={e=>setProduct(v=>({...v,city:e.target.value}))} style={{padding:11}}/>
       <input placeholder="Kısa teknik özet" value={product.spec} onChange={e=>setProduct(v=>({...v,spec:e.target.value}))} style={{padding:11,gridColumn:'1 / -1'}}/>
     </div>
     <hr style={{margin:'22px 0'}}/>
     <h3>{product.cat} — Admin Formundaki Teknik Alanlar</h3>
     <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
       {activeCriteria.map(c=>{
         if(c.type==='number') return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}{c.unit?' ('+c.unit+')':''}</span><input type="number" value={String(product.technical[c.key]||'')} onChange={e=>setTechnical(c.key,e.target.value)} style={{padding:10}}/></label>;
         if(c.type==='multiselect') return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}</span><select multiple value={Array.isArray(product.technical[c.key])?product.technical[c.key] as string[]:[]} onChange={e=>setTechnical(c.key,Array.from(e.target.selectedOptions).map(o=>o.value))} style={{padding:10,minHeight:80}}>{(c.values||[]).map(v=><option key={v}>{v}</option>)}</select></label>;
         return <label key={c.key} style={{display:'grid',gap:5}}><span>{c.label}</span><select value={String(product.technical[c.key]||'')} onChange={e=>setTechnical(c.key,e.target.value)} style={{padding:10}}><option value="">Seçiniz</option>{(c.values||[]).map(v=><option key={v}>{v}</option>)}</select></label>;
       })}
     </div>
     <div style={{display:'flex',gap:10,marginTop:22}}>
       <button type="button" onClick={saveProduct} style={{padding:'12px 22px',fontWeight:700}}>Ürünü Kaydet</button>
       <button type="button" onClick={resetProduct} style={{padding:'12px 22px'}}>Temizle</button>
     </div>
     {productSaved&&<p style={{marginTop:12,fontWeight:700}}>✓ Test ürünü yerel test alanına kaydedildi.</p>}
   </section>
 </main>
}

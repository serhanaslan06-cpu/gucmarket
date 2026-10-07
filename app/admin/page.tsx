'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';

type Category = { id: string; name: string; description?: string | null; parentId?: string | null; criteria: Criterion[] };
type Criterion = { id: string; key: string; label: string; dataType: string; unit?: string | null; options: { id: string; label: string; value: string }[] };
type ProductForm = { name: string; brand: string; categoryId: string; price: string; city: string; supplierName: string; spec: string; technical: Record<string, string | string[]> };
type ProductRow = { id: string; name: string; model?: string | null; price?: string | number | null; city?: string | null; category?: { name: string }; supplier?: { companyName: string }; brand?: { name: string } | null };

const typeLabels: Record<string, string> = { TEXT:'Metin', NUMBER:'Sayısal', BOOLEAN:'Evet/Hayır', SELECT:'Tekli Seçim', MULTISELECT:'Çoklu Seçim' };
const nav = [
  ['overview', 'Genel Bakış'], ['products', 'Ürünler'], ['categories', 'Kategoriler'],
  ['suppliers', 'Tedarikçiler'], ['members', 'Üyeler'], ['controls', 'Kontrol'],
] as const;
type Section = typeof nav[number][0];

export default function Admin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [section, setSection] = useState<Section>('overview');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [criterionName, setCriterionName] = useState('');
  const [criterionType, setCriterionType] = useState('select');
  const [criterionUnit, setCriterionUnit] = useState('');
  const [criterionOptions, setCriterionOptions] = useState(['']);
  const [product, setProduct] = useState<ProductForm>({name:'',brand:'',categoryId:'',price:'',city:'',supplierName:'',spec:'',technical:{}});

  const refresh = async () => {
    setLoading(true);
    try {
      const [cr, pr] = await Promise.all([
        fetch('/api/categories', { cache:'no-store' }),
        fetch('/api/products', { cache:'no-store' }),
      ]);
      const [cd, pd] = await Promise.all([cr.json(), pr.json()]);
      if (!cr.ok) throw new Error(cd.error || 'Kategoriler alınamadı');
      if (!pr.ok) throw new Error(pd.error || 'Ürünler alınamadı');
      setCategories(cd);
      setProducts(pd);
      if (cd.length && !selectedCategoryId) {
        setSelectedCategoryId(cd[0].id);
        setProduct(p => ({...p, categoryId:cd[0].id}));
      }
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Veriler alınamadı'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const productCategory = categories.find(c => c.id === product.categoryId);
  const suppliers = useMemo(() => Array.from(new Map(products.map(p => [p.supplier?.companyName || '', p.supplier?.companyName || ''])).values()).filter(Boolean), [products]);

  const createCategory = async () => {
    setMessage('');
    if (!newName.trim()) return;
    const r = await fetch('/api/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newName,description:newDesc,parentId:newParentId || null}) });
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Kategori oluşturulamadı');
    setNewName(''); setNewDesc(''); setNewParentId('');
    setMessage('Kategori kaydedildi.');
    await refresh(); setSelectedCategoryId(data.id);
  };
  const deleteCategory = async (c: Category) => {
    if (!window.confirm(`“${c.name}” kategorisini kaldırmak istiyor musunuz? Ürün veya alt kategori varsa önce onları kaldırmalısınız.`)) return;
    const r = await fetch('/api/categories/'+c.id, {method:'DELETE'});
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Kategori kaldırılamadı');
    setMessage('Kategori kaldırıldı.'); await refresh();
  };
  const addCriterion = async () => {
    if (!selectedCategoryId || !criterionName.trim()) return;
    const options = (criterionType === 'select' || criterionType === 'multiselect') ? criterionOptions.map(x=>x.trim()).filter(Boolean) : [];
    const r = await fetch('/api/categories/'+selectedCategoryId+'/criteria', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({label:criterionName,type:criterionType,unit:criterionUnit,options})});
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Teknik özellik oluşturulamadı');
    setCriterionName(''); setCriterionUnit(''); setCriterionOptions(['']); setMessage('Teknik özellik kaydedildi.'); await refresh();
  };
  const saveProduct = async () => {
    if (!product.name.trim() || !product.categoryId || !product.supplierName.trim()) return setMessage('Ürün adı, kategori ve tedarikçi zorunludur.');
    const r = await fetch('/api/products', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(product)});
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Ürün kaydedilemedi');
    setProduct({name:'',brand:'',categoryId:product.categoryId,price:'',city:'',supplierName:'',spec:'',technical:{}});
    setMessage('Ürün kaydedildi.'); await refresh();
  };
  const deleteProduct = async (p: ProductRow) => {
    if (!window.confirm(`“${p.name}” ürününü kalıcı olarak silmek istiyor musunuz?`)) return;
    const r = await fetch('/api/products/'+p.id, {method:'DELETE'});
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Ürün silinemedi');
    setMessage('Ürün silindi.'); await refresh();
  };

  const card: CSSProperties = {padding:22, marginTop:18};
  const field: CSSProperties = {padding:11, width:'100%'};
  const grid: CSSProperties = {display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:12, alignItems:'end'};

  return <main className="container" style={{paddingTop:32,paddingBottom:60}}>
    <h1>GüçMarket Yönetim Paneli</h1>
    <p style={{color:'var(--muted)'}}>Katalog, ürün ve tedarikçi yönetimi</p>
    <nav aria-label="Yönetim menüsü" style={{display:'flex',flexWrap:'wrap',gap:8,margin:'20px 0'}}>
      {nav.map(([id,label])=><button key={id} type="button" onClick={()=>{setSection(id);setMessage('');}} aria-current={section===id?'page':undefined} style={{padding:'10px 16px',fontWeight:section===id?800:500,borderRadius:8,border:section===id?'1px solid #1769ff':'1px solid #d8e0ec',background:section===id?'#1769ff':'white',color:section===id?'white':'inherit'}}>{label}</button>)}
    </nav>
    {message && <div className="card" role="status" style={{padding:14,marginTop:12,fontWeight:700}}>{message}</div>}
    {loading ? <div className="card" style={{padding:25,marginTop:20}}>Veritabanı yükleniyor...</div> : <>
      {section==='overview' && <section className="card" style={card}>
        <h2>Genel Bakış</h2><div style={grid}>
          {[['Ürün',products.length],['Kategori',categories.length],['Tedarikçi',suppliers.length],['Üye','—']].map(([label,value])=><div key={String(label)} className="card" style={{padding:18}}><div style={{color:'var(--muted)'}}>{label}</div><strong style={{fontSize:26}}>{value}</strong></div>)}
        </div><p style={{color:'var(--muted)',marginTop:16}}>Ürün ve kategori kayıtları mevcut veritabanı API’lerinden alınır.</p>
      </section>}

      {section==='categories' && <>
        <section className="card" style={card}>
          <h2>Kategori Ekle</h2><p style={{color:'var(--muted)'}}>Ana kategori veya alt kategori oluşturun.</p>
          <div style={grid}>
            <label>Kategori Adı<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Örn. Jeneratörler" style={field}/></label>
            <label>Açıklama<input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Kategori açıklaması" style={field}/></label>
            <label>Üst Kategori<select value={newParentId} onChange={e=>setNewParentId(e.target.value)} style={field}><option value="">Ana kategori</option>{categories.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
            <button type="button" onClick={createCategory} style={{padding:12,fontWeight:700}}>Kategoriyi Kaydet</button>
          </div>
        </section>
        <section className="card" style={card}>
          <h2>Kategoriler</h2><p style={{color:'var(--muted)'}}>Silme işlemi, kategori boşsa pasife alır. Ürün/alt kategori varsa önce onları kaldırın.</p>
          {categories.map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',padding:'12px 0',borderBottom:'1px solid #edf0f5'}}><span>{c.parentId?'↳ ':''}<b>{c.name}</b></span><button type="button" onClick={()=>deleteCategory(c)} style={{padding:'8px 12px'}}>Kategoriyi Sil</button></div>)}
        </section>
        <section className="card" style={card}>
          <h2>Teknik Form</h2><label style={{display:'grid',gap:5,maxWidth:600}}>Kategori<select value={selectedCategoryId} onChange={e=>setSelectedCategoryId(e.target.value)} style={field}>{categories.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
          <div style={{...grid,marginTop:14}}>
            <label>Özellik Adı<input value={criterionName} onChange={e=>setCriterionName(e.target.value)} placeholder="Örn. Yakıt Tipi" style={field}/></label>
            <label>Veri Tipi<select value={criterionType} onChange={e=>setCriterionType(e.target.value)} style={field}><option value="text">Metin</option><option value="select">Tekli Seçim</option><option value="number">Sayısal</option><option value="boolean">Evet / Hayır</option><option value="multiselect">Çoklu Seçim</option></select></label>
            <label>Birim<input value={criterionUnit} onChange={e=>setCriterionUnit(e.target.value)} placeholder="kVA, V, Ah..." style={field}/></label><button type="button" onClick={addCriterion} style={{padding:12}}>Özellik Kaydet</button>
          </div>
          {(criterionType==='select'||criterionType==='multiselect') && <div style={{marginTop:14}}><b>Seçenekler</b>{criterionOptions.map((v,i)=><div key={i} style={{display:'flex',gap:8,marginTop:8}}><input value={v} onChange={e=>setCriterionOptions(a=>a.map((x,j)=>j===i?e.target.value:x))} placeholder={'Seçenek '+(i+1)} style={{...field,flex:1}}/><button type="button" disabled={criterionOptions.length===1} onClick={()=>setCriterionOptions(a=>a.filter((_,j)=>j!==i))}>Sil</button></div>)}<button type="button" style={{marginTop:8}} onClick={()=>setCriterionOptions(a=>[...a,''])}>+ Seçenek</button></div>}
          {(selectedCategory?.criteria||[]).map(c=><div key={c.id} style={{padding:10,borderBottom:'1px solid #edf0f5'}}>{c.label}{c.unit?' ('+c.unit+')':''} <span style={{color:'var(--muted)'}}>· {typeLabels[c.dataType]||c.dataType}</span></div>)}
        </section>
      </>}

      {section==='products' && <>
        <section className="card" style={card}><h2>Ürün Ekle</h2><div style={grid}>
          <input placeholder="Ürün adı / model" value={product.name} onChange={e=>setProduct(v=>({...v,name:e.target.value}))} style={field}/>
          <input placeholder="Marka" value={product.brand} onChange={e=>setProduct(v=>({...v,brand:e.target.value}))} style={field}/>
          <label>Kategori<select value={product.categoryId} onChange={e=>setProduct(v=>({...v,categoryId:e.target.value,technical:{}}))} style={field}>{categories.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
          <input placeholder="Tedarikçi firma" value={product.supplierName} onChange={e=>setProduct(v=>({...v,supplierName:e.target.value}))} style={field}/>
          <input placeholder="Fiyat (TL)" value={product.price} onChange={e=>setProduct(v=>({...v,price:e.target.value}))} style={field}/>
          <input placeholder="Şehir" value={product.city} onChange={e=>setProduct(v=>({...v,city:e.target.value}))} style={field}/>
          <input placeholder="Kısa teknik özet" value={product.spec} onChange={e=>setProduct(v=>({...v,spec:e.target.value}))} style={{...field,gridColumn:'1 / -1'}}/>
        </div><hr style={{margin:'20px 0'}}/><h3>{productCategory?.name||'Kategori'} — Teknik Form</h3><div style={grid}>
          {(productCategory?.criteria||[]).map(c=>{
            const common={key:c.id,style:field};
            if(c.dataType==='NUMBER') return <label key={c.id}>{c.label}{c.unit?' ('+c.unit+')':''}<input type="number" value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={common.style}/></label>;
            if(c.dataType==='TEXT') return <label key={c.id}>{c.label}<input value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={common.style}/></label>;
            if(c.dataType==='BOOLEAN') return <label key={c.id}>{c.label}<select value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={common.style}><option value="">Seçiniz</option><option>Evet</option><option>Hayır</option></select></label>;
            if(c.dataType==='MULTISELECT') return <label key={c.id}>{c.label}<select multiple value={Array.isArray(product.technical[c.key])?product.technical[c.key] as string[]:[]} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:Array.from(e.target.selectedOptions).map(o=>o.value)}}))} style={{...common.style,minHeight:80}}>{c.options.map(o=><option key={o.id} value={o.value}>{o.label}</option>)}</select></label>;
            return <label key={c.id}>{c.label}<select value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={common.style}><option value="">Seçiniz</option>{c.options.map(o=><option key={o.id} value={o.value}>{o.label}</option>)}</select></label>;
          })}
        </div><button type="button" onClick={saveProduct} style={{marginTop:20,padding:'12px 22px',fontWeight:700}}>Ürünü Kaydet</button></section>
        <section className="card" style={card}><h2>Eklenen Ürünler</h2>{products.length===0?<p>Henüz listelenecek ürün yok.</p>:products.map(p=><div key={p.id} style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center',padding:'12px 0',borderBottom:'1px solid #edf0f5'}}><span><b>{p.name}</b> {p.model||''}<br/><small style={{color:'var(--muted)'}}>{p.category?.name||'Kategori yok'} · {p.supplier?.companyName||'Tedarikçi yok'}</small></span><button type="button" onClick={()=>deleteProduct(p)} style={{padding:'8px 12px'}}>Ürünü Sil</button></div>)}</section>
      </>}

      {section==='suppliers' && <section className="card" style={card}><h2>Tedarikçiler</h2><p style={{color:'var(--muted)'}}>Liste, ürün kayıtlarındaki tedarikçi bilgilerine göre oluşturulur.</p>{suppliers.length?suppliers.map(name=><div key={name} style={{padding:12,borderBottom:'1px solid #edf0f5'}}><b>{name}</b><span style={{color:'var(--muted)'}}> · {products.filter(p=>p.supplier?.companyName===name).length} ürün</span></div>):<p>Henüz tedarikçi yok. Ürün eklerken tedarikçi firma adı girin.</p>}</section>}

      {section==='members' && <section className="card" style={card}><h2>Üyeler</h2><p>Projede şu anda kullanıcı/üyelik veritabanı modeli ve üye yönetim API’si bulunmuyor. Üye listesi ve onay işlemlerini açmak için önce güvenli giriş ve kullanıcı kaydı altyapısı eklenmeli.</p></section>}

      {section==='controls' && <section className="card" style={card}><h2>Kontrol</h2><p>Son veri kontrolü: ürün ve kategori API’leri başarıyla yüklendi.</p><p>Kategoriler: {categories.length} · Ürünler: {products.length} · Tedarikçiler: {suppliers.length}</p><button type="button" onClick={()=>void refresh()} style={{padding:'10px 16px'}}>Verileri Yenile</button></section>}
    </>}
  </main>;
}

'use client';

import { useEffect, useMemo, useState } from 'react';

type Category = { id: string; name: string; description?: string | null; parentId?: string | null; criteria: Criterion[] };
type Criterion = { id: string; key: string; label: string; dataType: string; unit?: string | null; options: { id: string; label: string; value: string }[] };
type ProductForm = { name: string; brand: string; categoryId: string; price: string; city: string; supplierName: string; spec: string; technical: Record<string, string | string[]> };

const typeLabels: Record<string,string> = { TEXT:'Metin', NUMBER:'Sayısal', BOOLEAN:'Evet/Hayır', SELECT:'Tekli Seçim', MULTISELECT:'Çoklu Seçim' };

export default function Admin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [mode, setMode] = useState<'admin'|'supplier'>('admin');
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

  const loadCategories = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/categories', { cache: 'no-store' });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Kategoriler alınamadı');
      setCategories(data);
      if (data.length && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
        setProduct(p => ({...p, categoryId: data[0].id}));
      }
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Kategoriler alınamadı'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadCategories(); }, []);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const productCategory = categories.find(c => c.id === product.categoryId);
  const childCategories = useMemo(() => categories.filter(c => c.parentId === selectedCategoryId), [categories, selectedCategoryId]);

  const createCategory = async () => {
    setMessage('');
    if (!newName.trim()) return;
    const r = await fetch('/api/categories', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:newName,description:newDesc,parentId:newParentId || null}) });
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Kategori oluşturulamadı');
    setNewName(''); setNewDesc(''); setNewParentId('');
    setMessage('✓ Kategori gerçek veritabanına kaydedildi.');
    await loadCategories();
    setSelectedCategoryId(data.id);
  };

  const addCriterion = async () => {
    if (!selectedCategoryId || !criterionName.trim()) return;
    const options = (criterionType === 'select' || criterionType === 'multiselect') ? criterionOptions.map(x=>x.trim()).filter(Boolean) : [];
    const r = await fetch('/api/categories/'+selectedCategoryId+'/criteria', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({label:criterionName,type:criterionType,unit:criterionUnit,options})});
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Teknik özellik oluşturulamadı');
    setCriterionName(''); setCriterionUnit(''); setCriterionOptions(['']);
    setMessage('✓ Teknik özellik gerçek veritabanına kaydedildi.');
    await loadCategories();
  };

  const saveProduct = async () => {
    if (!product.name.trim() || !product.categoryId || !product.supplierName.trim()) return setMessage('Ürün adı, kategori ve tedarikçi zorunludur.');
    const r = await fetch('/api/products', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(product)});
    const data = await r.json();
    if (!r.ok) return setMessage(data.error || 'Ürün kaydedilemedi');
    setProduct({name:'',brand:'',categoryId:product.categoryId,price:'',city:'',supplierName:'',spec:'',technical:{}});
    setMessage('✓ Ürün gerçek veritabanına kaydedildi.');
  };

  return <main className="container" style={{paddingTop:35,paddingBottom:60}}>
    <h1>GüçMarket Yönetim Paneli</h1>
    <div style={{display:'flex',gap:10,marginTop:15}}>
      <button type="button" onClick={()=>setMode('admin')} style={{padding:'10px 18px',fontWeight:mode==='admin'?800:400}}>Admin</button>
      <button type="button" onClick={()=>setMode('supplier')} style={{padding:'10px 18px',fontWeight:mode==='supplier'?800:400}}>Tedarikçi Ürün Girişi</button>
    </div>
    <p style={{color:'var(--muted)'}}>Kategori, teknik form ve ürün artık localStorage yerine gerçek DB API'leri üzerinden çalışır.</p>
    {message && <div className="card" style={{padding:14,marginTop:15,fontWeight:700}}>{message}</div>}

    {loading ? <div className="card" style={{padding:25,marginTop:25}}>Veritabanı yükleniyor...</div> : <>
      {mode==='admin' ? <>
        <section className="card" style={{padding:22,marginTop:25}}>
          <h2>1. Kategori Tanımla</h2>
          <p style={{color:'var(--muted)'}}>Ana kategori veya seçilen üst kategori altında alt kategori oluşturabilirsiniz.</p>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr auto',gap:10,alignItems:'end'}}>
            <label style={{display:'grid',gap:5}}><span>Kategori Adı</span><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Örn. Jeneratörler" style={{padding:11}}/></label>
            <label style={{display:'grid',gap:5}}><span>Açıklama</span><input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Kategori açıklaması" style={{padding:11}}/></label>
            <label style={{display:'grid',gap:5}}><span>Üst Kategori (opsiyonel)</span><select value={newParentId} onChange={e=>setNewParentId(e.target.value)} style={{padding:11}}><option value="">Ana kategori</option>{categories.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
            <button type="button" onClick={createCategory} style={{padding:'11px 18px',fontWeight:700}}>Kaydet</button>
          </div>
        </section>

        <section className="card" style={{padding:22,marginTop:25}}>
          <h2>2. Teknik Formu Oluştur</h2>
          <label style={{display:'grid',gap:5,maxWidth:600}}><span>Kategori</span><select value={selectedCategoryId} onChange={e=>setSelectedCategoryId(e.target.value)} style={{padding:11}}>{categories.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
          <div style={{display:'grid',gridTemplateColumns:'1fr 180px 1fr auto',gap:10,marginTop:15,alignItems:'end'}}>
            <label style={{display:'grid',gap:5}}><span>Özellik Adı</span><input value={criterionName} onChange={e=>setCriterionName(e.target.value)} placeholder="Örn. Yakıt Tipi" style={{padding:11}}/></label>
            <label style={{display:'grid',gap:5}}><span>Veri Tipi</span><select value={criterionType} onChange={e=>setCriterionType(e.target.value)} style={{padding:11}}><option value="text">Metin</option><option value="select">Tekli Seçim</option><option value="number">Sayısal</option><option value="boolean">Evet / Hayır</option><option value="multiselect">Çoklu Seçim</option></select></label>
            <label style={{display:'grid',gap:5}}><span>Birim</span><input value={criterionUnit} onChange={e=>setCriterionUnit(e.target.value)} placeholder="kVA, V, Ah..." style={{padding:11}}/></label>
            <button type="button" onClick={addCriterion} style={{padding:'11px 18px'}}>Ekle</button>
          </div>
          {(criterionType==='select'||criterionType==='multiselect') && <div style={{marginTop:15}}><b>Seçenekler</b>{criterionOptions.map((v,i)=><div key={i} style={{display:'flex',gap:8,marginTop:8}}><input value={v} onChange={e=>setCriterionOptions(a=>a.map((x,j)=>j===i?e.target.value:x))} placeholder={'Seçenek '+(i+1)} style={{padding:10,flex:1}}/><button type="button" disabled={criterionOptions.length===1} onClick={()=>setCriterionOptions(a=>a.filter((_,j)=>j!==i))}>Sil</button></div>)}<button type="button" style={{marginTop:8}} onClick={()=>setCriterionOptions(a=>[...a,''])}>+ Seçenek</button></div>}
          <div style={{marginTop:20}}>{(selectedCategory?.criteria||[]).map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',padding:10,borderBottom:'1px solid #edf0f5'}}><span>{c.label}{c.unit?' ('+c.unit+')':''}</span><span style={{color:'var(--muted)'}}>{typeLabels[c.dataType]||c.dataType}</span></div>)}</div>
        </section>
      </> : <section className="card" style={{padding:22,marginTop:25}}>
        <h2>Ürün Ekle</h2>
        <p style={{color:'var(--muted)'}}>Tedarikçi sadece Admin tarafından oluşturulmuş kategori ve teknik formu kullanır.</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <input placeholder="Ürün adı / model" value={product.name} onChange={e=>setProduct(v=>({...v,name:e.target.value}))} style={{padding:11}}/>
          <input placeholder="Marka" value={product.brand} onChange={e=>setProduct(v=>({...v,brand:e.target.value}))} style={{padding:11}}/>
          <label style={{display:'grid',gap:5}}><span>Mevcut Kategori</span><select value={product.categoryId} onChange={e=>setProduct(v=>({...v,categoryId:e.target.value,technical:{}}))} style={{padding:11}}>{categories.map(c=><option key={c.id} value={c.id}>{c.parentId?'↳ ':''}{c.name}</option>)}</select></label>
          <input placeholder="Tedarikçi firma" value={product.supplierName} onChange={e=>setProduct(v=>({...v,supplierName:e.target.value}))} style={{padding:11}}/>
          <input placeholder="Fiyat (TL)" value={product.price} onChange={e=>setProduct(v=>({...v,price:e.target.value}))} style={{padding:11}}/>
          <input placeholder="Şehir" value={product.city} onChange={e=>setProduct(v=>({...v,city:e.target.value}))} style={{padding:11}}/>
          <input placeholder="Kısa teknik özet" value={product.spec} onChange={e=>setProduct(v=>({...v,spec:e.target.value}))} style={{padding:11,gridColumn:'1 / -1'}}/>
        </div>
        <hr style={{margin:'22px 0'}}/>
        <h3>{productCategory?.name || 'Kategori'} — Teknik Form</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
          {(productCategory?.criteria||[]).map(c=>{
            if(c.dataType==='NUMBER') return <label key={c.id} style={{display:'grid',gap:5}}><span>{c.label}{c.unit?' ('+c.unit+')':''}</span><input type="number" value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={{padding:10}}/></label>;
            if(c.dataType==='TEXT') return <label key={c.id} style={{display:'grid',gap:5}}><span>{c.label}</span><input value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={{padding:10}}/></label>;
            if(c.dataType==='BOOLEAN') return <label key={c.id} style={{display:'grid',gap:5}}><span>{c.label}</span><select value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={{padding:10}}><option value="">Seçiniz</option><option>Evet</option><option>Hayır</option></select></label>;
            if(c.dataType==='MULTISELECT') return <label key={c.id} style={{display:'grid',gap:5}}><span>{c.label}</span><select multiple value={Array.isArray(product.technical[c.key])?product.technical[c.key] as string[]:[]} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:Array.from(e.target.selectedOptions).map(o=>o.value)}}))} style={{padding:10,minHeight:80}}>{c.options.map(o=><option key={o.id} value={o.value}>{o.label}</option>)}</select></label>;
            return <label key={c.id} style={{display:'grid',gap:5}}><span>{c.label}</span><select value={String(product.technical[c.key]??'')} onChange={e=>setProduct(v=>({...v,technical:{...v.technical,[c.key]:e.target.value}}))} style={{padding:10}}><option value="">Seçiniz</option>{c.options.map(o=><option key={o.id} value={o.value}>{o.label}</option>)}</select></label>;
          })}
        </div>
        <button type="button" onClick={saveProduct} style={{marginTop:22,padding:'12px 22px',fontWeight:700}}>Ürünü Kaydet</button>
      </section>}
    </>}
  </main>;
}

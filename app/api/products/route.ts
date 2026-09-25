import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: { in: ['APPROVED', 'PUBLISHED'] } },
    include: { category: true, supplier: true, brand: true, technical: { include: { criterion: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? '').trim();
  const categoryId = String(body.categoryId ?? '');
  const supplierName = String(body.supplierName ?? '').trim();
  if (!name || !categoryId || !supplierName) return NextResponse.json({ error: 'Ürün adı, kategori ve tedarikçi zorunludur.' }, { status: 400 });
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true, active: true } });
  if (!category || !category.active) return NextResponse.json({ error: 'Kategori bulunamadı veya pasif.' }, { status: 400 });
  try {
    const supplierSlug = supplierName.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const supplier = await prisma.supplier.upsert({ where: { slug: supplierSlug }, update: { companyName: supplierName }, create: { companyName: supplierName, slug: supplierSlug } });
    let brandId: string | null = null;
    if (body.brand) {
      const brandName = String(body.brand).trim();
      const brandSlug = brandName.toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      const brand = await prisma.brand.upsert({ where: { slug: brandSlug }, update: { name: brandName }, create: { name: brandName, slug: brandSlug } });
      brandId = brand.id;
    }
    const slugBase = (String(body.model || name)).toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    const slug = slugBase + '-' + Date.now();
    const technical = body.technical && typeof body.technical === 'object' ? body.technical : {};
    const criteria = await prisma.technicalCriterion.findMany({ where: { categoryId, active: true } });
    const criterionByKey = new Map(criteria.map(c => [c.key, c]));
    for (const key of Object.keys(technical)) {
      if (!criterionByKey.has(key)) return NextResponse.json({ error: `Geçersiz teknik özellik: ${key}` }, { status: 400 });
    }
    const values = Object.entries(technical).flatMap(([key, raw]) => {
      const criterion = criterionByKey.get(key);
      if (!criterion || raw === '' || raw == null) return [];
      const value = Array.isArray(raw) ? raw.map(String).join(',') : String(raw);
      return [{ criterionId: criterion.id, value }];
    });
    const product = await prisma.product.create({
      data: { name, model: body.model ? String(body.model) : null, description: body.spec ? String(body.spec) : null, price: body.price ? String(body.price).replace(/[^0-9.,-]/g,'').replace(',','.') : null, currency: 'TRY', city: body.city ? String(body.city) : null, categoryId, supplierId: supplier.id, brandId, slug, status: 'PUBLISHED', technical: { create: values } },
      include: { category: true, supplier: true, brand: true, technical: true },
    });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Ürün kaydedilemedi.' }, { status: 409 });
  }
}

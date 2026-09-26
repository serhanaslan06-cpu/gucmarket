export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId');
  const supplierId = searchParams.get('supplierId');
  const brandId = searchParams.get('brandId');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');

  const reserved = new Set(['categoryId', 'supplierId', 'brandId', 'minPrice', 'maxPrice']);
  const technicalFilters = Array.from(searchParams.entries()).filter(([key]) => {
    return !reserved.has(key) && !key.startsWith('min_') && !key.startsWith('max_');
  });

  const numericFilters = Array.from(searchParams.entries()).filter(([key]) => key.startsWith('min_') || key.startsWith('max_'));

  let categoryIds: string[] | undefined;
  if (categoryId) {
    const categories = await prisma.category.findMany({
      where: { active: true },
      select: { id: true, parentId: true },
    });
    const childrenByParent = new Map<string, string[]>();
    for (const category of categories) {
      if (!category.parentId) continue;
      const children = childrenByParent.get(category.parentId) ?? [];
      children.push(category.id);
      childrenByParent.set(category.parentId, children);
    }
    categoryIds = [categoryId];
    for (let i = 0; i < categoryIds.length; i++) {
      categoryIds.push(...(childrenByParent.get(categoryIds[i]) ?? []));
    }
  }

  const products = await prisma.product.findMany({
    where: {
      status: { in: ['APPROVED', 'PUBLISHED'] },
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
      ...(supplierId ? { supplierId } : {}),
      ...(brandId ? { brandId } : {}),
      ...(minPrice || maxPrice ? {
        price: {
          ...(minPrice ? { gte: minPrice } : {}),
          ...(maxPrice ? { lte: maxPrice } : {}),
        },
      } : {}),
    },
    include: {
      category: true,
      supplier: true,
      brand: true,
      technical: { include: { criterion: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const matchesTechnical = (product: typeof products[number]) => {
    const values = new Map(product.technical.map(item => [item.criterion.key, item.value]));

    for (const [key, expected] of technicalFilters) {
      const actual = values.get(key);
      if (actual == null) return false;
      const criterion = product.technical.find(item => item.criterion.key === key)?.criterion;
      if (!criterion) return false;

      if (criterion.dataType === 'MULTISELECT') {
        const selected = actual.split(',').map(v => v.trim());
        if (!selected.includes(expected)) return false;
      } else if (actual !== expected) {
        return false;
      }
    }

    for (const [key, bound] of numericFilters) {
      const criterionKey = key.replace(/^(min|max)_/, '');
      const actual = values.get(criterionKey);
      if (actual == null) return false;
      const actualNumber = Number(actual.replace(',', '.'));
      const boundNumber = Number(bound.replace(',', '.'));
      if (!Number.isFinite(actualNumber) || !Number.isFinite(boundNumber)) return false;
      if (key.startsWith('min_') && actualNumber < boundNumber) return false;
      if (key.startsWith('max_') && actualNumber > boundNumber) return false;
    }

    return true;
  };

  return NextResponse.json(products.filter(matchesTechnical));
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
    const allCategories = await prisma.category.findMany({
      where: { active: true },
      select: { id: true, parentId: true },
    });
    const categoryById = new Map(allCategories.map(c => [c.id, c]));
    const categoryChain: string[] = [];
    let currentId: string | null = categoryId;
    while (currentId) {
      categoryChain.unshift(currentId);
      currentId = categoryById.get(currentId)?.parentId ?? null;
    }

    const criteria = await prisma.technicalCriterion.findMany({
      where: { categoryId: { in: categoryChain }, active: true },
      orderBy: { sortOrder: 'asc' },
    });
    const criterionByKey = new Map(criteria.map(c => [c.key, c]));

    for (const key of Object.keys(technical)) {
      if (!criterionByKey.has(key)) {
        return NextResponse.json({ error: `Geçersiz teknik özellik: ${key}` }, { status: 400 });
      }
    }

    const requiredCriteria = criteria.filter(c => c.required);
    for (const criterion of requiredCriteria) {
      const raw = technical[criterion.key];
      const missing = raw == null || raw === '' || (Array.isArray(raw) && raw.length === 0);
      if (missing) {
        return NextResponse.json({ error: `Zorunlu teknik özellik eksik: ${criterion.label}` }, { status: 400 });
      }
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

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: {
      criteria: {
        where: { active: true },
        include: { options: { where: { active: true }, orderBy: { sortOrder: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  const byId = new Map(categories.map(category => [category.id, category]));
  const withInheritedCriteria = categories.map(category => {
    const chain: typeof categories = [];
    let current: typeof category | undefined = category;

    while (current) {
      chain.unshift(current);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }

    const criteriaByKey = new Map<string, (typeof category.criteria)[number]>();
    for (const item of chain) {
      for (const criterion of item.criteria) {
        criteriaByKey.set(criterion.key, criterion);
      }
    }

    return {
      ...category,
      criteria: Array.from(criteriaByKey.values()).sort(
        (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, 'tr')
      ),
    };
  });

  return NextResponse.json(withInheritedCriteria);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'Kategori adı zorunludur.' }, { status: 400 });
  const parentId = body.parentId ? String(body.parentId) : null;
  if (parentId) {
    const parent = await prisma.category.findUnique({ where: { id: parentId }, select: { id: true, active: true } });
    if (!parent || !parent.active) return NextResponse.json({ error: 'Üst kategori bulunamadı veya pasif.' }, { status: 400 });
  }
  const slug = String(body.slug ?? name).toLocaleLowerCase('tr-TR')
    .replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  try {
    const category = await prisma.category.create({
      data: { name, slug, description: body.description ? String(body.description) : null, parentId },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Kategori oluşturulamadı. Aynı isim/slug mevcut olabilir.' }, { status: 409 });
  }
}

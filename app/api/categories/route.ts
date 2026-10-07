import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const slugify = (value: string) =>
  value.toLocaleLowerCase('tr-TR')
    .replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u')
    .replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    include: { criteria: { where: { active: true }, include: { options: { where: { active: true }, orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } } },
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'Kategori adı zorunludur.' }, { status: 400 });

  const parentId = body.parentId ? String(body.parentId) : null;
  let parentSlug = '';

  if (parentId) {
    const parent = await prisma.category.findUnique({
      where: { id: parentId },
      select: { id: true, active: true, slug: true },
    });
    if (!parent || !parent.active) {
      return NextResponse.json({ error: 'Üst kategori bulunamadı veya pasif.' }, { status: 400 });
    }
    parentSlug = parent.slug;
  }

  // Slugs are globally unique in the database. For subcategories, include
  // the parent slug so the same child name can safely exist under different parents.
  const baseSlug = slugify(String(body.slug ?? name));
  const slug = parentSlug ? `${parentSlug}-${baseSlug}` : baseSlug;

  try {
    const existing = await prisma.category.findUnique({ where: { slug }, select: { id: true, active: true, name: true } });
    if (existing) {
      return NextResponse.json({
        error: existing.active
          ? 'Bu kategori adı aynı üst kategori altında zaten mevcut.'
          : 'Bu kategori daha önce oluşturulmuş ancak pasif durumda. Önce mevcut kategoriyi aktifleştirin.',
      }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name, slug, description: body.description ? String(body.description) : null, parentId },
    });
    return NextResponse.json(category, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Kategori oluşturulamadı. Lütfen kategori bilgilerini kontrol edin.' }, { status: 409 });
  }
}

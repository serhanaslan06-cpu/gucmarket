import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

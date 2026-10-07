import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const category = await prisma.category.findUnique({
    where: { id },
    select: { id: true, active: true, _count: { select: { children: true, products: true } } },
  });
  if (!category) return NextResponse.json({ error: 'Kategori bulunamadı.' }, { status: 404 });
  if (category._count.children > 0 || category._count.products > 0) {
    return NextResponse.json({
      error: 'Bu kategoride alt kategoriler veya ürünler var. Önce ürünleri silin ve alt kategorileri kaldırın.',
    }, { status: 409 });
  }
  await prisma.category.update({ where: { id }, data: { active: false } });
  return NextResponse.json({ success: true });
}

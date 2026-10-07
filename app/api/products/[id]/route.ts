import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı.' }, { status: 404 });
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const typeMap: Record<string, 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT'> = { text: 'TEXT', number: 'NUMBER', boolean: 'BOOLEAN', select: 'SELECT', multiselect: 'MULTISELECT' };\nconst mapType = (type: string) => typeMap[type];

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = await request.json();
  const label = String(body.label ?? '').trim();
  const key = String(body.key ?? label).trim().toLocaleLowerCase('tr-TR').replace(/ı/g,'i').replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s').replace(/ö/g,'o').replace(/ç/g,'c').replace(/[^a-z0-9]+/g,'_');
  const dataType = mapType(String(body.type ?? 'text'));
  if (!label || !dataType) return NextResponse.json({ error: 'Özellik adı ve geçerli veri tipi zorunludur.' }, { status: 400 });
  const options = Array.isArray(body.options) ? body.options.map(String).map((x: string) => x.trim()).filter(Boolean) : [];
  if ((dataType === 'SELECT' || dataType === 'MULTISELECT') && options.length === 0) return NextResponse.json({ error: 'Seçim alanları için en az bir seçenek gereklidir.' }, { status: 400 });
  try {
    const count = await prisma.technicalCriterion.count({ where: { categoryId: id } });
    const criterion = await prisma.technicalCriterion.create({
      data: {
        categoryId: id, key, label, dataType, unit: body.unit ? String(body.unit).trim() : null, sortOrder: count,
        options: options.length ? { create: options.map((value: string, i: number) => ({ label: value, value, sortOrder: i })) } : undefined,
      },
      include: { options: true },
    });
    return NextResponse.json(criterion, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Teknik özellik oluşturulamadı.' }, { status: 409 });
  }
}

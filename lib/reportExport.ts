// lib/reportExport.ts
// Turn a ReportData snapshot into a downloadable Excel / CSV / PDF file.
// The heavy libraries (xlsx, jspdf) are dynamically imported so they only load
// when the user actually exports — keeping them out of the initial bundle/SSR.
import type { ReportData } from '@/lib/services/reports';
import { fmtDateShort as fmtDate } from '@/lib/format';

export type ReportFormat = 'excel' | 'csv' | 'pdf';

const money = (code: string, n?: number | null) =>
  `${code} ${(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ymd = (iso: string) => new Date(iso).toISOString().slice(0, 10);
const fileBase = (d: ReportData) => `RotoPay-Report_${ymd(d.period.start)}_${ymd(d.period.end)}`;

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Rows shared by every format.
const summaryRows = (d: ReportData): [string, string][] => [
  ['Period', `${fmtDate(d.period.start)} – ${fmtDate(d.period.end)} (${d.period.months} month${d.period.months > 1 ? 's' : ''})`],
  ['Global currency', d.currency],
  ['Native currency', d.nativeCurrency],
  ['Rate', d.rate == null ? 'unavailable' : `1 ${d.currency} = ${d.rate} ${d.nativeCurrency}`],
  ['Total shifts', String(d.totals.shifts)],
  ['Total hours', `${d.totals.hours}h`],
  ['Amount earned', money(d.currency, d.totals.earned)],
  ['Native amount earned', d.totals.nativeEarned == null ? '—' : money(d.nativeCurrency, d.totals.nativeEarned)],
  ['Wages recorded', String(d.totals.wages)],
  ['Payments total', money(d.currency, d.totals.paidTotal)],
];

// ── CSV (no dependency) ─────────────────────────
function csvCell(v: string | number): string {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvRow = (cells: (string | number)[]) => cells.map(csvCell).join(',');

function toCSV(d: ReportData): string {
  const lines: string[] = ['RotoPay Report'];
  for (const [k, v] of summaryRows(d)) lines.push(csvRow([k, v]));

  lines.push('', 'Shifts', csvRow(['Date', 'Name', 'Type', 'Hours', `Earned (${d.currency})`]));
  for (const s of d.shifts) lines.push(csvRow([fmtDate(s.date), s.name, s.type, s.hours, s.earned]));

  lines.push('', 'Wages', csvRow(['Shift', 'Employee', 'Rate type', 'Currency', 'Value']));
  for (const w of d.wages) lines.push(csvRow([w.shift, w.employee, w.rateType, w.currency, w.value]));

  lines.push('', 'Payments', csvRow(['Month', `Amount (${d.currency})`]));
  for (const p of d.payments) lines.push(csvRow([p.label, p.amount]));

  return lines.join('\n');
}

// ── Excel (SheetJS) ─────────────────────────────
async function toExcel(d: ReportData) {
  const XLSX = await import('xlsx');
  const wb = XLSX.utils.book_new();

  const summary = XLSX.utils.aoa_to_sheet([['RotoPay Report'], [], ...summaryRows(d)]);
  XLSX.utils.book_append_sheet(wb, summary, 'Summary');

  const shifts = XLSX.utils.json_to_sheet(
    d.shifts.map((s) => ({ Date: fmtDate(s.date), Name: s.name, Type: s.type, Hours: s.hours, [`Earned (${d.currency})`]: s.earned }))
  );
  XLSX.utils.book_append_sheet(wb, shifts, 'Shifts');

  const wages = XLSX.utils.json_to_sheet(
    d.wages.map((w) => ({ Shift: w.shift, Employee: w.employee, 'Rate type': w.rateType, Currency: w.currency, Value: w.value }))
  );
  XLSX.utils.book_append_sheet(wb, wages, 'Wages');

  const payments = XLSX.utils.json_to_sheet(
    d.payments.map((p) => ({ Month: p.label, [`Amount (${d.currency})`]: p.amount }))
  );
  XLSX.utils.book_append_sheet(wb, payments, 'Payments');

  XLSX.writeFile(wb, `${fileBase(d)}.xlsx`);
}

// ── PDF (jsPDF + autotable) ─────────────────────
async function toPDF(d: ReportData) {
  const { default: JsPDF } = await import('jspdf');
  const autoTable = (await import('jspdf-autotable')).default;

  const doc = new JsPDF();
  const brand: [number, number, number] = [0, 94, 163];

  doc.setFontSize(18);
  doc.setTextColor(...brand);
  doc.text('RotoPay Report', 14, 18);
  doc.setFontSize(10);
  doc.setTextColor(90);
  doc.text(`${fmtDate(d.period.start)} – ${fmtDate(d.period.end)}`, 14, 25);

  autoTable(doc, {
    startY: 32,
    theme: 'plain',
    styles: { fontSize: 9 },
    body: summaryRows(d),
    columnStyles: { 0: { fontStyle: 'bold', textColor: brand } },
  });

  const after = (): number => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  const headStyles = { fillColor: brand };

  doc.setFontSize(12);
  doc.setTextColor(...brand);
  doc.text('Shifts', 14, after());
  autoTable(doc, {
    startY: after() + 2,
    head: [['Date', 'Name', 'Type', 'Hours', `Earned (${d.currency})`]],
    body: d.shifts.map((s) => [fmtDate(s.date), s.name, s.type, String(s.hours), s.earned.toLocaleString()]),
    styles: { fontSize: 8 },
    headStyles,
  });

  doc.setFontSize(12);
  doc.setTextColor(...brand);
  doc.text('Wages', 14, after());
  autoTable(doc, {
    startY: after() + 2,
    head: [['Shift', 'Employee', 'Rate', 'Cur', 'Value']],
    body: d.wages.map((w) => [w.shift, w.employee, w.rateType, w.currency, w.value.toLocaleString()]),
    styles: { fontSize: 8 },
    headStyles,
  });

  if (d.payments.length) {
    doc.setFontSize(12);
    doc.setTextColor(...brand);
    doc.text('Payments', 14, after());
    autoTable(doc, {
      startY: after() + 2,
      head: [['Month', `Amount (${d.currency})`]],
      body: d.payments.map((p) => [p.label, p.amount.toLocaleString()]),
      styles: { fontSize: 8 },
      headStyles,
    });
  }

  doc.save(`${fileBase(d)}.pdf`);
}

export async function exportReport(data: ReportData, format: ReportFormat): Promise<void> {
  if (format === 'csv') {
    download(new Blob([toCSV(data)], { type: 'text/csv;charset=utf-8;' }), `${fileBase(data)}.csv`);
  } else if (format === 'excel') {
    await toExcel(data);
  } else {
    await toPDF(data);
  }
}

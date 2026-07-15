import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import type { ReportColumn, ReportData } from './report.service';

function escapeCsv(value: string | number | undefined): string {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function toCsv(data: ReportData): string {
  const header = data.columns.map((c) => escapeCsv(c.header)).join(',');
  const lines = data.rows.map((row) => data.columns.map((c) => escapeCsv(row[c.key])).join(','));
  return [header, ...lines].join('\r\n');
}

export async function toXlsx(data: ReportData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CoreSphere ERP';
  const sheet = workbook.addWorksheet(data.title.slice(0, 31));

  sheet.columns = data.columns.map((c) => ({
    header: c.header,
    key: c.key,
    width: Math.max(14, c.header.length + 2),
  }));
  data.rows.forEach((row) => sheet.addRow(row));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF0FF' } };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function toPdf(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(16).fillColor('#111').text(data.title);
    doc.moveDown(0.3);
    doc.fontSize(9).fillColor('#666').text(`CoreSphere ERP · generated ${new Date().toISOString().slice(0, 10)} · ${data.rows.length} rows`);
    doc.moveDown(0.8);

    const startX = doc.page.margins.left;
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const colWidth = pageWidth / data.columns.length;
    const rowHeight = 18;

    const drawRow = (values: Record<string, string | number>, bold: boolean, columns: ReportColumn[]) => {
      if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();
      const y = doc.y;
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#111');
      columns.forEach((c, i) => {
        doc.text(String(values[c.key] ?? ''), startX + i * colWidth + 2, y + 5, {
          width: colWidth - 4,
          height: rowHeight,
          ellipsis: true,
          lineBreak: false,
        });
      });
      doc
        .moveTo(startX, y + rowHeight)
        .lineTo(startX + pageWidth, y + rowHeight)
        .strokeColor(bold ? '#999' : '#e5e5e5')
        .lineWidth(bold ? 1 : 0.5)
        .stroke();
      doc.y = y + rowHeight;
    };

    const headerValues: Record<string, string> = {};
    data.columns.forEach((c) => (headerValues[c.key] = c.header));
    drawRow(headerValues, true, data.columns);
    data.rows.forEach((row) => drawRow(row, false, data.columns));

    doc.end();
  });
}

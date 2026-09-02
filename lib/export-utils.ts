'use client';

import html2canvas from 'html2canvas';
import { TemplateAnalysis, TemplateStyle } from '@/types';

export function exportToPdf() {
  window.print();
}

export async function exportToImage(elementId = 'cv-print-root', filename = 'my-cv.png'): Promise<void> {
  const rootEl = document.getElementById(elementId);
  if (!rootEl) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  const pageEl = (rootEl.querySelector('.cv-page') as HTMLElement) || rootEl;

  // Temporarily clone or capture at full native resolution (zoom = 1)
  const canvas = await html2canvas(pageEl, {
    scale: 2, // 2x high-resolution capture for crisp text
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    windowHeight: 1123,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToWord(
  analysis: TemplateAnalysis,
  singletonValues: Record<string, string>,
  entries: Record<string, Array<Record<string, string>>>,
  filename = 'my-cv.doc',
  styleOverrides?: Partial<TemplateStyle>,
): void {
  const primaryColor =
    styleOverrides?.primaryColor ||
    styleOverrides?.theme?.headingColor ||
    analysis.style.theme?.headingColor ||
    analysis.style.primaryColor ||
    '#111111';
  const fontFamily = styleOverrides?.fontFamily || analysis.style.fontFamily || 'Arial, sans-serif';

  const name =
    singletonValues.fullName ||
    singletonValues.name ||
    singletonValues.full_name ||
    'Your Name';
  const jobTitle =
    singletonValues.jobTitle ||
    singletonValues.title ||
    '';

  const sections = analysis.sections || [];

  let bodyHtml = `
    <div style="font-family: ${escapeHtml(fontFamily)}; color: #333333; max-width: 750px; margin: 0 auto; line-height: 1.4;">
      <div style="text-align: center; border-bottom: 2px solid ${escapeHtml(primaryColor)}; padding-bottom: 12px; margin-bottom: 20px;">
        <h1 style="font-size: 24pt; margin: 0 0 6px 0; text-transform: uppercase; color: ${escapeHtml(primaryColor)};">${escapeHtml(name)}</h1>
        ${jobTitle ? `<p style="font-size: 13pt; margin: 0 0 8px 0; font-weight: bold; color: #555555; text-transform: uppercase;">${escapeHtml(jobTitle)}</p>` : ''}
  `;

  // Collect contact fields
  const contactFields = analysis.fields.filter(
    (f) =>
      (f.section === 'personal' || f.section === 'contact') &&
      !/name|title|photo/i.test(`${f.id} ${f.label}`) &&
      (singletonValues[f.id] || '').trim(),
  );

  if (contactFields.length > 0) {
    const contactText = contactFields
      .map((f) => `${escapeHtml(f.label)}: ${escapeHtml(singletonValues[f.id] || '')}`)
      .join(' | ');
    bodyHtml += `<p style="font-size: 9.5pt; color: #666666; margin: 0;">${contactText}</p>`;
  }

  bodyHtml += `</div>`;

  // Render each section
  for (const section of sections) {
    if (section.id === 'personal' && !section.repeatable) continue;

    const isRepeatable = section.repeatable;
    const sectionEntries = entries[section.id] || [];
    const fields = analysis.fields.filter((f) => f.section === section.id);

    // Skip section if empty
    if (isRepeatable && sectionEntries.length === 0) continue;
    if (!isRepeatable && !fields.some((f) => (singletonValues[f.id] || '').trim())) continue;

    bodyHtml += `
      <div style="margin-bottom: 16px;">
        <h2 style="font-size: 12pt; text-transform: uppercase; border-bottom: 1.5px solid #222222; padding-bottom: 3px; margin: 0 0 8px 0; color: #111111;">
          ${escapeHtml(section.name)}
        </h2>
    `;

    if (isRepeatable) {
      for (const entry of sectionEntries) {
        const firstField = fields.find((f) => (entry[f.id] || '').trim());
        const title = firstField ? entry[firstField.id].trim() : 'Entry';
        const dateField = fields.find(
          (f) =>
            f.id !== firstField?.id &&
            /date|year|duration|period|time/i.test(`${f.id} ${f.label}`) &&
            (entry[f.id] || '').trim(),
        );
        const dateVal = dateField ? entry[dateField.id].trim() : '';

        bodyHtml += `
          <div style="margin-bottom: 8px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 2px;">
              <tr>
                <td style="font-size: 10.5pt; font-weight: bold; color: #222222; text-align: left;">${escapeHtml(title)}</td>
                ${dateVal ? `<td style="font-size: 9.5pt; color: #666666; text-align: right;">${escapeHtml(dateVal)}</td>` : ''}
              </tr>
            </table>
        `;

        for (const f of fields) {
          if (f.id === firstField?.id || f.id === dateField?.id) continue;
          const val = (entry[f.id] || '').trim();
          if (!val) continue;

          if (f.type === 'textarea') {
            const lines = val.split(/\s*\|\s*|\r?\n/).filter(Boolean);
            bodyHtml += `<ul style="margin: 3px 0 6px 18px; padding: 0; font-size: 10pt;">`;
            for (const line of lines) {
              bodyHtml += `<li style="margin-bottom: 2px;">${escapeHtml(line)}</li>`;
            }
            bodyHtml += `</ul>`;
          } else {
            bodyHtml += `<p style="font-size: 10pt; margin: 2px 0; color: #444444;">${escapeHtml(val)}</p>`;
          }
        }

        bodyHtml += `</div>`;
      }
    } else {
      for (const f of fields) {
        const val = (singletonValues[f.id] || '').trim();
        if (!val) continue;

        if (f.type === 'textarea') {
          const lines = val.split(/\s*\|\s*|\r?\n/).filter(Boolean);
          if (lines.length > 1) {
            bodyHtml += `<ul style="margin: 3px 0 6px 18px; padding: 0; font-size: 10pt;">`;
            for (const line of lines) {
              bodyHtml += `<li style="margin-bottom: 2px;">${escapeHtml(line)}</li>`;
            }
            bodyHtml += `</ul>`;
          } else {
            bodyHtml += `<p style="font-size: 10pt; margin: 2px 0; line-height: 1.45;">${escapeHtml(val)}</p>`;
          }
        } else {
          bodyHtml += `<p style="font-size: 10pt; margin: 2px 0;"><strong style="color: #333333;">${escapeHtml(f.label)}:</strong> ${escapeHtml(val)}</p>`;
        }
      }
    }

    bodyHtml += `</div>`;
  }

  bodyHtml += `</div>`;

  const wordHtml = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(name)} - CV</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 21.0cm 29.7cm; /* A4 */
            margin: 2.0cm 2.0cm 2.0cm 2.0cm;
            mso-page-orientation: portrait;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 10pt;
            color: #222222;
          }
        </style>
      </head>
      <body>
        ${bodyHtml}
      </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + wordHtml], {
    type: 'application/msword;charset=utf-8',
  });

  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename.endsWith('.doc') ? filename : `${filename}.doc`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

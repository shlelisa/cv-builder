'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import { TemplateAnalysis, TemplateStyle } from '@/types';

/**
 * Downloads a pixel-perfect, crisp, 1-page A4 PDF directly to the user's computer.
 */
export async function exportToPdfDownload(
  elementId = 'cv-print-root',
  filename = 'My_CV.pdf',
): Promise<void> {
  const rootEl = document.getElementById(elementId);
  if (!rootEl) {
    window.print();
    return;
  }

  const pageEl = (rootEl.querySelector('.cv-page') as HTMLElement) || rootEl;

  // Capture at 2x resolution for razor-sharp typography
  const canvas = await html2canvas(pageEl, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    windowHeight: 1123,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);

  // A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
  const outName = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
  pdf.save(outName);
}

/**
 * Opens the native browser print/save dialog.
 */
export function exportToPdf() {
  window.print();
}

/**
 * Captures the rendered CV as a high-resolution PNG image.
 */
export async function exportToImage(
  elementId = 'cv-print-root',
  filename = 'My_CV.png',
): Promise<void> {
  const rootEl = document.getElementById(elementId);
  if (!rootEl) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  const pageEl = (rootEl.querySelector('.cv-page') as HTMLElement) || rootEl;

  const canvas = await html2canvas(pageEl, {
    scale: 2.5,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 794,
    windowHeight: 1123,
  });

  canvas.toBlob((blob) => {
    if (blob) {
      const outName = filename.endsWith('.png') ? filename : `${filename}.png`;
      saveAs(blob, outName);
    }
  }, 'image/png');
}

function cleanFontName(fontStr?: string): string {
  if (!fontStr) return 'Arial';
  const first = fontStr.split(',')[0].replace(/['"]/g, '').trim();
  return first || 'Arial';
}

function cleanHex(colorStr?: string): string {
  if (!colorStr) return '1E293B';
  return colorStr.replace('#', '').trim() || '1E293B';
}

/**
 * Generates and downloads a native Microsoft Word (.docx) document.
 */
export async function exportToWord(
  analysis: TemplateAnalysis,
  singletonValues: Record<string, string>,
  entries: Record<string, Array<Record<string, string>>>,
  filename = 'My_CV.docx',
  styleOverrides?: Partial<TemplateStyle>,
): Promise<void> {
  const outName = filename.endsWith('.docx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.docx`;

  // 1. Try server API download first for 100% native HTTP header download
  try {
    const res = await fetch('/api/export-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'cv',
        analysis,
        singletonValues,
        entries,
        styleOverrides,
        filename: outName,
      }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const docxBlob = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      saveAs(docxBlob, outName);
      return;
    }
  } catch (err) {
    console.warn('Server docx export fallback to client:', err);
  }

  // 2. Client-side fallback with docx Packer
  const rawPrimary =
    styleOverrides?.primaryColor ||
    styleOverrides?.theme?.headingColor ||
    analysis.style.theme?.headingColor ||
    analysis.style.primaryColor ||
    '#1e293b';
  const primaryHex = cleanHex(rawPrimary);
  const fontName = cleanFontName(
    styleOverrides?.fontFamily || analysis.style.fontFamily || 'Arial',
  );

  const name =
    singletonValues.fullName ||
    singletonValues.name ||
    singletonValues.full_name ||
    'Candidate Name';
  const jobTitle =
    singletonValues.jobTitle ||
    singletonValues.title ||
    '';

  const sections = analysis.sections || [];
  const docParagraphs: Paragraph[] = [];

  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: name.toUpperCase(),
          bold: true,
          size: 44,
          font: fontName,
          color: primaryHex,
        }),
      ],
    }),
  );

  if (jobTitle) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: jobTitle.toUpperCase(),
            bold: true,
            size: 24,
            font: fontName,
            color: '4B5563',
          }),
        ],
      }),
    );
  }

  const contactFields = analysis.fields.filter(
    (f) =>
      (f.section === 'personal' || f.section === 'contact') &&
      !/name|title|photo/i.test(`${f.id} ${f.label}`) &&
      (singletonValues[f.id] || '').trim(),
  );

  if (contactFields.length > 0) {
    const contactRuns: TextRun[] = [];
    contactFields.forEach((f, idx) => {
      contactRuns.push(
        new TextRun({
          text: `${f.label}: `,
          bold: true,
          size: 19,
          font: fontName,
          color: '374151',
        }),
        new TextRun({
          text: singletonValues[f.id] || '',
          size: 19,
          font: fontName,
          color: '4B5563',
        }),
      );
      if (idx < contactFields.length - 1) {
        contactRuns.push(
          new TextRun({
            text: '   |   ',
            size: 19,
            font: fontName,
            color: '9CA3AF',
          }),
        );
      }
    });

    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 180 },
        border: {
          bottom: {
            color: primaryHex,
            space: 8,
            style: BorderStyle.SINGLE,
            size: 12,
          },
        },
        children: contactRuns,
      }),
    );
  }

  for (const section of sections) {
    if (section.id === 'personal' && !section.repeatable) continue;

    const isRepeatable = section.repeatable;
    const sectionEntries = entries[section.id] || [];
    const fields = analysis.fields.filter((f) => f.section === section.id);

    if (isRepeatable && sectionEntries.length === 0) continue;
    if (!isRepeatable && !fields.some((f) => (singletonValues[f.id] || '').trim())) continue;

    docParagraphs.push(
      new Paragraph({
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: primaryHex,
            space: 4,
            style: BorderStyle.SINGLE,
            size: 8,
          },
        },
        children: [
          new TextRun({
            text: section.name.toUpperCase(),
            bold: true,
            size: 24,
            font: fontName,
            color: primaryHex,
          }),
        ],
      }),
    );

    if (isRepeatable) {
      for (const entry of sectionEntries) {
        const firstField = fields.find((f) => (entry[f.id] || '').trim());
        const title = firstField ? entry[firstField.id].trim() : 'Role / Entry';
        const dateField = fields.find(
          (f) =>
            f.id !== firstField?.id &&
            /date|year|duration|period|time/i.test(`${f.id} ${f.label}`) &&
            (entry[f.id] || '').trim(),
        );
        const dateVal = dateField ? entry[dateField.id].trim() : '';

        const orgField = fields.find(
          (f) =>
            f.id !== firstField?.id &&
            f.id !== dateField?.id &&
            /company|organization|institution|school|university|employer|location/i.test(
              `${f.id} ${f.label}`,
            ) &&
            (entry[f.id] || '').trim(),
        );
        const orgVal = orgField ? entry[orgField.id].trim() : '';

        const entryHeaderRuns: TextRun[] = [
          new TextRun({
            text: title,
            bold: true,
            size: 21,
            font: fontName,
            color: '111827',
          }),
        ];

        if (orgVal) {
          entryHeaderRuns.push(
            new TextRun({
              text: `  —  ${orgVal}`,
              bold: true,
              size: 20,
              font: fontName,
              color: '374151',
            }),
          );
        }

        if (dateVal) {
          entryHeaderRuns.push(
            new TextRun({
              text: `  (${dateVal})`,
              italics: true,
              size: 19,
              font: fontName,
              color: '6B7280',
            }),
          );
        }

        docParagraphs.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: entryHeaderRuns,
          }),
        );

        for (const f of fields) {
          if (f.id === firstField?.id || f.id === dateField?.id || f.id === orgField?.id) continue;
          const val = (entry[f.id] || '').trim();
          if (!val) continue;

          if (f.type === 'textarea') {
            const lines = val.split(/\s*\|\s*|\r?\n/).filter(Boolean);
            for (const line of lines) {
              docParagraphs.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { before: 20, after: 30 },
                  children: [
                    new TextRun({
                      text: line.trim(),
                      size: 20,
                      font: fontName,
                      color: '374151',
                    }),
                  ],
                }),
              );
            }
          } else {
            docParagraphs.push(
              new Paragraph({
                spacing: { before: 20, after: 30 },
                children: [
                  new TextRun({
                    text: `${f.label}: `,
                    bold: true,
                    size: 20,
                    font: fontName,
                    color: '374151',
                  }),
                  new TextRun({
                    text: val,
                    size: 20,
                    font: fontName,
                    color: '4B5563',
                  }),
                ],
              }),
            );
          }
        }
      }
    } else {
      for (const f of fields) {
        const val = (singletonValues[f.id] || '').trim();
        if (!val) continue;

        if (f.type === 'textarea') {
          const lines = val.split(/\s*\|\s*|\r?\n/).filter(Boolean);
          if (lines.length > 1) {
            for (const line of lines) {
              docParagraphs.push(
                new Paragraph({
                  bullet: { level: 0 },
                  spacing: { before: 20, after: 30 },
                  children: [
                    new TextRun({
                      text: line.trim(),
                      size: 20,
                      font: fontName,
                      color: '374151',
                    }),
                  ],
                }),
              );
            }
          } else {
            docParagraphs.push(
              new Paragraph({
                spacing: { before: 30, after: 60 },
                children: [
                  new TextRun({
                    text: val,
                    size: 20,
                    font: fontName,
                    color: '374151',
                  }),
                ],
              }),
            );
          }
        } else {
          docParagraphs.push(
            new Paragraph({
              spacing: { before: 20, after: 40 },
              children: [
                new TextRun({
                  text: `${f.label}: `,
                  bold: true,
                  size: 20,
                  font: fontName,
                  color: '374151',
                }),
                new TextRun({
                  text: val,
                  size: 20,
                  font: fontName,
                  color: '4B5563',
                }),
              ],
            }),
          );
        }
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.8),
              right: convertInchesToTwip(0.8),
              bottom: convertInchesToTwip(0.8),
              left: convertInchesToTwip(0.8),
            },
          },
        },
        children: docParagraphs,
      },
    ],
  });

  const rawBlob = await Packer.toBlob(doc);
  const docxBlob = new Blob([rawBlob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  saveAs(docxBlob, outName);
}

/**
 * Exports a Cover Letter or Application Letter to native Word (.docx).
 */
export async function exportLetterToWord(
  content: string,
  applicantName: string,
  jobTitle = 'Application',
  filename = 'Cover_Letter.docx',
): Promise<void> {
  const outName = filename.endsWith('.docx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.docx`;

  // 1. Try server API download
  try {
    const res = await fetch('/api/export-docx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'letter',
        content,
        applicantName,
        jobTitle,
        filename: outName,
      }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const docxBlob = new Blob([blob], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      saveAs(docxBlob, outName);
      return;
    }
  } catch (err) {
    console.warn('Server letter docx export fallback to client:', err);
  }

  // 2. Client-side fallback
  const paragraphs = content
    .split(/\r?\n\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const docParagraphs: Paragraph[] = paragraphs.map((text) => {
    return new Paragraph({
      spacing: { before: 60, after: 120 },
      children: [
        new TextRun({
          text,
          size: 22,
          font: 'Calibri',
          color: '1F2937',
        }),
      ],
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: docParagraphs,
      },
    ],
  });

  const rawBlob = await Packer.toBlob(doc);
  const docxBlob = new Blob([rawBlob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  saveAs(docxBlob, outName);
}

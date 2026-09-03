'use client';

import html2canvas from 'html2canvas';
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

export function exportToPdf() {
  window.print();
}

export async function exportToImage(elementId = 'cv-print-root', filename = 'my-cv.png'): Promise<void> {
  const rootEl = document.getElementById(elementId);
  if (!rootEl) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  const pageEl = (rootEl.querySelector('.cv-page') as HTMLElement) || rootEl;

  // Capture at 2x high resolution for crisp text
  const canvas = await html2canvas(pageEl, {
    scale: 2,
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

function cleanFontName(fontStr?: string): string {
  if (!fontStr) return 'Arial';
  const first = fontStr.split(',')[0].replace(/['"]/g, '').trim();
  return first || 'Arial';
}

function cleanHex(colorStr?: string): string {
  if (!colorStr) return '1E293B';
  return colorStr.replace('#', '').trim() || '1E293B';
}

export async function exportToWord(
  analysis: TemplateAnalysis,
  singletonValues: Record<string, string>,
  entries: Record<string, Array<Record<string, string>>>,
  filename = 'my-cv.docx',
  styleOverrides?: Partial<TemplateStyle>,
): Promise<void> {
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

  // 1. Candidate Name (Header)
  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: name.toUpperCase(),
          bold: true,
          size: 44, // 22pt (in half-points)
          font: fontName,
          color: primaryHex,
        }),
      ],
    }),
  );

  // 2. Job Title
  if (jobTitle) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: jobTitle.toUpperCase(),
            bold: true,
            size: 24, // 12pt
            font: fontName,
            color: '4B5563',
          }),
        ],
      }),
    );
  }

  // 3. Contact Details
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
          size: 19, // 9.5pt
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

  // 4. Content Sections
  for (const section of sections) {
    if (section.id === 'personal' && !section.repeatable) continue;

    const isRepeatable = section.repeatable;
    const sectionEntries = entries[section.id] || [];
    const fields = analysis.fields.filter((f) => f.section === section.id);

    // Skip empty sections
    if (isRepeatable && sectionEntries.length === 0) continue;
    if (!isRepeatable && !fields.some((f) => (singletonValues[f.id] || '').trim())) continue;

    // Section Heading
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
            size: 24, // 12pt
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

        // Entry header line (Title + Org + Date)
        const entryHeaderRuns: TextRun[] = [
          new TextRun({
            text: title,
            bold: true,
            size: 21, // 10.5pt
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

        // Remaining detail fields
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
                      size: 20, // 10pt
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
      // Non-repeatable fields (e.g. Summary, Objective, Skills)
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

  // Create OpenXML Word Document with standard A4 margins
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
  const outName = filename.endsWith('.docx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.docx`;

  const docxBlob = new Blob([rawBlob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  saveAs(docxBlob, outName);
}

export async function exportLetterToWord(
  content: string,
  applicantName: string,
  jobTitle = 'Application',
  filename = 'Cover_Letter.docx',
): Promise<void> {
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
          size: 22, // 11pt
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
  const outName = filename.endsWith('.docx')
    ? filename
    : `${filename.replace(/\.[^/.]+$/, '')}.docx`;

  const docxBlob = new Blob([rawBlob], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });

  saveAs(docxBlob, outName);
}

import { NextRequest, NextResponse } from 'next/server';
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

function cleanFontName(fontStr?: string): string {
  if (!fontStr) return 'Arial';
  const first = fontStr.split(',')[0].replace(/['"]/g, '').trim();
  return first || 'Arial';
}

function cleanHex(colorStr?: string): string {
  if (!colorStr) return '1E293B';
  return colorStr.replace('#', '').trim() || '1E293B';
}

function cleanBulletText(text: string): string {
  if (!text) return '';
  return text
    .replace(/^[\s\-\*\•\–\—\.\·\›\>\o\u2022\u2023\u25E6\u2043\u2219]+[\s\.\-]*/, '')
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, analysis, singletonValues, entries, styleOverrides, filename, content, applicantName, jobTitle } = body;

    let doc: Document;

    if (type === 'letter') {
      const paragraphs = (content || '')
        .split(/\r?\n\r?\n/)
        .map((p: string) => p.trim())
        .filter(Boolean);

      const docParagraphs: Paragraph[] = paragraphs.map((text: string) => {
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

      doc = new Document({
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
    } else {
      const tplAnalysis: TemplateAnalysis = analysis || { sections: [], fields: [], style: {} };
      const rawPrimary =
        styleOverrides?.primaryColor ||
        styleOverrides?.theme?.headingColor ||
        tplAnalysis.style.theme?.headingColor ||
        tplAnalysis.style.primaryColor ||
        '#1e293b';
      const primaryHex = cleanHex(rawPrimary);

      const fontName = cleanFontName(
        styleOverrides?.fontFamily || tplAnalysis.style.fontFamily || 'Arial',
      );

      const name =
        singletonValues?.fullName ||
        singletonValues?.name ||
        singletonValues?.full_name ||
        'Candidate Name';
      const title =
        singletonValues?.jobTitle ||
        singletonValues?.title ||
        '';

      const sections = tplAnalysis.sections || [];
      const docParagraphs: Paragraph[] = [];

      // 1. Header Name
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

      // 2. Job Title
      if (title) {
        docParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 80 },
            children: [
              new TextRun({
                text: title.toUpperCase(),
                bold: true,
                size: 24,
                font: fontName,
                color: '4B5563',
              }),
            ],
          }),
        );
      }

      // 3. Contact Details
      const contactFields = (tplAnalysis.fields || []).filter(
        (f) =>
          (f.section === 'personal' || f.section === 'contact') &&
          !/name|title|photo/i.test(`${f.id} ${f.label}`) &&
          (singletonValues?.[f.id] || '').trim(),
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

      // 4. Sections
      for (const section of sections) {
        if (section.id === 'personal' && !section.repeatable) continue;

        const isRepeatable = section.repeatable;
        const sectionEntries = entries?.[section.id] || [];
        const fields = (tplAnalysis.fields || []).filter((f) => f.section === section.id);

        if (isRepeatable && sectionEntries.length === 0) continue;
        if (!isRepeatable && !fields.some((f) => (singletonValues?.[f.id] || '').trim())) continue;

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
            const entryTitle = firstField ? entry[firstField.id].trim() : 'Role / Entry';
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
                text: entryTitle,
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
                          text: cleanBulletText(line),
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
            const val = (singletonValues?.[f.id] || '').trim();
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
                          text: cleanBulletText(line),
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

      doc = new Document({
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
    }

    const buffer = await Packer.toBuffer(doc);
    const safeFilename = filename || 'Document.docx';
    const outName = safeFilename.endsWith('.docx') ? safeFilename : `${safeFilename}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(outName)}"`,
      },
    });
  } catch (err) {
    console.error('API export-docx error:', err);
    return NextResponse.json({ error: 'Failed to generate Word document' }, { status: 500 });
  }
}

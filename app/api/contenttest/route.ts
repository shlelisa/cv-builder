import { NextResponse } from 'next/server';
import { parseAndSanitizeAnalysis } from '@/lib/template-analysis';

export async function GET() {
  const raw = {
    templateName: 'Content Test',
    confidence: 0.9,
    layout: {
      type: 'sidebar-left',
      orderedSections: ['personal', 'summary', 'experience', 'education', 'skills'],
      sidebarSections: ['skills'],
    },
    style: { primaryColor: '#111111', secondaryColor: '#222222', backgroundColor: '#ffffff', textColor: '#111111', accentColor: '#0ea5e9' },
    sections: [
      { id: 'personal', name: 'Personal', repeatable: false },
      { id: 'summary', name: 'Profile', repeatable: false },
      { id: 'experience', name: 'Experience', repeatable: true },
      { id: 'education', name: 'Education', repeatable: true },
      { id: 'skills', name: 'Skills', repeatable: false },
    ],
    fields: [
      { id: 'fullName', label: 'Full Name', type: 'text', section: 'personal' },
      { id: 'jobTitle', label: 'Job Title', type: 'text', section: 'personal' },
      { id: 'email', label: 'Email', type: 'email', section: 'contact' },
      { id: 'phone', label: 'Phone', type: 'phone', section: 'contact' },
      { id: 'summary', label: 'Profile', type: 'textarea', section: 'summary' },
      { id: 'expRole', label: 'Role', type: 'text', section: 'experience' },
      { id: 'expCompany', label: 'Company', type: 'text', section: 'experience' },
      { id: 'expNotes', label: 'Notes', type: 'textarea', section: 'experience' },
      { id: 'skillText', label: 'Skills', type: 'textarea', section: 'skills' },
    ],
    content: {
      personal: { fullName: 'John M. Lane', jobTitle: 'Senior Software Engineer' },
      contact: { email: 'john@labs.com', phone: '+1 555 0100' },
      summary: { summary: 'Results-driven engineer\n- 8 years experience\n- Deep React expertise' },
      experience: [
        { expRole: 'Staff Engineer', expCompany: 'Acme Corp', expNotes: 'Led platform team\n- shipped 3 products\n- mentored 12 devs' },
        { expRole: 'SWE II', expCompany: 'Beta Inc', expNotes: 'Built payment system' },
      ],
      skills: { skillText: 'React, Node, TypeScript' },
    },
  };

  const a = parseAndSanitizeAnalysis(raw);
  return NextResponse.json({
    content: a.content,
    contentEntries: a.contentEntries,
  });
}
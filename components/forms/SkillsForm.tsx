'use client';

import { Input } from '@/components/ui';
import { Skills } from '@/types';

interface SkillsFormProps {
  value: Skills;
  onChange: (skills: Skills) => void;
}

const SkillsForm: React.FC<SkillsFormProps> = ({ value, onChange }) => {
  const handleUpdate = (field: keyof Skills, text: string) => {
    const items = text.split(',').map(s => s.trim()).filter(Boolean);
    onChange({ ...value, [field]: items });
  };

  const handleLanguagesChange = (name: string, proficiency: Skills['languages'][number]['proficiency']) => {
    const existing = value.languages;
    const exists = existing.findIndex(l => l.name === name);
    
    if (exists >= 0) {
      const updated = [...existing];
      updated[exists] = { name, proficiency };
      onChange({ ...value, languages: updated });
    } else {
      onChange({ ...value, languages: [...existing, { name, proficiency }] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
        <p className="text-sm text-gray-500">List your skills to help with job matching and CV generation</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technical Skills
          </label>
          <Input
            placeholder="e.g., Web Development, Database Design, API Design, Testing"
            value={value.technicalSkills.join(', ')}
            onChange={(e) => handleUpdate('technicalSkills', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programming Languages
          </label>
          <Input
            placeholder="e.g., JavaScript, Python, Java, C++, TypeScript"
            value={value.programmingLanguages.join(', ')}
            onChange={(e) => handleUpdate('programmingLanguages', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Frameworks
          </label>
          <Input
            placeholder="e.g., React, Node.js, Django, Spring Boot, Angular"
            value={value.frameworks.join(', ')}
            onChange={(e) => handleUpdate('frameworks', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Databases
          </label>
          <Input
            placeholder="e.g., MySQL, PostgreSQL, MongoDB, SQL Server"
            value={value.databases.join(', ')}
            onChange={(e) => handleUpdate('databases', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Networking
            </label>
            <Input
              placeholder="e.g., TCP/IP, DNS, HTTP, Routing"
              value={value.networking.join(', ')}
              onChange={(e) => handleUpdate('networking', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cloud
            </label>
            <Input
              placeholder="e.g., AWS, Azure, Google Cloud"
              value={value.cloud.join(', ')}
              onChange={(e) => handleUpdate('cloud', e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office/Productivity Tools
          </label>
          <Input
            placeholder="e.g., Microsoft Office, Excel, PowerPoint, Google Workspace"
            value={value.officeTools.join(', ')}
            onChange={(e) => handleUpdate('officeTools', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Soft Skills
          </label>
          <Input
            placeholder="e.g., Communication, Teamwork, Time Management, Problem-Solving"
            value={value.softSkills.join(', ')}
            onChange={(e) => handleUpdate('softSkills', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Languages
          </label>
          <div className="space-y-2">
            {['English', 'Afaan Oromo', 'Amharic', 'Other'].map((lang) => {
              const current = value.languages.find(l => l.name === lang);
              return (
                <div key={lang} className="flex items-center space-x-3">
                  <span className="w-32 text-sm text-gray-600">{lang}</span>
                  <select
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={current?.proficiency || ''}
                    onChange={(e) => handleLanguagesChange(lang, e.target.value as Skills['languages'][number]['proficiency'])}
                  >
                    <option value="">Not selected</option>
                    <option value="native">Native</option>
                    <option value="fluent">Fluent</option>
                    <option value="advanced">Advanced</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="basic">Basic</option>
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsForm;

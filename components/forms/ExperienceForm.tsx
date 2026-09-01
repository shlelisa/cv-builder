'use client';

import { Input, Button } from '@/components/ui';
import { Experience } from '@/types';

interface ExperienceFormProps {
  value: Experience[];
  onChange: (experience: Experience[]) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ value, onChange }) => {
  const handleAdd = () => {
    const newExperience: Experience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      employmentType: 'full-time',
      startDate: '',
      isCurrent: false,
      responsibilities: [],
      achievements: [],
      technologiesUsed: [],
    };
    onChange([...value, newExperience]);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((exp) => exp.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<Experience>) => {
    onChange(value.map((exp) => exp.id === id ? { ...exp, ...updates } : exp));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
          <p className="text-sm text-gray-500">Add your professional experience</p>
        </div>
        <Button type="button" onClick={handleAdd} variant="outline" size="sm">
          + Add Experience
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          No work experience added yet. Click &quot;Add Experience&quot; to begin.
        </div>
      )}

      {value.map((exp, index) => (
        <div key={exp.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Experience {index + 1}
            </span>
            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(exp.id)}
                className="text-red-600 hover:bg-red-50"
              >
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Company/Organization *"
              placeholder="e.g., ABC Technology"
              value={exp.company}
              onChange={(e) => handleUpdate(exp.id, { company: e.target.value })}
              required
            />
            <Input
              label="Position *"
              placeholder="e.g., Software Developer"
              value={exp.position}
              onChange={(e) => handleUpdate(exp.id, { position: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={exp.employmentType}
                onChange={(e) => handleUpdate(exp.id, { employmentType: e.target.value as Experience['employmentType'] })}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="temporary">Temporary</option>
              </select>
            </div>
            <div className="flex items-end space-x-2 pb-1">
              <div className="flex-1">
                <Input
                  label="Start Date"
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => handleUpdate(exp.id, { startDate: e.target.value })}
                  required
                />
              </div>
              {!exp.isCurrent && (
                <div className="flex-1">
                  <Input
                    label="End Date"
                    type="month"
                    value={exp.endDate || ''}
                    onChange={(e) => handleUpdate(exp.id, { endDate: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          <label className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={exp.isCurrent}
              onChange={(e) => handleUpdate(exp.id, { isCurrent: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span>I currently work here</span>
          </label>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Responsibilities (one per line)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="e.g., Develop and maintain web applications&#10;Collaborate with cross-functional teams"
              value={exp.responsibilities.join('\n')}
              onChange={(e) => handleUpdate(exp.id, {
                responsibilities: e.target.value.split('\n').filter(r => r.trim())
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Achievements (one per line)
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="e.g., Improved application performance by 40%&#10;Implemented new features that increased user engagement"
              value={exp.achievements.join('\n')}
              onChange={(e) => handleUpdate(exp.id, {
                achievements: e.target.value.split('\n').filter(a => a.trim())
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Technologies/Tools Used (comma separated)
            </label>
            <Input
              placeholder="e.g., React, Node.js, PostgreSQL, Git"
              value={exp.technologiesUsed.join(', ')}
              onChange={(e) => handleUpdate(exp.id, {
                technologiesUsed: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
              })}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceForm;

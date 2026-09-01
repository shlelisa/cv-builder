'use client';

import { Input, Button } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import { Experience } from '@/types';
import { validateExperienceList, fieldError } from '@/lib/validation';
import { useTouched } from '@/lib/useTouched';

interface ExperienceFormProps {
  value: Experience[];
  onChange: (experience: Experience[]) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ value, onChange }) => {
  const { t } = useApp();
  const { touched, markTouched } = useTouched();
  const errors = validateExperienceList(value);
  const showError = (index: number, field: string) =>
    fieldError(t, errors, touched, `${index}.${field}`);

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t.form.experienceTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{t.form.experienceSubtitle}</p>
        </div>
        <Button type="button" onClick={handleAdd} variant="outline" size="sm">
          + {t.common.add} {t.form.addExperience}
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-zinc-500 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
          No work experience added yet. Click &quot;Add Experience&quot; to begin.
        </div>
      )}

      {value.map((exp, index) => (
        <div key={exp.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Experience {index + 1}
            </span>
            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(exp.id)}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {t.common.remove}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t.form.company}
              placeholder="e.g., ABC Technology"
              value={exp.company}
              onChange={(e) => {
                markTouched(`${index}.company`);
                handleUpdate(exp.id, { company: e.target.value });
              }}
              error={showError(index, 'company')}
              required
            />
            <Input
              label={t.form.position}
              placeholder="e.g., Software Developer"
              value={exp.position}
              onChange={(e) => {
                markTouched(`${index}.position`);
                handleUpdate(exp.id, { position: e.target.value });
              }}
              error={showError(index, 'position')}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                {t.form.employmentType}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
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
                  label={t.form.startDate}
                  type="month"
                  value={exp.startDate}
                  onChange={(e) => {
                    markTouched(`${index}.startDate`);
                    handleUpdate(exp.id, { startDate: e.target.value });
                  }}
                  error={showError(index, 'startDate')}
                  required
                />
              </div>
              {!exp.isCurrent && (
                <div className="flex-1">
                  <Input
                    label={t.form.endDate}
                    type="month"
                    value={exp.endDate || ''}
                    onChange={(e) => {
                      markTouched(`${index}.endDate`);
                      handleUpdate(exp.id, { endDate: e.target.value });
                    }}
                    error={showError(index, 'endDate')}
                  />
                </div>
              )}
            </div>
          </div>

          <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={exp.isCurrent}
              onChange={(e) => handleUpdate(exp.id, { isCurrent: e.target.checked })}
              className="rounded border-gray-300 dark:border-zinc-700 text-blue-600 focus:ring-blue-500"
            />
            <span>{t.form.currentlyWork}</span>
          </label>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              {t.form.responsibilities}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              rows={3}
              placeholder="e.g., Develop and maintain web applications&#10;Collaborate with cross-functional teams"
              value={exp.responsibilities.join('\n')}
              onChange={(e) => handleUpdate(exp.id, {
                responsibilities: e.target.value.split('\n').filter(r => r.trim())
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              {t.form.experienceAchievements}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
              rows={2}
              placeholder="e.g., Improved application performance by 40%&#10;Implemented new features that increased user engagement"
              value={exp.achievements.join('\n')}
              onChange={(e) => handleUpdate(exp.id, {
                achievements: e.target.value.split('\n').filter(a => a.trim())
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              {t.form.techUsed}
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

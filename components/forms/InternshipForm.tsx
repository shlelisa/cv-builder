'use client';

import { Input, Button, TextArea } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import { Internship } from '@/types';
import { validateInternshipList, fieldError } from '@/lib/validation';
import { useTouched } from '@/lib/useTouched';

interface InternshipFormProps {
  value: Internship[];
  onChange: (internships: Internship[]) => void;
}

const InternshipForm: React.FC<InternshipFormProps> = ({ value, onChange }) => {
  const { t } = useApp();
  const { touched, markTouched } = useTouched();
  const errors = validateInternshipList(value);
  const showError = (index: number, field: string) =>
    fieldError(t, errors, touched, `${index}.${field}`);

  const handleAdd = () => {
    const newInternship: Internship = {
      id: `int-${Date.now()}`,
      organization: '',
      position: '',
      duration: '',
      startDate: '',
      responsibilities: [],
      achievements: [],
      skillsGained: [],
    };
    onChange([...value, newInternship]);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((int) => int.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<Internship>) => {
    onChange(value.map((int) => int.id === id ? { ...int, ...updates } : int));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t.form.internshipTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{t.form.internshipSubtitle}</p>
        </div>
        <Button type="button" onClick={handleAdd} variant="outline" size="sm">
          + {t.common.add} {t.form.addInternship}
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-zinc-500 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
          No internships added yet.
        </div>
      )}

      {value.map((intern, index) => (
        <div key={intern.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Internship {index + 1}</span>
            {value.length > 1 && (
              <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => handleRemove(intern.id)}>
                {t.common.remove}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t.form.organization}
              placeholder="e.g., XYZ Bank"
              value={intern.organization}
              onChange={(e) => {
                markTouched(`${index}.organization`);
                handleUpdate(intern.id, { organization: e.target.value });
              }}
              error={showError(index, 'organization')}
              required
            />
            <Input
              label={t.form.position}
              placeholder="e.g., Software Development Intern"
              value={intern.position}
              onChange={(e) => {
                markTouched(`${index}.position`);
                handleUpdate(intern.id, { position: e.target.value });
              }}
              error={showError(index, 'position')}
              required
            />
            <Input
              label={t.form.duration}
              placeholder="e.g., 3 months"
              value={intern.duration}
              onChange={(e) => handleUpdate(intern.id, { duration: e.target.value })}
            />
            <Input
              label={t.form.startDate}
              type="month"
              value={intern.startDate}
              onChange={(e) => handleUpdate(intern.id, { startDate: e.target.value })}
            />
          </div>

          <TextArea
            label={t.form.responsibilities}
            rows={2}
            placeholder="e.g., Assisted in developing web applications&#10;Participated in team meetings and code reviews"
            value={intern.responsibilities.join('\n')}
            onChange={(e) => handleUpdate(intern.id, {
              responsibilities: e.target.value.split('\n').filter(r => r.trim())
            })}
          />

          <TextArea
            label={t.form.experienceAchievements}
            rows={2}
            placeholder="e.g., Received recognition for outstanding performance"
            value={intern.achievements.join('\n')}
            onChange={(e) => handleUpdate(intern.id, {
              achievements: e.target.value.split('\n').filter(a => a.trim())
            })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              {t.form.skillsGained}
            </label>
            <Input
              placeholder="e.g., Industry tools, Professional communication, Project management"
              value={intern.skillsGained.join(', ')}
              onChange={(e) => handleUpdate(intern.id, {
                skillsGained: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default InternshipForm;

'use client';

import { Input, Button } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import { Education } from '@/types';

interface EducationFormProps {
  value: Education[];
  onChange: (education: Education[]) => void;
}

const BACHELOR_DEGREES = [
  'Bachelor of Science (BSc)',
  'Bachelor of Arts (BA)',
  'Bachelor of Engineering (BEng)',
  'Bachelor of Laws (LLB)',
  'Bachelor of Business Administration (BBA)',
  'Bachelor of Education (BEd)',
];

const MASTER_DEGREES = [
  'Master of Science (MSc)',
  'Master of Arts (MA)',
  'Master of Business Administration (MBA)',
  'Master of Laws (LLM)',
  'Master of Engineering (MEng)',
];

const Departments = [
  'Software Engineering',
  'Computer Science',
  'Information Technology',
  'Information Systems',
  'Computer Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Accounting and Finance',
  'Economics',
  'Management',
  'Marketing',
  'Nursing',
  'Pharmacy',
  'Public Health',
  'Medicine',
  'Agricultural Economics',
  'Agronomy',
  'Sociology',
  'Psychology',
  'English',
  'Mathematics',
  'Physics',
  'Law',
  'Education',
];

const EducationForm: React.FC<EducationFormProps> = ({ value, onChange }) => {
  const { t } = useApp();

  const handleAdd = () => {
    const newEducation: Education = {
      id: `edu-${Date.now()}`,
      university: '',
      degree: '',
      department: '',
      startYear: new Date().getFullYear() - 4,
      graduationYear: new Date().getFullYear(),
      relevantCourses: [],
      academicAchievements: [],
      academicAwards: [],
    };
    onChange([...value, newEducation]);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((edu) => edu.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<Education>) => {
    onChange(value.map((edu) => edu.id === id ? { ...edu, ...updates } : edu));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t.form.educationTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{t.form.educationSubtitle}</p>
        </div>
        <Button type="button" onClick={handleAdd} variant="outline" size="sm">
          + {t.common.add} {t.form.addEducation}
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-zinc-500 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
          No education added yet. Click &quot;Add Education&quot; to begin.
        </div>
      )}

      {value.map((edu, index) => (
        <div key={edu.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Education {index + 1}
            </span>
            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(edu.id)}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {t.common.remove}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t.form.university}
              placeholder="e.g., Addis Ababa University"
              value={edu.university}
              onChange={(e) => handleUpdate(edu.id, { university: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                {t.form.department}
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                list="departments-list"
                placeholder="e.g., Software Engineering"
                value={edu.department}
                onChange={(e) => handleUpdate(edu.id, { department: e.target.value })}
                required
              />
              <datalist id="departments-list">
                {Departments.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                {t.form.degree}
              </label>
              <input
                className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                list="degrees-list"
                placeholder="e.g., BSc in Software Engineering"
                value={edu.degree}
                onChange={(e) => handleUpdate(edu.id, { degree: e.target.value })}
                required
              />
              <datalist id="degrees-list">
                {[...BACHELOR_DEGREES, ...MASTER_DEGREES].map((deg) => (
                  <option key={deg} value={deg} />
                ))}
              </datalist>
            </div>
            <Input
              label={t.form.major}
              placeholder="e.g., Artificial Intelligence"
              value={edu.major || ''}
              onChange={(e) => handleUpdate(edu.id, { major: e.target.value })}
            />
            <Input
              label={t.form.minor}
              placeholder="e.g., Business"
              value={edu.minor || ''}
              onChange={(e) => handleUpdate(edu.id, { minor: e.target.value })}
            />
            <Input
              label={t.form.cgpa}
              type="number"
              step="0.01"
              min="0"
              max="4"
              placeholder="e.g., 3.75"
              value={edu.cgpa || ''}
              onChange={(e) => handleUpdate(edu.id, { cgpa: parseFloat(e.target.value) || undefined })}
            />
            <Input
              label={t.form.majorGpa}
              type="number"
              step="0.01"
              min="0"
              max="4"
              placeholder="e.g., 3.90"
              value={edu.majorGpa || ''}
              onChange={(e) => handleUpdate(edu.id, { majorGpa: parseFloat(e.target.value) || undefined })}
            />
            <Input
              label={t.form.exitExam}
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 78"
              value={edu.exitExamScore || ''}
              onChange={(e) => handleUpdate(edu.id, { exitExamScore: parseInt(e.target.value) || undefined })}
            />
            <Input
              label={t.form.startYear}
              type="number"
              min="1990"
              max="2030"
              value={edu.startYear}
              onChange={(e) => handleUpdate(edu.id, { startYear: parseInt(e.target.value) || 0 })}
            />
            <Input
              label={t.form.gradYear}
              type="number"
              min="1990"
              max="2030"
              value={edu.graduationYear}
              onChange={(e) => handleUpdate(edu.id, { graduationYear: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              {t.form.relevantCourses}
            </label>
            <Input
              placeholder="e.g., Database Systems, Web Development, Data Structures"
              value={(edu.relevantCourses || []).join(', ')}
              onChange={(e) => handleUpdate(edu.id, {
                relevantCourses: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              {t.form.academicAchievements}
            </label>
            <Input
              placeholder="e.g., Top 10% of class, Dean's list"
              value={(edu.academicAchievements || []).join(', ')}
              onChange={(e) => handleUpdate(edu.id, {
                academicAchievements: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
              })}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
              {t.form.academicAwards}
            </label>
            <Input
              placeholder="e.g., Academic Excellence Award, Scholarship"
              value={(edu.academicAwards || []).join(', ')}
              onChange={(e) => handleUpdate(edu.id, {
                academicAwards: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
              })}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationForm;

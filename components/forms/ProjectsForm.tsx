'use client';

import { Input, Button, TextArea } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import { Project } from '@/types';

interface ProjectsFormProps {
  value: Project[];
  onChange: (projects: Project[]) => void;
}

const ProjectsForm: React.FC<ProjectsFormProps> = ({ value, onChange }) => {
  const { t } = useApp();

  const handleAdd = () => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: '',
      description: '',
      role: '',
      technologies: [],
      features: [],
    };
    onChange([...value, newProject]);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((proj) => proj.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<Project>) => {
    onChange(value.map((proj) => proj.id === id ? { ...proj, ...updates } : proj));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t.form.projectsTitle}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{t.form.projectsSubtitle}</p>
        </div>
        <Button type="button" onClick={handleAdd} variant="outline" size="sm">
          + {t.common.add} {t.form.addProject}
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-zinc-500 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-lg">
          No projects added yet. Click &quot;Add Project&quot; to begin.
        </div>
      )}

      {value.map((project, index) => (
        <div key={project.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">
              Project {index + 1}
            </span>
            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(project.id)}
                className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {t.common.remove}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t.form.projectName}
              placeholder="e.g., Digital Library Management System"
              value={project.name}
              onChange={(e) => handleUpdate(project.id, { name: e.target.value })}
              required
            />
            <Input
              label={t.form.role}
              placeholder="e.g., Full-Stack Developer"
              value={project.role}
              onChange={(e) => handleUpdate(project.id, { role: e.target.value })}
            />
            <div className="sm:col-span-2">
              <TextArea
                label={t.form.projectDesc}
                rows={2}
                placeholder="Briefly describe the project and its purpose"
                value={project.description}
                onChange={(e) => handleUpdate(project.id, { description: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                {t.form.techUsedProj}
              </label>
              <Input
                placeholder="e.g., React, Node.js, MongoDB, Express"
                value={project.technologies.join(', ')}
                onChange={(e) => handleUpdate(project.id, {
                  technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              {t.form.mainFeatures}
            </label>
            <TextArea
              rows={2}
              placeholder="e.g., User authentication and authorization&#10;Advanced search and filtering"
              value={project.features.join('\n')}
              onChange={(e) => handleUpdate(project.id, {
                features: e.target.value.split('\n').filter(f => f.trim())
              })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              {t.form.resultsImpact}
            </label>
            <Input
              placeholder="e.g., Used by 500+ students for library management"
              value={project.resultsImpact || ''}
              onChange={(e) => handleUpdate(project.id, { resultsImpact: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t.form.githubUrl}
              placeholder="e.g., https://github.com/john/project"
              value={project.githubUrl || ''}
              onChange={(e) => handleUpdate(project.id, { githubUrl: e.target.value })}
            />
            <Input
              label={t.form.demoUrl}
              placeholder="e.g., https://project-demo.com"
              value={project.demoUrl || ''}
              onChange={(e) => handleUpdate(project.id, { demoUrl: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsForm;

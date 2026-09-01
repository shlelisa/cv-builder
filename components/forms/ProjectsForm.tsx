'use client';

import { Input, Button, TextArea } from '@/components/ui';
import { Project } from '@/types';

interface ProjectsFormProps {
  value: Project[];
  onChange: (projects: Project[]) => void;
}

const ProjectsForm: React.FC<ProjectsFormProps> = ({ value, onChange }) => {
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
          <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
          <p className="text-sm text-gray-500">Showcase your projects and academic work</p>
        </div>
        <Button type="button" onClick={handleAdd} variant="outline" size="sm">
          + Add Project
        </Button>
      </div>

      {value.length === 0 && (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
          No projects added yet. Click &quot;Add Project&quot; to begin.
        </div>
      )}

      {value.map((project, index) => (
        <div key={project.id} className="border rounded-lg p-4 space-y-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Project {index + 1}
            </span>
            {value.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(project.id)}
                className="text-red-600 hover:bg-red-50"
              >
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Project Name *"
              placeholder="e.g., Digital Library Management System"
              value={project.name}
              onChange={(e) => handleUpdate(project.id, { name: e.target.value })}
              required
            />
            <Input
              label="Your Role"
              placeholder="e.g., Full-Stack Developer"
              value={project.role}
              onChange={(e) => handleUpdate(project.id, { role: e.target.value })}
            />
            <div className="sm:col-span-2">
              <TextArea
                label="Project Description"
                rows={2}
                placeholder="Briefly describe the project and its purpose"
                value={project.description}
                onChange={(e) => handleUpdate(project.id, { description: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technologies Used (comma separated)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Main Features (one per line)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Results/Impact
            </label>
            <Input
              placeholder="e.g., Used by 500+ students for library management"
              value={project.resultsImpact || ''}
              onChange={(e) => handleUpdate(project.id, { resultsImpact: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="GitHub URL"
              placeholder="e.g., https://github.com/john/project"
              value={project.githubUrl || ''}
              onChange={(e) => handleUpdate(project.id, { githubUrl: e.target.value })}
            />
            <Input
              label="Demo URL"
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

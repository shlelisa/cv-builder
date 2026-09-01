'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import PersonalInfoForm from '@/components/forms/PersonalInfoForm';
import EducationForm from '@/components/forms/EducationForm';
import ExperienceForm from '@/components/forms/ExperienceForm';
import InternshipForm from '@/components/forms/InternshipForm';
import ProjectsForm from '@/components/forms/ProjectsForm';
import SkillsForm from '@/components/forms/SkillsForm';
import AdditionalInfoForm from '@/components/forms/AdditionalInfoForm';
import CVPreview from '@/components/cv/CVPreview';
import { UserProfile } from '@/types';
import { aiService } from '@/services/ai';
import { validateAll, sectionErrorCount } from '@/lib/validation';

const emptyProfile: UserProfile = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
  },
  education: [],
  experience: [],
  internships: [],
  projects: [],
  skills: {
    technicalSkills: [],
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    networking: [],
    cloud: [],
    officeTools: [],
    softSkills: [],
    languages: [],
  },
  certifications: [],
  training: [],
  volunteering: [],
  achievements: [],
  references: [],
};

type SectionKey = 'personal' | 'education' | 'experience' | 'internship' | 'projects' | 'skills' | 'additional';

export default function CVBuilder() {
  const { t } = useApp();
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [generatedSummary, setGeneratedSummary] = useState('');

  const sectionErrors = useMemo(() => validateAll(profile), [profile]);

  const navSections: { id: SectionKey; label: string }[] = [
    { id: 'personal', label: t.steps.personal },
    { id: 'education', label: t.steps.education },
    { id: 'experience', label: t.steps.experience },
    { id: 'internship', label: t.steps.internship },
    { id: 'projects', label: t.steps.projects },
    { id: 'skills', label: t.steps.skills },
    { id: 'additional', label: t.steps.additional },
  ];

  const updateSection = (key: keyof UserProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const errorCountFor = (key: SectionKey) => {
    const sectionKey = key === 'internship' ? 'internships' : key;
    return sectionErrorCount(sectionErrors[sectionKey]);
  };

  const totalIssues = navSections.reduce((acc, section) => acc + errorCountFor(section.id), 0);

  const handleGenerateSummary = () => {
    setGeneratedSummary(aiService.generateProfessionalSummary(profile));
  };

  const navItem = (id: SectionKey, label: string, showIndex: number) => {
    const count = errorCountFor(id);
    return (
      <a
        key={id}
        href={`#${id}`}
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          count > 0
            ? 'text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
            : 'text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
        }`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            count > 0 ? 'bg-red-500' : 'bg-emerald-500'
          }`}
        />
        <span className="truncate">
          {showIndex}. {label}
        </span>
        {count > 0 && (
          <span className="ml-auto text-xs font-semibold text-red-600 dark:text-red-400">
            {count}
          </span>
        )}
      </a>
    );
  };

  const cardClass =
    'bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 p-6';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
          {t.builder.title}
        </h1>
        <p className="text-gray-600 dark:text-zinc-400">
          {t.builder.subtitle}
        </p>
      </div>

      {totalIssues > 0 && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-4 py-3">
          <span className="text-amber-600 dark:text-amber-400">⚠</span>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {t.builder.errorsSummary}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden lg:block w-64 shrink-0">
          <nav className="sticky top-24 space-y-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
            {navSections.map((section, index) => navItem(section.id, section.label, index + 1))}
            <a
              href="#preview"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-blue-500" />
              8. {t.steps.preview}
            </a>
          </nav>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-wrap gap-2 lg:hidden">
            {navSections.map((section, index) => navItem(section.id, section.label, index + 1))}
            <a
              href="#preview"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
            >
              8. {t.steps.preview}
            </a>
          </div>

          <section id="personal" className={`scroll-mt-24 ${cardClass}`}>
            <PersonalInfoForm
              value={profile.personalInfo}
              onChange={(data) => updateSection('personalInfo', data)}
            />
          </section>

          <section id="education" className={`scroll-mt-24 ${cardClass}`}>
            <EducationForm
              value={profile.education}
              onChange={(data) => updateSection('education', data)}
            />
          </section>

          <section id="experience" className={`scroll-mt-24 ${cardClass}`}>
            <ExperienceForm
              value={profile.experience}
              onChange={(data) => updateSection('experience', data)}
            />
          </section>

          <section id="internship" className={`scroll-mt-24 ${cardClass}`}>
            <InternshipForm
              value={profile.internships}
              onChange={(data) => updateSection('internships', data)}
            />
          </section>

          <section id="projects" className={`scroll-mt-24 ${cardClass}`}>
            <ProjectsForm
              value={profile.projects}
              onChange={(data) => updateSection('projects', data)}
            />
          </section>

          <section id="skills" className={`scroll-mt-24 ${cardClass}`}>
            <SkillsForm
              value={profile.skills}
              onChange={(data) => updateSection('skills', data)}
            />
          </section>

          <section id="additional" className={`scroll-mt-24 ${cardClass}`}>
            <AdditionalInfoForm
              profile={profile}
              onChange={(data) => {
                setProfile((prev) => ({ ...prev, ...data }));
              }}
            />
          </section>

          <section id="preview" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                {t.steps.preview}
              </h3>
              <Button onClick={handleGenerateSummary} variant="outline" size="sm">
                {t.builder.generateSummary}
              </Button>
            </div>

            {generatedSummary && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/30 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-800 mb-2 dark:text-blue-300">
                  {t.cv.professionalSummary}
                </h4>
                <p className="text-sm text-blue-900 dark:text-blue-100">{generatedSummary}</p>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 p-6">
              <CVPreview profile={profile} enhancedSummary={generatedSummary} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
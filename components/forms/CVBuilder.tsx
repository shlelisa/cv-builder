'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
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

const STEPS = [
  'Personal Info',
  'Education',
  'Experience',
  'Internship',
  'Projects',
  'Skills',
  'Additional Info',
  'Preview & Generate',
];

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

export default function CVBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [generatedSummary, setGeneratedSummary] = useState('');

  const updateSection = (key: keyof UserProfile, value: unknown) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGenerateSummary = () => {
    const summary = aiService.generateProfessionalSummary(profile);
    setGeneratedSummary(summary);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoForm
            value={profile.personalInfo}
            onChange={(data) => updateSection('personalInfo', data)}
          />
        );
      case 1:
        return (
          <EducationForm
            value={profile.education}
            onChange={(data) => updateSection('education', data)}
          />
        );
      case 2:
        return (
          <ExperienceForm
            value={profile.experience}
            onChange={(data) => updateSection('experience', data)}
          />
        );
      case 3:
        return (
          <InternshipForm
            value={profile.internships}
            onChange={(data) => updateSection('internships', data)}
          />
        );
      case 4:
        return (
          <ProjectsForm
            value={profile.projects}
            onChange={(data) => updateSection('projects', data)}
          />
        );
      case 5:
        return (
          <SkillsForm
            value={profile.skills}
            onChange={(data) => updateSection('skills', data)}
          />
        );
      case 6:
        return (
          <AdditionalInfoForm
            profile={profile}
            onChange={(data) => {
              setProfile((prev) => ({ ...prev, ...data }));
            }}
          />
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Preview & Generate</h3>
              <Button onClick={handleGenerateSummary} variant="outline" size="sm">
                Generate Professional Summary
              </Button>
            </div>

            {generatedSummary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">
                  Generated Professional Summary
                </h4>
                <p className="text-sm text-blue-900">{generatedSummary}</p>
              </div>
            )}

            <CVPreview profile={profile} enhancedSummary={generatedSummary} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">CV Builder</h1>
        <p className="text-gray-600">
          Build your professional CV step by step. Your information will be used to generate
          an ATS-friendly CV and other career documents.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {STEPS.map((step, index) => (
          <button
            key={step}
            onClick={() => setCurrentStep(index)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentStep === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {index + 1}. {step}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {renderStep()}
      </div>

      <div className="flex justify-between mt-6">
        <Button
          onClick={handleBack}
          variant="secondary"
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          variant="primary"
          disabled={currentStep === STEPS.length - 1}
        >
          {currentStep === STEPS.length - 2 ? 'Preview' : 'Next'}
        </Button>
      </div>
    </div>
  );
}

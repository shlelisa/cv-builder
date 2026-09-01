'use client';

import { useState } from 'react';
import { Button, TextArea, Input } from '@/components/ui';
import { UserProfile, JobDescription, JobMatchResult, JobAnalysis } from '@/types';
import { aiService } from '@/services/ai';
import { useApp } from '@/lib/AppContext';

const emptyProfile: UserProfile = {
  personalInfo: { fullName: '', email: '', phone: '', location: '' },
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

const JobAnalyzer: React.FC = () => {
  const { t } = useApp();
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [requirements, setRequirements] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [atsResult, setAtsResult] = useState<{
    keywordSuggestions: string[];
    structureSuggestions: string[];
    contentSuggestions: string[];
    atsScore: number;
  } | null>(null);
  const [profileInput, setProfileInput] = useState('');

  const parseUnstructuredProfile = (text: string): Pick<UserProfile, 'education' | 'skills' | 'experience' | 'projects'> => {
    const lower = text.toLowerCase();
    const skills = {
      ...emptyProfile.skills,
    };

    const cgpaMatch = lower.match(/(\d+\.\d+)\s*cgpa/i);
    const gradMatch = lower.match(/graduated?\s*(\d{4})/i);
    const degreeMatch = lower.match(/software engineering|computer science|information technology|accounting|economics|nursing|medicine|law|civil engineering|mechanical engineering|electrical engineering/i);

    const technicalSkills: string[] = [];
    ['react', 'node', 'mysql', 'javascript', 'typescript', 'python', 'java', 'html', 'css', 'postgresql', 'mongodb'].forEach(skill => {
      if (lower.includes(skill)) {
        technicalSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    const education = degreeMatch ? [{
      id: 'auto-1',
      university: '',
      degree: degreeMatch[0],
      department: degreeMatch[0],
      startYear: 0,
      graduationYear: gradMatch ? parseInt(gradMatch[1]) : 0,
      cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : undefined,
      relevantCourses: [],
      academicAchievements: [],
      academicAwards: [],
    }] : [];

    return {
      education,
      skills: {
        ...skills,
        technicalSkills: [...new Set([...skills.technicalSkills, ...technicalSkills])],
      },
      experience: [],
      projects: [],
    };
  };

  const handleAnalyze = () => {
    const jobDescription: JobDescription = {
      position,
      company,
      requirements: requirements.split('\n').filter(r => r.trim()),
    };

    const analysis = aiService.analyzeJobDescription(jobDescription);
    setAnalysis(analysis);

    const parsedProfile = profileInput.trim()
      ? { ...emptyProfile, ...parseUnstructuredProfile(profileInput) }
      : emptyProfile;

    const match = aiService.matchJobRequirements(parsedProfile, jobDescription);
    setMatchResult(match);

    const ats = aiService.checkATS(parsedProfile, jobDescription);
    setAtsResult(ats);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">{t.jobs.title}</h1>
        <p className="text-gray-600 dark:text-zinc-400">
          {t.jobs.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t.jobs.jobDesc}</h3>
          <Input
            label={t.jobs.position}
            placeholder="e.g., Junior Software Developer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Input
            label={t.jobs.company}
            placeholder="e.g., ABC Technology PLC"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <TextArea
            label={t.jobs.requirements}
            rows={10}
            placeholder={
              "- Bachelor's degree in Software Engineering\n- JavaScript\n- React\n- Node.js\n- SQL\n- Git\n- Good communication skills"
            }
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t.jobs.yourProfile}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            {t.jobs.profileHint}
          </p>
          <TextArea
            rows={10}
            placeholder="e.g., 3.75 cgpa, Software Engineering graduate 2024, skills: React, Node.js, SQL, MySQL, project: Digital Library Management System, internship at ABC Tech"
            value={profileInput}
            onChange={(e) => setProfileInput(e.target.value)}
          />
          <Button onClick={handleAnalyze} className="w-full" isLoading={false}>
            {t.jobs.analyzeJob}
          </Button>
        </div>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">{t.jobs.analysis}</h3>
            <div className="space-y-4 text-sm">
              {analysis.requiredEducation.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-zinc-200 mb-1">{t.jobs.requiredEducation}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.requiredEducation.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.requiredTechnicalSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-zinc-200 mb-1">{t.jobs.requiredTechSkills}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.requiredTechnicalSkills.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.requiredExperience.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-zinc-200 mb-1">{t.jobs.requiredExperience}</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.requiredExperience.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.softSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-zinc-200 mb-1">{t.jobs.softSkills}</h4>
                  <p>{analysis.softSkills.join(', ')}</p>
                </div>
              )}
              {analysis.keywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-zinc-200 mb-1">{t.jobs.keywords}</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword: string, i: number) => (
                      <span key={i} className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs text-gray-600 dark:text-zinc-300">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {matchResult && (
            <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">{t.jobs.matchResults}</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-center mb-2">
                  <span className={
                    matchResult.matchScore >= 70 ? 'text-green-600 dark:text-green-400' :
                    matchResult.matchScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }>
                    {matchResult.matchScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      matchResult.matchScore >= 70 ? 'bg-green-600' :
                      matchResult.matchScore >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${matchResult.matchScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mt-1">
                  {matchResult.matchScore >= 70
                    ? t.jobs.strongMatch
                    : matchResult.matchScore >= 40
                    ? t.jobs.moderateMatch
                    : t.jobs.weakMatch}
                </p>
              </div>

              <div className="space-y-4 text-sm">
                {matchResult.matchedQualifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ {t.jobs.matchedQualifications}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {matchResult.matchedQualifications.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchResult.matchedTechnicalSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 dark:text-green-400 mb-1">✓ {t.jobs.matchedTechSkills}</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchedTechnicalSkills.map((item: string, i: number) => (
                        <span key={i} className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {matchResult.missingRequirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">✗ {t.jobs.missingWeak}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {matchResult.missingRequirements.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">{t.jobs.recommendations}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {matchResult.recommendations.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchResult.matchedTechnicalSkills.length === 0 && matchResult.missingRequirements.length === 0 && (
                  <p className="text-gray-500 dark:text-zinc-400">
                    {t.jobs.profileHint}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {atsResult && (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-zinc-100">{t.jobs.atsCheck}</h3>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">{t.jobs.atsScore}</span>
              <span className={`text-2xl font-bold ${
                atsResult.atsScore >= 70 ? 'text-green-600 dark:text-green-400' :
                atsResult.atsScore >= 40 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {atsResult.atsScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  atsResult.atsScore >= 70 ? 'bg-green-600' :
                  atsResult.atsScore >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                }`}
                style={{ width: `${atsResult.atsScore}%` }}
              />
            </div>
            <p className="text-sm mt-1 text-gray-600 dark:text-zinc-400">
              {atsResult.atsScore >= 70 ? t.jobs.atsScoreHigh :
               atsResult.atsScore >= 40 ? t.jobs.atsScoreMed : t.jobs.atsScoreLow}
            </p>
          </div>

          <div className="space-y-4 text-sm">
            {atsResult.keywordSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">{t.jobs.keywordSuggestions}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {atsResult.keywordSuggestions.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {atsResult.structureSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-1">{t.jobs.structureSuggestions}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {atsResult.structureSuggestions.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {atsResult.contentSuggestions.length > 0 && (
              <div>
                <h4 className="font-semibold text-purple-700 dark:text-purple-400 mb-1">{t.jobs.contentSuggestions}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {atsResult.contentSuggestions.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {atsResult.keywordSuggestions.length === 0 && atsResult.structureSuggestions.length === 0 && atsResult.contentSuggestions.length === 0 && (
              <p className="text-gray-500 dark:text-zinc-400">
                {t.jobs.profileHint}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAnalyzer;

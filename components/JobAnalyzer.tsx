'use client';

import { useState } from 'react';
import { Button, TextArea, Input } from '@/components/ui';
import { UserProfile, JobDescription, JobMatchResult, JobAnalysis } from '@/types';
import { aiService } from '@/services/ai';

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
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [requirements, setRequirements] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
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
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Analyzer</h1>
        <p className="text-gray-600">
          Paste a job description to analyze requirements and calculate your match score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold">Job Description</h3>
          <Input
            label="Position"
            placeholder="e.g., Junior Software Developer"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Input
            label="Company"
            placeholder="e.g., ABC Technology PLC"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <TextArea
            label="Requirements (one per line)"
            rows={10}
            placeholder={
              "- Bachelor's degree in Software Engineering\n- JavaScript\n- React\n- Node.js\n- SQL\n- Git\n- Good communication skills"
            }
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-semibold">Your Profile (Optional)</h3>
          <p className="text-sm text-gray-500">
            Paste your profile in any format. Our AI will automatically organize it.
            Example: &quot;3.6 cgpa software engineering graduated 2024 React node mysql&quot;
          </p>
          <TextArea
            rows={10}
            placeholder="e.g., 3.75 cgpa, Software Engineering graduate 2024, skills: React, Node.js, SQL, MySQL, project: Digital Library Management System, internship at ABC Tech"
            value={profileInput}
            onChange={(e) => setProfileInput(e.target.value)}
          />
          <Button onClick={handleAnalyze} className="w-full" isLoading={false}>
            Analyze Job & Calculate Match
          </Button>
        </div>
      </div>

      {analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Job Analysis</h3>
            <div className="space-y-4 text-sm">
              {analysis.requiredEducation.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Required Education:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.requiredEducation.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.requiredTechnicalSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Required Technical Skills:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.requiredTechnicalSkills.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.requiredExperience.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Required Experience:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.requiredExperience.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {analysis.softSkills.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Soft Skills:</h4>
                  <p>{analysis.softSkills.join(', ')}</p>
                </div>
              )}
              {analysis.keywords.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-1">Keywords:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keywords.map((keyword: string, i: number) => (
                      <span key={i} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {matchResult && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Match Results</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-center mb-2">
                  <span className={
                    matchResult.matchScore >= 70 ? 'text-green-600' :
                    matchResult.matchScore >= 40 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    {matchResult.matchScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      matchResult.matchScore >= 70 ? 'bg-green-600' :
                      matchResult.matchScore >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${matchResult.matchScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 text-center mt-1">
                  {matchResult.matchScore >= 70
                    ? 'Strong match - You are a great fit'
                    : matchResult.matchScore >= 40
                    ? 'Moderate match - Some areas to improve'
                    : 'Weak match - You may need more preparation'}
                </p>
              </div>

              <div className="space-y-4 text-sm">
                {matchResult.matchedQualifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-1">✓ Matched Qualifications:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {matchResult.matchedQualifications.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchResult.matchedTechnicalSkills.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-green-700 mb-1">✓ Matched Technical Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchResult.matchedTechnicalSkills.map((item: string, i: number) => (
                        <span key={i} className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {matchResult.missingRequirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-700 mb-1">✗ Missing or Weak:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {matchResult.missingRequirements.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchResult.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-blue-700 mb-1">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {matchResult.recommendations.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {matchResult.matchedTechnicalSkills.length === 0 && matchResult.missingRequirements.length === 0 && (
                  <p className="text-gray-500">
                    Add your profile details to see more detailed matching.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobAnalyzer;

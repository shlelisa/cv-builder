'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function JobAnalyzer() {
  const { t } = useApp();
  const router = useRouter();

  // Inputs
  const [position, setPosition] = useState('Junior Software Engineer');
  const [company, setCompany] = useState('Gadaa Software Company PLC');
  const [requirements, setRequirements] = useState(
    "- Bachelor's degree in Software Engineering, Computer Science or related field\n- Proven proficiency in React.js and Node.js\n- Hands-on experience with SQL databases (MySQL/PostgreSQL) and MongoDB\n- Familiarity with Git version control and RESTful APIs\n- Strong problem-solving, collaboration, and verbal communication skills"
  );
  const [profileInput, setProfileInput] = useState(
    "Lelisa Shashura Diriba - BSc in Software Engineering from Bule Hora University (CGPA 3.88, Exit Exam 75%).\nSkills: Java, C++, React.js, Node.js, SQL, MongoDB, Git, HTML, CSS, JavaScript, Problem Solving, Teamwork.\nExperience: IT Expert & Software Development Intern at OCC and Gadaa Software Company.\nProjects: Employee Hiring System (PHP/MySQL) and House Rental Portal (MERN stack)."
  );

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [atsResult, setAtsResult] = useState<{
    keywordSuggestions: string[];
    structureSuggestions: string[];
    contentSuggestions: string[];
    atsScore: number;
  } | null>(null);

  const parseUnstructuredProfile = (text: string): UserProfile => {
    const lower = text.toLowerCase();
    const skillsList: string[] = [];

    const KNOWN_SKILLS = [
      'react', 'react.js', 'node', 'node.js', 'javascript', 'typescript', 'python', 'java', 'c++', 'c#',
      'php', 'sql', 'mysql', 'postgresql', 'mongodb', 'git', 'github', 'html', 'css', 'tailwind',
      'aws', 'docker', 'rest', 'api', 'problem solving', 'teamwork', 'communication', 'leadership',
      'excel', 'powerpoint', 'accounting', 'marketing', 'seo', 'data analysis', 'figma'
    ];

    KNOWN_SKILLS.forEach(skill => {
      if (lower.includes(skill)) {
        skillsList.push(skill.charAt(0).toUpperCase() + skill.slice(1));
      }
    });

    const cgpaMatch = text.match(/(\d+\.\d+)\s*cgpa/i) || text.match(/cgpa:?\s*(\d+\.\d+)/i);
    const degreeMatch = text.match(/software engineering|computer science|information technology|accounting|economics|business management|civil engineering/i);
    const uniMatch = text.match(/from\s+([A-Za-z\s]+University|[A-Za-z\s]+College)/i);

    const education = degreeMatch ? [{
      id: 'auto-1',
      university: uniMatch ? uniMatch[1].trim() : 'University',
      degree: degreeMatch[0],
      department: degreeMatch[0],
      startYear: 2020,
      graduationYear: 2024,
      cgpa: cgpaMatch ? parseFloat(cgpaMatch[1]) : undefined,
      relevantCourses: [],
      academicAchievements: [],
      academicAwards: [],
    }] : [];

    return {
      ...emptyProfile,
      personalInfo: {
        fullName: text.split('\n')[0].split('-')[0].trim() || 'Candidate',
        email: '',
        phone: '',
        location: '',
      },
      education,
      experience: lower.includes('experience') || lower.includes('intern') ? [{
        id: 'auto-exp',
        company: 'Internship / Experience',
        position: 'Practitioner',
        employmentType: 'full-time',
        startDate: '2024',
        endDate: 'Present',
        isCurrent: true,
        responsibilities: [text.slice(0, 100)],
        achievements: [],
        technologiesUsed: skillsList.slice(0, 4),
      }] : [],
      skills: {
        ...emptyProfile.skills,
        technicalSkills: [...new Set(skillsList)],
      },
    };
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const jobDescription: JobDescription = {
        position,
        company,
        requirements: requirements.split('\n').map(r => r.trim()).filter(Boolean),
      };

      const parsedProfile = parseUnstructuredProfile(profileInput);

      const jobAnalysis = aiService.analyzeJobDescription(jobDescription);
      setAnalysis(jobAnalysis);

      const match = aiService.matchJobRequirements(parsedProfile, jobDescription);
      setMatchResult(match);

      const ats = aiService.checkATS(parsedProfile, jobDescription);
      setAtsResult(ats);
      setIsAnalyzing(false);
    }, 300);
  };

  const handleLoadSample = (sample: 'tech' | 'marketing') => {
    if (sample === 'tech') {
      setPosition('Junior Full-Stack Engineer');
      setCompany('Gadaa Tech Solutions');
      setRequirements(
        "- Bachelor's degree in Software Engineering or Computer Science\n- Solid foundation in JavaScript/TypeScript, React.js and Node.js\n- Experience designing and querying SQL and MongoDB databases\n- Familiarity with RESTful APIs, Git, and cloud concepts\n- Adaptable problem solver with good communication"
      );
      setProfileInput(
        "Lelisa Shashura Diriba\nSoftware Engineer Graduate (CGPA: 3.88) from Bule Hora University.\nSkills: JavaScript, TypeScript, React.js, Node.js, Express, SQL, MySQL, MongoDB, Git, HTML, CSS, Problem Solving, Teamwork.\nExperience: IT Support & Software Intern at Gadaa Software Company.\nProjects: Automated University Hiring System (PHP/MySQL) and Student Housing Platform (MERN stack)."
      );
    } else {
      setPosition('Marketing Manager');
      setCompany('Borcelle Media Group');
      setRequirements(
        "- Bachelor's degree in Business, Marketing, or related field\n- 3+ years experience driving digital marketing and brand strategy\n- Proficient in SEO, multi-channel campaign analytics, and ROI tracking\n- Demonstrated leadership and cross-functional project management\n- Strong presentation and stakeholder communication skills"
      );
      setProfileInput(
        "Richard Sanchez\nChicago, IL | Marketing Lead with Bachelor of Business Management from Wardiere University.\nSkills: Digital Marketing, Brand Strategy, SEO, Social Media Campaigns, Team Leadership, Budget Management, Google Analytics, Excel, Presentation.\nExperience: 4 years as Marketing Lead at Fauget Studio delivering 35% growth in brand engagement."
      );
    }
  };

  const handleGoToLetters = () => {
    router.push('/letters');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
            🔍 AI ATS & Skill Match Analyzer
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
            Job Match & ATS Diagnostic
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 mt-1">
            Compare your profile directly against any vacancy to uncover keyword overlap, calculate ATS pass probability, and identify key gaps.
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Load Test Data:</span>
          <button
            type="button"
            onClick={() => handleLoadSample('tech')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-xs"
          >
            💻 Tech Job & CV
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('marketing')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-xs"
          >
            📊 Marketing Job & CV
          </button>
        </div>
      </div>

      {/* Input Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Card 1: Job Description */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <span>📋</span>
              <span>1. Target Job Details</span>
            </h3>
            <span className="text-[11px] text-gray-400">Vacancy Info</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Position Title
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Junior Software Developer"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. ABC Technology PLC"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Job Requirements & Description (one per line or paste full text)
            </label>
            <textarea
              rows={8}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="- Degree in Software Engineering or related&#10;- React, Node.js, SQL&#10;- 1+ years experience"
              className="w-full p-3 text-xs sm:text-sm leading-relaxed border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Card 2: Your CV / Profile */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <span>👤</span>
              <span>2. Your CV & Background</span>
            </h3>
            <span className="text-[11px] text-gray-400">Candidate Info</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              Paste Your CV Summary, Skills & Background
            </label>
            <textarea
              rows={11}
              value={profileInput}
              onChange={(e) => setProfileInput(e.target.value)}
              placeholder="Paste your CV or summarize your degree, technical skills, projects, and work experience..."
              className="w-full p-3 text-xs sm:text-sm leading-relaxed border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <span>⏳ Analyzing Overlaps...</span>
            ) : (
              <span>⚡ Run In-Depth Match & ATS Diagnostic</span>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && matchResult && atsResult && (
        <div className="space-y-6 pt-4 border-t border-gray-200 dark:border-zinc-800 animate-in fade-in duration-300">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Match Score */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                Candidate Fit Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${
                  matchResult.matchScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                  matchResult.matchScore >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {matchResult.matchScore}%
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {matchResult.matchScore >= 70 ? 'Strong Alignment' :
                   matchResult.matchScore >= 45 ? 'Moderate Match' : 'Skill Gap Detected'}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    matchResult.matchScore >= 70 ? 'bg-emerald-500' :
                    matchResult.matchScore >= 45 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${matchResult.matchScore}%` }}
                />
              </div>
            </div>

            {/* ATS Readability Score */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                ATS Pass Probability
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${
                  atsResult.atsScore >= 70 ? 'text-blue-600 dark:text-blue-400' :
                  atsResult.atsScore >= 45 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {atsResult.atsScore}%
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {atsResult.atsScore >= 70 ? 'High Pass Rate' : 'Needs Optimization'}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${atsResult.atsScore}%` }}
                />
              </div>
            </div>

            {/* Matched Skills Count */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                Verified Overlaps
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">
                  {matchResult.matchedTechnicalSkills.length + matchResult.matchedEducation.length}
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  of {analysis.requiredTechnicalSkills.length + analysis.requiredEducation.length} key criteria
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">
                Direct keywords matched in your profile
              </p>
            </div>

            {/* Action CTA Box */}
            <div className="bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90 block mb-1">
                  Ready to Apply?
                </span>
                <p className="text-xs text-blue-100">
                  Create a tailored application letter that highlights your matched skills.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGoToLetters}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Write Letter for this Job →</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Breakdown (4 Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card A: Matched Strengths */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-emerald-600 text-base">✓</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Matched Qualifications & Strengths
                </h4>
              </div>

              {matchResult.matchedTechnicalSkills.length > 0 ? (
                <div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-2">
                    Direct Technical Match:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.matchedTechnicalSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        <span>✓</span>
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No exact technical overlap found.</p>
              )}

              {matchResult.matchedEducation.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1.5">
                    Education Criteria Met:
                  </span>
                  <ul className="space-y-1">
                    {matchResult.matchedEducation.map((edu, i) => (
                      <li key={i} className="text-xs text-gray-700 dark:text-zinc-300 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">•</span>
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Card B: Missing ATS Keywords */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-amber-600 text-base">⚠️</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Missing Keywords (Add to CV for ATS)
                </h4>
              </div>

              {matchResult.missingRequirements.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 dark:text-zinc-400">
                    ATS filters search for these exact terms. If you have experience with them, incorporate them into your CV summary or skills list:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missingRequirements.map((item, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                      >
                        <span>+</span>
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs">
                  🎉 Outstanding! Your profile covers all key required skills identified in this vacancy.
                </div>
              )}
            </div>

            {/* Card C: Demands Summary */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-blue-600 text-base">📌</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Role Demands Summary
                </h4>
              </div>

              <div className="space-y-2 text-xs">
                {analysis.requiredEducation.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700 dark:text-zinc-300">Degree Requirement:</span>
                    <p className="text-gray-600 dark:text-zinc-400">{analysis.requiredEducation.join(', ')}</p>
                  </div>
                )}
                {analysis.requiredExperience.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700 dark:text-zinc-300">Experience Expectation:</span>
                    <p className="text-gray-600 dark:text-zinc-400">{analysis.requiredExperience.join(', ')}</p>
                  </div>
                )}
                {analysis.softSkills.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700 dark:text-zinc-300">Soft Skills Mentioned:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {analysis.softSkills.map((s, i) => (
                        <span key={i} className="bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[11px] text-gray-700 dark:text-zinc-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card D: Strategic Recommendations */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-indigo-600 text-base">💡</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Actionable Strategy to Land Interview
                </h4>
              </div>

              <ul className="space-y-2 text-xs text-gray-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">1.</span>
                  <span>Align your CV headline with &quot;{position}&quot; to immediately confirm relevance for automated screening.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">2.</span>
                  <span>Feature your top matched proficiencies in the first half of your CV page.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 font-bold">3.</span>
                  <span>Include quantifiable outcomes in your project bullet points (e.g. users served, performance improvements).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobAnalysis, JobMatchResult } from '@/types';
import { useApp } from '@/lib/AppContext';
import { heuristicSemanticJobMatch } from '@/lib/job-analysis';
import { analyzeJobWithPuterClient } from '@/lib/puter-ai';

export default function JobAnalyzer() {
  const { t, language } = useApp();
  const router = useRouter();

  // Inputs
  const [position, setPosition] = useState('Junior Software Engineer');
  const [company, setCompany] = useState('ABC Company');
  const [requirements, setRequirements] = useState(
    "- Bachelor's degree in Software Engineering, Computer Science or related field\n- Proven proficiency in React.js and Node.js\n- Hands-on experience with SQL databases (MySQL/PostgreSQL) and MongoDB\n- Familiarity with Git version control and RESTful APIs\n- Strong problem-solving, collaboration, and verbal communication skills"
  );
  const [profileInput, setProfileInput] = useState(
    "Your Name / Maqaa Kee - BSc in Software Engineering from ABC University (CGPA 4, Exit Exam 99%).\nSkills: Java, C++, React.js, Node.js, SQL, MongoDB, Git, HTML, CSS, JavaScript, Problem Solving, Teamwork.\nExperience: 2 years IT Expert & Software Development Intern at ABC Company.\nProjects: Employee Hiring System (PHP/MySQL) and House Rental Portal (MERN stack)."
  );

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSource, setAnalysisSource] = useState<'backend-ai' | 'puter-ai' | 'semantic-engine'>('backend-ai');
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [atsResult, setAtsResult] = useState<{
    keywordSuggestions: string[];
    structureSuggestions: string[];
    contentSuggestions: string[];
    atsScore: number;
  } | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    const jobPayload = {
      position: position.trim(),
      company: company.trim(),
      requirements: requirements.split('\n').map(r => r.trim()).filter(Boolean),
    };

    try {
      // 1. Try Backend Multi-Model AI API
      const res = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: jobPayload.position,
          company: jobPayload.company,
          requirements: jobPayload.requirements,
          profileText: profileInput,
          language,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.matchResult) {
          setAnalysis(data.analysis);
          setMatchResult(data.matchResult);
          setAtsResult(data.atsResult);
          setAnalysisSource(data.mock ? 'semantic-engine' : 'backend-ai');
          setIsAnalyzing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[JobAnalyzer] Backend AI fetch failed, trying client fallback...', err);
    }

    // 2. Try Client-side Puter.js AI
    try {
      const puterRes = await analyzeJobWithPuterClient(jobPayload, profileInput, language);
      if (puterRes && puterRes.matchResult) {
        setAnalysis(puterRes.analysis);
        setMatchResult(puterRes.matchResult);
        setAtsResult(puterRes.atsResult);
        setAnalysisSource('puter-ai');
        setIsAnalyzing(false);
        return;
      }
    } catch (err) {
      console.warn('[JobAnalyzer] Puter AI fallback failed...', err);
    }

    // 3. High-Fidelity Domain-Aware Semantic Fallback
    const fallback = heuristicSemanticJobMatch(jobPayload, profileInput);
    setAnalysis(fallback.analysis);
    setMatchResult(fallback.matchResult);
    setAtsResult(fallback.atsResult);
    setAnalysisSource('semantic-engine');
    setIsAnalyzing(false);
  };

  const handleLoadSample = (sample: 'tech' | 'marketing' | 'accounting_mismatch') => {
    if (sample === 'tech') {
      setPosition('Junior Full-Stack Engineer');
      setCompany('ABC Tech Solutions');
      setRequirements(
        "- Bachelor's degree in Software Engineering or Computer Science\n- Solid foundation in JavaScript/TypeScript, React.js and Node.js\n- Experience designing and querying SQL and MongoDB databases\n- Familiarity with RESTful APIs, Git, and cloud concepts\n- Adaptable problem solver with good communication"
      );
      setProfileInput(
        "Your Name / Maqaa Kee\nSoftware Engineer Graduate (CGPA: 4) from ABC University.\nSkills: JavaScript, TypeScript, React.js, Node.js, Express, SQL, MySQL, MongoDB, Git, HTML, CSS, Problem Solving, Teamwork.\nExperience: 2 years IT Support & Software Intern at ABC Company.\nProjects: Automated University Hiring System (PHP/MySQL) and Student Housing Platform (MERN stack)."
      );
    } else if (sample === 'marketing') {
      setPosition('Marketing Manager');
      setCompany('Borcelle Media Group');
      setRequirements(
        "- Bachelor's degree in Business, Marketing, or related field\n- 3+ years experience driving digital marketing and brand strategy\n- Proficient in SEO, multi-channel campaign analytics, and ROI tracking\n- Demonstrated leadership and cross-functional project management\n- Strong presentation and stakeholder communication skills"
      );
      setProfileInput(
        "Richard Sanchez\nChicago, IL | Marketing Lead with Bachelor of Business Management from Wardiere University.\nSkills: Digital Marketing, Brand Strategy, SEO, Social Media Campaigns, Team Leadership, Budget Management, Google Analytics, Excel, Presentation.\nExperience: 4 years as Marketing Lead at Fauget Studio delivering 35% growth in brand engagement."
      );
    } else {
      // Domain Mismatch Demonstration: Accounting Job vs Computer Science Candidate
      setPosition('Senior Financial Accountant & Auditor');
      setCompany('Nexus Global Capital PLC');
      setRequirements(
        "- Bachelor's or Master's degree in Accounting, Finance, or Auditing (CPA/ACCA preferred)\n- 4+ years direct experience in general ledger reconciliation, GAAP compliance, and financial reporting\n- Hands-on mastery of QuickBooks, SAP ERP Financials, and advanced financial modeling in Excel\n- Strong track record managing quarterly corporate tax audits and cash flow forecasting\n- High ethical standards and executive presentation ability"
      );
      setProfileInput(
        "Your Name / Maqaa Kee\nAddis Ababa, Ethiopia | BSc in Computer Science & Software Engineering (CGPA: 3.9).\nSkills: Java, Python, React.js, Node.js, SQL Databases, Git, Problem Solving, System Architecture, Algorithms, Data Structures.\nExperience: 4 years as Full-Stack Software Developer building SaaS platforms and cloud backend APIs.\nProjects: University Management Portal (PostgreSQL/React) and Real-time Logistics Tracker."
      );
    }
  };

  const handleGoToLetters = () => {
    router.push('/letters');
  };

  const tj = t.jobs;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-2">
            <span>✨</span>
            <span>{tj.badge || 'AI Career Assistant & Recruiter Diagnostics'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-zinc-100 tracking-tight">
            {tj.title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 mt-1 max-w-3xl">
            {tj.subtitle}
          </p>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">{tj.sampleData}</span>
          <button
            type="button"
            onClick={() => handleLoadSample('tech')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-xs cursor-pointer"
          >
            {tj.sampleTech}
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('marketing')}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-emerald-500 hover:text-emerald-600 transition-colors shadow-xs cursor-pointer"
          >
            {tj.sampleMarketing}
          </button>
          <button
            type="button"
            onClick={() => handleLoadSample('accounting_mismatch')}
            title="Test domain mismatch comparison (e.g. 4 yrs Accounting vs 4 yrs Computer Science)"
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors shadow-xs cursor-pointer"
          >
            ⚖️ Accounting vs CS Mismatch Test
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
              <span>{tj.targetJobTitle}</span>
            </h3>
            <span className="text-[11px] font-medium text-gray-400">{tj.vacancyInfo}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {tj.positionTitle}
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Senior Financial Accountant"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
                {tj.companyName}
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Nexus Global Capital PLC"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              {tj.requirementsLabel}
            </label>
            <textarea
              rows={8}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="- Degree in field&#10;- 4+ years specific domain experience&#10;- Core technical tools and competencies"
              className="w-full p-3 text-xs sm:text-sm leading-relaxed border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            />
          </div>
        </div>

        {/* Card 2: Your CV / Profile */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200 flex items-center gap-2">
              <span>👤</span>
              <span>{tj.candidateProfileTitle}</span>
            </h3>
            <span className="text-[11px] font-medium text-gray-400">{t.form.personalTitle}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-zinc-300 mb-1">
              {tj.profileContentLabel}
            </label>
            <textarea
              rows={11}
              value={profileInput}
              onChange={(e) => setProfileInput(e.target.value)}
              placeholder="Paste your CV or summarize your degree, domain skills, projects, and work experience..."
              className="w-full p-3 text-xs sm:text-sm leading-relaxed border border-gray-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isAnalyzing ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{tj.calculatingBtn}</span>
              </div>
            ) : (
              <span>{tj.calculateMatchBtn}</span>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && matchResult && atsResult && (
        <div className="space-y-6 pt-6 border-t border-gray-200 dark:border-zinc-800 animate-in fade-in duration-300">
          {/* AI Intelligence Header Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 text-xs text-gray-600 dark:text-zinc-300">
            <div className="flex items-center gap-2">
              <span className="text-base">👔</span>
              <span className="font-semibold text-gray-900 dark:text-zinc-100">
                AI Executive Recruiter Evaluation:
              </span>
              <span>{matchResult.verdictTitle || 'Comprehensive Alignment Analysis'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 font-mono text-gray-500">
                Engine: {analysisSource === 'backend-ai' ? 'Claude / Gemini Neural' : analysisSource === 'puter-ai' ? 'Puter.js GPT-4o' : 'Domain Semantic Matcher'}
              </span>
            </div>
          </div>

          {/* Top Score Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Match Score */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                Candidate Fit Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black ${
                  matchResult.matchScore >= 70
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : matchResult.matchScore >= 45
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {matchResult.matchScore}%
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {matchResult.matchScore >= 70
                    ? 'Strong Alignment'
                    : matchResult.matchScore >= 45
                    ? 'Moderate Match'
                    : 'Domain / Skill Mismatch'}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    matchResult.matchScore >= 70
                      ? 'bg-emerald-500'
                      : matchResult.matchScore >= 45
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
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
                  atsResult.atsScore >= 70
                    ? 'text-blue-600 dark:text-blue-400'
                    : atsResult.atsScore >= 45
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {atsResult.atsScore}%
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {atsResult.atsScore >= 70 ? 'High Pass Rate' : 'Needs Tailoring'}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${atsResult.atsScore}%` }}
                />
              </div>
            </div>

            {/* Domain & Discipline Comparison */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-zinc-400 block mb-1">
                  Discipline Alignment
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                    matchResult.domainMatchStatus === 'match'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : matchResult.domainMatchStatus === 'partial'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {matchResult.domainMatchStatus === 'match'
                      ? '✓ Direct Field Match'
                      : matchResult.domainMatchStatus === 'partial'
                      ? '⇄ Partial Domain Overlap'
                      : '⚠️ Domain Shift Needed'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 dark:text-zinc-400 mt-2 line-clamp-2">
                  Target: {matchResult.jobDomain || position} <br />
                  Profile: {matchResult.candidateDomain || 'General Background'}
                </p>
              </div>
            </div>

            {/* Action CTA Box */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-5 text-white shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider opacity-90 block mb-1">
                  Ready to Apply?
                </span>
                <p className="text-xs text-blue-100 leading-snug">
                  Draft an application or cover letter directly tailored to this role.
                </p>
              </div>
              <button
                type="button"
                onClick={handleGoToLetters}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>{tj.generateLetterBtn}</span>
              </button>
            </div>
          </div>

          {/* Executive Career Coach Verdict */}
          {matchResult.verdictSummary && (
            <div className={`rounded-xl p-5 sm:p-6 border shadow-xs ${
              matchResult.domainMatchStatus === 'mismatch'
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50'
                : matchResult.matchScore >= 70
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">💬</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-zinc-100">
                      Recruiter Verdict: {matchResult.verdictTitle || 'Strategic Candidate Analysis'}
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">
                    {matchResult.verdictSummary}
                  </p>
                  {matchResult.domainExplanation && matchResult.domainExplanation !== matchResult.verdictSummary && (
                    <p className="text-xs text-gray-600 dark:text-zinc-400 mt-1 italic">
                      {matchResult.domainExplanation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Detailed Criteria Matrix (Side-by-Side Comparison) */}
          {matchResult.comparisonDetails && matchResult.comparisonDetails.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600 text-base">📊</span>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                    Direct Requirements vs. Candidate Matrix
                  </h4>
                </div>
                <span className="text-xs text-gray-400">Semantic AI Evaluation</span>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                {matchResult.comparisonDetails.map((detail, idx) => (
                  <div key={idx} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="md:w-1/4">
                      <span className="font-bold text-gray-800 dark:text-zinc-200 block">{detail.title}</span>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        detail.status === 'match'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : detail.status === 'partial'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {detail.status}
                      </span>
                    </div>

                    <div className="md:w-1/3 space-y-1">
                      <span className="text-gray-400 uppercase text-[10px] font-bold block">Job Expectation:</span>
                      <span className="text-gray-700 dark:text-zinc-300 font-medium">{detail.requiredValue}</span>
                    </div>

                    <div className="md:w-1/3 space-y-1">
                      <span className="text-gray-400 uppercase text-[10px] font-bold block">Your Profile:</span>
                      <span className="text-gray-900 dark:text-zinc-100 font-medium">{detail.candidateValue}</span>
                    </div>

                    {detail.commentary && (
                      <div className="md:w-1/4 text-gray-500 dark:text-zinc-400 italic">
                        {detail.commentary}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnostic Breakdown (4 Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card A: Matched Strengths & Overlaps */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-emerald-600 text-base">✓</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  {tj.matchedQualifications}
                </h4>
              </div>

              {matchResult.matchedTechnicalSkills.length > 0 ? (
                <div>
                  <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-2">
                    {tj.matchedTechSkills}:
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
                <p className="text-xs text-gray-500 italic">No direct domain skill overlap found.</p>
              )}

              {matchResult.transferableSkills && matchResult.transferableSkills.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1.5">
                    Transferable Strengths:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.transferableSkills.map((tr, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        ⇄ {tr}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {matchResult.matchedEducation.length > 0 && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400 block mb-1.5">
                    {tj.requiredEducation}
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

            {/* Card B: Missing Prerequisites & ATS Keywords */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-amber-600 text-base">⚠️</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  {tj.missingWeakAreas}
                </h4>
              </div>

              {matchResult.missingRequirements.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 dark:text-zinc-400">
                    The recruiter and ATS filters will scan for these critical requirements:
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
                  🎉 Outstanding! Your profile covers all key required qualifications identified in this vacancy.
                </div>
              )}
            </div>

            {/* Card C: Human Recruiter Coaching & Pivot Strategy */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-indigo-600 text-base">💡</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  Career Coach Strategic Guidance
                </h4>
              </div>

              {matchResult.recruiterAdvice && matchResult.recruiterAdvice.length > 0 ? (
                <ul className="space-y-2.5 text-xs text-gray-700 dark:text-zinc-300">
                  {matchResult.recruiterAdvice.map((adv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold">{i + 1}.</span>
                      <span className="leading-relaxed">{adv}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-500">Align your CV summary to mirror this position&apos;s title and key deliverables.</p>
              )}
            </div>

            {/* Card D: ATS Resume Formatting & Keywords */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 dark:border-zinc-800 pb-3">
                <span className="text-blue-600 text-base">⚙️</span>
                <h4 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-zinc-200">
                  ATS Optimization & Structure Tips
                </h4>
              </div>

              {matchResult.atsOptimizationTips && matchResult.atsOptimizationTips.length > 0 ? (
                <ul className="space-y-2.5 text-xs text-gray-700 dark:text-zinc-300">
                  {matchResult.atsOptimizationTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-2 text-xs text-gray-600 dark:text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Align your resume headline with &quot;{position}&quot; to confirm relevance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>Quantify your achievements with measurable results (percentages, volume, timelines).</span>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

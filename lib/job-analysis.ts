import { JobAnalysis, JobMatchResult, JobMatchAnalysisDetail } from '@/types';

/**
 * Builds a prompt for the AI Senior Recruiter & Career Advisor.
 */
export function buildJobMatchPrompt(
  job: { position: string; company: string; requirements: string[] | string },
  profileText: string,
  language = 'en'
): string {
  const reqText = Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements;

  return `
You are a Senior Talent Acquisition Director, Executive Headhunter, and Career Coach with 15+ years of experience in technical recruiting, HR screening, and resume evaluation.

Analyze the candidate's profile/CV against the target job vacancy with rigorous semantic understanding.

CRITICAL EVALUATION RULES:
1. DOMAIN & DISCIPLINE CHECK:
   - Identify the candidate's actual discipline (e.g., Software Engineering, Computer Science, Finance/Accounting, Nursing, Digital Marketing, Civil Engineering).
   - Identify the job's required discipline.
   - If there is a fundamental domain mismatch (e.g., Job requires 4 years in Accounting/Finance, but Candidate has 4 years in Computer Science/Software Engineering with NO accounting experience), DO NOT give a high score! Score it realistically between 15% - 35%. General years or having a degree does NOT satisfy a domain-specific requirement.
2. EXPERIENCE RELEVANCE:
   - Compare years of experience in the specific required field. 4 years of coding is NOT 4 years of auditing/accounting.
3. HUMAN CAREER COACH TONE:
   - Sound like an empathetic, highly knowledgeable senior recruiter giving constructive, strategic human feedback.
   - Avoid robotic canned statements (e.g., "Add word 'accounting'"). Provide insightful career context, pivot advice, transferable strengths, or adjacent job titles if mismatched.

Target Job:
Position: ${job.position || 'Not specified'}
Company: ${job.company || 'Not specified'}
Job Requirements & Description:
"""
${reqText}
"""

Candidate Profile / CV Content:
"""
${profileText}
"""

Language: ${language}

Respond with ONLY a valid, parseable JSON object matching this exact TypeScript structure:
{
  "jobAnalysis": {
    "requiredEducation": ["string"],
    "requiredExperience": ["string"],
    "requiredTechnicalSkills": ["string"],
    "preferredTechnicalSkills": ["string"],
    "softSkills": ["string"],
    "keywords": ["string"]
  },
  "domainMatch": {
    "status": "match" | "partial" | "mismatch",
    "jobDomain": "string (e.g. Accounting & Finance)",
    "candidateDomain": "string (e.g. Software Engineering & Computer Science)",
    "explanation": "string (clear human explanation comparing both domains)"
  },
  "matchScore": number (0 to 100 based on realistic domain fit),
  "atsScore": number (0 to 100 pass probability),
  "verdictTitle": "string (e.g. 'Domain Alignment Mismatch', 'Strong Competitive Fit', 'Partial Transferable Match')",
  "verdictSummary": "string (2-3 sentences concise executive summary with human career coach perspective)",
  "matchedQualifications": ["string"],
  "matchedTechnicalSkills": ["string"],
  "matchedExperience": ["string"],
  "matchedEducation": ["string"],
  "missingRequirements": ["string (critical missing skills, certifications, or domain prerequisites)"],
  "transferableSkills": ["string (transferable capabilities candidate can emphasize)"],
  "comparisonDetails": [
    {
      "category": "domain" | "experience" | "education" | "skills" | "culture",
      "title": "string (e.g. 'Discipline & Field Focus', 'Years & Seniority Level', 'Degree Alignment', 'Core Toolset')",
      "status": "match" | "partial" | "mismatch",
      "candidateValue": "string (what candidate has)",
      "requiredValue": "string (what job requires)",
      "commentary": "string (concise human-like feedback on this point)"
    }
  ],
  "recruiterAdvice": [
    "string (actionable, practical advice on positioning, gap bridging, or pivot strategy)"
  ],
  "atsOptimizationTips": [
    "string (clear ATS formatting & phrasing suggestions)"
  ]
}
`.trim();
}

/**
 * Sanitizes and normalizes the parsed JSON output from the AI.
 */
export function sanitizeJobMatchResult(
  parsed: any,
  jobFallback?: { position: string; company: string; requirements: string[] },
  profileFallbackText?: string
): {
  analysis: JobAnalysis;
  matchResult: JobMatchResult;
  atsResult: {
    atsScore: number;
    keywordSuggestions: string[];
    structureSuggestions: string[];
    contentSuggestions: string[];
  };
} {
  const jobAnalysis: JobAnalysis = {
    requiredEducation: Array.isArray(parsed?.jobAnalysis?.requiredEducation)
      ? parsed.jobAnalysis.requiredEducation.map(String)
      : [],
    requiredTechnicalSkills: Array.isArray(parsed?.jobAnalysis?.requiredTechnicalSkills)
      ? parsed.jobAnalysis.requiredTechnicalSkills.map(String)
      : [],
    preferredTechnicalSkills: Array.isArray(parsed?.jobAnalysis?.preferredTechnicalSkills)
      ? parsed.jobAnalysis.preferredTechnicalSkills.map(String)
      : [],
    requiredExperience: Array.isArray(parsed?.jobAnalysis?.requiredExperience)
      ? parsed.jobAnalysis.requiredExperience.map(String)
      : [],
    softSkills: Array.isArray(parsed?.jobAnalysis?.softSkills)
      ? parsed.jobAnalysis.softSkills.map(String)
      : [],
    keywords: Array.isArray(parsed?.jobAnalysis?.keywords)
      ? parsed.jobAnalysis.keywords.map(String)
      : [],
  };

  const domainMatch = parsed?.domainMatch || {};
  const domainStatus: 'match' | 'partial' | 'mismatch' =
    domainMatch.status === 'match' || domainMatch.status === 'partial' || domainMatch.status === 'mismatch'
      ? domainMatch.status
      : 'partial';

  const rawMatchScore = typeof parsed?.matchScore === 'number' ? Math.round(parsed.matchScore) : 50;
  const matchScore = Math.max(5, Math.min(99, rawMatchScore));

  const rawAtsScore = typeof parsed?.atsScore === 'number' ? Math.round(parsed.atsScore) : matchScore;
  const atsScore = Math.max(5, Math.min(100, rawAtsScore));

  const comparisonDetails: JobMatchAnalysisDetail[] = Array.isArray(parsed?.comparisonDetails)
    ? parsed.comparisonDetails.map((item: any) => ({
        category: item?.category || 'skills',
        title: String(item?.title || 'Criteria'),
        status: (item?.status === 'match' || item?.status === 'partial' || item?.status === 'mismatch')
          ? item.status
          : 'partial',
        candidateValue: String(item?.candidateValue || 'Not specified'),
        requiredValue: String(item?.requiredValue || 'Not specified'),
        commentary: String(item?.commentary || ''),
      }))
    : [];

  const matchedTech = Array.isArray(parsed?.matchedTechnicalSkills)
    ? parsed.matchedTechnicalSkills.map(String)
    : [];
  const matchedEdu = Array.isArray(parsed?.matchedEducation)
    ? parsed.matchedEducation.map(String)
    : [];
  const matchedExp = Array.isArray(parsed?.matchedExperience)
    ? parsed.matchedExperience.map(String)
    : [];
  const missingReqs = Array.isArray(parsed?.missingRequirements)
    ? parsed.missingRequirements.map(String)
    : [];
  const transferable = Array.isArray(parsed?.transferableSkills)
    ? parsed.transferableSkills.map(String)
    : [];
  const advice = Array.isArray(parsed?.recruiterAdvice)
    ? parsed.recruiterAdvice.map(String)
    : [];
  const atsTips = Array.isArray(parsed?.atsOptimizationTips)
    ? parsed.atsOptimizationTips.map(String)
    : [];

  const matchResult: JobMatchResult = {
    matchScore,
    atsScore,
    verdictTitle: parsed?.verdictTitle || (matchScore >= 70 ? 'Strong Candidate Alignment' : matchScore >= 45 ? 'Moderate Compatibility' : 'Domain & Skill Gap Identified'),
    verdictSummary: parsed?.verdictSummary || 'Detailed comparison between your profile and the vacancy requirements.',
    domainMatchStatus: domainStatus,
    jobDomain: domainMatch.jobDomain || 'Target Field',
    candidateDomain: domainMatch.candidateDomain || 'Candidate Discipline',
    domainExplanation: domainMatch.explanation || '',
    matchedQualifications: matchedEdu,
    matchedTechnicalSkills: matchedTech,
    matchedExperience: matchedExp,
    matchedEducation: matchedEdu,
    missingRequirements: missingReqs,
    transferableSkills: transferable,
    comparisonDetails,
    recommendations: advice,
    recruiterAdvice: advice,
    atsOptimizationTips: atsTips,
  };

  const atsResult = {
    atsScore,
    keywordSuggestions: missingReqs.map((r: string) => `Consider demonstrating experience with "${r}" if applicable to your actual background.`),
    structureSuggestions: [
      'Ensure standard section headers (Experience, Education, Skills) are clearly identifiable.',
      'Place top matching proficiencies within the first third of your CV.',
    ],
    contentSuggestions: atsTips.length > 0 ? atsTips : [
      'Use action verbs and quantifiable metrics (e.g. percentages, scale, users served).',
      'Align your CV headline directly with the target job title.',
    ],
  };

  return {
    analysis: jobAnalysis,
    matchResult,
    atsResult,
  };
}

/**
 * Heuristic Domain-Aware Semantic Fallback Matcher (works offline or if AI fails)
 */
export function heuristicSemanticJobMatch(
  job: { position: string; company: string; requirements: string[] },
  profileText: string
): {
  analysis: JobAnalysis;
  matchResult: JobMatchResult;
  atsResult: {
    atsScore: number;
    keywordSuggestions: string[];
    structureSuggestions: string[];
    contentSuggestions: string[];
  };
} {
  const pLower = profileText.toLowerCase();
  const jLower = (job.position + ' ' + job.requirements.join(' ')).toLowerCase();

  // Identify Candidate Domain
  const DOMAINS = {
    tech: ['software', 'computer science', 'programming', 'developer', 'react', 'node', 'javascript', 'python', 'java', 'sql', 'html', 'css', 'git', 'full-stack', 'backend', 'frontend'],
    finance: ['accounting', 'accountant', 'finance', 'financial', 'audit', 'tax', 'gaap', 'ledger', 'balance sheet', 'bookkeeping', 'cpa', 'quickbooks', 'ifrs', 'payroll'],
    marketing: ['marketing', 'seo', 'social media', 'campaign', 'brand', 'content creator', 'advertising', 'growth marketing', 'market research'],
    engineering: ['civil engineering', 'mechanical', 'electrical', 'structural', 'autocad', 'construction', 'circuits'],
    health: ['nursing', 'medical', 'clinical', 'patient care', 'healthcare', 'hospital', 'pharmacy', 'doctor'],
    business: ['business management', 'operations', 'project manager', 'administration', 'human resources', 'recruitment', 'hr'],
  };

  type DomainKey = keyof typeof DOMAINS;
  const scoreDomain = (text: string): Record<DomainKey, number> => {
    const scores: Record<DomainKey, number> = { tech: 0, finance: 0, marketing: 0, engineering: 0, health: 0, business: 0 };
    for (const [dom, keywords] of Object.entries(DOMAINS) as [DomainKey, string[]][]) {
      keywords.forEach(kw => {
        if (text.includes(kw)) scores[dom] += 1;
      });
    }
    return scores;
  };

  const cScores = scoreDomain(pLower);
  const jScores = scoreDomain(jLower);

  const topCDomain = (Object.keys(cScores) as DomainKey[]).reduce((a, b) => cScores[a] >= cScores[b] ? a : b);
  const topJDomain = (Object.keys(jScores) as DomainKey[]).reduce((a, b) => jScores[a] >= jScores[b] ? a : b);

  const domainNames: Record<DomainKey, string> = {
    tech: 'Software Engineering & Computer Science',
    finance: 'Accounting & Finance',
    marketing: 'Marketing & Brand Strategy',
    engineering: 'Engineering & Construction',
    health: 'Healthcare & Clinical Services',
    business: 'Business Management & Operations',
  };

  const domainMatches = topCDomain === topJDomain;
  const domainStatus: 'match' | 'partial' | 'mismatch' = domainMatches ? 'match' : (cScores[topJDomain] > 0 ? 'partial' : 'mismatch');

  // Extract years
  const cExpYearsMatch = profileText.match(/(\d+)\+?\s*years?/i);
  const cExpYears = cExpYearsMatch ? cExpYearsMatch[1] : '0';
  const jExpYearsMatch = jLower.match(/(\d+)\+?\s*years?/i);
  const jExpYears = jExpYearsMatch ? jExpYearsMatch[1] : '0';

  const matchedTech: string[] = [];
  const missingTech: string[] = [];

  job.requirements.forEach(req => {
    const reqClean = req.replace(/^[-*•\d.)\s]+/, '').trim();
    if (!reqClean) return;
    const rWords = reqClean.toLowerCase().split(/[^a-z0-9+#.]+/).filter(w => w.length > 2);
    const hasOverlap = rWords.some(w => pLower.includes(w));
    if (hasOverlap && (domainMatches || domainStatus === 'partial')) {
      matchedTech.push(reqClean);
    } else {
      missingTech.push(reqClean);
    }
  });

  let matchScore = 50;
  if (!domainMatches && domainStatus === 'mismatch') {
    matchScore = Math.min(28, Math.max(15, 12 + (matchedTech.length * 4)));
  } else if (domainStatus === 'partial') {
    matchScore = Math.min(65, Math.max(40, 45 + (matchedTech.length * 6)));
  } else {
    const ratio = matchedTech.length / Math.max(1, job.requirements.length);
    matchScore = Math.min(95, Math.max(55, Math.round(55 + (ratio * 40))));
  }

  const atsScore = Math.min(100, Math.max(15, Math.round(matchScore * 0.95)));

  const verdictTitle = domainStatus === 'mismatch'
    ? 'Domain Shift Detected'
    : matchScore >= 75
    ? 'Strong Candidate Alignment'
    : 'Moderate Fit with Addressable Gaps';

  const verdictSummary = domainStatus === 'mismatch'
    ? `The target vacancy requires specialized expertise in ${domainNames[topJDomain]}, while your background demonstrates primary focus in ${domainNames[topCDomain]}. While analytical problem-solving and software tools are valuable transferable assets, domain-specific requirements (e.g. accounting standards or specialized workflows) require deliberate positioning.`
    : `Your background in ${domainNames[topCDomain]} aligns well with the key expectations for this ${job.position} position, showing verifiable overlap in core proficiencies.`;

  const comparisonDetails: JobMatchAnalysisDetail[] = [
    {
      category: 'domain',
      title: 'Discipline & Domain Focus',
      status: domainStatus,
      candidateValue: domainNames[topCDomain],
      requiredValue: domainNames[topJDomain],
      commentary: domainStatus === 'mismatch'
        ? `Field mismatch: The role is focused on ${domainNames[topJDomain]}, whereas your primary profile is in ${domainNames[topCDomain]}.`
        : `Direct discipline alignment in ${domainNames[topJDomain]}.`,
    },
    {
      category: 'experience',
      title: 'Experience Length & Seniority',
      status: Number(cExpYears) >= Number(jExpYears) ? 'match' : 'partial',
      candidateValue: Number(cExpYears) > 0 ? `${cExpYears} years in ${domainNames[topCDomain]}` : `Entry/Internship level in ${domainNames[topCDomain]}`,
      requiredValue: Number(jExpYears) > 0 ? `${jExpYears} years in ${domainNames[topJDomain]}` : `Specified in job description`,
      commentary: domainStatus === 'mismatch'
        ? `While you have ${cExpYears} years of experience, it is in ${domainNames[topCDomain]} rather than ${domainNames[topJDomain]}.`
        : `Experience duration matches the expected seniority level.`,
    },
  ];

  const recruiterAdvice = domainStatus === 'mismatch'
    ? [
        `If targeting this vacancy, highlight crossover capabilities such as data analysis, quantitative logic, process automation, and software tools.`,
        `Explore adjacent opportunities such as ${domainNames[topCDomain]} positions within financial institutions, fintechs, or enterprise SaaS.`,
        `If making a deliberate career pivot into ${domainNames[topJDomain]}, showcase formal credentials, relevant certifications, or practical coursework.`,
      ]
    : [
        `Highlight your top matching skills in the first third of your CV summary to immediately satisfy ATS parsers and recruiters.`,
        `Add measurable impact metrics (e.g. percentages, system scale, user counts) to your project descriptions.`,
        `Align your resume headline with "${job.position}" for maximal recruiter search visibility.`,
      ];

  const atsOptimizationTips = [
    `Incorporate missing core terms into your skills and project descriptions where genuinely applicable.`,
    `Ensure clean standard headings (Professional Experience, Education, Technical Skills) for parsing software.`,
    `Avoid graphics, tables, or non-standard fonts in ATS submission versions.`,
  ];

  const analysis: JobAnalysis = {
    requiredEducation: job.requirements.filter(r => /degree|bachelor|master|bsc|msc|diploma/i.test(r)),
    requiredExperience: job.requirements.filter(r => /experience|year/i.test(r)),
    requiredTechnicalSkills: job.requirements.filter(r => !/degree|bachelor|master|bsc|msc|diploma/i.test(r)),
    preferredTechnicalSkills: [],
    softSkills: ['Communication', 'Problem Solving', 'Collaboration'],
    keywords: job.requirements.slice(0, 5),
  };

  const matchResult: JobMatchResult = {
    matchScore,
    atsScore,
    verdictTitle,
    verdictSummary,
    domainMatchStatus: domainStatus,
    jobDomain: domainNames[topJDomain],
    candidateDomain: domainNames[topCDomain],
    domainExplanation: verdictSummary,
    matchedQualifications: analysis.requiredEducation.filter(e => pLower.includes('degree') || pLower.includes('bsc')),
    matchedTechnicalSkills: matchedTech,
    matchedExperience: analysis.requiredExperience.length > 0 && Number(cExpYears) > 0 ? [`${cExpYears} years background`] : [],
    matchedEducation: analysis.requiredEducation.slice(0, 1),
    missingRequirements: missingTech,
    transferableSkills: ['Problem Solving', 'Analytical Thinking', 'Communication', 'Project Execution'],
    comparisonDetails,
    recommendations: recruiterAdvice,
    recruiterAdvice,
    atsOptimizationTips,
  };

  const atsResult = {
    atsScore,
    keywordSuggestions: missingTech.slice(0, 4).map(k => `Add experience with "${k}" if relevant.`),
    structureSuggestions: ['Ensure clear contact information and standard section headers.'],
    contentSuggestions: atsOptimizationTips,
  };

  return {
    analysis,
    matchResult,
    atsResult,
  };
}

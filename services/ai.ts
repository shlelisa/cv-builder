import { UserProfile, JobDescription, JobMatchResult, JobAnalysis, LanguageCode, TemplateAnalysis } from '@/types';

export class AIService {
  private static instance: AIService;
  
  private constructor() {}
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  generateProfessionalSummary(profile: UserProfile, _language: LanguageCode = 'en'): string {
    const { education, skills, experience, internships, projects } = profile;
    
    const latestEducation = education[0];
    const hasExperience = experience.length > 0;
    const hasInternship = internships.length > 0;
    const hasProjects = projects.length > 0;
    
    let summary = '';
    
    if (latestEducation) {
      const degree = latestEducation.degree || 'graduate';
      const department = latestEducation.department || '';
      const university = latestEducation.university || '';
      
      summary += `Recent ${department || degree} graduate`;
      
      if (university) {
        summary += ` from ${university}`;
      }
      
      if (latestEducation.cgpa) {
        summary += ` with a CGPA of ${latestEducation.cgpa}`;
      }
      
      summary += '.';
    }
    
    if (skills.technicalSkills.length > 0) {
      const mainSkills = skills.technicalSkills.slice(0, 3).join(', ');
      summary += ` Proficient in ${mainSkills}`;
      
      if (skills.technicalSkills.length > 3) {
        summary += ` and other technologies`;
      }
      summary += '.';
    }
    
    if (hasInternship) {
      const latestInternship = internships[0];
      summary += ` Gained practical experience as ${latestInternship.position} at ${latestInternship.organization}.`;
    }
    
    if (hasProjects) {
      summary += ` Successfully completed ${projects.length} project${projects.length > 1 ? 's' : ''} demonstrating technical skills and problem-solving abilities.`;
    }
    
    if (hasExperience) {
      const totalYears = this.calculateTotalExperience(experience);
      if (totalYears > 0) {
        summary += ` Brings ${totalYears} year${totalYears > 1 ? 's' : ''} of professional experience.`;
      }
    }
    
    return summary || 'Recent graduate seeking opportunities to apply academic knowledge and skills in a professional environment.';
  }

  extractSkillsFromEducation(education: { relevantCourses?: string[] }[]): string[] {
    const skills: string[] = [];
    
    education.forEach(edu => {
      if (edu.relevantCourses) {
        edu.relevantCourses.forEach(course => {
          const normalizedCourse = course.toLowerCase();
          
          if (normalizedCourse.includes('programming') || normalizedCourse.includes('software')) {
            skills.push('Software Development');
          }
          if (normalizedCourse.includes('database') || normalizedCourse.includes('sql')) {
            skills.push('Database Management');
          }
          if (normalizedCourse.includes('network') || normalizedCourse.includes('internet')) {
            skills.push('Networking');
          }
          if (normalizedCourse.includes('web') || normalizedCourse.includes('html') || normalizedCourse.includes('css')) {
            skills.push('Web Development');
          }
          if (normalizedCourse.includes('data') || normalizedCourse.includes('analytics')) {
            skills.push('Data Analysis');
          }
          if (normalizedCourse.includes('security') || normalizedCourse.includes('cyber')) {
            skills.push('Cybersecurity');
          }
          if (normalizedCourse.includes('cloud') || normalizedCourse.includes('aws') || normalizedCourse.includes('azure')) {
            skills.push('Cloud Computing');
          }
          if (normalizedCourse.includes('ai') || normalizedCourse.includes('machine learning')) {
            skills.push('Artificial Intelligence');
          }
        });
      }
    });
    
    return [...new Set(skills)];
  }

  analyzeJobDescription(jobDescription: JobDescription): JobAnalysis {
    const { requirements } = jobDescription;
    
    const requiredEducation: string[] = [];
    const requiredTechnicalSkills: string[] = [];
    const preferredTechnicalSkills: string[] = [];
    const requiredExperience: string[] = [];
    const softSkills: string[] = [];
    const keywords: string[] = [];

    const COMMON_TECH_TERMS = [
      'react', 'next.js', 'node', 'node.js', 'javascript', 'typescript', 'python', 'java', 'c++', 'c#',
      'php', 'ruby', 'go', 'golang', 'rust', 'html', 'css', 'sql', 'mysql', 'postgresql', 'postgres',
      'mongodb', 'nosql', 'sqlite', 'redis', 'aws', 'azure', 'gcp', 'cloud', 'docker', 'kubernetes',
      'git', 'github', 'ci/cd', 'rest', 'restful', 'api', 'graphql', 'linux', 'figma', 'excel', 'powerpoint',
      'agile', 'scrum', 'jira', 'machine learning', 'ai', 'devops', 'cybersecurity', 'accounting',
      'financial analysis', 'sales', 'marketing', 'seo', 'customer service', 'data analysis', 'flutter'
    ];

    const COMMON_SOFT_TERMS = [
      'communication', 'teamwork', 'collaboration', 'problem solving', 'leadership', 'adaptability',
      'time management', 'critical thinking', 'attention to detail', 'interpersonal', 'presentation',
      'work ethic', 'conflict resolution', 'negotiation', 'organizational'
    ];

    requirements.forEach(req => {
      const cleanReq = req.replace(/^[-*•\d.)\s]+/, '').trim();
      if (!cleanReq) return;
      const lowerReq = cleanReq.toLowerCase();
      const isPreferred = lowerReq.includes('preferred') || lowerReq.includes('plus') || lowerReq.includes('advantage') || lowerReq.includes('nice to have');

      // 1. Education
      if (lowerReq.includes('degree') || lowerReq.includes('bachelor') || lowerReq.includes('master') || lowerReq.includes('bsc') || lowerReq.includes('msc') || lowerReq.includes('diploma') || lowerReq.includes('university')) {
        requiredEducation.push(cleanReq);
      }

      // 2. Experience
      if (lowerReq.includes('experience') || lowerReq.includes('year') || lowerReq.includes('years') || lowerReq.includes('proven track record')) {
        requiredExperience.push(cleanReq);
      }

      // 3. Technical & Domain Skills
      const hasTechKeyword = COMMON_TECH_TERMS.some(term => lowerReq.includes(term)) || lowerReq.includes('proficient') || lowerReq.includes('knowledge of') || lowerReq.includes('familiarity with') || lowerReq.includes('experience in') || lowerReq.includes('tools');
      if (hasTechKeyword) {
        if (isPreferred) {
          preferredTechnicalSkills.push(cleanReq);
        } else {
          requiredTechnicalSkills.push(cleanReq);
        }
      }

      // 4. Soft Skills
      const hasSoftKeyword = COMMON_SOFT_TERMS.some(term => lowerReq.includes(term));
      if (hasSoftKeyword) {
        softSkills.push(cleanReq);
      }

      // 5. General Keywords
      if (!hasTechKeyword && !hasSoftKeyword && !requiredEducation.includes(cleanReq) && !requiredExperience.includes(cleanReq)) {
        keywords.push(cleanReq);
      }
    });

    return {
      requiredEducation: [...new Set(requiredEducation)],
      requiredTechnicalSkills: [...new Set(requiredTechnicalSkills)],
      preferredTechnicalSkills: [...new Set(preferredTechnicalSkills)],
      requiredExperience: [...new Set(requiredExperience)],
      softSkills: [...new Set(softSkills)],
      keywords: [...new Set(keywords)],
    };
  }

  matchJobRequirements(profile: UserProfile, jobDescription: JobDescription): JobMatchResult {
    const profileText = [
      profile.personalInfo.fullName,
      profile.personalInfo.location,
      ...profile.education.map(e => `${e.degree} ${e.department} ${e.university} ${(e.relevantCourses || []).join(' ')}`),
      ...profile.experience.map(e => `${e.position} ${e.company} ${(e.responsibilities || []).join(' ')} ${(e.technologiesUsed || []).join(' ')}`),
      ...profile.internships.map(i => `${i.position} ${i.organization} ${(i.responsibilities || []).join(' ')} ${(i.skillsGained || []).join(' ')}`),
      ...profile.projects.map(p => `${p.name} ${p.description} ${(p.technologies || []).join(' ')}`),
      ...profile.skills.technicalSkills,
      ...profile.skills.programmingLanguages,
      ...profile.skills.frameworks,
      ...profile.skills.databases,
      ...profile.skills.softSkills,
      ...profile.skills.languages,
    ].join(' ');

    const { heuristicSemanticJobMatch } = require('@/lib/job-analysis');
    const result = heuristicSemanticJobMatch(
      {
        position: jobDescription.position,
        company: jobDescription.company,
        requirements: jobDescription.requirements,
      },
      profileText
    );

    return result.matchResult;
  }

  checkATS(profile: UserProfile, jobDescription: JobDescription): {
    keywordSuggestions: string[];
    structureSuggestions: string[];
    contentSuggestions: string[];
    atsScore: number;
  } {
    const jobAnalysis = this.analyzeJobDescription(jobDescription);
    const keywordSuggestions: string[] = [];
    const structureSuggestions: string[] = [];
    const contentSuggestions: string[] = [];

    const allProfileText = [
      profile.education.map(e => `${e.university} ${e.degree} ${e.department} ${(e.relevantCourses || []).join(' ')}`).join(' '),
      profile.experience.map(e => `${e.position} ${e.company} ${e.responsibilities.join(' ')} ${e.achievements.join(' ')} ${e.technologiesUsed.join(' ')}`).join(' '),
      profile.projects.map(p => `${p.name} ${p.description} ${p.technologies.join(' ')} ${p.features.join(' ')}`).join(' '),
      profile.skills.technicalSkills.join(' '),
      profile.skills.programmingLanguages.join(' '),
      profile.skills.frameworks.join(' '),
      profile.skills.databases.join(' '),
      profile.skills.softSkills.join(' '),
    ].join(' ').toLowerCase();

    jobAnalysis.keywords.forEach(keyword => {
      const kw = keyword.toLowerCase().trim();
      if (kw && !allProfileText.includes(kw)) {
        keywordSuggestions.push(`Consider mentioning "${keyword}" in your CV if it reflects your actual experience.`);
      }
    });

    jobAnalysis.requiredTechnicalSkills.forEach(skill => {
      const sl = skill.toLowerCase().trim();
      if (sl && !allProfileText.includes(sl)) {
        keywordSuggestions.push(`The skill "${skill}" is required but not found in your CV. If you have this skill, add it to your Technical Skills section.`);
      }
    });

    if (profile.experience.length === 0 && profile.internships.length === 0) {
      contentSuggestions.push('No work experience or internships listed. For ATS systems, even academic projects, volunteer work, or freelance work count as experience.');
    }

    if (profile.skills.technicalSkills.length < 3) {
      contentSuggestions.push('Your Technical Skills section is sparse. Add more specific technical skills that match the job requirements to improve ATS ranking.');
    }

    profile.experience.forEach(exp => {
      if (exp.responsibilities.length < 2) {
        contentSuggestions.push(`Your role at ${exp.company} has few responsibilities listed. Add 3-5 measurable bullet points for better ATS results.`);
      }
    });

    profile.projects.forEach(proj => {
      if (proj.features.length < 2) {
        contentSuggestions.push(`Project "${proj.name}" could have more detail. List 2-4 key features to demonstrate specific skills.`);
      }
    });

    if (!profile.personalInfo.email) {
      structureSuggestions.push('Missing email address — ATS systems often filter applications without contact information.');
    }
    if (!profile.personalInfo.phone) {
      structureSuggestions.push('Missing phone number — some ATS systems require both email and phone.');
    }
    if (!profile.personalInfo.linkedin) {
      structureSuggestions.push('Missing LinkedIn profile — many recruiters use LinkedIn to verify candidates. Adding it can improve your profile.');
    }

    const hasSummary = profile.education.length > 0 || profile.experience.length > 0;
    if (!hasSummary && profile.education.length === 0 && profile.experience.length === 0 && profile.projects.length === 0) {
      structureSuggestions.push('Your CV has very little content. Add education, projects, or experience to create a complete professional profile for ATS parsing.');
    }

    const atsScore = Math.min(100, Math.max(0,
      100
      - (jobAnalysis.keywords.length > 0 ? Math.round((keywordSuggestions.length / Math.max(jobAnalysis.keywords.length, 1)) * 40) : 0)
      - (contentSuggestions.length * 10)
      - (structureSuggestions.length * 10)
    ));

    return {
      keywordSuggestions,
      structureSuggestions,
      contentSuggestions,
      atsScore
    };
  }

  generateApplicationLetter(
    profile: UserProfile, 
    company: string, 
    position: string, 
    jobRequirements: string[] = [],
    language: LanguageCode = 'en',
    tone: 'professional' | 'fresh-graduate' | 'modern' = 'professional'
  ): string {
    return this.generateHumanLetter({
      letterType: 'application',
      company,
      position,
      profile,
      jobRequirements,
      language,
      tone,
    });
  }

  generateCoverLetter(
    profile: UserProfile, 
    company: string, 
    position: string, 
    language: LanguageCode = 'en',
    tone: 'professional' | 'fresh-graduate' | 'modern' = 'professional'
  ): string {
    return this.generateHumanLetter({
      letterType: 'cover',
      company,
      position,
      profile,
      language,
      tone,
    });
  }

  generateHumanLetter(params: {
    letterType: 'application' | 'cover';
    company?: string;
    position?: string;
    applicantName?: string;
    email?: string;
    phone?: string;
    location?: string;
    recipient?: string;
    degree?: string;
    university?: string;
    skills?: string[];
    experienceSummary?: string;
    keyProjects?: string;
    profile?: UserProfile;
    jobRequirements?: string[];
    language?: LanguageCode;
    tone?: 'professional' | 'fresh-graduate' | 'modern';
  }): string {
    const {
      letterType,
      language = 'en',
      tone = 'professional',
    } = params;

    const p = params.profile;
    const name = (params.applicantName || p?.personalInfo.fullName || '').trim() || 'Applicant Name';
    const email = (params.email || p?.personalInfo.email || '').trim();
    const phone = (params.phone || p?.personalInfo.phone || '').trim();
    const loc = (params.location || p?.personalInfo.location || '').trim();

    const company = (params.company || '').trim() || 'Hiring Organization';
    const position = (params.position || '').trim() || 'Target Position';
    const recipient = (params.recipient || '').trim() || 'Hiring Manager';

    const latestEdu = p?.education?.[0];
    const degree = (params.degree || latestEdu?.degree || latestEdu?.department || '').trim();
    const university = (params.university || latestEdu?.university || '').trim();

    const skillsList = params.skills && params.skills.length > 0
      ? params.skills
      : p?.skills.technicalSkills && p.skills.technicalSkills.length > 0
        ? p.skills.technicalSkills
        : [];
    const skillsText = skillsList.length > 0 ? skillsList.slice(0, 5).join(', ') : '';

    const expSummary = (params.experienceSummary || (p?.experience?.[0] ? `${p.experience[0].position} at ${p.experience[0].company}` : '')).trim();
    const projects = (params.keyProjects || (p?.projects?.[0] ? p.projects[0].name : '')).trim();

    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const contactLineParts = [email, phone, loc].filter(Boolean);
    const contactHeader = contactLineParts.length > 0 ? contactLineParts.join(' | ') : '';

    // Afaan Oromo Letter
    if (language === 'om') {
      return `
${name}
${contactHeader}

Guyyaa: ${today}

Gara: Hooggansa Hojii / Qaxaraa
Dhaabbata: ${company}

Dhimmi: Iyyannoo Hojii Bakka "${position}" Tiif Dhiyaate

Kabajamoo Hooggantoota Qaxaraa,

Ani maqaan koo ${name} jedhama. Dhaabbata keessan ${company} keessatti bakka hojii "${position}" jedhuuf fedhii olaanaadhaan iyyannoo koo dhiyeessera.${degree ? ` Ani barnoota koo damee ${degree}${university ? ` yuunivarsiitii ${university} irraa` : ''} xumureera.` : ''}

${skillsText ? `Ogummaa koo ${skillsText} fayyadamuun bu'aa qabatamaa fi guddina dhaabbata keessaniitiif gumaachuuf qophiidha.` : 'Ogummaa fi dandeettii koo qabatamaan hojitti hiikuun galma dhaabbata keessaniitiif cimee hojjechuuf qophiidha.'} ${expSummary ? `Muuxannoo koo ${expSummary} keessatti hojiiwwan hedduu milkiin raawwadheera.` : ''}

Dhaabbata keessan ${company} keessatti carraa hojii kana argachuun naaf kabaja guddaadha. Waa'ee dandeettii koo marii bal'aa taasisuuf fedhii olaanaa qaba.

Galatoomaa,

Kabajaan,
${name}
      `.trim();
    }

    // Amharic Letter
    if (language === 'am') {
      return `
${name}
${contactHeader}

ቀን: ${today}

ለ: የቅጥር እና የሰው ሀብት ክፍል
ድርጅት: ${company}

ጉዳዩ፡ ለ"${position}" የሥራ መደብ የቀረበ የሥራ ማመልከቻ ደብዳቤ

የተከበራችሁ የድርጅቱ የሥራ መሪዎች፣

እኔ ${name} በድርጅታችሁ ${company} ውስጥ ክፍት በሆነው የ"${position}" የሥራ መደብ ላይ ለመቀጠር ያለኝን ከፍተኛ ፍላጎት በአክብሮት እገልጻለሁ።${degree ? ` በትምህርት ደረጃዬ በ${degree}${university ? ` ከ${university}` : ''} የተመረቅኩ ሲሆን፣` : ''} በዘርፉ በቂ ዕውቀትና ክህሎት አዳብሬያለሁ።

${skillsText ? `ባሉኝ የ${skillsText} ክህሎቶች በመታገዝ ለድርጅታችሁ ዕድገትና ስኬት የበኩሌን አስተዋጽዖ ለማበርከት ዝግጁ ነኝ።` : 'የቀሰምኳቸውን ዕውቀቶች በተግባር በማዋል ለድርጅታችሁ ግቦች መሳካት በሙሉ አቅሜ ለመሥራት ተነሳሽነት አለኝ።'} ${expSummary ? `በተለይም በ${expSummary} ውስጥ በነበረኝ የስራ ቆይታ ተግባራዊ ልምድ ቀስሜያለሁ።` : ''}

ለተሰጠኝ ትኩረት እያመሰገንኩ፣ በጉዳዩ ላይ ፊት ለፊት ተገናኝተን ለመወያየት ዝግጁ መሆኔን በትህትና እገልጻለሁ።

ከሰላምታ ጋር፣
${name}
      `.trim();
    }

    // Human English Letters
    if (letterType === 'cover') {
      if (tone === 'fresh-graduate') {
        return `
${name}
${contactHeader}

${today}

${recipient}
${company}

Dear ${recipient},

I was excited to come across the opening for the ${position} role at ${company}. As a proactive and dedicated graduate${degree ? ` with a degree in ${degree}` : ''}${university ? ` from ${university}` : ''}, I am eager to contribute my energy, foundational training, and technical curiosity to your team.

Throughout my studies and hands-on coursework, I have developed a strong aptitude for practical problem-solving${skillsText ? `, with demonstrable skills in ${skillsText}` : ''}.${projects ? ` In particular, working on projects such as ${projects} taught me how to take ownership of requirements, write dependable code, and adapt quickly to unfamiliar technologies.` : ''} I approach challenges with a steep learning curve and a genuine desire to deliver high-quality outcomes.

What distinguishes ${company} to me is your reputation for forward-thinking innovation and team excellence. I am looking for a collaborative environment where I can be challenged, contribute meaningfully, and grow alongside industry peers who value quality and accountability.

Thank you for your time and review of my qualifications. I have attached my curriculum vitae for your consideration and would welcome the opportunity to speak with you further about how I can support ${company}'s goals.

Warm regards,

${name}
        `.trim();
      }

      if (tone === 'modern') {
        return `
${name}
${contactHeader}

${today}

${recipient}
${company}

Dear ${recipient},

I am writing to submit my application for the ${position} position at ${company}. Having followed your organization's impressive work, I believe my background${degree ? ` in ${degree}` : ''}${skillsText ? ` and proficiency across ${skillsText}` : ''} make me an ideal fit for your current initiatives.

Here is what I bring to the ${position} role:
${skillsText ? `• Technical Strengths: Proficient in ${skillsText}, focusing on clean implementation and efficiency.` : '• Strong Fundamentals: Solid analytical approach and ability to rapidly master technical tools.'}
${expSummary ? `• Practical Experience: Applied competencies in ${expSummary}, collaborating to solve mission-critical tasks.` : projects ? `• Project Execution: Successfully developed ${projects}, translating requirements into workable solutions.` : '• Execution Mindset: Proactive team collaborator committed to reliability and continuous delivery.'}
• Adaptability & Drive: Quick to absorb complex workflows and dedicated to continuous improvement.

${company}'s culture of high standards resonates deeply with my personal work ethic. I look forward to the chance to connect and discuss how my skills and mindset can add immediate value to your department.

Sincerely,

${name}
        `.trim();
      }

      // Default Professional Cover Letter
      return `
${name}
${contactHeader}

${today}

${recipient}
${company}

Dear ${recipient},

I am writing to express my enthusiastic interest in the ${position} role at ${company}. With a background${degree ? ` in ${degree}` : ''}${university ? ` from ${university}` : ''} and proven hands-on capability in ${skillsText || 'contemporary industry methodologies'}, I am confident in my ability to deliver meaningful results for your team.

${expSummary ? `Through my experience with ${expSummary}, I have learned to deliver reliable solutions under tight deadlines while upholding high standards of quality.` : projects ? `In my practical project work—such as ${projects}—I have demonstrated an ability to analyze complex requirements and engineer dependable, user-focused outcomes.` : 'In my academic and project initiatives, I have consistently focused on translating conceptual knowledge into functional, high-value solutions.'} My core proficiencies include ${skillsText || 'analytical problem-solving, structured design, and collaborative execution'}, which align closely with the qualifications needed for this position.

I am particularly drawn to ${company} because of your recognized commitment to industry leadership and progressive standards. I take pride in being a dependable, solution-oriented professional who communicates clearly and thrives within collaborative environments.

Thank you for your time, consideration, and review of my application. I would welcome the privilege of an interview to discuss how my expertise and dedication will serve ${company}.

Sincerely,

${name}
      `.trim();
    }

    // Default Application Letter
    if (tone === 'fresh-graduate') {
      return `
${name}
${contactHeader}

${today}

${recipient}
${company}

Subject: Application for ${position} Position

Dear ${recipient},

Please accept this letter and the attached curriculum vitae as my formal application for the ${position} position at ${company}. Having recently graduated${degree ? ` with a ${degree}` : ''}${university ? ` from ${university}` : ''}, I am eager to apply my strong academic preparation and problem-solving drive to your esteemed organization.

During my academic tenure, I maintained a consistent focus on practical application and technical rigor.${skillsText ? ` My technical skill set encompasses ${skillsText}, which I have exercised through comprehensive coursework and dedicated lab projects.` : ''}${projects ? ` For instance, my work on ${projects} helped me cultivate a methodical approach to system design, debugging, and continuous improvement.` : ''} I pride myself on being an adaptable team member who absorbs new technologies rapidly and contributes positively to team morale.

${company} stands out as an organization where excellence, innovation, and integrity are prioritized. I would be thrilled to bring my passion, disciplined work ethic, and eagerness to contribute to your ongoing success in this role.

Thank you for considering my application. I look forward to the possibility of discussing my background in an interview at your earliest convenience.

Respectfully yours,

${name}
      `.trim();
    }

    if (tone === 'modern') {
      return `
${name}
${contactHeader}

${today}

${recipient}
${company}

Subject: Application for ${position}

Dear ${recipient},

I am writing to formally apply for the ${position} opportunity at ${company}. With demonstrable competencies in ${skillsText || 'my field'}${degree ? ` and an academic foundation in ${degree}` : ''}, I am eager to join your team and contribute immediately to your operational goals.

A quick summary of what I offer:
${skillsText ? `1. Core Competencies: Working knowledge of ${skillsText}, with an emphasis on accuracy and best practices.` : '1. Technical Proficiency: Strong aptitude for software fundamentals and modern workflows.'}
${expSummary ? `2. Applied Impact: Experience in ${expSummary}, delivering dependable results with attention to detail.` : projects ? `2. Project Experience: Proven ability to execute through ${projects}.` : '2. Execution Mindset: Thorough and dependable approach to problem resolution.'}
3. Work Ethic: Clear communication, professional curiosity, and a relentless focus on team objectives.

I admire ${company}'s standard of quality and would welcome the opportunity to speak with you regarding how my capabilities align with your requirements for the ${position} role.

Thank you for your time and consideration.

Best regards,

${name}
      `.trim();
    }

    // Default Professional Application Letter
    return `
${name}
${contactHeader}

${today}

${recipient}
${company}

Subject: Formal Application for the Position of ${position}

Dear ${recipient},

I am writing to submit my application for the ${position} vacancy currently available at ${company}. With a disciplined background${degree ? ` in ${degree}` : ''}${university ? ` from ${university}` : ''} and practical experience in ${skillsText || 'modern industry practices'}, I am excited by the opportunity to contribute effectively to your organization's mission.

${expSummary ? `My background includes hands-on experience with ${expSummary}, where I consistently met performance benchmarks and developed strong collaborative workflows.` : projects ? `Throughout my practical work on initiatives such as ${projects}, I have demonstrated a steadfast ability to translate requirements into well-structured, functional deliverables.` : 'My foundational training has emphasized analytical problem-solving, structured execution, and effective collaboration.'}${skillsText ? ` I have honed strong competencies in ${skillsText}, enabling me to adapt quickly to your team’s existing frameworks and standards.` : ''}

I am particularly attracted to ${company} due to your demonstrated excellence and reputation within the sector. I believe that my technical foundation, attention to detail, and positive professional attitude make me an asset who will integrate seamlessly into your workflow.

Thank you for your time and consideration of my application. I welcome the opportunity to discuss my qualifications with you in an interview and look forward to hearing from you soon.

Sincerely,

${name}
    `.trim();
  }

  improveContent(content: string, contentType: 'experience' | 'project' | 'achievement'): string {
    const actionVerbs: Record<string, string[]> = {
      experience: ['Developed', 'Implemented', 'Managed', 'Led', 'Created', 'Designed', 'Optimized', 'Streamlined', 'Coordinated', 'Facilitated'],
      project: ['Built', 'Designed', 'Developed', 'Implemented', 'Created', 'Engineered', 'Constructed', 'Established', 'Launched', 'Delivered'],
      achievement: ['Achieved', 'Attained', 'Earned', 'Received', 'Won', 'Secured', 'Accomplished', 'Surpassed', 'Exceeded', 'Outperformed']
    };
    
    const verbs = actionVerbs[contentType] || actionVerbs.experience;
    
    let improved = content;
    
    if (!improved.match(/^[A-Z]/)) {
      const randomVerb = verbs[Math.floor(Math.random() * verbs.length)];
      improved = `${randomVerb} ${improved.charAt(0).toLowerCase()}${improved.slice(1)}`;
    }
    
    return improved;
  }

  private calculateTotalExperience(experience: { startDate: string; endDate?: string; isCurrent: boolean }[]): number {
    let totalMonths = 0;
    
    experience.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.isCurrent ? new Date() : new Date(exp.endDate || exp.startDate);
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    });
    
    return Math.round(totalMonths / 12);
  }

  private generateRecommendations(profile: UserProfile, missingRequirements: string[]): string[] {
    const recommendations: string[] = [];
    
    missingRequirements.forEach(req => {
      const lowerReq = req.toLowerCase();
      
      if (lowerReq.includes('experience')) {
        recommendations.push('Consider taking on freelance projects or internships to gain relevant experience');
      }
      if (lowerReq.includes('certification')) {
        recommendations.push('Pursue relevant certifications to strengthen your qualifications');
      }
      if (lowerReq.includes('skill')) {
        recommendations.push(`Consider learning ${req.replace('experience with', '').trim()} to meet this requirement`);
      }
    });
    
    if (profile.projects.length < 2) {
      recommendations.push('Work on more personal projects to demonstrate your skills');
    }
    
    if (profile.certifications.length === 0) {
      recommendations.push('Consider obtaining relevant certifications to enhance your profile');
    }
    
    return recommendations;
  }

  private getCompanyStrength(): string {
    const strengths = [
      'innovation and excellence',
      'commitment to quality',
      'industry leadership',
      'creative solutions',
      'professional development',
      'team collaboration',
      'cutting-edge technology'
    ];
    
    return strengths[Math.floor(Math.random() * strengths.length)];
  }

  async analyzeTemplate(_imageBase64: string, _language: LanguageCode = 'en'): Promise<TemplateAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const analyses: TemplateAnalysis[] = [
      {
        templateName: 'Modern Professional',
        description:
          'A clean, modern CV template with a dark navy sidebar for skills and contact details, and a white main column for experience and education. Includes a circular profile photo at the top of the sidebar.',
        layout: {
          type: 'sidebar-left',
          orderedSections: ['personal', 'skills', 'education', 'experience', 'projects', 'references'],
          sidebarSections: ['skills'],
          photo: { included: true, position: 'sidebar', shape: 'circle', size: 'medium' },
        },
        style: {
          primaryColor: '#1e40af',
          secondaryColor: '#1e293b',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          accentColor: '#0ea5e9',
          fontFamily: 'Inter, sans-serif',
          headerStyle: 'left-aligned',
          sectionDivider: 'line',
        },
        sections: [
          { id: 'personal', name: 'Personal Information', description: 'Contact details and profile photo', repeatable: false },
          { id: 'skills', name: 'Skills', description: 'Technical and soft skills', repeatable: false },
          { id: 'education', name: 'Education', description: 'Academic qualifications', repeatable: true, maxEntries: 3 },
          { id: 'experience', name: 'Work Experience', description: 'Professional experience', repeatable: true, maxEntries: 5 },
          { id: 'projects', name: 'Projects', description: 'Notable projects', repeatable: true, maxEntries: 4 },
          { id: 'references', name: 'References', description: 'Professional references', repeatable: true, maxEntries: 3 },
        ],
        fields: [
          { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., John Smith', section: 'personal' },
          { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'e.g., john@email.com', section: 'personal' },
          { id: 'phone', label: 'Phone', type: 'phone', required: true, placeholder: 'e.g., +251 900 000 000', section: 'personal' },
          { id: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g., Addis Ababa', section: 'personal' },
          { id: 'technicalSkills', label: 'Technical Skills', type: 'textarea', required: true, placeholder: 'e.g., JavaScript, Python, React (one per line)', section: 'skills' },
          { id: 'softSkills', label: 'Soft Skills', type: 'textarea', required: false, placeholder: 'e.g., Communication, Teamwork (one per line)', section: 'skills' },
          { id: 'university', label: 'University', type: 'text', required: true, placeholder: 'e.g., Addis Ababa University', section: 'education' },
          { id: 'degree', label: 'Degree', type: 'text', required: true, placeholder: 'e.g., BSc in Software Engineering', section: 'education' },
          { id: 'eduYear', label: 'Year', type: 'text', required: true, placeholder: 'e.g., 2020 - 2024', section: 'education' },
          { id: 'company', label: 'Company', type: 'text', required: true, placeholder: 'e.g., ABC Technology', section: 'experience' },
          { id: 'position', label: 'Position', type: 'text', required: true, placeholder: 'e.g., Software Developer', section: 'experience' },
          { id: 'expDuration', label: 'Duration', type: 'text', required: true, placeholder: 'e.g., Jan 2024 - Present', section: 'experience' },
          { id: 'expDescription', label: 'Description', type: 'textarea', required: false, placeholder: 'Key responsibilities and achievements (one per line)', section: 'experience' },
          { id: 'projectName', label: 'Project Name', type: 'text', required: true, placeholder: 'e.g., E-Commerce Platform', section: 'projects' },
          { id: 'projectDesc', label: 'Description', type: 'textarea', required: false, placeholder: 'Brief description and technologies used', section: 'projects' },
          { id: 'refName', label: 'Reference Name', type: 'text', required: true, placeholder: 'e.g., Dr. Ahmed Hassan', section: 'references' },
          { id: 'refPosition', label: 'Position & Organization', type: 'text', required: true, placeholder: 'e.g., Professor at AAU', section: 'references' },
          { id: 'refContact', label: 'Contact (Email/Phone)', type: 'text', required: false, placeholder: 'e.g., ahmed@edu.com', section: 'references' },
        ],
        confidence: 0.92,
      },
      {
        templateName: 'Classic Executive',
        description:
          'A traditional, formal CV template with a centered header, full-width sections, and minimal styling. Common in government and academic roles. Section titles use small-caps letters with thin rules.',
        layout: {
          type: 'single-column',
          orderedSections: ['personal', 'summary', 'education', 'experience', 'certifications', 'references'],
          photo: { included: false, position: 'top-center', shape: 'square', size: 'small' },
        },
        style: {
          primaryColor: '#0f172a',
          secondaryColor: '#e2e8f0',
          backgroundColor: '#ffffff',
          textColor: '#111827',
          accentColor: '#7f1d1d',
          fontFamily: 'Georgia, serif',
          headerStyle: 'centered',
          sectionDivider: 'line',
        },
        sections: [
          { id: 'personal', name: 'Contact Information', description: 'Full name and contact details', repeatable: false },
          { id: 'summary', name: 'Professional Summary', description: 'Career objective or summary', repeatable: false },
          { id: 'education', name: 'Education', description: 'Academic background', repeatable: true, maxEntries: 3 },
          { id: 'experience', name: 'Professional Experience', description: 'Work history', repeatable: true, maxEntries: 6 },
          { id: 'certifications', name: 'Certifications', description: 'Professional certifications', repeatable: true, maxEntries: 5 },
          { id: 'references', name: 'References', description: 'Available upon request', repeatable: false },
        ],
        fields: [
          { id: 'fullName', label: 'Full Name', type: 'text', required: true, placeholder: 'e.g., John Smith', section: 'personal' },
          { id: 'email', label: 'Email', type: 'email', required: true, placeholder: 'e.g., john@email.com', section: 'personal' },
          { id: 'phone', label: 'Phone', type: 'phone', required: true, placeholder: 'e.g., +251 900 000 000', section: 'personal' },
          { id: 'location', label: 'Location', type: 'text', required: true, placeholder: 'e.g., Addis Ababa', section: 'personal' },
          { id: 'summary', label: 'Professional Summary', type: 'textarea', required: true, placeholder: 'Brief career summary (2-3 sentences)', section: 'summary' },
          { id: 'university', label: 'University', type: 'text', required: true, placeholder: 'e.g., Addis Ababa University', section: 'education' },
          { id: 'degree', label: 'Degree & Major', type: 'text', required: true, placeholder: 'e.g., BSc Computer Science', section: 'education' },
          { id: 'eduYear', label: 'Graduation Year', type: 'text', required: true, placeholder: 'e.g., 2024', section: 'education' },
          { id: 'company', label: 'Company', type: 'text', required: true, placeholder: 'e.g., Ministry of Innovation', section: 'experience' },
          { id: 'position', label: 'Position', type: 'text', required: true, placeholder: 'e.g., IT Officer', section: 'experience' },
          { id: 'expDuration', label: 'Duration', type: 'text', required: true, placeholder: 'e.g., 2024 - Present', section: 'experience' },
          { id: 'expDuties', label: 'Key Duties', type: 'textarea', required: false, placeholder: 'Main duties and accomplishments (one per line)', section: 'experience' },
          { id: 'certName', label: 'Certification Name', type: 'text', required: true, placeholder: 'e.g., AWS Cloud Practitioner', section: 'certifications' },
          { id: 'certOrg', label: 'Issuing Organization', type: 'text', required: false, placeholder: 'e.g., Amazon Web Services', section: 'certifications' },
          { id: 'refNote', label: 'References Note', type: 'text', required: false, placeholder: 'e.g., Available upon request', section: 'references' },
        ],
        confidence: 0.88,
      },
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  generateFromTemplate(
    analysis: TemplateAnalysis,
    singletonValues: Record<string, string>,
    entries: Record<string, Array<Record<string, string>>>,
    hasPhoto: boolean,
    _language: LanguageCode = 'en',
  ): string {
    const lines: string[] = [];
    const { layout, sections } = analysis;

    const resolveValue = (sectionId: string, fieldId: string, entry?: Record<string, string>): string =>
      entry ? entry[fieldId] || '' : singletonValues[fieldId] || '';

    const collectTextarea = (sectionId: string, fieldId: string, entry?: Record<string, string>): string[] =>
      (entry ? entry[fieldId] || '' : singletonValues[fieldId] || '')
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    layout.orderedSections.forEach((sectionId) => {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const personalIds = new Set(['personal', 'contact']);
      if (personalIds.has(section.id)) {
        const name = resolveValue(section.id, 'fullName');
        const contactParts = [
          resolveValue(section.id, 'email'),
          resolveValue(section.id, 'phone'),
          resolveValue(section.id, 'location'),
          resolveValue(section.id, 'refContract'),
        ].filter(Boolean);
        if (name) lines.push(`[${hasPhoto ? 'PHOTO] ' : ''}${name}`);
        if (contactParts.length > 0) lines.push(contactParts.join(' | '));
        const summary = resolveValue(section.id, 'summary');
        if (summary) {
          lines.push('');
          lines.push(summary);
        }
        lines.push('');
        return;
      }

      const sectionItems: string[] = [];
      const collectItem = (values?: Record<string, string>) => {
        const itemLines: string[] = [];
        analysis.fields
          .filter((f) => f.section === section.id)
          .forEach((field) => {
            const value = resolveValue(section.id, field.id, values);
            if (!value.trim()) return;
            if (field.type === 'textarea') {
              collectTextarea(section.id, field.id, values).forEach((l) =>
                itemLines.push(`  • ${l}`),
              );
            } else {
              itemLines.push(`  • ${value}`);
            }
          });
        if (itemLines.length > 0) sectionItems.push(itemLines.join('\n'));
      };

      if (section.repeatable) {
        (entries[section.id] || []).forEach((entry) => collectItem(entry));
      } else {
        collectItem(undefined);
      }

      if (sectionItems.length === 0) return;

      lines.push(section.name.toUpperCase());
      lines.push('—'.repeat(40));
      sectionItems.forEach((item) => {
        lines.push(item);
      });
      lines.push('');
    });

    return lines.join('\n').trim();
  }
}

export const aiService = AIService.getInstance();

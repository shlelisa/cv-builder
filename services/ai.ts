import { UserProfile, JobDescription, JobMatchResult, JobAnalysis, LanguageCode } from '@/types';

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
    
    requirements.forEach(req => {
      const lowerReq = req.toLowerCase();
      
      if (lowerReq.includes('degree') || lowerReq.includes('bachelor') || lowerReq.includes('master')) {
        requiredEducation.push(req);
      } else if (lowerReq.includes('experience') || lowerReq.includes('years')) {
        requiredExperience.push(req);
      } else if (lowerReq.includes('skill') || lowerReq.includes('proficient') || lowerReq.includes('knowledge')) {
        if (lowerReq.includes('preferred') || lowerReq.includes('plus') || lowerReq.includes('advantage')) {
          preferredTechnicalSkills.push(req);
        } else {
          requiredTechnicalSkills.push(req);
        }
      } else if (lowerReq.includes('communication') || lowerReq.includes('teamwork') || lowerReq.includes('leadership')) {
        softSkills.push(req);
      } else {
        keywords.push(req);
      }
    });
    
    return {
      requiredEducation,
      requiredTechnicalSkills,
      preferredTechnicalSkills,
      requiredExperience,
      softSkills,
      keywords
    };
  }

  matchJobRequirements(profile: UserProfile, jobDescription: JobDescription): JobMatchResult {
    const jobAnalysis = this.analyzeJobDescription(jobDescription);
    const profileSkills = [
      ...profile.skills.technicalSkills,
      ...profile.skills.programmingLanguages,
      ...profile.skills.frameworks,
      ...profile.skills.databases
    ];
    
    const matchedTechnicalSkills = jobAnalysis.requiredTechnicalSkills.filter(skill => 
      profileSkills.some(profileSkill => 
        profileSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(profileSkill.toLowerCase())
      )
    );
    
    const matchedEducation = jobAnalysis.requiredEducation.filter(edu => 
      profile.education.some(profileEdu => 
        profileEdu.degree.toLowerCase().includes(edu.toLowerCase()) ||
        edu.toLowerCase().includes(profileEdu.degree.toLowerCase())
      )
    );
    
    const matchedExperience = jobAnalysis.requiredExperience.filter(exp => 
      profile.experience.some(profileExp => 
        profileExp.position.toLowerCase().includes(exp.toLowerCase()) ||
        exp.toLowerCase().includes(profileExp.position.toLowerCase())
      )
    );
    
    const totalRequirements = jobAnalysis.requiredTechnicalSkills.length + 
                            jobAnalysis.requiredEducation.length + 
                            jobAnalysis.requiredExperience.length;
    
    const matchedTotal = matchedTechnicalSkills.length + 
                        matchedEducation.length + 
                        matchedExperience.length;
    
    const matchScore = totalRequirements > 0 ? Math.round((matchedTotal / totalRequirements) * 100) : 0;
    
    const missingRequirements = [
      ...jobAnalysis.requiredTechnicalSkills.filter(skill => !matchedTechnicalSkills.includes(skill)),
      ...jobAnalysis.requiredEducation.filter(edu => !matchedEducation.includes(edu)),
      ...jobAnalysis.requiredExperience.filter(exp => !matchedExperience.includes(exp))
    ];
    
    const recommendations = this.generateRecommendations(profile, missingRequirements);
    
    return {
      matchScore,
      matchedQualifications: matchedEducation,
      matchedTechnicalSkills,
      matchedExperience,
      matchedEducation,
      missingRequirements,
      recommendations
    };
  }

  generateApplicationLetter(
    profile: UserProfile, 
    company: string, 
    position: string, 
    _jobRequirements: string[],
    _language: LanguageCode = 'en'
  ): string {
    const { personalInfo, education, skills, internships, projects } = profile;
    
    const latestEducation = education[0];
    const mainSkills = skills.technicalSkills.slice(0, 4).join(', ');
    
    const letter = `
${personalInfo.fullName}
${personalInfo.email} | ${personalInfo.phone}
${personalInfo.location}
${personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : ''}
${personalInfo.github ? `GitHub: ${personalInfo.github}` : ''}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Hiring Manager
${company}

Subject: Application for the Position of ${position}

Dear Hiring Manager,

I am writing to express my strong interest in the ${position} position at ${company}. As a recent ${latestEducation?.department || 'graduate'} graduate from ${latestEducation?.university || 'university'}, I am excited about the opportunity to contribute to your team.

${latestEducation ? `My academic background includes a ${latestEducation.degree}${latestEducation.cgpa ? ` with a CGPA of ${latestEducation.cgpa}` : ''}, which has provided me with a solid foundation in ${latestEducation.department}.` : ''}

${internships.length > 0 ? `During my internship at ${internships[0].organization}, I gained practical experience in ${internships[0].responsibilities.slice(0, 2).join(' and ')}.` : ''}

${projects.length > 0 ? `I have successfully completed ${projects.length} project${projects.length > 1 ? 's' : ''}, including ${projects[0].name}, which demonstrates my ability to ${projects[0].description.substring(0, 100)}.` : ''}

My technical skills include ${mainSkills}, which align well with the requirements of this position. I am particularly drawn to this opportunity because of ${company}'s reputation for ${this.getCompanyStrength()}.

I am confident that my combination of academic knowledge, practical experience, and technical skills makes me a strong candidate for this position. I would welcome the opportunity to discuss how I can contribute to your team.

Thank you for considering my application. I look forward to hearing from you.

Sincerely,
${personalInfo.fullName}
    `.trim();
    
    return letter;
  }

  generateCoverLetter(
    profile: UserProfile, 
    company: string, 
    position: string, 
    _language: LanguageCode = 'en'
  ): string {
    const { personalInfo, education, skills, experience, internships } = profile;
    
    const latestEducation = education[0];
    const mainSkills = skills.technicalSkills.slice(0, 3).join(', ');
    
    const letter = `
${personalInfo.fullName}
${personalInfo.email} | ${personalInfo.phone}
${personalInfo.location}

${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Dear Hiring Manager,

I am excited to apply for the ${position} position at ${company}. As a recent graduate with a passion for ${latestEducation?.department || 'this field'}, I am eager to bring my skills and enthusiasm to your team.

${latestEducation ? `My education in ${latestEducation.department} from ${latestEducation.university} has equipped me with the knowledge and skills necessary to excel in this role.` : ''}

${experience.length > 0 ? `My professional experience as ${experience[0].position} has taught me valuable skills in ${experience[0].technologiesUsed.slice(0, 2).join(' and ')}.` : ''}

${internships.length > 0 ? `Through my internship at ${internships[0].organization}, I developed practical skills in ${internships[0].skillsGained.slice(0, 2).join(' and ')}.` : ''}

I am particularly drawn to this position because it aligns perfectly with my career goals and allows me to utilize my skills in ${mainSkills}. I am confident that my dedication and ability to learn quickly will make me a valuable asset to your team.

Thank you for considering my application. I would welcome the opportunity to discuss how I can contribute to ${company}'s success.

Sincerely,
${personalInfo.fullName}
    `.trim();
    
    return letter;
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
}

export const aiService = AIService.getInstance();

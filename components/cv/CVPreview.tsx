'use client';

import { UserProfile } from '@/types';
import { useState } from 'react';

interface CVPreviewProps {
  profile: UserProfile;
  enhancedSummary?: string;
}

const CVPreview: React.FC<CVPreviewProps> = ({ profile, enhancedSummary }) => {
  const [zoom, setZoom] = useState(1);
  const { personalInfo, education, experience, internships, projects, skills } = profile;

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const generateSummary = () => {
    if (enhancedSummary) return enhancedSummary;

    const latestEducation = education[0];
    if (!latestEducation) return '';

    const gpa = latestEducation.cgpa ? ` with a CGPA of ${latestEducation.cgpa}` : '';
    const mainSkills = skills.technicalSkills.slice(0, 3).join(', ');
    const experienceCount = experience.length;
    const internshipCount = internships.length;

    let summary = `Recent ${latestEducation.department || 'graduate'}${gpa} from ${latestEducation.university || ''}.`;

    if (mainSkills) {
      summary += ` Skilled in ${mainSkills}.`;
    }

    if (internshipCount > 0) {
      summary += ` Completed ${internshipCount} internship${internshipCount > 1 ? 's' : ''}.`;
    }

    if (experienceCount > 0) {
      summary += ` ${experienceCount} year${experienceCount > 1 ? 's' : ''} of professional experience.`;
    }

    return summary;
  };

  const renderLanguages = () => {
    return skills.languages
      .filter((l) => l.proficiency)
      .map((l) => `${l.name} (${l.proficiency.charAt(0).toUpperCase() + l.proficiency.slice(1)})`)
      .join(', ');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2">
        <span className="text-sm font-medium text-gray-700">A4 Page Preview</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          >
            -
          </button>
          <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="px-2 py-1 bg-white border rounded hover:bg-gray-50 text-sm"
          >
            +
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 mx-auto"
        style={{
          width: `${794 * zoom}px`,
          minHeight: `${1123 * zoom}px`,
          maxWidth: '100%',
          overflow: 'hidden',
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
        }}
      >
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: '794px' }}>
          <div className="cv-page bg-white text-black p-8" style={{ width: '794px', minHeight: '1123px' }}>
            <header className="text-center mb-6">
              <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">
                {personalInfo.fullName || 'Your Name'}
              </h1>
              <div className="text-sm space-y-1">
                {personalInfo.location && <p>{personalInfo.location}</p>}
                <p>
                  {[personalInfo.email, personalInfo.phone].filter(Boolean).join('  |  ')}
                </p>
                <p>
                  {[
                    personalInfo.linkedin ? `LinkedIn: ${personalInfo.linkedin}` : '',
                    personalInfo.github ? `GitHub: ${personalInfo.github}` : '',
                    personalInfo.portfolio ? `Portfolio: ${personalInfo.portfolio}` : '',
                  ]
                    .filter(Boolean)
                    .join('  |  ')}
                </p>
              </div>
            </header>

            {generateSummary() && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Professional Summary
                </h2>
                <p className="text-sm leading-relaxed">{generateSummary()}</p>
              </section>
            )}

            {education.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Education
                </h2>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{edu.degree}</h3>
                          <p className="text-sm">{edu.university}</p>
                          {edu.department && (
                            <p className="text-sm text-gray-700">{edu.department}</p>
                          )}
                        </div>
                        <div className="text-sm text-right">
                          <p>
                            {edu.startYear} - {edu.graduationYear}
                          </p>
                          {edu.cgpa && <p className="font-medium">CGPA: {edu.cgpa}</p>}
                        </div>
                      </div>
                      {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Relevant Courses:</span>{' '}
                          {edu.relevantCourses.join(', ')}
                        </p>
                      )}
                      {edu.academicAchievements && edu.academicAchievements.length > 0 && (
                        <ul className="text-sm list-disc list-inside mt-1">
                          {edu.academicAchievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {experience.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{exp.position}</h3>
                          <p className="text-sm">{exp.company}</p>
                        </div>
                        <div className="text-sm text-right">
                          <p>
                            {formatDate(exp.startDate)} -{' '}
                            {exp.isCurrent ? 'Present' : formatDate(exp.endDate || '')}
                          </p>
                          <p className="capitalize">{exp.employmentType}</p>
                        </div>
                      </div>
                      {exp.responsibilities.length > 0 && (
                        <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                          {exp.responsibilities.map((responsibility, i) => (
                            <li key={i}>{responsibility}</li>
                          ))}
                        </ul>
                      )}
                      {exp.achievements.length > 0 && (
                        <div className="mt-1">
                          <span className="text-sm font-medium">Achievements: </span>
                          <ul className="text-sm list-disc list-inside mt-1">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {internships.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Internship
                </h2>
                <div className="space-y-4">
                  {internships.map((intern) => (
                    <div key={intern.id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{intern.position}</h3>
                          <p className="text-sm">{intern.organization}</p>
                        </div>
                        <p className="text-sm">{intern.duration}</p>
                      </div>
                      {intern.responsibilities.length > 0 && (
                        <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                          {intern.responsibilities.map((responsibility, i) => (
                            <li key={i}>{responsibility}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {projects.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Projects
                </h2>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id}>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        {project.technologies.length > 0 && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {project.technologies.join(', ')}
                          </span>
                        )}
                      </div>
                      {project.role && <p className="text-sm text-gray-700">{project.role}</p>}
                      {project.description && (
                        <p className="text-sm mt-1">{project.description}</p>
                      )}
                      {project.features.length > 0 && (
                        <ul className="text-sm list-disc list-inside mt-2">
                          {project.features.map((feature, i) => (
                            <li key={i}>{feature}</li>
                          ))}
                        </ul>
                      )}
                      {project.resultsImpact && (
                        <p className="text-sm text-gray-700 mt-1">
                          <span className="font-medium">Impact:</span> {project.resultsImpact}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {(skills.technicalSkills.length > 0 ||
              skills.programmingLanguages.length > 0 ||
              skills.frameworks.length > 0 ||
              skills.databases.length > 0 ||
              skills.softSkills.length > 0) && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Skills
                </h2>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {skills.technicalSkills.length > 0 && (
                    <div>
                      <span className="font-medium">Technical:</span>{' '}
                      {skills.technicalSkills.join(', ')}
                    </div>
                  )}
                  {skills.programmingLanguages.length > 0 && (
                    <div>
                      <span className="font-medium">Languages:</span>{' '}
                      {skills.programmingLanguages.join(', ')}
                    </div>
                  )}
                  {skills.frameworks.length > 0 && (
                    <div>
                      <span className="font-medium">Frameworks:</span> {skills.frameworks.join(', ')}
                    </div>
                  )}
                  {skills.databases.length > 0 && (
                    <div>
                      <span className="font-medium">Databases:</span> {skills.databases.join(', ')}
                    </div>
                  )}
                  {skills.softSkills.length > 0 && (
                    <div>
                      <span className="font-medium">Soft Skills:</span> {skills.softSkills.join(', ')}
                    </div>
                  )}
                </div>
              </section>
            )}

            {renderLanguages() && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Languages
                </h2>
                <p className="text-sm">{renderLanguages()}</p>
              </section>
            )}

            {profile.certifications.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Certifications
                </h2>
                <div className="space-y-2">
                  {profile.certifications.map((cert) => (
                    <div key={cert.id}>
                      <h3 className="font-semibold text-sm">{cert.name}</h3>
                      <p className="text-sm">
                        {cert.issuingOrganization}
                        {cert.date ? ` | ${formatDate(cert.date)}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {profile.training.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Training
                </h2>
                <div className="space-y-2">
                  {profile.training.map((training) => (
                    <div key={training.id}>
                      <h3 className="font-semibold text-sm">{training.name}</h3>
                      <p className="text-sm">
                        {training.institution}
                        {training.duration ? ` | ${training.duration}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {profile.achievements.length > 0 && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  Achievements
                </h2>
                <ul className="text-sm list-disc list-inside space-y-1">
                  {profile.achievements.map((achievement) => (
                    <li key={achievement.id}>
                      {achievement.title}
                      {achievement.description && ` - ${achievement.description}`}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {profile.references.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold border-b-2 border-black pb-1 mb-3 uppercase">
                  References
                </h2>
                <div className="space-y-2">
                  {profile.references.map((reference) => (
                    <div key={reference.id} className="text-sm">
                      <h3 className="font-semibold">{reference.name}</h3>
                      <p>{reference.position} - {reference.organization}</p>
                      <p>
                        {[reference.email, reference.phone].filter(Boolean).join(' | ')}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVPreview;

'use client';

import { useState } from 'react';
import { Input, Button, TextArea } from '@/components/ui';
import { useApp } from '@/lib/AppContext';
import {
  UserProfile,
  Certification,
  Training,
  Volunteering,
  Achievement,
  Reference,
} from '@/types';
import { validateAdditional, fieldError } from '@/lib/validation';
import { useTouched } from '@/lib/useTouched';

interface AdditionalInfoFormProps {
  profile: UserProfile;
  onChange: (data: Partial<UserProfile>) => void;
}

const AdditionalInfoForm: React.FC<AdditionalInfoFormProps> = ({ profile, onChange }) => {
  const { t } = useApp();
  const { touched, markTouched } = useTouched();
  const errors = validateAdditional(profile);
  const showError = (field: string) => fieldError(t, errors, touched, field);
  const [activeTab, setActiveTab] = useState<
    'certifications' | 'training' | 'volunteering' | 'achievements' | 'references'
  >('certifications');

  const tabs = [
    { id: 'certifications' as const, label: t.form.certifications },
    { id: 'training' as const, label: t.form.training },
    { id: 'volunteering' as const, label: t.form.volunteering },
    { id: 'achievements' as const, label: t.form.achievements },
    { id: 'references' as const, label: t.form.references },
  ];

  const handleAddCertification = () => {
    const newCert: Certification = {
      id: `cert-${Date.now()}`,
      name: '',
      issuingOrganization: '',
      date: '',
    };
    onChange({ certifications: [...profile.certifications, newCert] });
  };

  const handleRemoveCertification = (id: string) => {
    onChange({ certifications: profile.certifications.filter((c) => c.id !== id) });
  };

  const handleUpdateCertification = (id: string, updates: Partial<Certification>) => {
    onChange({
      certifications: profile.certifications.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  };

  const handleAddTraining = () => {
    const newTraining: Training = {
      id: `train-${Date.now()}`,
      name: '',
      institution: '',
      duration: '',
      skillsLearned: [],
    };
    onChange({ training: [...profile.training, newTraining] });
  };

  const handleUpdateTraining = (id: string, updates: Partial<Training>) => {
    onChange({
      training: profile.training.map((tr) => (tr.id === id ? { ...tr, ...updates } : tr)),
    });
  };

  const handleRemoveTraining = (id: string) => {
    onChange({ training: profile.training.filter((tr) => tr.id !== id) });
  };

  const handleAddVolunteering = () => {
    const newVolunteer: Volunteering = {
      id: `vol-${Date.now()}`,
      organization: '',
      position: '',
      responsibilities: [],
      achievements: [],
    };
    onChange({ volunteering: [...profile.volunteering, newVolunteer] });
  };

  const handleAddAchievement = () => {
    const newAchievement: Achievement = {
      id: `ach-${Date.now()}`,
      title: '',
      category: 'academic',
      description: '',
      date: '',
    };
    onChange({ achievements: [...profile.achievements, newAchievement] });
  };

  const handleAddReference = () => {
    const newReference: Reference = {
      id: `ref-${Date.now()}`,
      name: '',
      position: '',
      organization: '',
      email: '',
      phone: '',
    };
    onChange({ references: [...profile.references, newReference] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">{t.form.additionalTitle}</h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {t.form.additionalSubtitle}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-zinc-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 rounded-md text-sm font-medium ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'certifications' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={handleAddCertification} variant="outline" size="sm">
              + {t.common.add}
            </Button>
          </div>
          {profile.certifications.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">
              No certifications added yet.
            </p>
          )}
          {profile.certifications.map((cert, index) => (
            <div key={cert.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleRemoveCertification(cert.id)}
                >
                  {t.common.remove}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Certification Name"
                  placeholder="e.g., AWS Certified Cloud Practitioner"
                  value={cert.name}
                  onChange={(e) => {
                    markTouched(`cert-${index}.name`);
                    handleUpdateCertification(cert.id, { name: e.target.value });
                  }}
                  error={showError(`cert-${index}.name`)}
                />
                <Input
                  label="Issuing Organization"
                  placeholder="e.g., Amazon Web Services"
                  value={cert.issuingOrganization}
                  onChange={(e) =>
                    handleUpdateCertification(cert.id, { issuingOrganization: e.target.value })
                  }
                />
                <Input
                  label="Date"
                  type="month"
                  value={cert.date}
                  onChange={(e) => handleUpdateCertification(cert.id, { date: e.target.value })}
                />
                <Input
                  label="Credential URL"
                  placeholder="e.g., https://credential.example"
                  value={cert.credentialUrl || ''}
                  onChange={(e) =>
                    handleUpdateCertification(cert.id, { credentialUrl: e.target.value })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'training' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={handleAddTraining} variant="outline" size="sm">
              + {t.common.add}
            </Button>
          </div>
          {profile.training.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No training added yet.</p>
          )}
          {profile.training.map((training, index) => (
            <div key={training.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-zinc-800/50">
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={() => handleRemoveTraining(training.id)}
                >
                  {t.common.remove}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Training Name"
                  placeholder="e.g., Full Stack Web Development"
                  value={training.name}
                  onChange={(e) => {
                    markTouched(`train-${index}.name`);
                    handleUpdateTraining(training.id, { name: e.target.value });
                  }}
                  error={showError(`train-${index}.name`)}
                />
                <Input
                  label="Institution"
                  placeholder="e.g., Alem Training Center"
                  value={training.institution}
                  onChange={(e) =>
                    handleUpdateTraining(training.id, { institution: e.target.value })
                  }
                />
                <Input
                  label="Duration"
                  placeholder="e.g., 6 months"
                  value={training.duration}
                  onChange={(e) => handleUpdateTraining(training.id, { duration: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                  Skills Learned (comma separated)
                </label>
                <Input
                  placeholder="e.g., React, Node.js, Express"
                  value={training.skillsLearned.join(', ')}
                  onChange={(e) =>
                    handleUpdateTraining(training.id, {
                      skillsLearned: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'volunteering' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={handleAddVolunteering} variant="outline" size="sm">
              + {t.common.add}
            </Button>
          </div>
          {profile.volunteering.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No volunteering added yet.</p>
          )}
          {profile.volunteering.map((vol, index) => (
            <div key={`${vol.organization}-${index}`} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-zinc-800/50">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Organization"
                  placeholder="e.g., Red Cross"
                  onChange={(e) => {
                    markTouched(`vol-${index}.organization`);
                    onChange({
                      volunteering: profile.volunteering.map((v, i) =>
                        i === index ? { ...v, organization: e.target.value } : v
                      ),
                    });
                  }}
                  error={showError(`vol-${index}.organization`)}
                />
                <Input
                  label="Position"
                  placeholder="e.g., Volunteer Coordinator"
                  onChange={(e) =>
                    onChange({
                      volunteering: profile.volunteering.map((v, i) =>
                        i === index ? { ...v, position: e.target.value } : v
                      ),
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={handleAddAchievement} variant="outline" size="sm">
              + {t.common.add}
            </Button>
          </div>
          {profile.achievements.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No achievements added yet.</p>
          )}
          {profile.achievements.map((achievement, index) => (
            <div key={achievement.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-zinc-800/50">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Title"
                  placeholder="e.g., Dean's List Honors"
                  value={achievement.title}
                  onChange={(e) => {
                    markTouched(`ach-${index}.title`);
                    onChange({
                      achievements: profile.achievements.map((a) =>
                        a.id === achievement.id ? { ...a, title: e.target.value } : a
                      ),
                    });
                  }}
                  error={showError(`ach-${index}.title`)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                    value={achievement.category}
                    onChange={(e) =>
                      onChange({
                        achievements: profile.achievements.map((a) =>
                          a.id === achievement.id
                            ? { ...a, category: e.target.value as Achievement['category'] }
                            : a
                        ),
                      })
                    }
                  >
                    <option value="award">Award</option>
                    <option value="competition">Competition</option>
                    <option value="scholarship">Scholarship</option>
                    <option value="leadership">Leadership</option>
                    <option value="academic">Academic</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>
              <TextArea
                label="Description"
                rows={2}
                placeholder="Describe the achievement"
                value={achievement.description}
                onChange={(e) =>
                  onChange({
                    achievements: profile.achievements.map((a) =>
                      a.id === achievement.id ? { ...a, description: e.target.value } : a
                    ),
                  })
                }
              />
            </div>
          ))}
        </div>
      )}

      {activeTab === 'references' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button type="button" onClick={handleAddReference} variant="outline" size="sm">
              + {t.common.add}
            </Button>
          </div>
          {profile.references.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-zinc-500 text-center py-4">No references added yet.</p>
          )}
          {profile.references.map((reference, index) => (
            <div key={reference.id} className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-zinc-800/50">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  label="Name"
                  placeholder="e.g., Dr. John Doe"
                  value={reference.name}
                  onChange={(e) => {
                    markTouched(`ref-${index}.name`);
                    onChange({
                      references: profile.references.map((r) =>
                        r.id === reference.id ? { ...r, name: e.target.value } : r
                      ),
                    });
                  }}
                  error={showError(`ref-${index}.name`)}
                />
                <Input
                  label="Position"
                  placeholder="e.g., Assistant Professor"
                  value={reference.position}
                  onChange={(e) =>
                    onChange({
                      references: profile.references.map((r) =>
                        r.id === reference.id ? { ...r, position: e.target.value } : r
                      ),
                    })
                  }
                />
                <Input
                  label="Organization"
                  placeholder="e.g., ABC University"
                  value={reference.organization}
                  onChange={(e) =>
                    onChange({
                      references: profile.references.map((r) =>
                        r.id === reference.id ? { ...r, organization: e.target.value } : r
                      ),
                    })
                  }
                />
                <Input
                  label="Email"
                  placeholder="e.g., john@example.com"
                  value={reference.email}
                  onChange={(e) => {
                    markTouched(`ref-${index}.email`);
                    onChange({
                      references: profile.references.map((r) =>
                        r.id === reference.id ? { ...r, email: e.target.value } : r
                      ),
                    });
                  }}
                  error={showError(`ref-${index}.email`)}
                />
                <Input
                  label="Phone"
                  placeholder="e.g., +251 900 000 000"
                  value={reference.phone}
                  onChange={(e) => {
                    markTouched(`ref-${index}.phone`);
                    onChange({
                      references: profile.references.map((r) =>
                        r.id === reference.id ? { ...r, phone: e.target.value } : r
                      ),
                    });
                  }}
                  error={showError(`ref-${index}.phone`)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdditionalInfoForm;

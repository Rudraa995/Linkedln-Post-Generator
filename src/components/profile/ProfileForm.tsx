'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getProfile,
  updateProfile,
} from '@/lib/storage'
import {
  UserProfile,
  Skill,
  Experience,
  Project,
  Certification,
  Achievement,
} from '@/types'
import { generateId } from '@/lib/utils'
import { Plus, Trash2, User, GraduationCap, Briefcase, Award, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setProfile(getProfile())
    setLoading(false)
  }, [])

  const saveProfile = useCallback(
    (updated: UserProfile) => {
      setProfile(updated)
      updateProfile(updated)
    },
    [],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg border border-input p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No profile found</h3>
          <p className="text-muted-foreground mb-6">
            Create your professional profile to enable AI-powered personalized
            LinkedIn post generation.
          </p>
          <Button
            onClick={() => {
              const initial: UserProfile = {
                id: generateId(),
                fullName: '',
                headline: '',
                aboutMe: '',
                currentRole: '',
                education: '',
                collegeUniversity: '',
                skills: [],
                workExperience: [],
                internshipExperience: [],
                projects: [],
                certifications: [],
                achievements: [],
                professionalInterests: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
              saveProfile(initial)
            }}
            className="w-full"
          >
            Create Profile
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Profile</h1>
          <p className="text-muted-foreground">
            Manage your professional background. The AI uses this information to
            generate personalized LinkedIn posts that reflect your real experience.
          </p>
        </div>
        <Button
          onClick={() => {
            const updated = { ...profile, updatedAt: new Date().toISOString() }
            saveProfile(updated)
          }}
        >
          Save Profile
        </Button>
      </div>

      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Your name, headline, and professional summary.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <Input
                value={profile.fullName}
                onChange={(e) =>
                  saveProfile({ ...profile, fullName: e.target.value })
                }
                placeholder="e.g. Rudraa Sharma"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Professional Headline</label>
              <Input
                value={profile.headline}
                onChange={(e) =>
                  saveProfile({ ...profile, headline: e.target.value })
                }
                placeholder="e.g. AI/ML Student | Developer"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-foreground">About Me</label>
              <Textarea
                value={profile.aboutMe}
                onChange={(e) =>
                  saveProfile({ ...profile, aboutMe: e.target.value })
                }
                placeholder="Tell us about your professional background..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Current Role</label>
              <Input
                value={profile.currentRole}
                onChange={(e) =>
                  saveProfile({ ...profile, currentRole: e.target.value })
                }
                placeholder="e.g. AI/ML Student"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Education</label>
              <Input
                value={profile.education}
                onChange={(e) =>
                  saveProfile({ ...profile, education: e.target.value })
                }
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">College / University</label>
              <Input
                value={profile.collegeUniversity}
                onChange={(e) =>
                  saveProfile({ ...profile, collegeUniversity: e.target.value })
                }
                placeholder="e.g. IIT Delhi"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <SkillList
          skills={profile.skills}
          onChange={(skills) =>
            saveProfile({ ...profile, skills })
          }
        />

        {/* Experience */}
        <ExperienceList
          workExperience={profile.workExperience}
          internshipExperience={profile.internshipExperience}
          onChange={(workExperience, internshipExperience) =>
            saveProfile({ ...profile, workExperience, internshipExperience })
          }
        />

        {/* Projects */}
        <ProjectList
          projects={profile.projects}
          onChange={(projects) => saveProfile({ ...profile, projects })}
        />

        {/* Certifications */}
        <CertificationList
          certifications={profile.certifications}
          onChange={(certifications) =>
            saveProfile({ ...profile, certifications })
          }
        />

        {/* Achievements */}
        <AchievementList
          achievements={profile.achievements}
          onChange={(achievements) =>
            saveProfile({ ...profile, achievements })
          }
        />

        {/* Professional Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.professionalInterests.map((interest: string, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={interest}
                    onChange={(e) => {
                      const interests = [...profile.professionalInterests]
                      interests[i] = e.target.value
                      saveProfile({ ...profile, professionalInterests: interests })
                    }}
                    placeholder="e.g. Generative AI"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const interests = profile.professionalInterests.filter(
                        (_: string, idx: number) => idx !== i,
                      )
                      saveProfile({ ...profile, professionalInterests: interests })
                    }}
                    className="p-1 hover:bg-accent rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  saveProfile({
                    ...profile,
                    professionalInterests: [
                      ...profile.professionalInterests,
                      '',
                    ],
                  })
                }}
                className="text-xs flex items-center gap-1 text-primary hover:text-primary/90"
              >
                <Plus className="w-3 h-3" /> Add Interest
              </button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

/* ---------- Skill List ---------- */

interface SkillListProps {
  skills: Skill[]
  onChange: (skills: Skill[]) => void
}

function SkillList({ skills, onChange }: SkillListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Add your technical and soft skills.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <div key={i} className="inline-flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-1 text-sm">
              <Input
                value={skill.name}
                onChange={(e) => {
                  const updated = [...skills]
                  updated[i] = { ...updated[i], name: e.target.value }
                  onChange(updated)
                }}
                className="bg-transparent border-0 p-0 focus:ring-0 w-full"
                placeholder="Skill name"
              />
              <button
                type="button"
                onClick={() => {
                  onChange(skills.filter((_, idx) => idx !== i))
                }}
                className="p-1 hover:bg-accent rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              onChange([...skills, { id: generateId(), name: '' }])
            }}
            className="text-xs flex items-center gap-1 text-primary hover:text-primary/90"
          >
            <Plus className="w-3 h-3" /> Add Skill
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ---------- Experience List ---------- */

interface ExperienceListProps {
  workExperience: Experience[]
  internshipExperience: Experience[]
  onChange: (
    workExperience: Experience[],
    internshipExperience: Experience[],
  ) => void
}

function ExperienceList({
  workExperience,
  internshipExperience,
  onChange,
}: ExperienceListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ExperienceSection
        title="Work Experience"
        icon={<Briefcase className="w-4 h-4" />}
        items={workExperience}
        onChange={(items) => onChange(items, internshipExperience)}
      />
      <ExperienceSection
        title="Internship Experience"
        icon={<GraduationCap className="w-4 h-4" />}
        items={internshipExperience}
        onChange={(items) => onChange(workExperience, items)}
      />
    </div>
  )
}

interface ExperienceSectionProps {
  title: string
  icon: React.ReactNode
  items: Experience[]
  onChange: (items: Experience[]) => void
}

function ExperienceSection({
  title,
  icon,
  items,
  onChange,
}: ExperienceSectionProps) {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2">
        {icon}
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="space-y-2 p-3 rounded-md bg-background/50 border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={item.role}
                onChange={(e) => {
                  const updated = [...items]
                  updated[i] = { ...updated[i], role: e.target.value }
                  onChange(updated)
                }}
                placeholder="Role"
                className="text-sm"
              />
              <Input
                value={item.company}
                onChange={(e) => {
                  const updated = [...items]
                  updated[i] = { ...updated[i], company: e.target.value }
                  onChange(updated)
                }}
                placeholder="Company"
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                value={item.duration}
                onChange={(e) => {
                  const updated = [...items]
                  updated[i] = { ...updated[i], duration: e.target.value }
                  onChange(updated)
                }}
                placeholder="Duration"
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="p-1 hover:bg-accent rounded"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <Textarea
              value={item.description}
              onChange={(e) => {
                const updated = [...items]
                updated[i] = { ...updated[i], description: e.target.value }
                onChange(updated)
              }}
              placeholder="Describe your responsibilities and achievements..."
              rows={2}
              className="text-sm"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            onChange([
              ...items,
              {
                id: generateId(),
                role: '',
                company: '',
                duration: '',
                description: '',
                type: title.includes('Internship') ? 'internship' : 'work',
              },
            ])
          }}
          className="text-xs flex items-center gap-1 text-primary hover:text-primary/90"
        >
          <Plus className="w-3 h-3" /> Add {title}
        </button>
      </CardContent>
    </Card>
  )
}

/* ---------- Project List ---------- */

interface ProjectListProps {
  projects: Project[]
  onChange: (projects: Project[]) => void
}

function ProjectList({ projects, onChange }: ProjectListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          Add your key projects with technologies used.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project, i) => (
          <div key={i} className="space-y-2 p-3 rounded-md bg-background/50 border border-border/50">
            <Input
              value={project.name}
              onChange={(e) => {
                const updated = [...projects]
                updated[i] = { ...updated[i], name: e.target.value }
                onChange(updated)
              }}
              placeholder="Project name"
              className="text-sm"
            />
            <Textarea
              value={project.description}
              onChange={(e) => {
                const updated = [...projects]
                updated[i] = { ...updated[i], description: e.target.value }
                onChange(updated)
              }}
              placeholder="What does this project do?"
              rows={2}
              className="text-sm"
            />
            <Input
              value={project.technologies.join(', ')}
              onChange={(e) => {
                const updated = [...projects]
                updated[i] = {
                  ...updated[i],
                  technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                }
                onChange(updated)
              }}
              placeholder="e.g. Python, React, TensorFlow"
              className="text-sm"
            />
            <Input
              value={project.link ?? ''}
              onChange={(e) => {
                const updated = [...projects]
                updated[i] = { ...updated[i], link: e.target.value || undefined }
                onChange(updated)
              }}
              placeholder="GitHub / Live demo link"
              className="text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(projects.filter((_, idx) => idx !== i))}
              className="p-1 hover:bg-accent rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            onChange([
              ...projects,
              {
                id: generateId(),
                name: '',
                description: '',
                technologies: [],
              },
            ])
          }}
          className="text-xs flex items-center gap-1 text-primary hover:text-primary/90"
        >
          <Plus className="w-3 h-3" /> Add Project
        </button>
      </CardContent>
    </Card>
  )
}

/* ---------- Certification List ---------- */

interface CertificationListProps {
  certifications: Certification[]
  onChange: (certifications: Certification[]) => void
}

function CertificationList({
  certifications,
  onChange,
}: CertificationListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
        <CardDescription>
          Add your professional certifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {certifications.map((cert, i) => (
          <div key={i} className="space-y-2 p-3 rounded-md bg-background/50 border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={cert.name}
                onChange={(e) => {
                  const updated = [...certifications]
                  updated[i] = { ...updated[i], name: e.target.value }
                  onChange(updated)
                }}
                placeholder="Certification name"
                className="text-sm"
              />
              <Input
                value={cert.issuer}
                onChange={(e) => {
                  const updated = [...certifications]
                  updated[i] = { ...updated[i], issuer: e.target.value }
                  onChange(updated)
                }}
                placeholder="Issuer"
                className="text-sm"
              />
              <Input
                type="number"
                value={cert.year || ''}
                onChange={(e) => {
                  const updated = [...certifications]
                  updated[i] = { ...updated[i], year: e.target.value ? parseInt(e.target.value, 10) : new Date().getFullYear() }
                  onChange(updated)
                }}
                placeholder="Year"
                className="text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => onChange(certifications.filter((_, idx) => idx !== i))}
              className="p-1 hover:bg-accent rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            onChange([
              ...certifications,
              {
                id: generateId(),
                name: '',
                issuer: '',
                year: new Date().getFullYear(),
              },
            ])
          }}
          className="text-xs flex items-center gap-1 text-primary hover:text-primary/90"
        >
          <Plus className="w-3 h-3" /> Add Certification
        </button>
      </CardContent>
    </Card>
  )
}

/* ---------- Achievement List ---------- */

interface AchievementListProps {
  achievements: Achievement[]
  onChange: (achievements: Achievement[]) => void
}

function AchievementList({
  achievements,
  onChange,
}: AchievementListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>
          Add your notable achievements and awards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.map((ach, i) => (
          <div key={i} className="space-y-2 p-3 rounded-md bg-background/50 border border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                value={ach.title}
                onChange={(e) => {
                  const updated = [...achievements]
                  updated[i] = { ...updated[i], title: e.target.value }
                  onChange(updated)
                }}
                placeholder="Achievement title"
                className="text-sm"
              />
              <Input
                value={ach.date}
                onChange={(e) => {
                  const updated = [...achievements]
                  updated[i] = { ...updated[i], date: e.target.value }
                  onChange(updated)
                }}
                placeholder="Date"
                className="text-sm"
              />
            </div>
            <Textarea
              value={ach.description}
              onChange={(e) => {
                const updated = [...achievements]
                updated[i] = { ...updated[i], description: e.target.value }
                onChange(updated)
              }}
              placeholder="Describe the achievement..."
              rows={2}
              className="text-sm"
            />
            <button
              type="button"
              onClick={() => onChange(achievements.filter((_, idx) => idx !== i))}
              className="p-1 hover:bg-accent rounded"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => {
            onChange([
              ...achievements,
              { id: generateId(), title: '', description: '', date: '' },
            ])
          }}
          className="text-xs flex items-center gap-1 text-primary hover:text-primary/90"
        >
          <Plus className="w-3 h-3" /> Add Achievement
        </button>
      </CardContent>
    </Card>
  )
}

import React, { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  FolderGit2,
  Award,
  Trophy,
  Save,
  Plus,
  Trash2,
  Cpu,
  User,
  Sparkles,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  X,
  Lock,
  Target,
  ShieldCheck,
} from "lucide-react";
import {
  CandidateProfile,
  EducationEntry,
  ProjectEntry,
  ExperienceEntry,
  CertificationEntry,
  HackathonEntry,
  RadixSkillMapping,
} from "@/types/candidateProfile";
import { RADIX_SKILL_CATEGORIES } from "@/lib/resumeParserService";
import { toast } from "sonner";

interface ManualProfileFormProps {
  initialData?: CandidateProfile | null;
  user?: any;
  student?: any;
  onSave: (profile: CandidateProfile) => Promise<any>;
  onCancel?: () => void;
  isInitialOnboarding?: boolean;
}

export const createDefaultProfile = (
  user?: any,
  student?: any
): CandidateProfile => {
  return {
    userId: user?.id || `user_${Date.now()}`,
    fullName: student?.username
      ? student.username.toUpperCase()
      : user?.email?.split("@")[0].toUpperCase() || "STUDENT",
    email: user?.email || "",
    phone: "",
    location: "Noida, UP",
    headline: `${
      student?.branchName || "Computer Science"
    } Student | JSS University`,
    preferredRole: "Full Stack Software Engineer",
    summary:
      "Passionate engineering student with strong computer science fundamentals, looking for opportunities in software engineering.",
    portfolioUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    education: [
      {
        id: `edu_${Date.now()}`,
        institution: "JSS University Noida",
        degree: "Bachelor of Technology",
        fieldOfStudy: student?.branchName || "Computer Science & Engineering",
        startDate: student?.admissionYear
          ? String(student.admissionYear)
          : "2021",
        endDate: student?.admissionYear
          ? String(Number(student.admissionYear) + 4)
          : "2025",
        gradeOrCgpa: "8.5 CGPA",
        location: "Noida, UP",
      },
    ],
    skills: {
      radixSkills: RADIX_SKILL_CATEGORIES.map((cat) => ({
        skillSetId: cat.id,
        shortName: cat.shortName,
        skillSetName: cat.name,
        matchedTechnologies:
          cat.shortName === "COD"
            ? ["Python", "JavaScript", "C++"]
            : cat.shortName === "SQL"
            ? ["PostgreSQL", "MySQL"]
            : [],
        proficiencySummary: "",
        levelAssessment: 6,
      })),
      rawTechnicalSkills: [
        "Python",
        "JavaScript",
        "TypeScript",
        "C++",
        "SQL",
        "React",
        "Node.js",
      ],
      toolsAndFrameworks: ["Git", "GitHub", "VS Code", "Postman", "Linux"],
      softSkills: [
        "Problem Solving",
        "Team Leadership",
        "Communication",
        "Critical Thinking",
      ],
    },
    projects: [
      {
        id: `proj_${Date.now()}`,
        title: "Campus Placement Portal",
        role: "Full Stack Developer",
        description:
          "Developed high-performance web platform for student placement tracking and intelligence.",
        technologies: ["React", "TypeScript", "Tailwind CSS"],
        link: "",
        highlights: [
          "Implemented responsive UI and auth workflows",
          "Engineered skill competency assessment matrix",
        ],
      },
    ],
    experience: [],
    certifications: [
      {
        id: `cert_${Date.now()}`,
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        issueDate: "2024",
        credentialUrl: "",
      },
    ],
    hackathons: [
      {
        id: `hack_${Date.now()}`,
        name: "Smart India Hackathon (SIH)",
        projectName: "AI Student Career Navigator",
        roleOrTeam: "Team Lead",
        awardOrPosition: "Finalist",
        date: "2024",
        description:
          "Developed real-time intelligence solution for national competition.",
        projectUrl: "",
      },
    ],
    extractedAt: new Date().toISOString(),
    extractionSource: "manual",
    updatedAt: new Date().toISOString(),
  };
};

export const ManualProfileForm: React.FC<ManualProfileFormProps> = ({
  initialData,
  user,
  student,
  onSave,
  onCancel,
  isInitialOnboarding = false,
}) => {
  const [form, setForm] = useState<CandidateProfile>(() => {
    if (initialData) {
      return {
        ...initialData,
        certifications: initialData.certifications || [],
        hackathons: initialData.hackathons || [],
      };
    }
    return createDefaultProfile(user, student);
  });

  const [activeSection, setActiveSection] = useState<
    | "personal"
    | "education"
    | "skills"
    | "projects"
    | "experience"
    | "certifications"
    | "hackathons"
  >("personal");

  const [isSaving, setIsSaving] = useState(false);

  // Quick tag inputs
  const [newRawSkill, setNewRawSkill] = useState("");
  const [newTool, setNewTool] = useState("");
  const [newSoftSkill, setNewSoftSkill] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) {
      toast.error("Please enter your full name.");
      setActiveSection("personal");
      return;
    }

    setIsSaving(true);
    try {
      const updated: CandidateProfile = {
        ...form,
        updatedAt: new Date().toISOString(),
      };
      await onSave(updated);
      toast.success("Profile saved successfully to database!");
    } catch (err: any) {
      toast.error("Failed to save profile", {
        description: err.message || "Please check your inputs and try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Education Helpers
  const addEducation = () => {
    const newEdu: EducationEntry = {
      id: `edu_${Date.now()}`,
      institution: "JSS University Noida",
      degree: "Bachelor of Technology",
      fieldOfStudy: "Computer Science",
      startDate: "2021",
      endDate: "2025",
      gradeOrCgpa: "",
    };
    setForm({ ...form, education: [...form.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    setForm({
      ...form,
      education: form.education.filter((e) => e.id !== id),
    });
  };

  const updateEducation = (id: string, field: keyof EducationEntry, val: string) => {
    setForm({
      ...form,
      education: form.education.map((e) =>
        e.id === id ? { ...e, [field]: val } : e
      ),
    });
  };

  // Projects Helpers
  const addProject = () => {
    const newProj: ProjectEntry = {
      id: `proj_${Date.now()}`,
      title: "New Project",
      role: "Developer",
      description: "",
      technologies: [],
      link: "",
      highlights: [],
    };
    setForm({ ...form, projects: [...form.projects, newProj] });
  };

  const removeProject = (id: string) => {
    setForm({
      ...form,
      projects: form.projects.filter((p) => p.id !== id),
    });
  };

  const updateProject = (id: string, field: keyof ProjectEntry, val: any) => {
    setForm({
      ...form,
      projects: form.projects.map((p) =>
        p.id === id ? { ...p, [field]: val } : p
      ),
    });
  };

  // Experience Helpers
  const addExperience = () => {
    const newExp: ExperienceEntry = {
      id: `exp_${Date.now()}`,
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      description: "",
      highlights: [],
    };
    setForm({ ...form, experience: [...form.experience, newExp] });
  };

  const removeExperience = (id: string) => {
    setForm({
      ...form,
      experience: form.experience.filter((exp) => exp.id !== id),
    });
  };

  const updateExperience = (id: string, field: keyof ExperienceEntry, val: any) => {
    setForm({
      ...form,
      experience: form.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: val } : exp
      ),
    });
  };

  // Certifications Helpers
  const addCertification = () => {
    const newCert: CertificationEntry = {
      id: `cert_${Date.now()}`,
      name: "",
      issuer: "",
      issueDate: "",
      credentialUrl: "",
    };
    setForm({
      ...form,
      certifications: [...(form.certifications || []), newCert],
    });
  };

  const removeCertification = (id: string) => {
    setForm({
      ...form,
      certifications: (form.certifications || []).filter((c) => c.id !== id),
    });
  };

  const updateCertification = (
    id: string,
    field: keyof CertificationEntry,
    val: string
  ) => {
    setForm({
      ...form,
      certifications: (form.certifications || []).map((c) =>
        c.id === id ? { ...c, [field]: val } : c
      ),
    });
  };

  // Hackathons Helpers
  const addHackathon = () => {
    const newHack: HackathonEntry = {
      id: `hack_${Date.now()}`,
      name: "",
      projectName: "",
      roleOrTeam: "",
      awardOrPosition: "Participant",
      date: "",
      description: "",
      projectUrl: "",
    };
    setForm({
      ...form,
      hackathons: [...(form.hackathons || []), newHack],
    });
  };

  const removeHackathon = (id: string) => {
    setForm({
      ...form,
      hackathons: (form.hackathons || []).filter((h) => h.id !== id),
    });
  };

  const updateHackathon = (
    id: string,
    field: keyof HackathonEntry,
    val: string
  ) => {
    setForm({
      ...form,
      hackathons: (form.hackathons || []).map((h) =>
        h.id === id ? { ...h, [field]: val } : h
      ),
    });
  };

  // RADIX Level Assessment Helper
  const updateRadixLevel = (catId: number, level: number) => {
    const updatedRadix = (form.skills?.radixSkills || []).map((s) =>
      s.skillSetId === catId ? { ...s, levelAssessment: level } : s
    );
    setForm({
      ...form,
      skills: {
        ...form.skills,
        radixSkills: updatedRadix,
      },
    });
  };

  // Tag helper
  const addTag = (
    type: "rawTechnicalSkills" | "toolsAndFrameworks" | "softSkills",
    value: string
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const currentList = form.skills?.[type] || [];
    if (!currentList.includes(trimmed)) {
      setForm({
        ...form,
        skills: {
          ...form.skills,
          [type]: [...currentList, trimmed],
        },
      });
    }
  };

  const removeTag = (
    type: "rawTechnicalSkills" | "toolsAndFrameworks" | "softSkills",
    tagToRemove: string
  ) => {
    setForm({
      ...form,
      skills: {
        ...form.skills,
        [type]: (form.skills?.[type] || []).filter((t) => t !== tagToRemove),
      },
    });
  };

  const sections = [
    { id: "personal", label: "Personal & Contact", icon: User },
    { id: "education", label: `Education (${form.education.length})`, icon: GraduationCap },
    { id: "skills", label: "Skills & RADIX (12)", icon: Cpu },
    { id: "projects", label: `Projects (${form.projects.length})`, icon: FolderGit2 },
    { id: "experience", label: `Experience (${form.experience.length})`, icon: Briefcase },
    { id: "certifications", label: `Certifications (${form.certifications?.length || 0})`, icon: Award },
    { id: "hackathons", label: `Hackathons (${form.hackathons?.length || 0})`, icon: Trophy },
  ] as const;

  return (
    <form onSubmit={handleSave} className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold font-heading text-white">
              {isInitialOnboarding
                ? "Candidate Profile Onboarding Form"
                : "Edit Placement Profile Details"}
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Fill in your placement profile details. These are matched with campus drive criteria and RADIX framework ladders.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Profile"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs">
        {sections.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all shrink-0 ${
                isActive
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: PERSONAL & CONTACT */}
      {activeSection === "personal" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
            <User className="w-4 h-4 text-blue-600" />
            Personal & Contact Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Aman Verma"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College Email
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. +91 9876543210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location || ""}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Noida, UP, India"
              />
            </div>

            <div className="md:col-span-2 p-4 rounded-xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-200/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-blue-900 font-heading">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span>Preferred Placement Role * (Manually Selected Only)</span>
                </label>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3 h-3 text-blue-600" />
                  Manual Only · Never Overwritten by AI
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-tight">
                Select or enter your desired campus placement role. This preference is strictly manual and is never modified by automated resume parsing.
              </p>
              <input
                type="text"
                value={form.preferredRole || ""}
                onChange={(e) => setForm({ ...form, preferredRole: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-900"
                placeholder="e.g. Full Stack Developer, SDE (Backend), Cloud Architect, Data Scientist"
              />
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-slate-500 font-semibold mr-1">
                  Quick Select:
                </span>
                {[
                  "Full Stack Developer",
                  "Frontend Developer",
                  "Backend Developer",
                  "SDE (Software Development Engineer)",
                  "Data Scientist / AI Engineer",
                  "DevOps & Cloud Engineer",
                  "Cybersecurity Analyst",
                  "Mobile App Developer (iOS/Android)",
                ].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setForm({ ...form, preferredRole: role })}
                    className={`text-[10px] font-semibold px-2 py-1 rounded-md transition-all cursor-pointer ${
                      form.preferredRole === role
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-white text-slate-700 hover:bg-blue-100/80 border border-slate-200"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Headline / Profile Tagline
              </label>
              <input
                type="text"
                value={form.headline || ""}
                onChange={(e) => setForm({ ...form, headline: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. Full Stack Developer | React & Python | Cloud & Distributed Systems"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                value={form.linkedinUrl || ""}
                onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                GitHub Profile URL
              </label>
              <input
                type="url"
                value={form.githubUrl || ""}
                onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://github.com/username"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portfolio / Personal Website URL
              </label>
              <input
                type="url"
                value={form.portfolioUrl || ""}
                onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://yourportfolio.dev"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professional Bio / Executive Summary
              </label>
              <textarea
                value={form.summary || ""}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Brief summary of your academic background, core engineering strengths, and career aspirations..."
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: EDUCATION */}
      {activeSection === "education" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Education History
            </h4>
            <button
              type="button"
              onClick={addEducation}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {form.education.map((edu, idx) => (
              <div
                key={edu.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Degree Entry #{idx + 1}
                  </span>
                  {form.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(edu.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Degree
                    </label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. Bachelor of Technology (B.Tech)"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Institution
                    </label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, "institution", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. JSS University Noida"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Branch / Field of Study
                    </label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "fieldOfStudy", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. Computer Science & Engineering"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Start Year
                    </label>
                    <input
                      type="text"
                      value={edu.startDate || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "startDate", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="2021"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      End Year (or Expected)
                    </label>
                    <input
                      type="text"
                      value={edu.endDate || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "endDate", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="2025"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      CGPA / Percentage
                    </label>
                    <input
                      type="text"
                      value={edu.gradeOrCgpa || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "gradeOrCgpa", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. 8.65 CGPA"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: SKILLS & 12 RADIX CATEGORIES */}
      {activeSection === "skills" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 font-heading">
                <Cpu className="w-4 h-4 text-blue-600" />
                12 RADIX Placement Competency Ladders
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Skill ratings are evaluated algorithmically by AI against verified resume projects, coursework, and technical artifacts. To protect placement drive audit integrity, <strong>RADIX framework ratings are strictly read-only and non-editable</strong>.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-200/90 text-slate-700 shrink-0">
              <Lock className="w-3 h-3 text-slate-600" />
              Verified · Locked
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(form.skills?.radixSkills || []).map((skill) => {
              const currentLevel = skill.levelAssessment || 5;
              const hasTech = skill.matchedTechnologies && skill.matchedTechnologies.length > 0;

              return (
                <div
                  key={skill.skillSetId}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {skill.shortName}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {skill.skillSetName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono font-bold text-blue-700">
                        Level {currentLevel} / 10
                      </span>
                      <span title="Rating assessed from resume; non-editable">
                        <Lock className="w-3 h-3 text-slate-400" />
                      </span>
                    </div>
                  </div>

                  {/* Read-only Competency Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, currentLevel * 10))}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-600 italic">
                    {skill.proficiencySummary || (hasTech
                      ? `Verified skills: ${skill.matchedTechnologies.join(", ")}`
                      : "Core foundational coursework")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Quick Technical Skills Tags */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technical Skills (Languages, Frameworks, Databases)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRawSkill}
                  onChange={(e) => setNewRawSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("rawTechnicalSkills", newRawSkill);
                      setNewRawSkill("");
                    }
                  }}
                  placeholder="Type skill & press Enter (e.g. React, C++, Docker)"
                  className="flex-1 text-xs p-2 rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    addTag("rawTechnicalSkills", newRawSkill);
                    setNewRawSkill("");
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.skills?.rawTechnicalSkills || []).map((skill, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeTag("rawTechnicalSkills", skill)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tools & Frameworks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Developer Tools & Environments
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag("toolsAndFrameworks", newTool);
                      setNewTool("");
                    }
                  }}
                  placeholder="e.g. Git, Docker, Postman, Linux, VS Code"
                  className="flex-1 text-xs p-2 rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    addTag("toolsAndFrameworks", newTool);
                    setNewTool("");
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {(form.skills?.toolsAndFrameworks || []).map((tool, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tool}
                    <button
                      type="button"
                      onClick={() => removeTag("toolsAndFrameworks", tool)}
                      className="hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: PROJECTS */}
      {activeSection === "projects" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
              <FolderGit2 className="w-4 h-4 text-blue-600" />
              Technical Projects
            </h4>
            <button
              type="button"
              onClick={addProject}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="space-y-4">
            {form.projects.map((proj, idx) => (
              <div
                key={proj.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Project #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) =>
                        updateProject(proj.id, "title", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. Real-Time Chat & Collaboration Engine"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={proj.role || ""}
                      onChange={(e) =>
                        updateProject(proj.id, "role", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. Lead Developer / Backend Architect"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Technologies (comma separated)
                    </label>
                    <input
                      type="text"
                      value={(proj.technologies || []).join(", ")}
                      onChange={(e) =>
                        updateProject(
                          proj.id,
                          "technologies",
                          e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean)
                        )
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="e.g. React, Node.js, WebSockets, PostgreSQL"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Project Link / GitHub Repo
                    </label>
                    <input
                      type="url"
                      value={proj.link || ""}
                      onChange={(e) =>
                        updateProject(proj.id, "link", e.target.value)
                      }
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="https://github.com/username/project"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Project Description
                    </label>
                    <textarea
                      value={proj.description || ""}
                      onChange={(e) =>
                        updateProject(proj.id, "description", e.target.value)
                      }
                      rows={2}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="Overview of architecture, design choices, and key deliverables..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 5: EXPERIENCE */}
      {activeSection === "experience" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Work Experience & Internships
            </h4>
            <button
              type="button"
              onClick={addExperience}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          {form.experience.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No formal work experience added yet. (Optional for freshers).
            </div>
          ) : (
            <div className="space-y-4">
              {form.experience.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Experience #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeExperience(exp.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, "company", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. Infosys, TCS, Startup"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Job Title / Role
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) =>
                          updateExperience(exp.id, "role", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. Software Engineering Intern"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Start Date
                      </label>
                      <input
                        type="text"
                        value={exp.startDate || ""}
                        onChange={(e) =>
                          updateExperience(exp.id, "startDate", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. June 2024"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        value={exp.endDate || ""}
                        onChange={(e) =>
                          updateExperience(exp.id, "endDate", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. August 2024 or Present"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Description
                      </label>
                      <textarea
                        value={exp.description || ""}
                        onChange={(e) =>
                          updateExperience(exp.id, "description", e.target.value)
                        }
                        rows={2}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="Summary of responsibilities and technical contributions..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 6: CERTIFICATIONS */}
      {activeSection === "certifications" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
                <Award className="w-4 h-4 text-emerald-600" />
                Certifications & Badges
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Include industry certificates (AWS, Google, Coursera, NPTEL, Cisco, etc.).
              </p>
            </div>
            <button
              type="button"
              onClick={addCertification}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Certification</span>
            </button>
          </div>

          {(form.certifications || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No certifications added yet. Click &quot;Add Certification&quot; to add your badges.
            </div>
          ) : (
            <div className="space-y-4">
              {(form.certifications || []).map((cert, idx) => (
                <div
                  key={cert.id || idx}
                  className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Certificate #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCertification(cert.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 md:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Certificate Name *
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) =>
                          updateCertification(cert.id, "name", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. AWS Certified Solutions Architect"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Issuer / Authority
                      </label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) =>
                          updateCertification(cert.id, "issuer", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. Amazon Web Services / Coursera"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Issue Year / Date
                      </label>
                      <input
                        type="text"
                        value={cert.issueDate || ""}
                        onChange={(e) =>
                          updateCertification(cert.id, "issueDate", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. Nov 2024"
                      />
                    </div>

                    <div className="sm:col-span-2 md:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Credential / Verification URL
                      </label>
                      <input
                        type="url"
                        value={cert.credentialUrl || ""}
                        onChange={(e) =>
                          updateCertification(cert.id, "credentialUrl", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="https://credly.com/your-badge"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 7: HACKATHONS */}
      {activeSection === "hackathons" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
                <Trophy className="w-4 h-4 text-amber-500" />
                Hackathons & Competitions
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Highlight your coding hackathons (SIH, HackCBS, Devpost, Kaggle, etc.) and rankings.
              </p>
            </div>
            <button
              type="button"
              onClick={addHackathon}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Hackathon</span>
            </button>
          </div>

          {(form.hackathons || []).length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No hackathons added yet. Click &quot;Add Hackathon&quot; to showcase your achievements.
            </div>
          ) : (
            <div className="space-y-4">
              {(form.hackathons || []).map((hack, idx) => (
                <div
                  key={hack.id || idx}
                  className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/20 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Hackathon #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeHackathon(hack.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 md:col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Hackathon Name *
                      </label>
                      <input
                        type="text"
                        value={hack.name}
                        onChange={(e) =>
                          updateHackathon(hack.id, "name", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. Smart India Hackathon (SIH)"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Project / Solution Name
                      </label>
                      <input
                        type="text"
                        value={hack.projectName || ""}
                        onChange={(e) =>
                          updateHackathon(hack.id, "projectName", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. AI Crop Yield Predictor"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Award / Position
                      </label>
                      <select
                        value={hack.awardOrPosition || "Participant"}
                        onChange={(e) =>
                          updateHackathon(hack.id, "awardOrPosition", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="Winner">Winner / 1st Place</option>
                        <option value="1st Runner Up">1st Runner Up</option>
                        <option value="2nd Runner Up">2nd Runner Up</option>
                        <option value="Finalist">Finalist</option>
                        <option value="Top 10">Top 10</option>
                        <option value="Special Mention">Special Mention</option>
                        <option value="Participant">Participant</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Date / Year
                      </label>
                      <input
                        type="text"
                        value={hack.date || ""}
                        onChange={(e) =>
                          updateHackathon(hack.id, "date", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="e.g. Oct 2024"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Project / Repo / Demo Link
                      </label>
                      <input
                        type="url"
                        value={hack.projectUrl || ""}
                        onChange={(e) =>
                          updateHackathon(hack.id, "projectUrl", e.target.value)
                        }
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="https://github.com/team/hackathon-project"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Key Learnings & Solution Summary
                      </label>
                      <textarea
                        value={hack.description || ""}
                        onChange={(e) =>
                          updateHackathon(hack.id, "description", e.target.value)
                        }
                        rows={2}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
                        placeholder="Describe what problem you solved and key tech stack used during the hackathon..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {sections.map((sec, idx) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeSection === sec.id
                  ? "bg-blue-600 ring-2 ring-blue-300"
                  : "bg-slate-300 hover:bg-slate-400"
              }`}
              title={sec.label}
            />
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save Profile Details"}</span>
          </button>
        </div>
      </div>
    </form>
  );
};

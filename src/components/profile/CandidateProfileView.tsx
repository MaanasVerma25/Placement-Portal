import React, { useState } from "react";
import {
  GraduationCap,
  Briefcase,
  FolderGit2,
  Sparkles,
  Save,
  Edit3,
  CheckCircle2,
  ExternalLink,
  Cpu,
  Layers,
  Database,
  RefreshCw,
  FileText,
  Award,
  Trophy,
  Target,
  Lock,
} from "lucide-react";
import { CandidateProfile } from "@/types/candidateProfile";
import { ManualProfileForm } from "./ManualProfileForm";
import { toast } from "sonner";

interface CandidateProfileViewProps {
  profile: CandidateProfile | null;
  isParsing?: boolean;
  parsingStatus?: string;
  onSave?: (updated: CandidateProfile) => Promise<any>;
  onReextract?: () => void;
  hasResume?: boolean;
}

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  profile,
  isParsing = false,
  parsingStatus = "",
  onSave,
  onReextract,
  hasResume = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CandidateProfile | null>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "skills" | "projects" | "education" | "experience" | "certifications" | "hackathons"
  >("skills");

  // Keep local state in sync when profile updates
  React.useEffect(() => {
    setFormData(profile);
  }, [profile]);

  if (isParsing) {
    return (
      <div className="py-12 px-4 rounded-2xl bg-gradient-to-b from-blue-50/50 to-indigo-50/30 border border-blue-200/80 text-center animate-pulse">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-900 font-heading">
          AI Resume Extraction in Progress
        </h3>
        <p className="text-xs text-blue-700 font-medium mt-1 max-w-md mx-auto">
          {parsingStatus || "Extracting text and mapping to 12 RADIX competency categories..."}
        </p>
        <div className="mt-5 w-64 h-1.5 bg-blue-200 rounded-full mx-auto overflow-hidden">
          <div className="w-full h-full bg-blue-600 animate-[pulse_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    );
  }

  // If in editing mode, display the comprehensive ManualProfileForm
  if (isEditing) {
    return (
      <ManualProfileForm
        initialData={formData || profile}
        onSave={async (updated) => {
          if (onSave) {
            await onSave(updated);
          }
          setFormData(updated);
          setIsEditing(false);
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (!profile) {
    return (
      <div className="py-10 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center">
          <FileText className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">No Profile Features Detected Yet</h4>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
          Upload your resume in PDF/DOCX format to automatically extract your skills, hackathons, and certifications with AI, or enter your details manually.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {hasResume && onReextract && (
            <button
              type="button"
              onClick={onReextract}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autofill Profile with AI</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
            <span>Enter Details Manually</span>
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData || !onSave) return;
    setIsSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
      toast.success("Profile saved to database successfully!");
    } catch (err: any) {
      toast.error("Failed to save profile changes", { description: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const currentData = isEditing && formData ? formData : profile;

  return (
    <div className="space-y-5 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold font-heading text-white">
              {currentData.fullName}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3 h-3" /> Autofilled by AI
            </span>
            {currentData.extractionSource && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                Source: {currentData.extractionSource === "direct_text" ? "Digital Text" : "OCR.Space"}
              </span>
            )}
          </div>
          <p className="text-xs text-blue-200">{currentData.headline}</p>

          {currentData.preferredRole ? (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                <Target className="w-3.5 h-3.5 text-blue-300" />
                <span>Preferred Role: {currentData.preferredRole}</span>
              </span>
            </div>
          ) : (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-300 hover:text-white transition-colors cursor-pointer"
              >
                <Target className="w-3.5 h-3.5 text-blue-400" />
                <span>+ Set Preferred Role (Manual Only)</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onReextract && (
            <button
              type="button"
              onClick={onReextract}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/10 hover:bg-white/20 transition-colors"
              title="Re-run AI extraction from resume"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-analyze</span>
            </button>
          )}

          {isEditing ? (
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? "Saving..." : "Save Changes"}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary / Bio */}
      {currentData.summary && (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Professional Overview
          </span>
          {isEditing ? (
            <textarea
              value={formData?.summary || ""}
              onChange={(e) =>
                setFormData(formData ? { ...formData, summary: e.target.value } : null)
              }
              rows={2}
              className="w-full mt-1.5 text-xs text-slate-700 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              {currentData.summary}
            </p>
          )}
        </div>
      )}

      {/* Feature Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("skills")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
            activeTab === "skills"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>12 RADIX Skills ({currentData.skills?.radixSkills?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("projects")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
            activeTab === "projects"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5" />
          <span>Projects ({currentData.projects?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("education")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
            activeTab === "education"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Education ({currentData.education?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("experience")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
            activeTab === "experience"
              ? "bg-white text-blue-600 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Experience ({currentData.experience?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certifications")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
            activeTab === "certifications"
              ? "bg-white text-emerald-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Certifications ({currentData.certifications?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hackathons")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 ${
            activeTab === "hackathons"
              ? "bg-white text-amber-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Hackathons ({currentData.hackathons?.length || 0})</span>
        </button>
      </div>

      {/* Tab 1: 12 RADIX SKILLS MATRIX */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                RADIX Skill Categories (12 Placement Competency Ladders)
              </h4>
              <p className="text-[11px] text-slate-500">
                Objective competency framework evaluated from verified resume projects and artifacts.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-center">
              <Lock className="w-3 h-3 text-slate-500" />
              Verified Competencies · Non-Editable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentData.skills?.radixSkills?.map((skill) => {
              const score = skill.levelAssessment || 3;
              const hasTech = skill.matchedTechnologies && skill.matchedTechnologies.length > 0;

              return (
                <div
                  key={skill.skillSetId}
                  className={`p-3.5 rounded-xl border transition-all ${
                    hasTech
                      ? "border-blue-200/90 bg-gradient-to-br from-white to-blue-50/30 shadow-2xs"
                      : "border-slate-200/80 bg-slate-50/50 opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {skill.shortName}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {skill.skillSetName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-bold font-mono text-slate-500">
                        Level {score}/10
                      </span>
                      <span title="Assessed by AI from resume; non-editable">
                        <Lock className="w-2.5 h-2.5 text-slate-400" />
                      </span>
                      <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${score * 10}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {skill.proficiencySummary && (
                    <p className="text-[11px] text-slate-600 mb-2.5 leading-snug">
                      {skill.proficiencySummary}
                    </p>
                  )}

                  {/* Matched Technologies Pills */}
                  {hasTech ? (
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      {skill.matchedTechnologies.map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-3xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">
                      Core academic coursework
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Raw Tools & Frameworks */}
          {currentData.skills?.toolsAndFrameworks && currentData.skills.toolsAndFrameworks.length > 0 && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Developer Tools & Frameworks
              </span>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentData.skills.toolsAndFrameworks.map((tool, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: PROJECTS */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Extracted Technical Projects
            </h4>
            <span className="text-[11px] text-slate-500 font-mono">
              {currentData.projects?.length || 0} Projects detected
            </span>
          </div>

          {currentData.projects?.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No projects detected in resume.
            </div>
          ) : (
            currentData.projects?.map((project, idx) => (
              <div
                key={project.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      {project.title}
                    </h5>
                    {project.role && (
                      <span className="text-[10px] text-blue-600 font-medium">
                        {project.role}
                      </span>
                    )}
                  </div>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Link</span>
                    </a>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {project.description}
                </p>

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {project.highlights && project.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5 pt-1">
                    {project.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: EDUCATION */}
      {activeTab === "education" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Education & Degrees
            </h4>
          </div>

          {currentData.education?.map((edu, idx) => (
            <div
              key={edu.id || idx}
              className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-900">
                    {edu.degree}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium">{edu.institution}</p>
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  {edu.fieldOfStudy && <span>{edu.fieldOfStudy}</span>}
                  {edu.gradeOrCgpa && (
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      {edu.gradeOrCgpa}
                    </span>
                  )}
                  {edu.location && <span>{edu.location}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: EXPERIENCE / INTERNSHIPS */}
      {activeTab === "experience" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Work Experience & Internships
            </h4>
          </div>

          {currentData.experience?.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              No formal work experience detected in resume. Focus on projects and skills for fresher placement drives.
            </div>
          ) : (
            currentData.experience?.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-start gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-900">{exp.role}</h5>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {exp.startDate} – {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 font-semibold">{exp.company}</p>
                  {exp.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {exp.description}
                    </p>
                  )}
                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5 pt-1">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 5: CERTIFICATIONS */}
      {activeTab === "certifications" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
                <Award className="w-4 h-4 text-emerald-600" />
                Verified & Recognized Certifications
              </h4>
              <p className="text-[11px] text-slate-500">
                Industry credentials and skill badges from AWS, Google, Coursera, NPTEL, Cisco, etc.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit / Add</span>
            </button>
          </div>

          {!currentData.certifications || currentData.certifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
              <Award className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">No certifications listed yet.</p>
              <p className="text-[11px] text-slate-400">
                Showcase your AWS, Google Cloud, Coursera, or HackerRank certificates to boost your placement score.
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-2xs transition-colors"
              >
                <span>Add Certification</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentData.certifications.map((cert, idx) => (
                <div
                  key={cert.id || idx}
                  className="p-4 rounded-xl border border-emerald-200/90 bg-gradient-to-br from-white to-emerald-50/30 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 leading-tight">
                            {cert.name}
                          </h5>
                          <span className="text-[11px] font-semibold text-emerald-700">
                            {cert.issuer}
                          </span>
                        </div>
                      </div>

                      {cert.issueDate && (
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {cert.issueDate}
                        </span>
                      )}
                    </div>
                  </div>

                  {cert.credentialUrl && (
                    <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-end">
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Verify Credential</span>
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: HACKATHONS */}
      {activeTab === "hackathons" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-heading">
                <Trophy className="w-4 h-4 text-amber-500" />
                Hackathons & Competitive Achievements
              </h4>
              <p className="text-[11px] text-slate-500">
                National and collegiate hackathon awards, project prototypes, and rankings.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>Edit / Add</span>
            </button>
          </div>

          {!currentData.hackathons || currentData.hackathons.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-2">
              <Trophy className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="font-semibold text-slate-700">No hackathons listed yet.</p>
              <p className="text-[11px] text-slate-400">
                Participation in Smart India Hackathon, HackCBS, or dev challenges demonstrates rapid problem solving to top recruiters.
              </p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-2xs transition-colors"
              >
                <span>Add Hackathon</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {currentData.hackathons.map((hack, idx) => (
                <div
                  key={hack.id || idx}
                  className="p-4 rounded-xl border border-amber-200/90 bg-gradient-to-br from-white to-amber-50/20 shadow-2xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 leading-tight">
                          {hack.name}
                        </h5>
                        {hack.projectName && (
                          <span className="text-[11px] font-semibold text-blue-700">
                            Project: {hack.projectName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {hack.awardOrPosition && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          {hack.awardOrPosition}
                        </span>
                      )}
                      {hack.date && (
                        <span className="text-[10px] font-mono text-slate-500">
                          {hack.date}
                        </span>
                      )}
                    </div>
                  </div>

                  {hack.description && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {hack.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                    {hack.roleOrTeam ? (
                      <span className="text-slate-500 font-medium">
                        Role: {hack.roleOrTeam}
                      </span>
                    ) : (
                      <span />
                    )}

                    {hack.projectUrl && (
                      <a
                        href={hack.projectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Project / Demo</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
        <span className="flex items-center gap-1">
          <Database className="w-3 h-3 text-emerald-600" />
          Synchronized to Supabase Database
        </span>
        {currentData.extractedAt && (
          <span>
            Last updated: {new Date(currentData.extractedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
};

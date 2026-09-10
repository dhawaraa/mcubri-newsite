"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Globe,
  GraduationCap,
  BookOpen,
  User,
  X,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Users,
} from "lucide-react";
import { useLocale, useT } from "@/shared/lib/i18n/client";
import type { DepartmentDto, PersonnelDto } from "@/features/personnel";
import type { PersonnelType } from "@/generated/prisma";

interface PublicPersonnelClientProps {
  initialDepartments: DepartmentDto[];
  initialPersonnels: PersonnelDto[];
}

export function PublicPersonnelClient({
  initialDepartments,
  initialPersonnels,
}: PublicPersonnelClientProps) {
  const locale = useLocale();
  const t = useT();

  const [activeDept, setActiveDept] = useState<string>("ALL");
  const [activeType, setActiveType] = useState<"ALL" | PersonnelType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<PersonnelDto | null>(null);

  // Filter logic
  const filteredPersonnels = initialPersonnels.filter((p) => {
    if (activeDept !== "ALL" && p.departmentId !== activeDept) return false;
    if (activeType !== "ALL" && p.type !== activeType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTh = `${p.academicRankTh || p.titleTh || ""} ${p.firstNameTh} ${p.lastNameTh} ${p.positionTh}`.toLowerCase();
      const matchEn = `${p.academicRankEn || p.titleEn || ""} ${p.firstNameEn} ${p.lastNameEn} ${p.positionEn}`.toLowerCase();
      const matchEmail = (p.email || "").toLowerCase();
      const matchExpertise = (p.expertise || "").toLowerCase();
      if (!matchTh.includes(q) && !matchEn.includes(q) && !matchEmail.includes(q) && !matchExpertise.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-950 to-zinc-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Users className="w-3.5 h-3.5" />
            <span>{locale === "en" ? "Faculty & Staff Directory" : "บุคลากรประจำคณะ"}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {t("personnel.public.title")}
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto">
            {t("personnel.public.subtitle")}
          </p>

          {/* Search Box */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === "en" ? "Search by name, position, expertise..." : "ค้นหาด้วยชื่อ, ตำแหน่ง, ความเชี่ยวชาญ..."}
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 text-white placeholder-zinc-400 text-sm backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        {/* Type Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
          {[
            { id: "ALL", labelTh: "ทั้งหมด", labelEn: "All Personnel" },
            { id: "EXECUTIVE", labelTh: "คณะผู้บริหาร", labelEn: "Executives" },
            { id: "ACADEMIC", labelTh: "สายวิชาการ (คณาจารย์)", labelEn: "Academic Faculty" },
            { id: "SUPPORT", labelTh: "สายสนับสนุน", labelEn: "Support Staff" },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setActiveType(type.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeType === type.id
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-[1.02]"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {locale === "en" ? type.labelEn : type.labelTh}
            </button>
          ))}
        </div>

        {/* Department Pills */}
        {initialDepartments.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveDept("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeDept === "ALL"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {t("personnel.allDepartments")}
            </button>
            {initialDepartments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeDept === dept.id
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {locale === "en" ? dept.nameEn : dept.nameTh}
              </button>
            ))}
          </div>
        )}

        {/* Personnel Grid */}
        {filteredPersonnels.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <User className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              ไม่พบบุคลากรตามเงื่อนไขที่ค้นหา
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPersonnels.map((p) => {
              const fullName =
                locale === "en"
                  ? `${p.academicRankEn || p.titleEn || ""} ${p.firstNameEn} ${p.lastNameEn}`.trim()
                  : `${p.academicRankTh || p.titleTh || ""} ${p.firstNameTh} ${p.lastNameTh}`.trim();

              const position = locale === "en" ? p.positionEn : p.positionTh;
              const deptName = locale === "en" ? p.departmentNameEn : p.departmentNameTh;

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProfile(p)}
                  className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/40 dark:hover:border-blue-500/40 transition-all duration-300 flex flex-col cursor-pointer"
                >
                  {/* Avatar Container (Fixed 3:4 aspect ratio) */}
                  <div className="relative aspect-[3/4] w-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={fullName}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                        <User className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <span className="text-xs font-semibold text-white inline-flex items-center gap-1">
                        ดูประวัติและผลงาน <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mb-0.5">
                        {deptName}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {fullName}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                        {position}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {p.email && (
                        <div className="flex items-center gap-1.5 text-[11px] truncate">
                          <Mail className="w-3 h-3 shrink-0 text-zinc-400" />
                          <span className="truncate">{p.email}</span>
                        </div>
                      )}
                      {p.officeRoom && (
                        <div className="flex items-center gap-1.5 text-[11px] truncate">
                          <MapPin className="w-3 h-3 shrink-0 text-zinc-400" />
                          <span className="truncate">ห้อง {p.officeRoom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Detail Modal */}
      {selectedProfile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setSelectedProfile(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setSelectedProfile(null)}
                className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 max-h-[85vh] overflow-y-auto">
              {/* Left Column: Image */}
              <div className="sm:col-span-2 bg-zinc-100 dark:bg-zinc-800 aspect-[3/4] sm:aspect-auto sm:h-full relative overflow-hidden">
                {selectedProfile.avatarUrl ? (
                  <img
                    src={selectedProfile.avatarUrl}
                    alt={selectedProfile.firstNameTh}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <User className="w-20 h-20" />
                  </div>
                )}
              </div>

              {/* Right Column: Details */}
              <div className="sm:col-span-3 p-6 space-y-4">
                <div>
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {locale === "en"
                      ? selectedProfile.departmentNameEn
                      : selectedProfile.departmentNameTh}
                  </span>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                    {locale === "en"
                      ? `${selectedProfile.academicRankEn || selectedProfile.titleEn || ""} ${selectedProfile.firstNameEn} ${selectedProfile.lastNameEn}`
                      : `${selectedProfile.academicRankTh || selectedProfile.titleTh || ""} ${selectedProfile.firstNameTh} ${selectedProfile.lastNameTh}`}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {selectedProfile.firstNameEn} {selectedProfile.lastNameEn}
                  </p>
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mt-2">
                    {locale === "en" ? selectedProfile.positionEn : selectedProfile.positionTh}
                  </p>
                </div>

                {/* Contact list */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl space-y-2 text-xs">
                  {selectedProfile.email && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                      <a href={`mailto:${selectedProfile.email}`} className="hover:underline">
                        {selectedProfile.email}
                      </a>
                    </div>
                  )}
                  {selectedProfile.phone && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{selectedProfile.phone}</span>
                    </div>
                  )}
                  {selectedProfile.officeRoom && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>ห้องทำงาน: {selectedProfile.officeRoom}</span>
                    </div>
                  )}
                  {selectedProfile.websiteUrl && (
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                      <a
                        href={selectedProfile.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>เว็บไซต์ส่วนตัว / ผลงานวิจัย</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Education */}
                {selectedProfile.education && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-zinc-500" />
                      <span>ประวัติการศึกษา</span>
                    </h4>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-line pl-5 border-l-2 border-zinc-200 dark:border-zinc-800">
                      {selectedProfile.education}
                    </div>
                  </div>
                )}

                {/* Expertise */}
                {selectedProfile.expertise && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-zinc-500" />
                      <span>ความเชี่ยวชาญ / สาขาวิจัย</span>
                    </h4>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 whitespace-pre-line pl-5 border-l-2 border-zinc-200 dark:border-zinc-800">
                      {selectedProfile.expertise}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

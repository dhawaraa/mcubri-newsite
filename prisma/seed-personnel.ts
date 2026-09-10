import "dotenv/config";
import { PrismaClient, PersonnelType } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

async function seedPersonnel() {
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
  if (!tenant) {
    console.error("No active tenant found");
    return;
  }

  console.log("Seeding Personnel for tenant:", tenant.nameTh);

  // 1. Departments
  const deptsData = [
    {
      nameTh: "สำนักงานคณบดี",
      nameEn: "Dean's Office",
      slug: "deans-office",
      description: "หน่วยงานบริหารและสนับสนุนการดำเนินงานของคณะ",
      displayOrder: 1,
    },
    {
      nameTh: "ภาควิชาวิทยาการคอมพิวเตอร์และปัญญาประดิษฐ์",
      nameEn: "Department of Computer Science & AI",
      slug: "computer-science",
      description: "การเรียนการสอนและวิจัยด้านวิทยาการคอมพิวเตอร์ AI และระบบสารสนเทศ",
      displayOrder: 2,
    },
    {
      nameTh: "ภาควิชาวิศวกรรมข้อมูลและเทคโนโลยีชีวการแพทย์",
      nameEn: "Department of Data Engineering & Biomedical Tech",
      slug: "data-biomedical",
      description: "การประยุกต์ใช้วิทยาการข้อมูลและเทคโนโลยีการแพทย์เพื่อสุขภาพ",
      displayOrder: 3,
    },
    {
      nameTh: "ฝ่ายสนับสนุนวิชาการและสารสนเทศ",
      nameEn: "Academic Support & IT Division",
      slug: "it-support",
      description: "บริการโครงสร้างพื้นฐานไอที ห้องปฏิบัติการ และงานบริการการศึกษา",
      displayOrder: 4,
    },
  ];

  const createdDepts: Record<string, string> = {};

  for (const d of deptsData) {
    const dept = await prisma.personnelDepartment.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: d.slug } },
      update: {
        nameTh: d.nameTh,
        nameEn: d.nameEn,
        description: d.description,
        displayOrder: d.displayOrder,
      },
      create: {
        tenantId: tenant.id,
        nameTh: d.nameTh,
        nameEn: d.nameEn,
        slug: d.slug,
        description: d.description,
        displayOrder: d.displayOrder,
      },
    });
    createdDepts[d.slug] = dept.id;
  }

  // 2. Personnel list
  const personnelsData = [
    {
      departmentSlug: "deans-office",
      type: "EXECUTIVE" as PersonnelType,
      titleTh: "ศ.ดร.",
      titleEn: "Prof. Dr.",
      firstNameTh: "ธีรเดช",
      lastNameTh: "วัฒนพาณิชย์",
      firstNameEn: "Theeradej",
      lastNameEn: "Wattanapanich",
      academicRankTh: "ศาสตราจารย์ ดร.",
      academicRankEn: "Professor Dr.",
      positionTh: "คณบดีคณะสารสนเทศศาสตร์",
      positionEn: "Dean, Faculty of Informatics",
      email: "theeradej.w@faculty.ac.th",
      phone: "02-123-4567 ต่อ 101",
      officeRoom: "อาคารบริหาร ชั้น 4 ห้อง 401",
      education: "Ph.D. in Computer Engineering, MIT, USA\nวศ.ม. (วิศวกรรมคอมพิวเตอร์) จุฬาลงกรณ์มหาวิทยาลัย\nวศ.บ. (วิศวกรรมคอมพิวเตอร์) เกียรตินิยมอันดับหนึ่ง จุฬาฯ",
      expertise: "High Performance Computing, Distributed Systems, Cloud Architecture, AI for Medicine",
      websiteUrl: "https://scholar.google.com",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
      displayOrder: 1,
    },
    {
      departmentSlug: "deans-office",
      type: "EXECUTIVE" as PersonnelType,
      titleTh: "รศ.ดร.",
      titleEn: "Assoc. Prof. Dr.",
      firstNameTh: "นภาพร",
      lastNameTh: "ศิริชัยวงศ์",
      firstNameEn: "Napaporn",
      lastNameEn: "Sirichaiwong",
      academicRankTh: "รองศาสตราจารย์ ดร.",
      academicRankEn: "Associate Professor Dr.",
      positionTh: "รองคณบดีฝ่ายวิชาการและวิจัย",
      positionEn: "Associate Dean for Academic & Research",
      email: "napaporn.s@faculty.ac.th",
      phone: "02-123-4567 ต่อ 102",
      officeRoom: "อาคารบริหาร ชั้น 4 ห้อง 402",
      education: "Ph.D. in Information Systems, University of Melbourne, Australia\nวท.บ. (สถิติประยุกต์) จุฬาลงกรณ์มหาวิทยาลัย",
      expertise: "Data Governance, Smart City Analytics, Health Informatics",
      websiteUrl: "https://researchgate.net",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      displayOrder: 2,
    },
    {
      departmentSlug: "computer-science",
      type: "ACADEMIC" as PersonnelType,
      titleTh: "ผศ.ดร.",
      titleEn: "Asst. Prof. Dr.",
      firstNameTh: "กิตติพงษ์",
      lastNameTh: "สุขเกษม",
      firstNameEn: "Kittipong",
      lastNameEn: "Sukkasem",
      academicRankTh: "ผู้ช่วยศาสตราจารย์ ดร.",
      academicRankEn: "Assistant Professor Dr.",
      positionTh: "หัวหน้าภาควิชาวิทยาการคอมพิวเตอร์และปัญญาประดิษฐ์",
      positionEn: "Head of Computer Science & AI Department",
      email: "kittipong.s@faculty.ac.th",
      phone: "02-123-4567 ต่อ 201",
      officeRoom: "อาคาร 2 ชั้น 3 ห้อง 308",
      education: "Ph.D. in Computer Science, Tokyo Institute of Technology, Japan\nวศ.บ. (วิศวกรรมคอมพิวเตอร์) มหาวิทยาลัยเกษตรศาสตร์",
      expertise: "Deep Learning, Natural Language Processing for Southeast Asian Languages, Computer Vision",
      websiteUrl: "https://github.com",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
      displayOrder: 3,
    },
    {
      departmentSlug: "computer-science",
      type: "ACADEMIC" as PersonnelType,
      titleTh: "อาจารย์ ดร.",
      titleEn: "Dr.",
      firstNameTh: "ปรียานุช",
      lastNameTh: "ทองดี",
      firstNameEn: "Preeyanuch",
      lastNameEn: "Thongdee",
      academicRankTh: "อาจารย์ ดร.",
      academicRankEn: "Lecturer Dr.",
      positionTh: "อาจารย์ประจำสาขาวิทยาการคอมพิวเตอร์",
      positionEn: "Lecturer in Computer Science",
      email: "preeyanuch.t@faculty.ac.th",
      phone: "02-123-4567 ต่อ 205",
      officeRoom: "อาคาร 2 ชั้น 3 ห้อง 312",
      education: "Ph.D. in Cyber Security, Royal Holloway, University of London\nวท.บ. (วิทยาการคอมพิวเตอร์) มหาวิทยาลัยเชียงใหม่",
      expertise: "Cryptography, Network Security, Zero Trust Architecture, Blockchain Applications",
      websiteUrl: "https://scholar.google.com",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
      displayOrder: 4,
    },
    {
      departmentSlug: "data-biomedical",
      type: "ACADEMIC" as PersonnelType,
      titleTh: "รศ.ดร.",
      titleEn: "Assoc. Prof. Dr.",
      firstNameTh: "วรเมธ",
      lastNameTh: "จรัสแสง",
      firstNameEn: "Worameth",
      lastNameEn: "Jarassaeng",
      academicRankTh: "รองศาสตราจารย์ ดร.",
      academicRankEn: "Associate Professor Dr.",
      positionTh: "อาจารย์และหัวหน้ากลุ่มวิจัยชีวสารสนเทศ",
      positionEn: "Associate Professor & Bio-IT Lab Director",
      email: "worameth.j@faculty.ac.th",
      phone: "02-123-4567 ต่อ 301",
      officeRoom: "อาคาร 3 ชั้น 5 ห้อง 501",
      education: "Ph.D. in Bioinformatics, Stanford University, USA\nวท.บ. (เทคโนโลยีชีวภาพ) มหาวิทยาลัยมหิดล",
      expertise: "Genomic Sequence Analysis, Structural Bioinformatics, Drug Repurposing Machine Learning",
      websiteUrl: "https://scholar.google.com",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      displayOrder: 5,
    },
    {
      departmentSlug: "it-support",
      type: "SUPPORT" as PersonnelType,
      titleTh: "นาย",
      titleEn: "Mr.",
      firstNameTh: "สมศักดิ์",
      lastNameTh: "พัฒนไพศาล",
      firstNameEn: "Somsak",
      lastNameEn: "Pattanapaisan",
      academicRankTh: "",
      academicRankEn: "",
      positionTh: "หัวหน้างานเทคโนโลยีสารสนเทศและบริการโสตทัศนูปกรณ์",
      positionEn: "Head of IT Infrastructure & Media Services",
      email: "somsak.p@faculty.ac.th",
      phone: "02-123-4567 ต่อ 501",
      officeRoom: "อาคาร 1 ชั้น 1 ห้องไอทีเซิร์ฟเวอร์",
      education: "วท.บ. (เทคโนโลยีสารสนเทศ) สถาบันเทคโนโลยีพระจอมเกล้าฯ",
      expertise: "Campus Network Infrastructure, Server Virtualization, Cisco Networking, Audio-Visual Event Systems",
      websiteUrl: "",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
      displayOrder: 6,
    },
    {
      departmentSlug: "it-support",
      type: "SUPPORT" as PersonnelType,
      titleTh: "นางสาว",
      titleEn: "Ms.",
      firstNameTh: "วรรณิศา",
      lastNameTh: "แก้วประเสริฐ",
      firstNameEn: "Wannisa",
      lastNameEn: "Kaewprasert",
      academicRankTh: "",
      academicRankEn: "",
      positionTh: "นักวิชาการศึกษา ชำนาญการ",
      positionEn: "Senior Educational Services Officer",
      email: "wannisa.k@faculty.ac.th",
      phone: "02-123-4567 ต่อ 503",
      officeRoom: "อาคารบริหาร ชั้น 1 แผนกบริการการศึกษา",
      education: "ศศ.บ. (การบริหารการศึกษา) มหาวิทยาลัยศรีนครินทรวิโรฒ",
      expertise: "Student Affairs, Academic Curriculum Registration, International Student Exchange Program",
      websiteUrl: "",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
      displayOrder: 7,
    },
  ];

  for (const p of personnelsData) {
    const departmentId = createdDepts[p.departmentSlug];
    if (!departmentId) continue;

    await prisma.personnel.create({
      data: {
        tenantId: tenant.id,
        departmentId,
        type: p.type,
        titleTh: p.titleTh,
        titleEn: p.titleEn,
        firstNameTh: p.firstNameTh,
        lastNameTh: p.lastNameTh,
        firstNameEn: p.firstNameEn,
        lastNameEn: p.lastNameEn,
        academicRankTh: p.academicRankTh,
        academicRankEn: p.academicRankEn,
        positionTh: p.positionTh,
        positionEn: p.positionEn,
        email: p.email,
        phone: p.phone,
        officeRoom: p.officeRoom,
        education: p.education,
        expertise: p.expertise,
        websiteUrl: p.websiteUrl,
        avatarUrl: p.avatarUrl,
        displayOrder: p.displayOrder,
        isActive: true,
      },
    });
  }

  console.log("Personnel seeded successfully! Total:", personnelsData.length);
}

seedPersonnel()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

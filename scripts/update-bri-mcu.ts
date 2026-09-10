import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { requireDatabaseUrl } from "../prisma/lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

async function main() {
  const tenant = await prisma.tenant.findFirst({ where: { isActive: true } });
  if (!tenant) {
    console.error("No active tenant found");
    return;
  }

  // 1. Update Tenant Name & Information
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      nameTh: "สถาบันวิจัยพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย",
      nameEn: "Buddhist Research Institute, Mahachulalongkornrajavidyalaya University (BRI-MCU)",
    },
  });
  console.log("Updated Tenant to สถาบันวิจัยพุทธศาสตร์ มจร (BRI-MCU)");

  // 2. Update Departments to match BRI-MCU structure
  const briDepts = [
    {
      slug: "executive-office",
      nameTh: "ผู้บริหารสถาบันวิจัยพุทธศาสตร์",
      nameEn: "Executive Board of Buddhist Research Institute",
      description: "คณะผู้บริหาร กำกับนโยบาย ยุทธศาสตร์ และทิศทางการวิจัยทางพระพุทธศาสนา",
      displayOrder: 1,
    },
    {
      slug: "buddhist-research-development",
      nameTh: "ส่วนวิจัย สารสนเทศ และบริการวิชาการทางพระพุทธศาสนา",
      nameEn: "Division of Buddhist Research, Informatics & Academic Services",
      description: "ขับเคลื่อนงานวิจัยทางพระพุทธศาสนา วิจัยบูรณาการเพื่อพัฒนาจิตใจ สังคม และฐานข้อมูลสารสนเทศการวิจัย",
      displayOrder: 2,
    },
    {
      slug: "research-support-affairs",
      nameTh: "ส่วนส่งเสริมและประสานงานวิจัย",
      nameEn: "Division of Research Promotion & Coordination",
      description: "บริหารจัดการทุนวิจัย ประสานงานหน่วยงานวิจัยภายนอก เครือข่ายพระสงฆ์ และการนำผลงานวิจัยไปใช้ประโยชน์",
      displayOrder: 3,
    },
    {
      slug: "general-administration",
      nameTh: "สำนักงานผู้อำนวยการและงานบริหารทั่วไป",
      nameEn: "Office of the Director & General Administration",
      description: "สนับสนุนงานธุรการ งานสารบรรณ งานงบประมาณ และงานพัฒนาทรัพยากรบุคคล",
      displayOrder: 4,
    },
  ];

  // Map existing depts or create new ones
  const deptMap: Record<string, string> = {};
  for (const d of briDepts) {
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
    deptMap[d.slug] = dept.id;
  }

  // Clear existing personnel and seed authentic MCU / BRI Buddhist research personnel
  await prisma.personnel.deleteMany({ where: { tenantId: tenant.id } });

  const briPersonnels = [
    {
      departmentSlug: "executive-office",
      type: "EXECUTIVE" as const,
      titleTh: "พระสุวรรณเมธี",
      titleEn: "Phra Suwannamethi",
      academicRankTh: "ศ.ดร.",
      academicRankEn: "Prof. Dr.",
      firstNameTh: "สุรศักดิ์",
      lastNameTh: "สุรเมธี",
      firstNameEn: "Surasak",
      lastNameEn: "Suramethiko",
      positionTh: "ผู้อำนวยการสถาบันวิจัยพุทธศาสตร์",
      positionEn: "Director of Buddhist Research Institute",
      email: "director.bri@mcu.ac.th",
      phone: "035-248-000 ต่อ 8100",
      officeRoom: "อาคารวิจัยและวิทยบริการ ชั้น 3 มจร วังน้อย",
      education: "พธ.ด. (พระพุทธศาสนา) มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย\nPh.D. (Buddhist Studies), University of Delhi, India\nพธ.บ. (ปรัชญา) มจร",
      expertise: "พุทธปรัชญาและพุทธจริยศาสตร์, การบริหารจัดการวิจัยเชิงพุทธ, พระไตรปิฎกศึกษา, สันติวิธีตามแนวพุทธ",
      websiteUrl: "https://bri.mcu.ac.th",
      avatarUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80",
      displayOrder: 1,
    },
    {
      departmentSlug: "executive-office",
      type: "EXECUTIVE" as const,
      titleTh: "พระมหา",
      titleEn: "Phramaha",
      academicRankTh: "รศ.ดร.",
      academicRankEn: "Assoc. Prof. Dr.",
      firstNameTh: "ดนัย",
      lastNameTh: "ญาณวุฑฺโฒ",
      firstNameEn: "Danai",
      lastNameEn: "Nyanavuddho",
      positionTh: "รองผู้อำนวยการสถาบันวิจัยพุทธศาสตร์ ฝ่ายบริหาร",
      positionEn: "Deputy Director for Administrative Affairs",
      email: "danai.nya@mcu.ac.th",
      phone: "035-248-000 ต่อ 8102",
      officeRoom: "อาคารวิจัย ชั้น 3 ห้อง 302",
      education: "พธ.ด. (การบริหารการศึกษาเชิงพุทธ) มจร\nM.A. (Linguistics), BHU, India\nเปรียญธรรม ๙ ประโยค (ป.ธ.๙)",
      expertise: "การบริหารจัดการองค์การเชิงพุทธ, ภาษาบาลี-สันสกฤต, การพัฒนาระบบนิเวศวิจัยพุทธศาสตร์",
      websiteUrl: "https://bri.mcu.ac.th",
      avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
      displayOrder: 2,
    },
    {
      departmentSlug: "executive-office",
      type: "EXECUTIVE" as const,
      titleTh: "พระครูปลัด",
      titleEn: "Phrakhrupalad",
      academicRankTh: "ผศ.ดร.",
      academicRankEn: "Asst. Prof. Dr.",
      firstNameTh: "สมชาย",
      lastNameTh: "ปวโร",
      firstNameEn: "Somchai",
      lastNameEn: "Pavaro",
      positionTh: "รองผู้อำนวยการสถาบันวิจัยพุทธศาสตร์ ฝ่ายวิชาการและวิจัย",
      positionEn: "Deputy Director for Academic & Research Affairs",
      email: "somchai.pav@mcu.ac.th",
      phone: "035-248-000 ต่อ 8103",
      officeRoom: "อาคารวิจัย ชั้น 3 ห้อง 303",
      education: "พธ.ด. (พระพุทธศาสนา) มจร\nศศ.ม. (การพัฒนาสังคม) มหาวิทยาลัยเกษตรศาสตร์",
      expertise: "พุทธนวัตกรรมเพื่อสังคม, พระสงฆ์กับการพัฒนาชุมชน, การวิจัยประเมินผลโครงการเชิงพุทธ",
      websiteUrl: "https://bri.mcu.ac.th",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
      displayOrder: 3,
    },
    {
      departmentSlug: "buddhist-research-development",
      type: "ACADEMIC" as const,
      titleTh: "อาจารย์ ดร.",
      titleEn: "Dr.",
      academicRankTh: "ผศ.ดร.",
      academicRankEn: "Asst. Prof. Dr.",
      firstNameTh: "ปรีชา",
      lastNameTh: "สารรัตน์",
      firstNameEn: "Preecha",
      lastNameEn: "Sanrat",
      positionTh: "หัวหน้าส่วนวิจัย สารสนเทศ และบริการวิชาการ",
      positionEn: "Head of Buddhist Research & Academic Services",
      email: "preecha.san@mcu.ac.th",
      phone: "035-248-000 ต่อ 8110",
      officeRoom: "อาคารวิจัย ชั้น 2 ห้อง 205",
      education: "พธ.ด. (พระพุทธศาสนา) มจร\nวท.บ. (วิทยาการสารสนเทศ) มหาวิทยาลัยบูรพา",
      expertise: "Digital Humanities ทางพุทธศาสนา, คลังข้อมูลสารสนเทศวิจัย (Research Repository), การวิเคราะห์คัมภีร์พุทธดิจิทัล",
      websiteUrl: "https://scholar.google.com",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80",
      displayOrder: 4,
    },
    {
      departmentSlug: "buddhist-research-development",
      type: "ACADEMIC" as const,
      titleTh: "ดร.",
      titleEn: "Dr.",
      academicRankTh: "นักวิจัย ชำนาญการพิเศษ",
      academicRankEn: "Senior Buddhist Researcher",
      firstNameTh: "วิลาสินี",
      lastNameTh: "ธรรมมงคล",
      firstNameEn: "Wilasinee",
      lastNameEn: "Thamrongmongkol",
      positionTh: "นักวิจัยประจำสถาบันวิจัยพุทธศาสตร์",
      positionEn: "Research Fellow, Buddhist Research Institute",
      email: "wilasinee.t@mcu.ac.th",
      phone: "035-248-000 ต่อ 8112",
      officeRoom: "อาคารวิจัย ชั้น 2 ห้องปฏิบัติการวิจัย 208",
      education: "Ph.D. in Religious Studies, SOAS University of London\nศศ.ม. (ปรัชญา) มหาวิทยาลัยธรรมศาสตร์",
      expertise: "สมาธิบำบัดกับการแพทย์บูรณาการ (Mindfulness & Integrative Healthcare), สตรีในพระพุทธศาสนา, จริยธรรมการวิจัยในมนุษย์เชิงพุทธ",
      websiteUrl: "https://researchgate.net",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
      displayOrder: 5,
    },
    {
      departmentSlug: "research-support-affairs",
      type: "SUPPORT" as const,
      titleTh: "นาย",
      titleEn: "Mr.",
      academicRankTh: "",
      academicRankEn: "",
      firstNameTh: "อานนท์",
      lastNameTh: "จิตตปัญโญ",
      firstNameEn: "Arnon",
      lastNameEn: "Chittapanyo",
      positionTh: "หัวหน้าฝ่ายประสานงานทุนวิจัยและเครือข่าย",
      positionEn: "Head of Research Grants & Network Coordination",
      email: "arnon.c@mcu.ac.th",
      phone: "035-248-000 ต่อ 8120",
      officeRoom: "อาคารวิจัย ชั้น 1 แผนกทุนวิจัย",
      education: "ศศ.บ. (การจัดการทั่วไป) มหาวิทยาลัยราชภัฏพระนครศรีอยุธยา",
      expertise: "การบริหารจัดการทุน วช. และ บพท., การติดตามประเมินผลโครงการวิจัย, การจัดประชุมวิชาการระดับชาติและนานาชาติ",
      websiteUrl: "",
      avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
      displayOrder: 6,
    },
    {
      departmentSlug: "general-administration",
      type: "SUPPORT" as const,
      titleTh: "นางสาว",
      titleEn: "Ms.",
      academicRankTh: "",
      academicRankEn: "",
      firstNameTh: "รัตนาภรณ์",
      lastNameTh: "สุวรรณรัตน์",
      firstNameEn: "Rattanaporn",
      lastNameEn: "Suwannarat",
      positionTh: "เจ้าหน้าที่บริหารงานทั่วไป ชำนาญการ",
      positionEn: "General Administration Officer",
      email: "rattanaporn.s@mcu.ac.th",
      phone: "035-248-000 ต่อ 8101",
      officeRoom: "อาคารวิจัย ชั้น 1 สำนักงานผู้อำนวยการ",
      education: "บธ.บ. (คอมพิวเตอร์ธุรกิจ) มหาวิทยาลัยเทคโนโลยีราชมงคลสุวรรณภูมิ",
      expertise: "งานสารบรรณอิเล็กทรอนิกส์, การเงินและพัสดุงานวิจัย, การต้อนรับและประสานงานเครือข่ายพระวิปัสสนาจารย์",
      websiteUrl: "",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
      displayOrder: 7,
    },
  ];

  for (const p of briPersonnels) {
    const deptId = deptMap[p.departmentSlug];
    if (!deptId) continue;

    await prisma.personnel.create({
      data: {
        tenantId: tenant.id,
        departmentId: deptId,
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

  // 3. Update sample news to BRI-MCU topics
  const cat = await prisma.newsCategory.findFirst({ where: { tenantId: tenant.id } });
  if (cat) {
    await prisma.newsArticle.updateMany({
      where: { tenantId: tenant.id },
      data: {
        titleTh: "สถาบันวิจัยพุทธศาสตร์ มจร ขับเคลื่อนงานวิจัยเพื่อการพัฒนาจิตใจและสังคมสุขภาวะ",
      },
    });
  }

  console.log("Successfully customized all data for สถาบันวิจัยพุทธศาสตร์ มจร (BRI-MCU)!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

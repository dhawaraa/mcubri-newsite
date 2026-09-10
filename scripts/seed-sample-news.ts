import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { requireDatabaseUrl } from "../prisma/lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

async function main() {
  console.log("🌱 เริ่มต้นสร้างข่าวสารตัวอย่าง 10 รายการ...");

  const tenant = await prisma.tenant.findFirst({
    where: { code: "DEMO" },
  });

  if (!tenant) {
    console.error("❌ ไม่พบ Tenant 'DEMO'");
    process.exit(1);
  }

  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@app.local" },
  });

  if (!adminUser) {
    console.error("❌ ไม่พบ User admin@app.local");
    process.exit(1);
  }

  // 1. หมวดหมู่ข่าว
  const categoriesData = [
    { nameTh: "ข่าววิชาการและงานวิจัย", nameEn: "Academic & Research", slug: "academic-research", colorBadge: "blue", displayOrder: 1 },
    { nameTh: "ข่าวกิจกรรมและอบรม", nameEn: "Events & Workshops", slug: "events-workshops", colorBadge: "emerald", displayOrder: 2 },
    { nameTh: "ทุนการศึกษาและรับสมัคร", nameEn: "Scholarships & Admissions", slug: "scholarships-admissions", colorBadge: "amber", displayOrder: 3 },
    { nameTh: "ประกาศจัดซื้อจัดจ้าง", nameEn: "Procurement & Announcements", slug: "procurement-announcements", colorBadge: "purple", displayOrder: 4 },
  ];

  const catMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const c = await prisma.newsCategory.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: cat.slug } },
      update: { nameTh: cat.nameTh, nameEn: cat.nameEn, colorBadge: cat.colorBadge },
      create: { ...cat, tenantId: tenant.id },
    });
    catMap[cat.slug] = c.id;
  }

  // 2. ข่าวตัวอย่าง 10 รายการ
  const sampleArticles = [
    {
      slug: "ai-revolution-symposium-2026",
      categorySlug: "academic-research",
      isPinned: true,
      pinnedOrder: 1,
      viewCount: 342,
      coverImageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      titleTh: "คณะจัดสัมมนาวิชาการระดับนานาชาติ ด้านปัญญาประดิษฐ์กับการขับเคลื่อนการศึกษาแห่งอนาคต",
      titleEn: "International Academic Symposium on Artificial Intelligence Driving the Future of Higher Education",
      summaryTh: "เปิดเวทีแลกเปลี่ยนงานวิจัยระดับโลก นำเสนอผลงานนวัตกรรม AI โมเดลภาษาขนาดใหญ่ และทิศทางการประยุกต์ใช้เพื่อการเรียนรู้ในศตวรรษที่ 21",
      summaryEn: "A global research exchange showcasing AI innovations, large language models, and practical applications in 21st-century learning.",
      contentTh: `คณะได้จัดโครงการสัมมนาวิชาการระดับนานาชาติ ภายใต้หัวข้อ "AI and the Future of Education" เพื่อส่งเสริมการแลกเปลี่ยนความรู้ระหว่างคณาจารย์ นักวิจัย และผู้เชี่ยวชาญระดับสากล

ภายในงานมีการบรรยายพิเศษจาก Keynote Speakers ชื่อดังด้าน Generative AI และ Data Science รวมทั้งการนำเสนอผลงานวิจัยของนิสิตนักศึกษาระดับบัณฑิตศึกษามากกว่า 40 ผลงาน

คณะมีความมุ่งมั่นที่จะพัฒนาหลักสูตรและงานวิจัยเพื่อตอบสนองต่อการเปลี่ยนแปลงทางเทคโนโลยี และผลิตบัณฑิตที่มีศักยภาพสูงสุดในระดับภูมิภาค`,
      contentEn: `The Faculty hosted the International Symposium on 'AI and the Future of Education' to foster collaboration among faculty members, global scholars, and technology innovators.

The event featured keynote presentations on Generative AI and Data Science in education, along with presentations of over 40 graduate research projects.`,
    },
    {
      slug: "smart-campus-hackathon-2026",
      categorySlug: "events-workshops",
      isPinned: true,
      pinnedOrder: 2,
      viewCount: 215,
      coverImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "ขอเชิญนิสิตนักศึกษาสมัครร่วมการแข่งขัน Smart Campus Hackathon 2026 ชิงเงินรางวัลกว่า 100,000 บาท",
      titleEn: "Calling all students: Register for Smart Campus Hackathon 2026 with prizes over 100,000 THB",
      summaryTh: "ประลองไอเดียสร้างสรรค์พัฒนานวัตกรรมดิจิทัลเพื่อมหาวิทยาลัยอัจฉริยะ ตลอด 48 ชั่วโมงเต็ม พร้อมรับคำปรึกษาจากเมนเทอร์ชั้นนำ",
      summaryEn: "Compete in a 48-hour challenge to design innovative digital solutions for smart campuses with guidance from industry mentors.",
      contentTh: `เปิดรับสมัครแล้วสำหรับการแข่งขัน Hackathon ประจำปี 2026 หัวข้อ "Innovating Our Sustainable & Smart Campus"

คุณสมบัติผู้เข้าแข่งขัน:
1. เป็นนักศึกษาคณะหรือเครือข่ายความร่วมมือ
2. รวมทีม 3 - 5 คน ข้ามสาขาวิชาได้
3. มีความสนใจในการพัฒนา Web/Mobile Application, IoT หรือ Green Technology

กำหนดการรับสมัคร: ตั้งแต่วันนี้ - 30 มีนาคม 2026
เงินรางวัลรวมกว่า 100,000 บาท พร้อมเกียรติบัตรและโอกาสต่อยอดผลงานเชิงพาณิชย์`,
      contentEn: `Applications are officially open for the Annual Hackathon 2026 on 'Innovating Our Sustainable & Smart Campus'. Teams of 3-5 students can join the 48-hour sprint to build prototypes with total prizes exceeding 100,000 THB.`,
    },
    {
      slug: "mou-singapore-tech-university",
      categorySlug: "academic-research",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 189,
      coverImageUrl: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "คณะลงนามบันทึกข้อตกลงความร่วมมือทางวิชาการ (MoU) ร่วมกับมหาวิทยาลัยเทคโนโลยีชั้นนำจากสิงคโปร์",
      titleEn: "Faculty signs Memorandum of Understanding (MoU) with Leading Singapore Technological University",
      summaryTh: "ยกระดับความเป็นสากล เปิดโอกาสแลกเปลี่ยนคณาจารย์และนักศึกษา พร้อมวิจัยร่วมด้านนวัตกรรมและเทคโนโลยีขั้นสูง",
      summaryEn: "Elevating international collaboration with student/faculty exchange programs and joint advanced research initiatives.",
      contentTh: `คณบดีและผู้บริหารคณะ ได้ร่วมพิธีลงนามบันทึกข้อตกลงความร่วมมือทางวิชาการ (MoU) ร่วมกับคณะผู้แทนจากมหาวิทยาลัยเทคโนโลยีชั้นนำจากประเทศสิงคโปร์

ความร่วมมือในครั้งนี้ครอบคลุม:
- โครงการแลกเปลี่ยนนักศึกษาภาคฤดูร้อน (Student Exchange Program)
- การทำวิจัยร่วม (Joint Research & Dual Degree)
- การจัดสัมมนาวิชาการร่วมระดับภูมิภาคอาเซียน`,
      contentEn: `The Dean and executive committee signed an MoU with our Singaporean partner university to establish joint research initiatives and student exchange programs.`,
    },
    {
      slug: "excellence-scholarship-round-1",
      categorySlug: "scholarships-admissions",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 450,
      coverImageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "ประกาศรับสมัครทุนการศึกษาเรียนดีและทุนช่วยเหลือนิสิต ประจำภาคการศึกษาที่ 1/2569",
      titleEn: "Applications Open for Academic Excellence and Student Support Scholarships for Semester 1/2026",
      summaryTh: "คณะเปิดรับสมัครทุนการศึกษาเต็มจำนวนและบางส่วนสำหรับนิสิตระดับปริญญาตรีและบัณฑิตศึกษา สมัครได้ผ่านระบบออนไลน์",
      summaryEn: "Offering full and partial tuition scholarships for undergraduate and graduate students through the online portal.",
      contentTh: `งานกิจการนิสิตขอประกาศรับสมัครทุนการศึกษา ประจำปีการศึกษา 2569 จำนวนกว่า 50 ทุน แบ่งเป็น:
1. ทุนผลการเรียนยอดเยี่ยม (GPAX 3.50 ขึ้นไป)
2. ทุนผู้สร้างชื่อเสียงและนวัตกรรมให้แก่คณะ
3. ทุนช่วยเหลือนักศึกษาที่ขาดแคลนทุนทรัพย์

นิสิตที่ประสงค์จะขอรับทุนสามารถกรอกแบบฟอร์มคำขอผ่านระบบบริการนักศึกษาได้ตั้งแต่วันนี้เป็นต้นไป`,
      contentEn: `Student Affairs announces over 50 scholarships for the upcoming academic year. Eligible students can apply via the portal.`,
    },
    {
      slug: "tcas69-portfolio-round-announcement",
      categorySlug: "scholarships-admissions",
      isPinned: true,
      pinnedOrder: 3,
      viewCount: 680,
      coverImageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "ประกาศรับสมัครบุคคลเข้าศึกษาต่อระดับปริญญาตรี รอบที่ 1 Portfolio ประจำปีการศึกษา 2569",
      titleEn: "Undergraduate Admissions Announcement: Round 1 Portfolio for Academic Year 2026",
      summaryTh: "เปิดรับสมัครนักเรียนชั้น ม.6 และเทียบเท่า เข้าศึกษาต่อทุกหลักสูตรของคณะ พร้อมตรวจสอบเกณฑ์การคัดเลือกและจำนวนรับ",
      summaryEn: "Admissions open for Grade 12 students across all undergraduate programs. Check eligibility criteria and seat allocation.",
      contentTh: `งานบริการการศึกษาเปิดรับสมัครนักเรียนเข้าศึกษาต่อระดับปริญญาตรี (TCAS รอบที่ 1 แฟ้มสะสมผลงาน)

สาขาวิชาที่เปิดรับ:
- สาขาวิชาวิทยาการคอมพิวเตอร์และปัญญาประดิษฐ์
- สาขาวิชาเทคโนโลยีสารสนเทศเพื่อการจัดการ
- สาขาวิชานวัตกรรมดิจิทัลและการสื่อสาร

ดูรายละเอียดเกณฑ์การรับสมัครและกำหนดการสอบสัมภาษณ์ได้ที่เว็บไซต์หลักสูตรของคณะ`,
      contentEn: `Admissions are now open for TCAS Round 1 Portfolio across our computer science and digital technology programs.`,
    },
    {
      slug: "procurement-server-cluster-upgrade",
      categorySlug: "procurement-announcements",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 94,
      coverImageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "ประกาศราคากลางและการจัดซื้อจัดจ้างโครงการปรับปรุงระบบ High Performance Server Cluster",
      titleEn: "Procurement Announcement and Median Price for High Performance Server Cluster Upgrade Project",
      summaryTh: "งานพัสดุและอาคารสถานที่ประกาศเอกสารราคากลางโครงการจัดซื้อครุภัณฑ์แม่ข่ายสำหรับงานประมวลผลปัญญาประดิษฐ์",
      summaryEn: "Official procurement documents and median price specifications for GPU Server cluster expansion.",
      contentTh: `ประกาศคณะ เรื่อง เผยแพร่แผนการจัดซื้อจัดจ้างและราคากลาง ประจำปีงบประมาณ 2569

รายการ: โครงการจัดซื้อชุดเซิร์ฟเวอร์สมรรถนะสูงพร้อมหน่วยประมวลผลกราฟิก (GPU Server Cluster) เพื่อการเรียนการสอนและการวิจัย
วงเงินงบประมาณ: 3,500,000 บาท
วิธียื่นข้อเสนอ: ประกวดราคาอิเล็กทรอนิกส์ (e-Bidding)

ผู้ประกอบการที่สนใจสามารถดาวน์โหลดเอกสารประกาศฉบับเต็มได้ที่หน้าเว็บไซต์งานพัสดุ`,
      contentEn: `Procurement notice regarding the acquisition of high performance GPU server equipment for research and instructional labs via e-Bidding.`,
    },
    {
      slug: "data-science-bootcamp-workshop",
      categorySlug: "events-workshops",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 165,
      coverImageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "ภาพบรรยากาศโครงการอบรมเชิงปฏิบัติการ Data Analytics & Visualization Bootcamp",
      titleEn: "Highlights from the Data Analytics & Visualization Workshop Bootcamp",
      summaryTh: "เสร็จสิ้นลงอย่างน่าประทับใจสำหรับโครงการอบรมการวิเคราะห์ข้อมูลและสร้าง Interactive Dashboard สำหรับนักศึกษาและบุคลากร",
      summaryEn: "Successfully concluded hands-on workshop on modern data analytics pipelines and dashboard development.",
      contentTh: `คณะได้จัดโครงการอบรมเชิงปฏิบัติการ "Data Analytics with Modern Tools" เมื่อวันเสาร์และอาทิตย์ที่ผ่านมา ณ ห้องปฏิบัติการคอมพิวเตอร์ 401

ผู้เข้าร่วมอบรมได้ลงมือฝึกปฏิบัติการเตรียมข้อมูล (Data Cleansing), การสร้างแบบจำลองการวิเคราะห์ และการนำเสนอข้อมูลผ่านแดชบอร์ดด้วยเครื่องมือระดับสากล บรรยากาศเป็นไปด้วยความกระตือรือร้นและได้รับคำชื่นชมอย่างดียิ่ง`,
      contentEn: `Faculty members and students participated in the 2-day intensive data science bootcamp, building production-ready analytics dashboards.`,
    },
    {
      slug: "faculty-award-best-researcher-2025",
      categorySlug: "academic-research",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 280,
      coverImageUrl: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "ขอแสดงความยินดีกับคณาจารย์ผู้ได้รับรางวัลนักวิจัยดีเด่นระดับชาติ ประจำปี 2568",
      titleEn: "Congratulations to Faculty Members Receiving National Outstanding Researcher Awards 2025",
      summaryTh: "ผลงานวิจัยด้านระบบการจัดการความรู้และเทคโนโลยีสุขภาพคว้ารางวัลระดับสภาวิจัยแห่งชาติ สร้างชื่อเสียงให้แก่คณะและมหาวิทยาลัย",
      summaryEn: "Distinguished faculty members honored with National Research Council awards for digital health innovations.",
      contentTh: `คณะขอแสดงความยินดีเป็นอย่างยิ่งแก่ ศาสตราจารย์ ดร. และทีมวิจัย ที่ได้รับรางวัลสภาวิจัยแห่งชาติ รางวัลผลงานวิจัยดีเด่น สาขาเทคโนโลยีสารสนเทศและนิเทศศาสตร์

ผลงานดังกล่าวเป็นการพัฒนาระบบสนับสนุนการวินิจฉัยโรคเบื้องต้นด้วยเทคโนโลยีการประมวลผลภาพทางการแพทย์ ซึ่งนำไปใช้งานจริงในโรงพยาบาลชุมชนหลายแห่งทั่วประเทศ`,
      contentEn: `Honoring our esteemed faculty professors awarded by the National Research Council for their contributions to medical imaging analytics.`,
    },
    {
      slug: "cybersecurity-awareness-month",
      categorySlug: "events-workshops",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 130,
      coverImageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "กิจกรรมรณรงค์ความปลอดภัยไซเบอร์ Cybersecurity Awareness: รู้เท่าทันภัยคุกคามทางออนไลน์",
      titleEn: "Cybersecurity Awareness Month: Safeguarding Your Digital Identity and Data",
      summaryTh: "ศูนย์สารสนเทศคณะจัดกิจกรรมส่งเสริมความรู้ด้านสุขภาวะทางดิจิทัล การป้องกัน Phishing และการรักษาความปลอดภัยข้อมูลส่วนบุคคล (PDPA)",
      summaryEn: "Promoting digital hygiene, phishing protection, and personal data privacy compliance across the campus.",
      contentTh: `เพื่อสร้างความตระหนักรู้ด้านความมั่นคงปลอดภัยทางไซเบอร์ ศูนย์สารสนเทศได้จัดบูธนิทรรศการและกิจกรรมทดสอบความรู้ Phishing Simulation

ขอเชิญชวนบุคลากรและนักศึกษาทุกท่านร่วมตรวจสอบการตั้งค่าความปลอดภัยบัญชีอีเมลมหาวิทยาลัย การเปิดใช้งานยืนยันตัวตน 2 ขั้นตอน (2FA) และรับของที่ระลึกได้ตลอดสัปดาห์นี้`,
      contentEn: `Engaging faculty and staff in interactive cybersecurity simulations and best practices for two-factor authentication.`,
    },
    {
      slug: "alumni-talk-tech-careers-journey",
      categorySlug: "events-workshops",
      isPinned: false,
      pinnedOrder: 0,
      viewCount: 310,
      coverImageUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
      youtubeUrl: null,
      titleTh: "เสวนาศิษย์เก่า Alumni Talk: เส้นทางสู่การทำงานในองค์กรเทคโนโลยีชั้นนำและสตาร์ทอัพระดับยูนิคอร์น",
      titleEn: "Alumni Talk: Journeys and Insights from Tech Unicorn Engineers and Product Managers",
      summaryTh: "รุ่นพี่ศิษย์เก่าคณะร่วมถ่ายทอดประสบการณ์การเตรียมความพร้อมก่อนสำเร็จการศึกษา และทักษะที่เป็นที่ต้องการสูงสุดในตลาดแรงงานสากล",
      summaryEn: "Inspiring talks from alumni working at top tech firms sharing career journeys, portfolio tips, and industry trends.",
      contentTh: `สมาคมศิษย์เก่าร่วมกับคณะ จัดกิจกรรมเสวนาออนไลน์ "From Campus to Tech Lead" โดยเชิญรุ่นพี่ที่กำลังทำงานในตำแหน่ง Software Engineer, Tech Lead และ Data Architect ในบริษัทเทคโนโลยีชั้นนำ

ไฮไลท์ของการเสวนา:
- ทักษะ Full-stack Development และ Cloud Architecture ที่บริษัทมองหา
- เทคนิคการสัมภาษณ์งานและ Coding Challenge
- คำแนะนำในการทำผลงาน Portfolio สำหรับนักศึกษาชั้นปีที่ 3 และ 4`,
      contentEn: `Alumni shared practical insights on preparing for engineering roles, technical interview strategies, and working in fast-paced software organizations.`,
    },
  ];

  for (let i = 0; i < sampleArticles.length; i++) {
    const art = sampleArticles[i];
    const catId = catMap[art.categorySlug];

    const pastDate = new Date(Date.now() - (i * 24 * 60 * 60 * 1000 + i * 3600000));

    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: tenant.id, slug: art.slug } },
      update: {
        titleTh: art.titleTh,
        titleEn: art.titleEn,
        summaryTh: art.summaryTh,
        summaryEn: art.summaryEn,
        contentTh: art.contentTh,
        contentEn: art.contentEn,
        coverImageUrl: art.coverImageUrl,
        youtubeUrl: art.youtubeUrl,
        status: "PUBLISHED",
        isPinned: art.isPinned,
        pinnedOrder: art.pinnedOrder,
        publishedAt: pastDate,
        viewCount: art.viewCount,
      },
      create: {
        tenantId: tenant.id,
        categoryId: catId,
        authorId: adminUser.id,
        titleTh: art.titleTh,
        titleEn: art.titleEn,
        slug: art.slug,
        summaryTh: art.summaryTh,
        summaryEn: art.summaryEn,
        contentTh: art.contentTh,
        contentEn: art.contentEn,
        coverImageUrl: art.coverImageUrl,
        youtubeUrl: art.youtubeUrl,
        status: "PUBLISHED",
        isPinned: art.isPinned,
        pinnedOrder: art.pinnedOrder,
        publishedAt: pastDate,
        viewCount: art.viewCount,
      },
    });

    console.log(`✅ ข่าวที่ ${i + 1}: ${art.titleTh.substring(0, 40)}...`);
  }

  console.log("\n🎉 สร้างข่าวสารตัวอย่าง 10 ข่าวสำเร็จเรียบร้อย!");
}

main().finally(() => prisma.$disconnect());

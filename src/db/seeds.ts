import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log("⏳ بدأت عملية بذر البيانات المصححة والديناميكية...");

  // 1. جدول المستخدمين (Users)
  console.log("👥 بذر جدول المستخدمين...");
  const insertedUsers = await db.insert(schema.users).values([
    { email: "doctor1@sakha.com", role: "STAFF", createdAt: new Date() },
    { email: "patient1@sakha.com", role: "PATIENT", createdAt: new Date() },
    { email: "staff1@sakha.com", role: "STAFF", createdAt: new Date() },
  ]).onConflictDoNothing().returning();

  // حماية: إذا كانت البيانات موجودة مسبقاً، نوقف العملية لتجنب الأخطاء
  if (insertedUsers.length === 0) {
    console.log("⚠️ البيانات موجودة مسبقاً! قم بتنظيف قاعدة البيانات (Truncate) إذا أردت إعادة البذر.");
    process.exit(0);
  }

  const [docUser, patUser, staffUser] = insertedUsers;

  // 2. جدول العيادات (Clinics)
  console.log("🏢 بذر جدول العيادات...");
  const insertedClinics = await db.insert(schema.clinics).values([
    { name: "عيادة الشفاء التخصصية" },
    { name: "مركز الأمل الطبي" },
  ]).onConflictDoNothing().returning();
  const mainClinic = insertedClinics[0];

  // 3. جدول التخصصات (Specializations)
  console.log("🩺 بذر جدول التخصصات...");
  const insertedSpecs = await db.insert(schema.specializations).values([
    { name: "جراحة عامة", description: "تخصص الجراحة العامة والمناظير" },
    { name: "أطفال", description: "طب الأطفال وحديثي الولادة" },
    { name: "باطنية وقلب", description: "أمراض الباطنية والقلب والأوعية" },
  ]).onConflictDoNothing().returning();
  const surgerySpec = insertedSpecs[0];
  const heartSpec = insertedSpecs[2];

  // 4. جدول الأطباء (Doctors)
  console.log("🥼 بذر جدول الأطباء...");
  const insertedDoctors = await db.insert(schema.doctors).values([
    {
      userId: docUser.userId,
      clinicId: mainClinic.clinicId,
      fullName: "د. أحمد عبدالله",
      phone: "+967733333333",
      yearsOfExperience: 8,
      bio: "استشاري جراحة عامة ومناظير، خبرة طويلة في المستشفيات التعليمية.",
      status: "ACTIVE",
    },
  ]).onConflictDoNothing().returning();
  const doctor = insertedDoctors[0];

  // 5. جدول المرضى (Patients)
  console.log("🩹 بذر جدول المرضى...");
  const insertedPatients = await db.insert(schema.patients).values([
    {
      userId: patUser.userId,
      fullName: "خالد محمد انيس",
      phone: "+967771234567",
      gender: "male",
    }
  ]).onConflictDoNothing().returning();
  const patient = insertedPatients[0];

  // 6. جدول الموظفين (Staff)
  console.log("💼 بذر جدول الموظفين...");
  await db.insert(schema.staff).values([
    {
      userId: staffUser.userId,
      clinicId: mainClinic.clinicId,
      fullName: "أروى صلاح (مسؤولة الاستقبال)",
      phone: "+967711223344",
      position: "receptionist",
    }
  ]).onConflictDoNothing();

  // 7. جدول الربط (Doctors To Specializations)
  console.log("🔗 ربط الأطباء بالتخصصات...");
  await db.insert(schema.doctorsToSpecializations).values([
    { doctorId: doctor.doctorId, specializationId: surgerySpec.specializationId },
    { doctorId: doctor.doctorId, specializationId: heartSpec.specializationId },
  ]).onConflictDoNothing();

  // 8. جدول أوقات الدوام (Doctor Availability)
  console.log("📅 بذر مواعيد توفر الأطباء...");
  await db.insert(schema.doctorAvailability).values([
    { doctorId: doctor.doctorId, dayOfWeek: 1, startTime: "09:00:00", endTime: "13:00:00" },
    { doctorId: doctor.doctorId, dayOfWeek: 3, startTime: "16:00:00", endTime: "20:00:00" },
  ]).onConflictDoNothing();

  // 🚀 [الجدول الجديد] 9. جدول الاستثناءات والإجازات الطارئة (Doctor Exceptions)
  console.log("🚨 بذر استثناءات الدوام والإجازات الطارئة...");
  await db.insert(schema.doctorExceptions).values([
    {
      doctorId: doctor.doctorId,
      clinicId: mainClinic.clinicId,
      specificDate: "2026-05-20", // إجازة تجريبية لتاريخ محدد
      isClosed: true,
      reason: "نعتذر لكم، العيادة مغلقة غداً الأربعاء لظروف طارئة خارجة عن إرادتنا."
    }
  ]).onConflictDoNothing();

  // 10. جدول المواعيد (Appointments)
  console.log("📆 بذر جدول الحجوزات والمواعيد...");
  const insertedAppointments = await db.insert(schema.appointments).values([
    {
      patientId: patient.patientId,
      doctorId: doctor.doctorId,
      clinicId: mainClinic.clinicId,
      appointmentDate: "2026-06-01", 
      appointmentTime: "10:00:00",    
      status: "PENDING",
      notes: "حالة فحص روتينية مستعجلة",
    }
  ]).onConflictDoNothing().returning();
  const appointment = insertedAppointments[0];

  // 11. جدول التقييمات (Reviews)
  console.log("⭐ بذر جدول التقييمات...");
  await db.insert(schema.reviews).values([
    {
      appointmentId: appointment.appointmentId,
      patientId: patient.patientId,
      rating: 5,
      comment: "طبيب ممتاز جداً ومتعاون والشرح مبسط ونظيف المظهر!",
    }
  ]).onConflictDoNothing();

  // 12. جدول الإشعارات (Notifications)
  console.log("🔔 بذر جدول الإشعارات...");
  await db.insert(schema.notifications).values([
    {
      userId: docUser.userId,
      title: "حجز جديد",
      message: "تم تسجيل حجز جديد باسم المريض خالد محمد",
      isRead: false,
    },
  ]).onConflictDoNothing();

  // ==========================================
  // 13. جداول الرموز (Auth & Refresh Tokens)
  // ==========================================
  console.log("🔑 بذر جداول توكنات الأمان...");
  await db.insert(schema.authTokens).values([
    { 
      email: "doctor1@sakha.com", 
      role : "ADMIN",
      tokenHash: "sample_access_token_for_doctor", 
      expiresAt: new Date("2026-12-31") 
    }
  ]).onConflictDoNothing();

  await db.insert(schema.refreshTokens).values([
    { 
      userId: docUser.userId, 
      tokenHash: "sample_refresh_token_for_doctor", 
      expiresAt: new Date("2027-12-31") 
    }
  ]).onConflictDoNothing();
  
  console.log("🏆 تم التوافق التام مع الـ Types ومعمارية قاعدة البيانات بنجاح وبدون أخطاء تضارب!");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ حدث خطأ غير متوقع أثناء الـ Seeding:", err);
  process.exit(1);
});
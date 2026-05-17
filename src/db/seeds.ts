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
  console.log("⏳ بدأت عملية بذر البيانات المصححة...");

  // 1. جدول المستخدمين (Users)
  console.log("👥 بذر جدول المستخدمين...");
  await db.insert(schema.users).values([
    { userId: 1, email: "doctor1@sakha.com", role: "doctor", createdAt: new Date() },
    { userId: 2, email: "patient1@sakha.com", role: "patient", createdAt: new Date() },
    { userId: 3, email: "staff1@sakha.com", role: "staff", createdAt: new Date() },
  ]).onConflictDoNothing();

  // 2. جدول العيادات (Clinics)
  console.log("🏢 بذر جدول العيادات...");
  await db.insert(schema.clinics).values([
    { clinicId: 1, name: "عيادة الشفاء التخصصية" },
    { clinicId: 2, name: "مركز الأمل الطبي" },
  ]).onConflictDoNothing();

  // 3. جدول التخصصات (Specializations)
  console.log("🩺 بذر جدول التخصصات...");
  await db.insert(schema.specializations).values([
    { specializationId: 1, name: "جراحة عامة", description: "تخصص الجراحة العامة والمناظير" },
    { specializationId: 2, name: "أطفال", description: "طب الأطفال وحديثي الولادة" },
    { specializationId: 3, name: "باطنية وقلب", description: "أمراض الباطنية والقلب والأوعية" },
  ]).onConflictDoNothing();

  // 4. جدول الأطباء (Doctors)
  console.log("🥼 بذر جدول الأطباء...");
  await db.insert(schema.doctors).values([
    {
      doctorId: 8,
      userId: 1,
      clinicId: 1,
      fullName: "د. أحمد عبدالله",
      phone: "+967733333333",
      yearsOfExperience: 8,
      bio: "استشاري جراحة عامة ومناظير، خبرة طويلة في المستشفيات التعليمية.",
      status: "active",
    },
  ]).onConflictDoNothing();

  // 5. جدول المرضى (Patients) - تصحيح: حذف dateOfBirth وحذف المصفوفة من النوع
  console.log("🩹 بذر جدول المرضى...");
  await db.insert(schema.patients).values([
    {
      patientId: 1,
      userId: 2,
      fullName: "خالد محمد انيس",
      phone: "+967771234567",
      gender: "male", // يتوافق مع الخيارات 'male' | 'female' | 'other'
    }
  ]).onConflictDoNothing();

  // 6. جدول الموظفين (Staff) - تصحيح: تغييره من role إلى position
  console.log("💼 بذر جدول الموظفين...");
  await db.insert(schema.staff).values([
    {
      staffId: 1,
      userId: 3,
      clinicId: 1,
      fullName: "أروى صلاح (مسؤولة الاستقبال)",
      phone: "+967711223344",
      position: "receptionist", // تصحيح للحقل المتوقع في السكيما
    }
  ]).onConflictDoNothing();

  // 7. جدول الربط (Doctors To Specializations)
  console.log("🔗 ربط الأطباء بالتخصصات...");
  await db.insert(schema.doctorsToSpecializations).values([
    { doctorId: 8, specializationId: 1 },
    { doctorId: 8, specializationId: 3 },
  ]).onConflictDoNothing();

  // 8. جدول أوقات الدوام (Doctor Availability) - تصحيح: dayOfWeek يتوقع number من 1 لـ 7
  console.log("📅 بذر مواعيد توفر الأطباء...");
  await db.insert(schema.doctorAvailability).values([
    { availabilityId: 1, doctorId: 8, dayOfWeek: 1, startTime: "09:00:00", endTime: "13:00:00" }, // 1 للـ Sunday مثلاً
    { availabilityId: 2, doctorId: 8, dayOfWeek: 3, startTime: "16:00:00", endTime: "20:00:00" },
  ]).onConflictDoNothing();

  // 9. جدول المواعيد (Appointments) - تصحيح: يتوقع نصوص للمواعيد والساعات
  console.log("📆 بذر جدول الحجوزات والمواعيد...");
  await db.insert(schema.appointments).values([
    {
      appointmentId: 1,
      patientId: 1,
      doctorId: 8,
      clinicId: 1,
      appointmentDate: "2026-06-01", // تصحيح: نص متوقع
      appointmentTime: "10:00:00",    // تصحيح: إضافة حقل الوقت المستقل
      status: "pending",
      notes: "حالة فحص روتينية مستعجلة",
    }
  ]).onConflictDoNothing();

  // 10. جدول التقييمات (Reviews) - تصحيح: حذف doctorId لأن العلاقة تأتي من الـ appointmentId مباشرة
  console.log("⭐ بذر جدول التقييمات...");
  await db.insert(schema.reviews).values([
    {
      reviewId: 1,
      appointmentId: 1,
      patientId: 1,
      rating: 5,
      comment: "طبيب ممتاز جداً ومتعاون والشرح مسطح ونظيف المظهر!",
    }
  ]).onConflictDoNothing();

  // 11. جدول الإشعارات (Notifications)
  console.log("🔔 بذر جدول الإشعارات...");
  await db.insert(schema.notifications).values([
    {
      notificationId: 1,
      userId: 1,
      title: "حجز جديد",
      message: "تم تسجيل حجز جديد باسم المريض خالد محمد",
      isRead: false,
    },
  ]).onConflictDoNothing();

// ==========================================
  // 12. جداول الرموز (Auth & Refresh Tokens)
  // ==========================================
  console.log("🔑 بذر جداول توكنات الأمان...");
  await db.insert(schema.authTokens).values([
    { 
      id: "11111111-2222-3333-4444-555555555555", // 👈 صيغة UUID حقيقية وصالحة للفحص
      email: "doctor1@sakha.com", 
      tokenHash: "sample_access_token_for_doctor", 
      expiresAt: new Date("2026-12-31") 
    }
  ]).onConflictDoNothing();

  await db.insert(schema.refreshTokens).values([
    { 
      id: "66666666-7777-8888-9999-000000000000", // 👈 صيغة UUID حقيقية وصالحة للفحص
      userId: 1, 
      tokenHash: "sample_refresh_token_for_doctor", 
      expiresAt: new Date("2027-12-31") 
    }
  ]).onConflictDoNothing();
  console.log("🏆 تم التوافق التام مع الـ Types بنجاح 0 أخطاء!");
  await pool.end();
}

main().catch((err) => {
  console.error("❌ حدث خطأ غير متوقع أثناء الـ Seeding:", err);
  process.exit(1);
});
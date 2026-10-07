import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/services/auth.service';
import { UsersService } from './src/users/services/user.service';
import { db } from './src/db/index';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);

  console.log('🔄 إعداد حسابات الاختبار...');
  
  // 1. تهيئة حساب الآدمن
  let adminUser = await db.query.users.findFirst({ where: eq(users.email, 'admin_api@sakha.com') });
  if (!adminUser) {
    const inserted = await db.insert(users).values({ email: 'admin_api@sakha.com', role: 'ADMIN' }).returning();
    adminUser = inserted[0];
  }
  
  // 2. تهيئة حساب المريض
  let patientUser = await db.query.users.findFirst({ where: eq(users.email, 'patient_api@sakha.com') });
  if (!patientUser) {
    const inserted = await db.insert(users).values({ email: 'patient_api@sakha.com', role: 'PATIENT' }).returning();
    patientUser = inserted[0];
  }

  // 3. تهيئة حساب الطبيب
  let doctorUser = await db.query.users.findFirst({ where: eq(users.email, 'doctor_api@sakha.com') });
  if (!doctorUser) {
    const inserted = await db.insert(users).values({ email: 'doctor_api@sakha.com', role: 'DOCTOR' }).returning();
    doctorUser = inserted[0];
  }

  console.log('🔑 توليد التوكنات (JWT Tokens)...');
  const adminTokens = await authService.generateTokens(adminUser.userId, adminUser.email, adminUser.role);
  const patientTokens = await authService.generateTokens(patientUser.userId, patientUser.email, patientUser.role);
  const doctorTokens = await authService.generateTokens(doctorUser.userId, doctorUser.email, doctorUser.role);

  const adminHeaders = { 'Authorization': `Bearer ${adminTokens.accessToken}`, 'Content-Type': 'application/json' };
  const patientHeaders = { 'Authorization': `Bearer ${patientTokens.accessToken}`, 'Content-Type': 'application/json' };
  const doctorHeaders = { 'Authorization': `Bearer ${doctorTokens.accessToken}`, 'Content-Type': 'application/json' };

  // يمكن تغيير البورت إلى 3000 حسب المنفذ الذي يعمل عليه المشروع أو وضع رابط السحابة
  const BASE_URL = 'https://sakhabookingapi-1.onrender.com/api/v1';

  console.log('🚀 بدء تنفيذ الـ Endpoints (محاكاة Postman)...\n');

  try {
    // 1. Create Clinic (Admin)
    console.log('➡️ [ADMIN] POST /clinics');
    const clinicRes = await fetch(`${BASE_URL}/clinics`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        name: 'عيادة اختبار API الجديدة',
        address: 'صنعاء, شارع الزبيري',
        city: 'صنعاء',
        phone: '+967733333333',
        description: 'تم الإنشاء بواسطة سكريبت الاختبار التلقائي'
      })
    });
    const clinicData = await clinicRes.json();
    console.log('✅ Clinic Response:', clinicData);

    const clinicId = clinicData?.clinicId || 1;

    // 2. Create Staff Profile (Admin)
    console.log('\n➡️ [ADMIN] PUT /staff/profile');
    const staffRes = await fetch(`${BASE_URL}/staff/profile`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        fullName: 'مدير النظام التلقائي',
        position: 'Admin',
        phone: '+967711111111',
        clinicId: clinicId
      })
    });
    console.log('✅ Staff Profile Response:', await staffRes.json());

    // 3. Create Doctor Profile (Doctor)
    console.log('\n➡️ [DOCTOR] PUT /doctors/profile');
    const docRes = await fetch(`${BASE_URL}/doctors/profile`, {
      method: 'PUT',
      headers: doctorHeaders,
      body: JSON.stringify({
        fullName: 'د. الطبيب الآلي',
        phone: '+967733222111',
        clinicId: clinicId,
        yearsOfExperience: 5,
        bio: 'طبيب تم إضافته لغرض الاختبار التلقائي',
        status: 'ACTIVE',
        specializationIds: []
      })
    });
    const docProfileData = await docRes.json();
    console.log('✅ Doctor Profile Response:', docProfileData);
    
    // 4. Create Patient Profile (Patient)
    console.log('\n➡️ [PATIENT] PUT /patients/profile');
    const patientProfileRes = await fetch(`${BASE_URL}/patients/profile`, {
      method: 'PUT',
      headers: patientHeaders,
      body: JSON.stringify({
        fullName: 'المريض التلقائي',
        phone: '+967777777777',
        gender: 'male',
        birthDate: '1995-05-10',
        address: 'تعز'
      })
    });
    const patientProfileData = await patientProfileRes.json();
    console.log('✅ Patient Profile Response:', patientProfileData);

    // 5. Setup Availability (Doctor)
    console.log('\n➡️ [DOCTOR] POST /availability');
    const availRes = await fetch(`${BASE_URL}/availability`, {
      method: 'POST',
      headers: doctorHeaders,
      body: JSON.stringify({
        availability: [{
          doctorId: docProfileData?.doctor?.doctorId || docProfileData?.doctorId || 1,
          clinicId: clinicId,
          dayOfWeek: 2, // Tuesday
          startTime: '08:00',
          endTime: '14:00',
          maxPatients: 20
        }]
      })
    });
    const availData = await availRes.json();
    console.log('✅ Availability Response:', availData);

    // 6. Create Appointment (Patient)
    console.log('\n➡️ [PATIENT] POST /appointments');
    const apptRes = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({
        patientId: patientProfileData?.patient?.patientId || patientProfileData?.patientId || 1,
        doctorId: docProfileData?.doctor?.doctorId || docProfileData?.doctorId || 1,
        clinicId: clinicId,
        appointmentDate: '2026-10-13',
        appointmentTime: '10:00:00',
        notes: 'حجز تم عن طريق السكريبت'
      })
    });
    const apptData = await apptRes.json();
    console.log('✅ Appointment Response:', apptData);

    const appointmentId = apptData?.appointment?.appointmentId || apptData?.appointmentId || 1;

    // 7. Add Review (Patient)
    console.log('\n➡️ [PATIENT] POST /reviews');
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: patientHeaders,
      body: JSON.stringify({
        patientId: patientProfileData?.patient?.patientId || patientProfileData?.patientId || 1,
        appointmentId: appointmentId,
        rating: 5,
        comment: 'خدمة ممتازة واختبار ناجح للـ Endpoints!'
      })
    });
    console.log('✅ Review Response:', await reviewRes.json());

    console.log('\n🎉 اكتمل تنفيذ السكريبت واختبار الـ Endpoints بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء تنفيذ الطلبات:', error);
  }

  await app.close();
  process.exit(0);
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});

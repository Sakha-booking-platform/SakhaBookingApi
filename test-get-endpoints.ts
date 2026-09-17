import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/services/auth.service';
import { db } from './src/db/index';
import { users } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  console.log('🔄 إعداد حسابات الاختبار...');
  
  // 1. جلب حساب الآدمن
  const adminUser = await db.query.users.findFirst({ where: eq(users.email, 'admin_api@sakha.com') });
  
  // 2. جلب حساب المريض
  const patientUser = await db.query.users.findFirst({ where: eq(users.email, 'patient_api@sakha.com') });

  // 3. جلب حساب الطبيب
  const doctorUser = await db.query.users.findFirst({ where: eq(users.email, 'doctor_api@sakha.com') });

  if (!adminUser || !patientUser || !doctorUser) {
      console.error('❌ يجب تشغيل سكريبت test-endpoints.ts أولاً لإنشاء الحسابات!');
      await app.close();
      process.exit(1);
  }

  console.log('🔑 توليد التوكنات (JWT Tokens)...');
  const adminTokens = await authService.generateTokens(adminUser.userId, adminUser.email, adminUser.role);
  const patientTokens = await authService.generateTokens(patientUser.userId, patientUser.email, patientUser.role);
  const doctorTokens = await authService.generateTokens(doctorUser.userId, doctorUser.email, doctorUser.role);

  const adminHeaders = { 'Authorization': `Bearer ${adminTokens.accessToken}`, 'Content-Type': 'application/json' };
  const patientHeaders = { 'Authorization': `Bearer ${patientTokens.accessToken}`, 'Content-Type': 'application/json' };
  const doctorHeaders = { 'Authorization': `Bearer ${doctorTokens.accessToken}`, 'Content-Type': 'application/json' };

  const BASE_URL = 'https://sakhabookingapi-1.onrender.com/api/v1';

  console.log('🚀 بدء الاستعلام من الـ Endpoints (GET)...\n');

  try {
    // --- 1. Auth ---
    console.log('➡️ [PATIENT] GET /auth/me');
    const authMeRes = await fetch(`${BASE_URL}/auth/me`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Auth Me Response:', await authMeRes.json());

    // --- 2. Users (Admin only) ---
    console.log('\n➡️ [ADMIN] GET /users/admin/all-users');
    const allUsersRes = await fetch(`${BASE_URL}/users/admin/all-users`, { method: 'GET', headers: adminHeaders });
    console.log('✅ All Users Response:', await allUsersRes.json());

    console.log(`\n➡️ [ADMIN] GET /users/${patientUser.userId}`);
    const userByIdRes = await fetch(`${BASE_URL}/users/${patientUser.userId}`, { method: 'GET', headers: adminHeaders });
    console.log('✅ User By ID Response:', await userByIdRes.json());

    console.log(`\n➡️ [ADMIN] GET /users/search/email?email=${patientUser.email}`);
    const searchEmailRes = await fetch(`${BASE_URL}/users/search/email?email=${patientUser.email}`, { method: 'GET', headers: adminHeaders });
    console.log('✅ Search By Email Response:', await searchEmailRes.json());

    // --- 3. Profiles ---
    console.log('\n➡️ [PATIENT] GET /patients/profile');
    const pProfileRes = await fetch(`${BASE_URL}/patients/profile`, { method: 'GET', headers: patientHeaders });
    const pProfileData = await pProfileRes.json();
    console.log('✅ Patient Profile Response:', pProfileData);
    
    console.log('\n➡️ [DOCTOR] GET /doctors/profile');
    const dProfileRes = await fetch(`${BASE_URL}/doctors/profile`, { method: 'GET', headers: doctorHeaders });
    const dProfileData = await dProfileRes.json();
    console.log('✅ Doctor Profile Response:', dProfileData);

    console.log('\n➡️ [ADMIN] GET /staff/profile');
    const sProfileRes = await fetch(`${BASE_URL}/staff/profile`, { method: 'GET', headers: adminHeaders });
    console.log('✅ Staff Profile Response:', await sProfileRes.json());

    const doctorId = dProfileData?.doctorId || dProfileData?.doctor?.doctorId || 1;
    const patientId = pProfileData?.patientId || pProfileData?.patient?.patientId || 1;

    // --- 4. Clinics ---
    console.log('\n➡️ [PATIENT] GET /clinics');
    const clinicsRes = await fetch(`${BASE_URL}/clinics`, { method: 'GET', headers: patientHeaders });
    const clinicsData = await clinicsRes.json();
    console.log('✅ All Clinics Response:', clinicsData);

    const clinicId = clinicsData?.clinics?.[0]?.clinicId || clinicsData?.[0]?.clinicId || 1;

    console.log(`\n➡️ [PATIENT] GET /clinics/${clinicId}`);
    const singleClinicRes = await fetch(`${BASE_URL}/clinics/${clinicId}`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Single Clinic Response:', await singleClinicRes.json());

    console.log('\n➡️ [PATIENT] GET /clinics/specializations/all');
    const specsRes = await fetch(`${BASE_URL}/clinics/specializations/all`, { method: 'GET', headers: patientHeaders });
    console.log('✅ All Specializations Response:', await specsRes.json());

    // --- 5. Availability ---
    console.log(`\n➡️ [PATIENT] GET /availability/doctor/${doctorId}`);
    const availRes = await fetch(`${BASE_URL}/availability/doctor/${doctorId}`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Doctor Availability Response:', await availRes.json());

    console.log(`\n➡️ [PATIENT] GET /availability/doctor/${doctorId}/calendar`);
    const calendarRes = await fetch(`${BASE_URL}/availability/doctor/${doctorId}/calendar`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Doctor Calendar Response:', await calendarRes.json());

    // --- 6. Appointments ---
    console.log(`\n➡️ [PATIENT] GET /appointments/patient/${patientId}`);
    const ptApptsRes = await fetch(`${BASE_URL}/appointments/patient/${patientId}`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Patient Appointments Response:', await ptApptsRes.json());

    console.log(`\n➡️ [DOCTOR] GET /appointments/doctor/${doctorId}`);
    const docApptsRes = await fetch(`${BASE_URL}/appointments/doctor/${doctorId}`, { method: 'GET', headers: doctorHeaders });
    const docApptsData = await docApptsRes.json();
    console.log('✅ Doctor Appointments Response:', docApptsData);

    const apptId = docApptsData?.data?.[0]?.appointmentId || 1;

    console.log(`\n➡️ [PATIENT] GET /appointments/${apptId}`);
    const singleApptRes = await fetch(`${BASE_URL}/appointments/${apptId}`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Single Appointment Response:', await singleApptRes.json());

    console.log(`\n➡️ [ADMIN] GET /appointments/clinic/${clinicId}`);
    const clinicApptsRes = await fetch(`${BASE_URL}/appointments/clinic/${clinicId}`, { method: 'GET', headers: adminHeaders });
    console.log('✅ Clinic Appointments Response:', await clinicApptsRes.json());

    // --- 7. Reviews ---
    console.log(`\n➡️ [PATIENT] GET /reviews/doctor/${doctorId}`);
    const reviewsRes = await fetch(`${BASE_URL}/reviews/doctor/${doctorId}`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Doctor Reviews Response:', await reviewsRes.json());

    // --- 8. Notifications ---
    console.log(`\n➡️ [PATIENT] GET /notifications/user/${patientUser.userId}`);
    const notifRes = await fetch(`${BASE_URL}/notifications/user/${patientUser.userId}`, { method: 'GET', headers: patientHeaders });
    console.log('✅ Notifications Response:', await notifRes.json());

    console.log('\n🎉 اكتمل تنفيذ سكريبت الاستعلامات (GET) بنجاح!');
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

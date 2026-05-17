ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_patients_patient_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_doctors_doctor_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_clinic_id_clinics_clinic_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_availability" DROP CONSTRAINT "doctor_availability_doctor_id_doctors_doctor_id_fk";
--> statement-breakpoint
ALTER TABLE "doctor_availability" DROP CONSTRAINT "doctor_availability_clinic_id_clinics_clinic_id_fk";
--> statement-breakpoint
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_clinic_id_clinics_clinic_id_fk";
--> statement-breakpoint
ALTER TABLE "doctors_to_specializations" DROP CONSTRAINT "doctors_to_specializations_doctor_id_doctors_doctor_id_fk";
--> statement-breakpoint
ALTER TABLE "doctors_to_specializations" DROP CONSTRAINT "doctors_to_specializations_specialization_id_specializations_specialization_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_clinic_id_clinics_clinic_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_doctor_id_doctors_doctor_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_patient_id_patients_patient_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_appointment_id_appointments_appointment_id_fk";
--> statement-breakpoint
ALTER TABLE "staff" DROP CONSTRAINT "staff_clinic_id_clinics_clinic_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "appointment_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "appointment_time" time NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD CONSTRAINT "doctor_availability_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD CONSTRAINT "doctor_availability_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors_to_specializations" ADD CONSTRAINT "doctors_to_specializations_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors_to_specializations" ADD CONSTRAINT "doctors_to_specializations_specialization_id_specializations_specialization_id_fk" FOREIGN KEY ("specialization_id") REFERENCES "public"."specializations"("specialization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" DROP COLUMN "appointment_datetime";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "clinic_id";--> statement-breakpoint
ALTER TABLE "reviews" DROP COLUMN "doctor_id";--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD CONSTRAINT "doctor_availability_doctor_id_clinic_id_day_of_week_unique" UNIQUE("doctor_id","clinic_id","day_of_week");
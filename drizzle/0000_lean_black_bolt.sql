CREATE TYPE "public"."appointment_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'DOCTOR', 'PATIENT', 'STAFF');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "appointments" (
	"appointment_id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"doctor_id" integer,
	"clinic_id" integer,
	"appointment_date" date NOT NULL,
	"appointment_time" time NOT NULL,
	"queue_number" integer,
	"status" "appointment_status" DEFAULT 'pending',
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "auth_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"role" "role" NOT NULL,
	"token_hash" text NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"clinic_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text,
	"phone" text,
	"clinic_image" text,
	"city" text,
	"price" integer DEFAULT 0,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "doctor_availability" (
	"availability_id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer,
	"clinic_id" integer,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"max_patients" integer,
	CONSTRAINT "doctor_availability_doctor_id_clinic_id_day_of_week_unique" UNIQUE("doctor_id","clinic_id","day_of_week")
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"doctor_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"full_name" text NOT NULL,
	"clinic_id" integer,
	"phone" text,
	"years_of_experience" integer,
	"bio" text,
	"status" "status" DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "doctors_to_specializations" (
	"doctor_id" integer NOT NULL,
	"specialization_id" integer NOT NULL,
	CONSTRAINT "doctors_to_specializations_doctor_id_specialization_id_pk" PRIMARY KEY("doctor_id","specialization_id")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"notification_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"patient_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"full_name" text NOT NULL,
	"phone" text,
	"gender" "gender",
	"birth_date" date,
	"address" text
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"revoked" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"review_id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"appointment_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "reviews_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "specializations" (
	"specialization_id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
CREATE TABLE "staff" (
	"staff_id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"full_name" text NOT NULL,
	"position" text,
	"clinic_id" integer,
	"phone" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"role" "role" DEFAULT 'patient' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD CONSTRAINT "doctor_availability_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_availability" ADD CONSTRAINT "doctor_availability_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors_to_specializations" ADD CONSTRAINT "doctors_to_specializations_doctor_id_doctors_doctor_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("doctor_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors_to_specializations" ADD CONSTRAINT "doctors_to_specializations_specialization_id_specializations_specialization_id_fk" FOREIGN KEY ("specialization_id") REFERENCES "public"."specializations"("specialization_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_appointment_id_appointments_appointment_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("appointment_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff" ADD CONSTRAINT "staff_clinic_id_clinics_clinic_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("clinic_id") ON DELETE cascade ON UPDATE no action;
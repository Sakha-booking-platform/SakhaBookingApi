import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  uuid,
  boolean,
  time,
  date,
  pgEnum,
  primaryKey
} from "drizzle-orm/pg-core";


export const roleEnum = pgEnum("role", ["admin", "doctor", "patient", "staff"]);
export const statusEnum = pgEnum("status", ["active", "inactive", "suspended"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pending", 
  "confirmed", 
  "cancelled", 
  "completed", 
  "no_show"
]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);




/* =========================
   USER 
========================= */
// Stores application users and their login credentials, contact information, role, and account status.
export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),

  email: text("email").notNull().unique(),

  role: roleEnum("role").notNull().default("patient"),

  createdAt: timestamp("created_at").defaultNow(),
});

/* =========================
   DOCTOR 
========================= */
// Holds doctor profiles, their user reference, clinic affiliation, experience, and contact details.
export const doctors = pgTable("doctors", {
  doctorId: serial("doctor_id").primaryKey(),
userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
 
  clinicId: integer("clinic_id").references(() => clinics.clinicId),
  phone: text("phone"),
  yearsOfExperience: integer("years_of_experience"),
  bio: text("bio"),
  status: statusEnum("status").default("active"),
});

/* =========================
   DOCTORS_TO_SPECIALIZATIONS (Junction Table)
========================= */
// Junction table linking doctors to medical specializations, preventing duplicate assignments.
export const doctorsToSpecializations = pgTable("doctors_to_specializations", {
  // معرف الطبيب
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.doctorId),
  
  // معرف التخصص
  specializationId: integer("specialization_id")
    .notNull()
    .references(() => specializations.specializationId),
}, (table) => ({
  // مفتاح أساسي مركب يضمن عدم تكرار نفس التخصص لنفس الطبيب
  pk: primaryKey({ columns: [table.doctorId, table.specializationId] }),
}));

/* =========================
   APPOINTMENT (Updated with Status Enum)
========================= */
// Records patient appointments with doctors, clinic details, timing, status, and optional notes.
export const appointments = pgTable("appointments", {
  appointmentId: serial("appointment_id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.patientId , {onDelete: "restrict"}),
  doctorId: integer("doctor_id").references(() => doctors.doctorId , {onDelete: "restrict"}),
  clinicId: integer("clinic_id").references(() => clinics.clinicId , {onDelete: "restrict"}),
  appointmentDatetime: timestamp("appointment_datetime").notNull(),
  queueNumber: integer("queue_number"),
  status: appointmentStatusEnum("status").default("pending"), // Using Enum
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});




/* =========================
   SPECIALIZATION
========================= */
// Defines medical specializations that doctors can be associated with.
export const specializations = pgTable("specializations", {
  specializationId: serial("specialization_id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

/* =========================
   CLINIC
========================= */
// Contains clinic locations, contact information, pricing, and descriptive details.
export const clinics = pgTable("clinics", {
  clinicId: serial("clinic_id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  phone: text("phone"),
  clinicImage : text("clinic_image"),
  price :integer().default(0),
  description: text("description"),
});

/* =========================
   STAFF
========================= */
// Stores clinic staff members linked to user accounts, including roles and contact info.
export const staff = pgTable("staff", {
  staffId: serial("staff_id").primaryKey(),
userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  position: text("position"),
  clinicId: integer("clinic_id").references(() => clinics.clinicId),
  phone: text("phone"),
});


/* =========================
   PATIENT
========================= */
// Stores patient profiles and demographics linked to user accounts.
export const patients = pgTable("patients", {
  patientId: serial("patient_id").primaryKey(),
userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone : text("phone"),
gender: genderEnum("gender"),
  birthDate: date("birth_date"),
  address: text("address"),
});

/* =========================
   NOTIFICATION
========================= */
// Tracks notifications sent to users, including read status and message payload.
export const notifications = pgTable("notifications", {
  notificationId: serial("notification_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Defines doctor availability windows by day, time range, and maximum patients per slot.
export const doctorAvailability = pgTable("doctor_availability", {
  availabilityId: serial("availability_id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.doctorId),
  clinicId: integer("clinic_id").references(() => clinics.clinicId),
  
  dayOfWeek: integer("day_of_week").notNull(), // 0 (الأحد) إلى 6 (السبت)
  startTime: time("start_time").notNull(), 
endTime: time("end_time").notNull(),
  maxPatients: integer("max_patients"), // أقصى عدد مرضى في هذا اليوم (اختياري)
});


/* =========================
   REVIEWS & RATINGS (Combined)
========================= */
// Records patient reviews and ratings for doctors and clinics, optionally tied to appointments.
export const reviews = pgTable("reviews", {
  reviewId: serial("review_id").primaryKey(),
  
  patientId: integer("patient_id")
    .references(() => patients.patientId)
    .notNull(),
  clinicId: integer("clinic_id").references(() => clinics.clinicId),
  doctorId: integer("doctor_id").references(() => doctors.doctorId),
  rating: integer("rating").notNull(), // النجوم (1-5)
  comment: text("comment"),

  appointmentId: integer("appointment_id")
    .references(() => appointments.appointmentId)
    .unique(), 

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});


// Stores short-lived authentication tokens for email-based verification and one-time access.
export const authTokens = pgTable('auth_tokens', {
  id: uuid('id')
    .defaultRandom()
    .primaryKey(),

  email: text('email')
    .notNull(),

  tokenHash: text('token_hash')
    .notNull(),

  used: boolean('used')
    .default(false)
    .notNull(),

  expiresAt: timestamp('expires_at')
    .notNull(),

  createdAt: timestamp('created_at')
    .defaultNow()
    .notNull(),
});

//
// Stores refresh tokens for longer-lived user sessions and token rotation.
export const refreshTokens =
  pgTable('refresh_tokens', {

    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    userId: integer('user_id')
      .notNull(),

    tokenHash: text('token_hash')
      .notNull(),

    revoked: boolean('revoked')
      .default(false)
      .notNull(),

    expiresAt: timestamp('expires_at')
      .notNull(),

    createdAt: timestamp('created_at')
      .defaultNow()
      .notNull(),

    lastUsedAt: timestamp('last_used_at'),
  });
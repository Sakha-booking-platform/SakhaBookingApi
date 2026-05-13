import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
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
export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  role: roleEnum("role").notNull().default("patient"), // Using Enum here
  createdAt: timestamp("created_at").defaultNow(),
  status: statusEnum("status").default("active"),
});

/* =========================
   DOCTOR 
========================= */
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
export const specializations = pgTable("specializations", {
  specializationId: serial("specialization_id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

/* =========================
   CLINIC
========================= */
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
export const patients = pgTable("patients", {
  patientId: serial("patient_id").primaryKey(),
userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
gender: genderEnum("gender"),
  birthDate: date("birth_date"),
  address: text("address"),
});

/* =========================
   NOTIFICATION
========================= */
export const notifications = pgTable("notifications", {
  notificationId: serial("notification_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

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
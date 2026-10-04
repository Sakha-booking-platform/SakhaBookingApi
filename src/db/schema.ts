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
  primaryKey,
  unique,
  varchar
} from "drizzle-orm/pg-core";

import { relations } from 'drizzle-orm';


export const roleEnum = pgEnum("role", ["ADMIN", "DOCTOR", "PATIENT", "STAFF"]);
export const statusEnum = pgEnum("status", ["ACTIVE", "INACTIVE", "SUSPENDED"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "COMPLETED",
  "NO_SHOW"
]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const users = pgTable("users", {
  userId: serial("user_id").primaryKey(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").notNull().default("PATIENT"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clinics = pgTable("clinics", {
  clinicId: serial("clinic_id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  phone: text("phone"),
  clinicImage: text("clinic_image"),
  city: text("city"),
  price: integer().default(0),
  requiresPrepayment: boolean('requires_prepayment').default(false).notNull(),
  paymentInstructions: text('payment_instructions'),
  description: text("description"),
});

export const specializations = pgTable("specializations", {
  specializationId: serial("specialization_id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const doctors = pgTable("doctors", {
  doctorId: serial("doctor_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  clinicId: integer("clinic_id").references(() => clinics.clinicId, { onDelete: "set null" }),
  phone: text("phone"),
  yearsOfExperience: integer("years_of_experience"),
  bio: text("bio"),
  status: statusEnum("status").default("ACTIVE"),
});

export const doctorsToSpecializations = pgTable("doctors_to_specializations", {
  doctorId: integer("doctor_id")
    .notNull()
    .references(() => doctors.doctorId, { onDelete: "cascade" }),
  specializationId: integer("specialization_id")
    .notNull()
    .references(() => specializations.specializationId, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.doctorId, table.specializationId] }),
}));

export const staff = pgTable("staff", {
  staffId: serial("staff_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  position: text("position"),
  clinicId: integer("clinic_id").references(() => clinics.clinicId, { onDelete: "cascade" }),
  phone: text("phone"),
});

export const patients = pgTable("patients", {
  patientId: serial("patient_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  gender: genderEnum("gender"),
  birthDate: date("birth_date"),
  address: text("address"),
});


export const appointments = pgTable("appointments", {
  appointmentId: serial("appointment_id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.patientId, { onDelete: "set null" }),
  doctorId: integer("doctor_id").references(() => doctors.doctorId, { onDelete: "set null" }),
  clinicId: integer("clinic_id").references(() => clinics.clinicId, { onDelete: "set null" }),
  availabilityId: integer("availability_id").references(() => doctorAvailability.availabilityId, { onDelete: "set null" }),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  periodType: text("period_type"), // 'morning' أو 'evening'
  queueNumber: integer("queue_number"),
  status: appointmentStatusEnum("status").default("PENDING"),
  notes: text("notes"),
  paymentReference: varchar('payment_reference', { length: 100 }), // رقم مرجع الحوالة
  paymentAttachment: text('payment_attachment'), // رابط صورة إشعار التحويل (لقطة الشاشة)
  isPaymentVerified: boolean('is_payment_verified').default(false).notNull(), // هل قامت السكرتيرة بتأكيد الحوالة؟
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  notificationId: serial("notification_id").primaryKey(),
  userId: integer("user_id").references(() => users.userId, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const doctorAvailability = pgTable("doctor_availability", {
  availabilityId: serial("availability_id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.doctorId, { onDelete: "cascade" }),
  clinicId: integer("clinic_id").references(() => clinics.clinicId, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  maxPatients: integer("max_patients"),
}, (table) => ({
  uniqAvailability: unique().on(table.doctorId, table.clinicId, table.dayOfWeek, table.startTime),
}));


export const doctorExceptions = pgTable("doctor_exceptions", {
  exceptionId: serial("exception_id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.doctorId, { onDelete: "cascade" }),
  clinicId: integer("clinic_id").references(() => clinics.clinicId, { onDelete: "cascade" }),

  // التاريخ المحدد للاستثناء (مثلاً: 2026-05-22 وهو يوم جمعة)
  specificDate: date("specific_date").notNull(),

  // هل العيادة مغلقة في هذا التاريخ؟
  isClosed: boolean("is_closed").default(false).notNull(),

  // إذا لم تكن مغلقة، هل هناك أوقات دوام خاصة بهذا اليوم تحديداً؟ (اختياري)
  startTime: time("start_time"),
  endTime: time("end_time"),

  // سبب الإجازة أو التعديل (مثال: "إجازة عيد العمال" أو "دوام تعويضي")
  reason: text("reason"),
});

export const reviews = pgTable("reviews", {
  reviewId: serial("review_id").primaryKey(),
  patientId: integer("patient_id")
    .references(() => patients.patientId, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  appointmentId: integer("appointment_id")
    .references(() => appointments.appointmentId, { onDelete: "set null" })
    .unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const authTokens = pgTable('auth_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  role: roleEnum('role').default('PATIENT').notNull(),
  tokenHash: text('token_hash').notNull(),
  used: boolean('used').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  revoked: boolean('revoked').default(false).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastUsedAt: timestamp('last_used_at'),
});

// استورد جداولك هنا (doctors, specializations, doctorsToSpecializations)

// 1. علاقات جدول الأطباء (Doctors Relations)
export const doctorsRelations = relations(doctors, ({ many }) => ({
  doctorsToSpecializations: many(doctorsToSpecializations),
}));

// 2. علاقات جدول التخصصات (Specializations Relations)
export const specializationsRelations = relations(specializations, ({ many }) => ({
  doctorsToSpecializations: many(doctorsToSpecializations),
}));

// 3. علاقات جدول الربط المشترك (Junction Table Relations) - هنا يكمن الخطأ غالباً
export const doctorsToSpecializationsRelations = relations(doctorsToSpecializations, ({ one }) => ({
  doctor: one(doctors, {
    fields: [doctorsToSpecializations.doctorId],
    references: [doctors.doctorId], // ⚠️ تأكد أن هذا الاسم يطابق مفتاح الطبيب الأساسي لديك
  }),
  specialization: one(specializations, {
    fields: [doctorsToSpecializations.specializationId],
    references: [specializations.specializationId], // ⚠️ تأكد أن هذا الاسم يطابق مفتاح التخصص الأساسي لديك
  }),
}));
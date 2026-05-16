import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  users,
  doctors,
  doctorsToSpecializations,
  appointments,
  specializations,
  clinics,
  staff,
  patients,
  notifications,
  doctorAvailability,
  reviews,
  authTokens,
  refreshTokens,
} from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    users,
    doctors,
    doctorsToSpecializations,
    appointments,
    specializations,
    clinics,
    staff,
    patients,
    notifications,
    doctorAvailability,
    reviews,
    authTokens,
    refreshTokens,
  },
}); 
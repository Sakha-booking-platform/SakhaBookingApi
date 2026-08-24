import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema"; // 👈 هنا يكمن السحر: استيراد كل شيء أوتوماتيكياً (جداول وعلاقات)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// الآن الدريزل سيقرأ شجرة الجداول والعلاقات كاملة تلقائياً
export const db = drizzle(pool, { schema });
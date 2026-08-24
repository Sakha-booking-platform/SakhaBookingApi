BEGIN;

ALTER TABLE clinics ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE clinics ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS profile_image text;
ALTER TABLE specializations ADD COLUMN IF NOT EXISTS icon text;

CREATE INDEX IF NOT EXISTS idx_clinics_city ON clinics(city);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic_id ON doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);
CREATE INDEX IF NOT EXISTS idx_dts_specialization_id ON doctors_to_specializations(specialization_id);
CREATE INDEX IF NOT EXISTS idx_dts_doctor_id ON doctors_to_specializations(doctor_id);

COMMIT;

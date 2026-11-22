-- Ejecutar con el propietario de las migraciones. Asignar los grupos a logins distintos.
DO $$
BEGIN
 IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='becas_reader') THEN CREATE ROLE becas_reader NOLOGIN; END IF;
 IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='becas_editor') THEN CREATE ROLE becas_editor NOLOGIN; END IF;
END $$;
GRANT USAGE ON SCHEMA public TO becas_reader,becas_editor;
GRANT SELECT ON "Institution","Program","Scholarship","AcademicLevel","StudyArea","Country","Source","Evidence","Requirement","Benefit","Channel","_AcademicLevelToScholarship","_CountryToScholarship","_ScholarshipToStudyArea" TO becas_reader;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA public TO becas_editor;
REVOKE ALL ON "_prisma_migrations" FROM becas_editor;
REVOKE UPDATE,DELETE ON "ReviewEvent","Evidence" FROM becas_editor;
GRANT SELECT, INSERT ON "SearchJob" TO becas_reader;

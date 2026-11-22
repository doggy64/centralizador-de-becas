ALTER TABLE "Scholarship"
  ADD CONSTRAINT "publication_requires_verification" CHECK ("status" <> 'PUBLISHED' OR "lastVerifiedAt" IS NOT NULL),
  ADD CONSTRAINT "one_deadline_precision" CHECK ("deadlineDay" IS NULL OR "deadlineAt" IS NULL);
ALTER TABLE "Channel"
  ADD CONSTRAINT "channel_type" CHECK ("type" IN ('FORM_URL','PORTAL_URL','EMAIL')),
  ADD CONSTRAINT "channel_purpose" CHECK ("purpose" IN ('APPLY','CONTACT')),
  ADD CONSTRAINT "channel_verification" CHECK ("verification" IN ('PENDING','VERIFIED','INVALID','STALE')),
  ADD CONSTRAINT "channel_verified_date" CHECK ("verification" <> 'VERIFIED' OR "verifiedAt" IS NOT NULL);
ALTER TABLE "Evidence" ADD CONSTRAINT "page_positive" CHECK ("pageNumber" IS NULL OR "pageNumber" >= 1);

-- La CLI guarda la decisión y el evento en la misma transacción.
CREATE FUNCTION check_publication_review() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."status" = 'PUBLISHED' THEN
    IF TG_OP = 'INSERT' THEN RAISE EXCEPTION 'Una convocatoria nace como borrador'; END IF;
    IF OLD."status" <> 'IN_REVIEW' OR NOT EXISTS (
      SELECT 1 FROM "ReviewEvent" WHERE "callId" = NEW.id AND action = 'publish'
        AND length(trim(actor)) > 0
        AND xmin = pg_current_xact_id()::xid
    ) THEN RAISE EXCEPTION 'Falta aprobación editorial en esta transacción'; END IF;
  END IF;
  RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER scholarship_review
AFTER INSERT OR UPDATE OF "status" ON "Scholarship"
DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_publication_review();

CREATE TABLE IF NOT EXISTS "Contacts" (
  "id" SERIAL PRIMARY KEY,
  "phoneNumber" VARCHAR(255) NULL,
  "email" VARCHAR(255) NULL,
  "linkedId" INTEGER NULL REFERENCES "Contacts" ("id") ON UPDATE CASCADE ON DELETE SET NULL,
  "linkPrecedence" VARCHAR(10) NOT NULL DEFAULT 'primary' CHECK ("linkPrecedence" IN ('primary', 'secondary')),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
  "deletedAt" TIMESTAMP WITH TIME ZONE NULL
);

CREATE INDEX IF NOT EXISTS "contacts_email" ON "Contacts" ("email");
CREATE INDEX IF NOT EXISTS "contacts_phone_number" ON "Contacts" ("phoneNumber");
CREATE INDEX IF NOT EXISTS "contacts_linked_id" ON "Contacts" ("linkedId");

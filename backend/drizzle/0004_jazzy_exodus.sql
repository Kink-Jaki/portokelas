ALTER TABLE "users" ADD COLUMN "nim" text;--> statement-breakpoint
CREATE UNIQUE INDEX "users_nim_unique" ON "users" USING btree ("nim");
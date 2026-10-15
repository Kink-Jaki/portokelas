CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"reporter_user_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ngl_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text,
	"spotify_type" text,
	"spotify_id" text,
	"image_path" text,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ngl_messages_has_payload" CHECK ("ngl_messages"."content" is not null or "ngl_messages"."spotify_id" is not null or "ngl_messages"."image_path" is not null)
);
--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_message_id_ngl_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ngl_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reads" ADD CONSTRAINT "message_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reports" ADD CONSTRAINT "message_reports_message_id_ngl_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."ngl_messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_reports" ADD CONSTRAINT "message_reports_reporter_user_id_users_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "message_reads_message_user_unique" ON "message_reads" USING btree ("message_id","user_id");--> statement-breakpoint
CREATE INDEX "message_reads_message_id_idx" ON "message_reads" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_reads_user_id_idx" ON "message_reads" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "message_reports_message_reporter_unique" ON "message_reports" USING btree ("message_id","reporter_user_id");--> statement-breakpoint
CREATE INDEX "message_reports_message_id_idx" ON "message_reports" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "message_reports_reporter_user_id_idx" ON "message_reports" USING btree ("reporter_user_id");--> statement-breakpoint
CREATE INDEX "message_reports_status_idx" ON "message_reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "ngl_messages_created_at_idx" ON "ngl_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "ngl_messages_is_hidden_idx" ON "ngl_messages" USING btree ("is_hidden");--> statement-breakpoint
INSERT INTO "app_settings" ("key", "value", "updated_at") VALUES ('ngl_enabled', 'false'::jsonb, now()) ON CONFLICT ("key") DO NOTHING;
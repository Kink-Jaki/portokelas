CREATE TABLE "memory_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"video_url" text NOT NULL,
	"caption" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

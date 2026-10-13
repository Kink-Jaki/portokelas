CREATE TABLE "heroes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image1_url" text,
	"image2_url" text,
	"image3_url" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TYPE "public"."log_type" AS ENUM('SYS', 'AI', 'DB', 'WARN');--> statement-breakpoint
CREATE TYPE "public"."severity_level" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('PENDING', 'INVESTIGATING', 'QUEUED', 'SCHEDULED', 'IN_PROGRESS', 'RESOLVED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('CITIZEN', 'OFFICIAL', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('valid', 'duplicate', 'resolved');--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"severity" text DEFAULT 'MEDIUM' NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"assigned_dept" text DEFAULT 'Municipal Admin' NOT NULL,
	"reported_by" text NOT NULL,
	"reported_by_id" text,
	"reported_at" text NOT NULL,
	"image_url" text NOT NULL,
	"location_name" text NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"ai_confidence" double precision DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "departments_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" text PRIMARY KEY NOT NULL,
	"area_name" text NOT NULL,
	"risk_score" double precision NOT NULL,
	"predicted_issue" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"type" text NOT NULL,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "timeline_items" (
	"id" text PRIMARY KEY NOT NULL,
	"complaint_id" text NOT NULL,
	"status" text NOT NULL,
	"description" text NOT NULL,
	"timestamp" text NOT NULL,
	"is_current" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"uid" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" text DEFAULT 'CITIZEN' NOT NULL,
	"points" integer DEFAULT 100 NOT NULL,
	"joined_at" text NOT NULL,
	"avatar_url" text DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150' NOT NULL,
	"password_hash" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"complaint_id" text NOT NULL,
	"user_id" text NOT NULL,
	"vote_type" text DEFAULT 'valid' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_reported_by_id_users_uid_fk" FOREIGN KEY ("reported_by_id") REFERENCES "public"."users"("uid") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timeline_items" ADD CONSTRAINT "timeline_items_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_complaint_id_complaints_id_fk" FOREIGN KEY ("complaint_id") REFERENCES "public"."complaints"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verifications" ADD CONSTRAINT "verifications_user_id_users_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("uid") ON DELETE cascade ON UPDATE no action;
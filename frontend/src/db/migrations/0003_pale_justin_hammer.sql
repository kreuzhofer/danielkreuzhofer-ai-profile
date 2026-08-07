CREATE TABLE "workshop_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workshop_id" uuid NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"company" text NOT NULL,
	"role" text,
	"second_person_name" text,
	"second_person_email" text,
	"invoice_company" text NOT NULL,
	"invoice_contact_name" text NOT NULL,
	"invoice_email" text NOT NULL,
	"invoice_street" text NOT NULL,
	"invoice_zip" text NOT NULL,
	"invoice_city" text NOT NULL,
	"invoice_country" text DEFAULT 'Deutschland' NOT NULL,
	"invoice_ust_id" text,
	"is_small_business" boolean DEFAULT false NOT NULL,
	"payment_preference" text NOT NULL,
	"newsletter_opt_in" boolean DEFAULT false NOT NULL,
	"newsletter_doi_confirmed_at" timestamp with time zone,
	"status" text DEFAULT 'reserved' NOT NULL,
	"reserved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"booked_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"tracking_id" text,
	"lead_reported_at" timestamp with time zone,
	"revenue_reported_at" timestamp with time zone,
	"confirm_payment_token" text,
	"cancel_token" text,
	"ip_at_submit" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"termin" timestamp with time zone,
	"duration_min" integer DEFAULT 90 NOT NULL,
	"price_net_eur" integer NOT NULL,
	"capacity" integer NOT NULL,
	"min_booked_to_run" integer NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"format" text DEFAULT 'live_online' NOT NULL,
	"location_label" text DEFAULT 'live online' NOT NULL,
	"recording_hint" boolean DEFAULT true NOT NULL,
	"admin_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workshops_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "workshop_submissions" ADD CONSTRAINT "workshop_submissions_workshop_id_workshops_id_fk" FOREIGN KEY ("workshop_id") REFERENCES "public"."workshops"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "workshop_submissions_workshop_id_idx" ON "workshop_submissions" USING btree ("workshop_id");--> statement-breakpoint
CREATE INDEX "workshop_submissions_status_idx" ON "workshop_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "workshop_submissions_email_idx" ON "workshop_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "workshop_submissions_tracking_id_idx" ON "workshop_submissions" USING btree ("tracking_id");--> statement-breakpoint
CREATE INDEX "workshops_slug_idx" ON "workshops" USING btree ("slug");
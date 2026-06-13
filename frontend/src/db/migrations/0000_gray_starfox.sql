CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scorecard" text DEFAULT 'engpass-check' NOT NULL,
	"email" text NOT NULL,
	"answers" jsonb NOT NULL,
	"score" integer NOT NULL,
	"band" text NOT NULL,
	"typ" text NOT NULL,
	"weg" text NOT NULL,
	"qualified" boolean NOT NULL,
	"doi_status" text DEFAULT 'pending' NOT NULL,
	"doi_token" text NOT NULL,
	"report_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"ip_at_submit" text,
	"user_agent" text,
	"cleverreach_synced" boolean DEFAULT false NOT NULL,
	CONSTRAINT "submissions_doi_token_unique" UNIQUE("doi_token"),
	CONSTRAINT "submissions_report_token_unique" UNIQUE("report_token")
);
--> statement-breakpoint
CREATE INDEX "submissions_scorecard_idx" ON "submissions" USING btree ("scorecard");--> statement-breakpoint
CREATE INDEX "submissions_created_at_idx" ON "submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "submissions_typ_idx" ON "submissions" USING btree ("typ");--> statement-breakpoint
CREATE INDEX "submissions_weg_idx" ON "submissions" USING btree ("weg");
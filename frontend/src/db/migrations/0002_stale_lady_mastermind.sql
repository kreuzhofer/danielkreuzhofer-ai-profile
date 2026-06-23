CREATE TABLE "scorecard_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scorecard" text NOT NULL,
	"email" text NOT NULL,
	"answers" jsonb NOT NULL,
	"result" jsonb NOT NULL,
	"doi_status" text DEFAULT 'pending' NOT NULL,
	"doi_token" text NOT NULL,
	"report_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmed_at" timestamp with time zone,
	"ip_at_submit" text,
	"user_agent" text,
	"tid" text,
	"cleverreach_synced" boolean DEFAULT false NOT NULL,
	CONSTRAINT "scorecard_submissions_doi_token_unique" UNIQUE("doi_token"),
	CONSTRAINT "scorecard_submissions_report_token_unique" UNIQUE("report_token")
);
--> statement-breakpoint
CREATE INDEX "scorecard_submissions_scorecard_idx" ON "scorecard_submissions" USING btree ("scorecard");--> statement-breakpoint
CREATE INDEX "scorecard_submissions_created_at_idx" ON "scorecard_submissions" USING btree ("created_at");
-- Phase 16: Database integration additions

-- New enums
CREATE TYPE "public"."service_item_type" AS ENUM('part', 'labor');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('paid', 'pending', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."purchase_order_status" AS ENUM('draft', 'sent', 'received', 'cancelled');--> statement-breakpoint

-- Extend user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "cpf" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "address" text;--> statement-breakpoint

-- Extend service_orders table
ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "client_report" text;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "diagnosis" text;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "service_type" text;--> statement-breakpoint
ALTER TABLE "service_orders" ADD COLUMN IF NOT EXISTS "priority" text NOT NULL DEFAULT 'normal';--> statement-breakpoint

-- Extend service_order_items table
ALTER TABLE "service_order_items" ADD COLUMN IF NOT EXISTS "item_type" "service_item_type" NOT NULL DEFAULT 'part';--> statement-breakpoint
ALTER TABLE "service_order_items" ADD COLUMN IF NOT EXISTS "approved" boolean NOT NULL DEFAULT true;--> statement-breakpoint

-- New transactions table
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"status" "transaction_status" DEFAULT 'pending' NOT NULL,
	"service_order_id" uuid,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);--> statement-breakpoint

-- New purchase_orders table
CREATE TABLE IF NOT EXISTS "purchase_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"supplier" text NOT NULL,
	"status" "purchase_order_status" DEFAULT 'draft' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"expected_delivery" timestamp,
	"notes" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);--> statement-breakpoint

-- New purchase_order_items table
CREATE TABLE IF NOT EXISTS "purchase_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"purchase_order_id" uuid NOT NULL,
	"service_id" uuid,
	"description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price" numeric(12, 2) DEFAULT '0' NOT NULL
);--> statement-breakpoint

-- Foreign keys
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_service_order_id_service_orders_id_fk"
  FOREIGN KEY ("service_order_id") REFERENCES "public"."service_orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_purchase_order_id_purchase_orders_id_fk"
  FOREIGN KEY ("purchase_order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_service_id_services_id_fk"
  FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;

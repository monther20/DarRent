CREATE TABLE "users" (
  "id" text PRIMARY KEY,
  "email" text UNIQUE NOT NULL,
  "password" text,
  "full_name_en" text,
  "full_name_ar" text,
  "phone" text,
  "profile_picture" text,
  "registration_date" timestamp,
  "status" text,
  "rating" float
);

CREATE TABLE "landlords" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "bank_account" text,
  "verification_status_en" text,
  "verification_status_ar" text,
  "rating" float
);

CREATE TABLE "renters" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "preferred_location_en" text,
  "preferred_location_ar" text,
  "budget" decimal,
  "rating" float
);

CREATE TABLE "properties" (
  "id" text PRIMARY KEY,
  "title_en" text,
  "title_ar" text,
  "description_en" text,
  "description_ar" text,
  "rent_amount" decimal,
  "security_deposit" decimal,
  "status" text,
  "listing_date" timestamp,
  "number_of_rooms" int,
  "square_footage" int,
  "property_type_en" text,
  "property_type_ar" text,
  "availability_date" timestamp,
  "owner_id" text,
  "city_en" text,
  "city_ar" text,
  "area_en" text,
  "area_ar" text,
  "latitude" decimal,
  "longitude" decimal,
  "views" int,
  "inquiries" int,
  "days_listed" int
);

CREATE TABLE "property_images" (
  "id" text PRIMARY KEY,
  "property_id" text,
  "image_url" text,
  "upload_date" timestamp,
  "is_main_image" boolean
);

CREATE TABLE "rental_contracts" (
  "id" text PRIMARY KEY,
  "property_id" text,
  "renter_id" text,
  "start_date" timestamp,
  "end_date" timestamp,
  "monthly_rent" decimal,
  "security_deposit" decimal,
  "status" text,
  "payment_due_day" int,
  "created_at" timestamp,
  "signed_document" boolean,
  "document_url" text
);

CREATE TABLE "payments" (
  "id" text PRIMARY KEY,
  "contract_id" text,
  "amount" decimal,
  "payment_date" timestamp,
  "due_date" timestamp,
  "payment_type" text,
  "status" text,
  "transaction_reference" text
);

CREATE TABLE "transactions" (
  "id" text PRIMARY KEY,
  "property_id" text,
  "renter_id" text,
  "landlord_id" text,
  "amount" decimal,
  "currency" text,
  "type" text,
  "status" text,
  "due_date" timestamp,
  "paid_date" timestamp,
  "description_en" text,
  "description_ar" text
);

CREATE TABLE "evaluations" (
  "id" text PRIMARY KEY,
  "reviewer_id" text,
  "reviewee_id" text,
  "rating" float,
  "comment_en" text,
  "comment_ar" text,
  "date" timestamp,
  "type" text
);

CREATE TABLE "applications" (
  "id" text PRIMARY KEY,
  "property_id" text,
  "renter_id" text,
  "status" text,
  "created_at" timestamp,
  "id_card" boolean,
  "proof_of_income" boolean,
  "bank_statement" boolean,
  "progress" int
);

CREATE TABLE "messages" (
  "id" text PRIMARY KEY,
  "sender_id" text,
  "receiver_id" text,
  "content_en" text,
  "content_ar" text,
  "timestamp" timestamp,
  "is_read" boolean,
  "property_id" text
);

CREATE TABLE "UserVerification" (
  "id" text PRIMARY KEY,
  "user_id" text,
  "id_card_url" text,
  "proof_of_address_url" text,
  "submitted_at" timestamp,
  "verified_at" timestamp,
  "status" text,
  "notes_en" text,
  "notes_ar" text
);

CREATE TABLE "maintenance_requests" (
  "id" text PRIMARY KEY,
  "renter_id" text,
  "property_id" text,
  "title_en" text,
  "title_ar" text,
  "description_en" text,
  "description_ar" text,
  "location_en" text,
  "location_ar" text,
  "status" text,
  "priority" text,
  "created_at" timestamp,
  "updated_at" timestamp,
  "completed_at" timestamp
);

CREATE TABLE "maintenance_status_history" (
  "id" text PRIMARY KEY,
  "request_id" text,
  "previous_status" text,
  "new_status" text,
  "changed_by" text,
  "changed_at" timestamp,
  "notes_en" text,
  "notes_ar" text
);

CREATE TABLE "maintenance_attachments" (
  "id" text PRIMARY KEY,
  "request_id" text,
  "file_url" text,
  "file_type" text,
  "created_at" timestamp
);

ALTER TABLE "landlords" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "renters" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "properties" ADD FOREIGN KEY ("owner_id") REFERENCES "landlords" ("id");
ALTER TABLE "property_images" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id");
ALTER TABLE "rental_contracts" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id");
ALTER TABLE "rental_contracts" ADD FOREIGN KEY ("renter_id") REFERENCES "renters" ("id");
ALTER TABLE "payments" ADD FOREIGN KEY ("contract_id") REFERENCES "rental_contracts" ("id");
ALTER TABLE "transactions" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id");
ALTER TABLE "transactions" ADD FOREIGN KEY ("renter_id") REFERENCES "renters" ("id");
ALTER TABLE "transactions" ADD FOREIGN KEY ("landlord_id") REFERENCES "landlords" ("id");
ALTER TABLE "evaluations" ADD FOREIGN KEY ("reviewer_id") REFERENCES "users" ("id");
ALTER TABLE "evaluations" ADD FOREIGN KEY ("reviewee_id") REFERENCES "users" ("id");
ALTER TABLE "applications" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id");
ALTER TABLE "applications" ADD FOREIGN KEY ("renter_id") REFERENCES "renters" ("id");
ALTER TABLE "messages" ADD FOREIGN KEY ("sender_id") REFERENCES "users" ("id");
ALTER TABLE "messages" ADD FOREIGN KEY ("receiver_id") REFERENCES "users" ("id");
ALTER TABLE "messages" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id");
ALTER TABLE "UserVerification" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "maintenance_requests" ADD FOREIGN KEY ("renter_id") REFERENCES "renters" ("id");
ALTER TABLE "maintenance_requests" ADD FOREIGN KEY ("property_id") REFERENCES "properties" ("id");
ALTER TABLE "maintenance_status_history" ADD FOREIGN KEY ("request_id") REFERENCES "maintenance_requests" ("id");
ALTER TABLE "maintenance_status_history" ADD FOREIGN KEY ("changed_by") REFERENCES "users" ("id");
ALTER TABLE "maintenance_attachments" ADD FOREIGN KEY ("request_id") REFERENCES "maintenance_requests" ("id");

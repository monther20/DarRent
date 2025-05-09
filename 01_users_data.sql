-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clear existing data (if any)
DELETE FROM maintenance_attachments;
DELETE FROM maintenance_status_history;
DELETE FROM maintenance_requests;
DELETE FROM UserVerification;
DELETE FROM messages;
DELETE FROM applications;
DELETE FROM evaluations;
DELETE FROM transactions;
DELETE FROM payments;
DELETE FROM rental_contracts;
DELETE FROM property_images;
DELETE FROM properties;
DELETE FROM landlords;
DELETE FROM renters;
DELETE FROM users;

-- Insert users (20 users: 4 landlords, 16 renters)
INSERT INTO users (id, email, password, full_name_en, full_name_ar, phone, profile_picture, registration_date, status, rating)
VALUES
-- Landlords (4)
('l1', 'ahmed.khan@example.com', NULL, 'Ahmed Khan', 'أحمد خان', '+966501234567', 'profile-pictures/ahmed_khan.jpg', '2022-01-15', 'active', 4.7),
('l2', 'fatima.ali@example.com', NULL, 'Fatima Ali', 'فاطمة علي', '+966512345678', 'profile-pictures/fatima_ali.jpg', '2022-02-10', 'active', 4.8),
('l3', 'omar.hassan@example.com', NULL, 'Omar Hassan', 'عمر حسن', '+966523456789', 'profile-pictures/omar_hassan.jpg', '2022-03-05', 'active', 4.5),
('l4', 'layla.mahmoud@example.com', NULL, 'Layla Mahmoud', 'ليلى محمود', '+966534567890', 'profile-pictures/layla_mahmoud.jpg', '2022-04-20', 'active', 4.9),

-- Renters (16)
('r1', 'mohammad.abbas@example.com', NULL, 'Mohammad Abbas', 'محمد عباس', '+966545678901', 'profile-pictures/mohammad_abbas.jpg', '2022-01-20', 'active', 4.6),
('r2', 'sarah.talal@example.com', NULL, 'Sarah Talal', 'سارة طلال', '+966556789012', 'profile-pictures/sarah_talal.jpg', '2022-02-15', 'active', 4.8),
('r3', 'khalid.nasser@example.com', NULL, 'Khalid Nasser', 'خالد ناصر', '+966567890123', 'profile-pictures/khalid_nasser.jpg', '2022-03-10', 'active', 4.5),
('r4', 'nora.saeed@example.com', NULL, 'Nora Saeed', 'نورة سعيد', '+966578901234', 'profile-pictures/nora_saeed.jpg', '2022-04-05', 'active', 4.7),
('r5', 'yusuf.malik@example.com', NULL, 'Yusuf Malik', 'يوسف مالك', '+966589012345', 'profile-pictures/yusuf_malik.jpg', '2022-05-12', 'active', 4.4),
('r6', 'aisha.faisal@example.com', NULL, 'Aisha Faisal', 'عائشة فيصل', '+966590123456', 'profile-pictures/aisha_faisal.jpg', '2022-06-20', 'active', 4.9),
('r7', 'rashid.abdullah@example.com', NULL, 'Rashid Abdullah', 'رشيد عبدالله', '+966601234567', 'profile-pictures/rashid_abdullah.jpg', '2022-07-15', 'active', 4.3),
('r8', 'maryam.zain@example.com', NULL, 'Maryam Zain', 'مريم زين', '+966612345678', 'profile-pictures/maryam_zain.jpg', '2022-08-10', 'active', 4.6),
('r9', 'tariq.ahmed@example.com', NULL, 'Tariq Ahmed', 'طارق أحمد', '+966623456789', 'profile-pictures/tariq_ahmed.jpg', '2022-09-05', 'active', 4.2),
('r10', 'hana.majid@example.com', NULL, 'Hana Majid', 'هناء ماجد', '+966634567890', 'profile-pictures/hana_majid.jpg', '2022-10-20', 'active', 4.5),
('r11', 'fadi.khalil@example.com', NULL, 'Fadi Khalil', 'فادي خليل', '+966645678901', 'profile-pictures/fadi_khalil.jpg', '2022-11-15', 'active', 4.8),
('r12', 'dana.salem@example.com', NULL, 'Dana Salem', 'دانا سالم', '+966656789012', 'profile-pictures/dana_salem.jpg', '2022-12-10', 'active', 4.7),
('r13', 'karim.jamil@example.com', NULL, 'Karim Jamil', 'كريم جميل', '+966667890123', 'profile-pictures/karim_jamil.jpg', '2023-01-05', 'active', 4.4),
('r14', 'lina.kareem@example.com', NULL, 'Lina Kareem', 'لينا كريم', '+966678901234', 'profile-pictures/lina_kareem.jpg', '2023-02-20', 'active', 4.9),
('r15', 'samir.hadi@example.com', NULL, 'Samir Hadi', 'سمير هادي', '+966689012345', 'profile-pictures/samir_hadi.jpg', '2023-03-15', 'active', 4.3),
('r16', 'rania.tamer@example.com', NULL, 'Rania Tamer', 'رانيا تامر', '+966690123456', 'profile-pictures/rania_tamer.jpg', '2023-04-10', 'active', 4.6);

-- Insert landlords
INSERT INTO landlords (id, user_id, bank_account, verification_status_en, verification_status_ar, rating)
VALUES
('land1', 'l1', 'SA0380000000608010167519', 'verified', 'تم التحقق', 4.7),
('land2', 'l2', 'SA0380000000608010167520', 'verified', 'تم التحقق', 4.8),
('land3', 'l3', 'SA0380000000608010167521', 'verified', 'تم التحقق', 4.5),
('land4', 'l4', 'SA0380000000608010167522', 'verified', 'تم التحقق', 4.9);

-- Insert renters
INSERT INTO renters (id, user_id, preferred_location_en, preferred_location_ar, budget, rating)
VALUES
('rent1', 'r1', 'Riyadh, Al Olaya', 'الرياض، العليا', 5000, 4.6),
('rent2', 'r2', 'Jeddah, Al Hamra', 'جدة، الحمراء', 4500, 4.8),
('rent3', 'r3', 'Dammam, Al Faisaliyah', 'الدمام، الفيصلية', 3800, 4.5),
('rent4', 'r4', 'Riyadh, Al Malaz', 'الرياض، الملز', 4200, 4.7),
('rent5', 'r5', 'Jeddah, Al Rawdah', 'جدة، الروضة', 6000, 4.4),
('rent6', 'r6', 'Riyadh, Al Yasmin', 'الرياض، الياسمين', 5500, 4.9),
('rent7', 'r7', 'Dammam, Al Shati', 'الدمام، الشاطئ', 4000, 4.3),
('rent8', 'r8', 'Riyadh, Al Wadi', 'الرياض، الوادي', 4800, 4.6),
('rent9', 'r9', 'Jeddah, Al Salamah', 'جدة، السلامة', 3500, 4.2),
('rent10', 'r10', 'Riyadh, Al Muruj', 'الرياض، المروج', 5200, 4.5),
('rent11', 'r11', 'Dammam, Al Aziziyah', 'الدمام، العزيزية', 4100, 4.8),
('rent12', 'r12', 'Riyadh, Al Nakheel', 'الرياض، النخيل', 4700, 4.7),
('rent13', 'r13', 'Jeddah, Al Nahda', 'جدة، النهضة', 3900, 4.4),
('rent14', 'r14', 'Riyadh, Al Worood', 'الرياض، الورود', 5800, 4.9),
('rent15', 'r15', 'Dammam, Al Rakah', 'الدمام، الراكة', 4300, 4.3),
('rent16', 'r16', 'Riyadh, Al Aqiq', 'الرياض، العقيق', 5100, 4.6);

-- Create user verification records
INSERT INTO "UserVerification" (id, user_id, id_card_url, proof_of_address_url, submitted_at, verified_at, status, notes_en, notes_ar)
VALUES
-- Landlords verification
('v1', 'l1', 'verification-documents/l1_id.jpg', 'verification-documents/l1_proof.jpg', '2022-01-16', '2022-01-18', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v2', 'l2', 'verification-documents/l2_id.jpg', 'verification-documents/l2_proof.jpg', '2022-02-11', '2022-02-13', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v3', 'l3', 'verification-documents/l3_id.jpg', 'verification-documents/l3_proof.jpg', '2022-03-06', '2022-03-08', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v4', 'l4', 'verification-documents/l4_id.jpg', 'verification-documents/l4_proof.jpg', '2022-04-21', '2022-04-23', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),

-- A few renter verifications
('v5', 'r1', 'verification-documents/r1_id.jpg', 'verification-documents/r1_proof.jpg', '2022-01-21', '2022-01-23', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v6', 'r2', 'verification-documents/r2_id.jpg', 'verification-documents/r2_proof.jpg', '2022-02-16', '2022-02-18', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v7', 'r3', 'verification-documents/r3_id.jpg', 'verification-documents/r3_proof.jpg', '2022-03-11', '2022-03-13', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v8', 'r4', 'verification-documents/r4_id.jpg', 'verification-documents/r4_proof.jpg', '2022-04-06', '2022-04-08', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v9', 'r5', 'verification-documents/r5_id.jpg', 'verification-documents/r5_proof.jpg', '2022-05-13', '2022-05-15', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'),
('v10', 'r6', 'verification-documents/r6_id.jpg', 'verification-documents/r6_proof.jpg', '2022-06-21', '2022-06-23', 'verified', 'All documents verified', 'تم التحقق من جميع المستندات'); 
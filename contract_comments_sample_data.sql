-- DarRent - Contract Comments Sample Data
-- This file contains sample data for the contract comments system

-- ==========================================
-- Insert Contract Comments Sample Data
-- ==========================================

-- Add sample comments to contract1 (Mohammad Abbas renting from Ahmed Khan)
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at
) VALUES
('cc1', 'contract1', 'l1', 'Welcome to your new home! Please let me know if you have any questions.', 
'مرحبًا بك في منزلك الجديد! يرجى إعلامي إذا كان لديك أي أسئلة.',
NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days'),

('cc2', 'contract1', 'r1', 'Thank you! I am very happy with the apartment.', 
'شكرًا لك! أنا سعيد جدًا بالشقة.',
NOW() - INTERVAL '29 days', NOW() - INTERVAL '29 days');

-- Add an issue comment
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at,
  is_issue, issue_priority, issue_category
) VALUES
('cc3', 'contract1', 'r1', 'There is a leaking pipe under the kitchen sink that needs to be fixed.', 
'هناك أنبوب مسرب تحت حوض المطبخ يحتاج إلى إصلاح.',
NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days',
TRUE, 'medium', 'plumbing');

-- Add a response and resolution
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at, parent_comment_id
) VALUES
('cc4', 'contract1', 'l1', 'I will send a plumber tomorrow between 10am and 12pm.', 
'سأرسل سباكًا غدًا بين الساعة 10 صباحًا و 12 ظهرًا.',
NOW() - INTERVAL '19 days', NOW() - INTERVAL '19 days', 'cc3');

-- Mark the issue as resolved
UPDATE contract_comments 
SET 
  issue_resolved = TRUE,
  issue_resolved_by = 'l1',
  issue_resolved_at = NOW() - INTERVAL '18 days'
WHERE id = 'cc3';

-- Add a response confirming the fix
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at, parent_comment_id
) VALUES
('cc5', 'contract1', 'r1', 'The plumber came and fixed the sink. Thank you!', 
'جاء السباك وأصلح الحوض. شكرًا لك!',
NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days', 'cc3');

-- Add sample comments to contract2 (Sarah Talal renting from Ahmed Khan)
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at
) VALUES
('cc6', 'contract2', 'l1', 'Welcome to your new villa! I hope you enjoy living here.', 
'مرحبًا بك في فيلتك الجديدة! آمل أن تستمتع بالعيش هنا.',
NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days'),

('cc7', 'contract2', 'r2', 'Thank you! The villa is beautiful. I appreciate the welcome.', 
'شكرًا لك! الفيلا جميلة. أقدر الترحيب.',
NOW() - INTERVAL '24 days', NOW() - INTERVAL '24 days');

-- Add an ongoing issue that hasn't been resolved yet
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at,
  is_issue, issue_priority, issue_category, image_url
) VALUES
('cc8', 'contract2', 'r2', 'The air conditioning in the master bedroom is not cooling properly.', 
'مكيف الهواء في غرفة النوم الرئيسية لا يبرد بشكل صحيح.',
NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days',
TRUE, 'high', 'cooling', 'maintenance-attachments/ac_issue.jpg');

-- Add a response to the ongoing issue
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at, parent_comment_id
) VALUES
('cc9', 'contract2', 'l1', 'I will schedule an HVAC technician to check it out. Is tomorrow afternoon good for you?', 
'سأجدول فني تكييف للتحقق من الأمر. هل بعد ظهر الغد مناسب لك؟',
NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', 'cc8');

-- Add renter response
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at, parent_comment_id
) VALUES
('cc10', 'contract2', 'r2', 'Yes, tomorrow afternoon works for me. Thank you for the quick response!', 
'نعم، بعد ظهر الغد يناسبني. شكرًا لك على الاستجابة السريعة!',
NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', 'cc9');

-- Add sample comments to contract3 (Khalid Nasser renting from Fatima Ali)
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at
) VALUES
('cc11', 'contract3', 'l2', 'Welcome to your new seafront apartment!', 
'مرحبًا بك في شقتك الجديدة على الواجهة البحرية!',
NOW() - INTERVAL '60 days', NOW() - INTERVAL '60 days'),

('cc12', 'contract3', 'r3', 'Thank you! The view is amazing.', 
'شكرًا لك! المنظر رائع.',
NOW() - INTERVAL '59 days', NOW() - INTERVAL '59 days');

-- Add a maintenance issue with a photo
INSERT INTO contract_comments (
  id, contract_id, user_id, comment_text_en, comment_text_ar, created_at, updated_at,
  is_issue, issue_priority, issue_category, image_url
) VALUES
('cc13', 'contract3', 'r3', 'The bathroom door lock is broken and doesn''t close properly.', 
'قفل باب الحمام مكسور ولا يغلق بشكل صحيح.',
NOW() - INTERVAL '45 days', NOW() - INTERVAL '45 days',
TRUE, 'medium', 'fixture', 'maintenance-attachments/door_lock.jpg');

-- ==========================================
-- Verify the Data
-- ==========================================

-- Run these queries to check the data was inserted properly
-- SELECT * FROM contract_comments ORDER BY created_at;
-- SELECT COUNT(*) FROM contract_comments WHERE is_issue = TRUE;
-- SELECT COUNT(*) FROM contract_comments WHERE is_issue = TRUE AND issue_resolved = TRUE;
-- SELECT COUNT(*) FROM contract_comments WHERE parent_comment_id IS NOT NULL; 
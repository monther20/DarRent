-- DarRent - Review System Sample Data
-- This file contains sample data for the property and renter review system

-- ==========================================
-- Insert Property Reviews
-- ==========================================

-- Clear any existing review data for clean testing
DELETE FROM property_reviews;
DELETE FROM renter_reviews;

-- Reset ratings in properties and users tables
UPDATE properties SET rating = NULL, review_count = 0;
UPDATE users SET average_rating = 0, review_count = 0;

-- Insert property reviews
INSERT INTO property_reviews (
  id,
  property_id,
  renter_id,
  contract_id,
  rating,
  review_text_en,
  review_text_ar,
  review_date,
  visible,
  created_at
) VALUES
-- Reviews for completed contracts
('pr1', 'prop1', 'rent9', 'contract9', 4, 
'Great apartment in an excellent location. The landlord was responsive and professional throughout my stay. The only drawback was occasional noise from the street.', 
'شقة رائعة في موقع ممتاز. كان المالك متجاوبًا ومحترفًا طوال فترة إقامتي. العيب الوحيد كان الضوضاء المتقطعة من الشارع.',
'2022-02-20', TRUE, '2022-02-20'),

('pr2', 'prop4', 'rent10', 'contract10', 5, 
'This seafront apartment exceeded all my expectations! Stunning views, modern amenities, and the landlord was incredibly helpful. I highly recommend this property!', 
'تجاوزت هذه الشقة المطلة على البحر كل توقعاتي! إطلالات رائعة، ومرافق حديثة، وكان المالك مفيدًا للغاية. أوصي بشدة بهذا العقار!',
'2022-03-10', TRUE, '2022-03-10'),

-- Add a few more reviews for variety
('pr3', 'prop7', 'rent5', 'contract5', 3, 
'The apartment is decent for the price, but some appliances need updating. The location is convenient, and the landlord responds quickly to maintenance requests.', 
'الشقة مناسبة للسعر، لكن بعض الأجهزة تحتاج إلى تحديث. الموقع مناسب، والمالك يستجيب بسرعة لطلبات الصيانة.',
'2022-11-15', TRUE, '2022-11-15'),

('pr4', 'prop8', 'rent6', 'contract6', 5, 
'This family home is perfect! Spacious, well-maintained, and in a quiet neighborhood. The garden is beautiful and my kids love playing outside.', 
'هذا المنزل العائلي مثالي! واسع، محافظ عليه جيدًا، وفي حي هادئ. الحديقة جميلة وأطفالي يحبون اللعب في الخارج.',
'2023-01-12', TRUE, '2023-01-12'),

('pr5', 'prop10', 'rent7', 'contract7', 4, 
'Elegant apartment with tasteful design. The neighborhood is lively with many restaurants and shops. Very satisfied with my rental experience.', 
'شقة أنيقة ذات تصميم راقي. الحي نابض بالحياة مع العديد من المطاعم والمتاجر. راضٍ جدًا عن تجربة الإيجار.',
'2023-02-28', TRUE, '2023-02-28'),

-- Add a hidden review to test the visibility feature
('pr6', 'prop11', 'rent8', 'contract8', 1, 
'Terrible experience. Nothing like the description. Avoid at all costs!', 
'تجربة سيئة. لا تشبه الوصف على الإطلاق. تجنب بأي ثمن!',
'2023-03-05', FALSE, '2023-03-05');

-- ==========================================
-- Insert Renter Reviews
-- ==========================================

INSERT INTO renter_reviews (
  id,
  renter_id,
  landlord_id,
  contract_id,
  rating,
  review_text_en,
  review_text_ar,
  review_date,
  visible,
  created_at
) VALUES
-- Reviews for the same completed contracts
('rr1', 'rent9', 'land1', 'contract9', 5, 
'Excellent tenant who took great care of the property. Always paid rent on time and communicated well. Would rent to them again anytime.', 
'مستأجر ممتاز اعتنى جيدًا بالعقار. سدد الإيجار دائمًا في الموعد المحدد وتواصل بشكل جيد. أرحب بتأجيره مرة أخرى في أي وقت.',
'2022-02-22', TRUE, '2022-02-22'),

('rr2', 'rent10', 'land2', 'contract10', 4, 
'Responsible renter who maintained the property well. Occasionally delayed in reporting minor issues, but overall a positive experience.', 
'مستأجر مسؤول حافظ على العقار بشكل جيد. تأخر أحيانًا في الإبلاغ عن المشكلات الصغيرة، ولكن كانت التجربة إيجابية بشكل عام.',
'2022-03-12', TRUE, '2022-03-12'),

-- Add more renter reviews
('rr3', 'rent5', 'land3', 'contract5', 3, 
'Decent renter who kept the apartment in acceptable condition. Sometimes noisy according to neighbors, but paid rent on time.', 
'مستأجر مقبول احتفظ بالشقة في حالة مقبولة. كان مزعجًا أحيانًا حسب الجيران، لكنه دفع الإيجار في الوقت المحدد.',
'2022-11-20', TRUE, '2022-11-20'),

('rr4', 'rent6', 'land3', 'contract6', 5, 
'Exceptional tenant! The family took immaculate care of the property and were a pleasure to work with. Highly recommended.', 
'مستأجر استثنائي! اعتنت العائلة بالعقار بشكل مثالي وكان من دواعي السرور العمل معهم. موصى به بشدة.',
'2023-01-15', TRUE, '2023-01-15'),

('rr5', 'rent7', 'land4', 'contract7', 4, 
'Reliable renter who respected all house rules. Communication was smooth and the property was well-maintained throughout the tenancy.', 
'مستأجر موثوق احترم جميع قواعد المنزل. كان التواصل سلسًا وتمت صيانة العقار جيدًا طوال فترة الإيجار.',
'2023-03-02', TRUE, '2023-03-02'),

-- Add a hidden renter review
('rr6', 'rent8', 'land4', 'contract8', 2, 
'Problematic tenant who caused damage to several fixtures. Paid rent late multiple times. Would not rent to again.', 
'مستأجر إشكالي تسبب في إتلاف العديد من التجهيزات. دفع الإيجار متأخرًا عدة مرات. لن أؤجر له مرة أخرى.',
'2023-03-08', FALSE, '2023-03-08');

-- ==========================================
-- Update Statistics
-- ==========================================

-- Update property ratings
WITH property_stats AS (
  SELECT 
    property_id, 
    AVG(rating) as avg_rating, 
    COUNT(*) as count
  FROM property_reviews
  WHERE visible = TRUE
  GROUP BY property_id
)
UPDATE properties p
SET 
  rating = ps.avg_rating,
  review_count = ps.count
FROM property_stats ps
WHERE p.id = ps.property_id;

-- Update renter ratings
WITH renter_stats AS (
  SELECT 
    renter_id, 
    AVG(rating) as avg_rating, 
    COUNT(*) as count
  FROM renter_reviews
  WHERE visible = TRUE
  GROUP BY renter_id
)
UPDATE users u
SET 
  average_rating = rs.avg_rating,
  review_count = rs.count
FROM renter_stats rs
JOIN renters r ON r.id = rs.renter_id
WHERE u.id = r.user_id; 
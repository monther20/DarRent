-- Insert messages
INSERT INTO messages (
    id, sender_id, receiver_id, content_en, content_ar, timestamp, is_read, property_id
)
VALUES
-- Conversation about property 1
('msg1', 'r1', 'l1', 'Hi, I am interested in your apartment in Al Olaya. Is it still available?', 
'مرحبًا، أنا مهتم بشقتك في العليا. هل ما زالت متاحة؟', 
'2022-02-05 10:30:00', TRUE, 'prop1'),

('msg2', 'l1', 'r1', 'Yes, it is still available. Would you like to schedule a viewing?', 
'نعم، لا تزال متاحة. هل ترغب في تحديد موعد لمشاهدتها؟', 
'2022-02-05 11:15:00', TRUE, 'prop1'),

('msg3', 'r1', 'l1', 'Yes, I would like to see it. How about tomorrow at 5 PM?', 
'نعم، أود رؤيتها. ما رأيك في الغد الساعة 5 مساءً؟', 
'2022-02-05 11:45:00', TRUE, 'prop1'),

('msg4', 'l1', 'r1', 'That works for me. I will meet you at the property. Here is the address: [Address details]', 
'هذا يناسبني. سألتقي بك في العقار. إليك العنوان: [تفاصيل العنوان]', 
'2022-02-05 12:30:00', TRUE, 'prop1'),

('msg5', 'r1', 'l1', 'I really liked the apartment and would like to rent it. What are the next steps?', 
'لقد أعجبتني الشقة حقًا وأود استئجارها. ما هي الخطوات التالية؟', 
'2022-02-06 18:30:00', TRUE, 'prop1'),

-- Conversation about property 3
('msg6', 'r9', 'l1', 'Hello, I am interested in your studio in Al Muruj. Is it still available for rent?', 
'مرحبًا، أنا مهتم باستوديو المروج الخاص بك. هل لا يزال متاحًا للإيجار؟', 
'2023-01-10 14:20:00', TRUE, 'prop3'),

('msg7', 'l1', 'r9', 'Yes, it is available. Would you like to know more about it or schedule a viewing?', 
'نعم، إنه متاح. هل ترغب في معرفة المزيد عنه أو تحديد موعد لمشاهدته؟', 
'2023-01-10 15:05:00', TRUE, 'prop3'),

('msg8', 'r9', 'l1', 'I would like to know if the rent includes utilities and if pets are allowed?', 
'أود أن أعرف ما إذا كان الإيجار يشمل المرافق وما إذا كان مسموحًا بالحيوانات الأليفة؟', 
'2023-01-10 15:30:00', TRUE, 'prop3'),

('msg9', 'l1', 'r9', 'Utilities are not included in the rent. Small pets might be allowed on a case-by-case basis.', 
'المرافق غير مشمولة في الإيجار. قد يُسمح بالحيوانات الأليفة الصغيرة على أساس كل حالة على حدة.', 
'2023-01-10 16:15:00', TRUE, 'prop3'),

-- Maintenance request conversation
('msg10', 'r1', 'l1', 'Hi, the kitchen sink is leaking. Can you send someone to fix it?', 
'مرحبًا، حوض المطبخ يتسرب. هل يمكنك إرسال شخص ما لإصلاحه؟', 
'2022-04-05 09:45:00', TRUE, 'prop1'),

('msg11', 'l1', 'r1', 'I will send a plumber tomorrow between 10 AM and 12 PM. Will you be home?', 
'سأرسل سباكًا غدًا بين الساعة 10 صباحًا و 12 ظهرًا. هل ستكون في المنزل؟', 
'2022-04-05 10:30:00', TRUE, 'prop1'),

('msg12', 'r1', 'l1', 'Yes, I will be home. Thank you for the quick response.', 
'نعم، سأكون في المنزل. شكرًا على الاستجابة السريعة.', 
'2022-04-05 10:45:00', TRUE, 'prop1'),

('msg13', 'l1', 'r1', 'The plumber has fixed the issue. Please let me know if there are any other problems.', 
'لقد أصلح السباك المشكلة. يرجى إعلامي إذا كانت هناك أي مشاكل أخرى.', 
'2022-04-06 14:30:00', TRUE, 'prop1'),

-- Rent reminder
('msg14', 'l3', 'r5', 'Just a friendly reminder that your rent payment is due on the 10th of this month.', 
'مجرد تذكير ودي بأن دفعة الإيجار الخاصة بك مستحقة في العاشر من هذا الشهر.', 
'2022-07-05 11:00:00', TRUE, 'prop7'),

('msg15', 'r5', 'l3', 'Thank you for the reminder. I will make the payment on time.', 
'شكرًا على التذكير. سأقوم بالدفع في الوقت المحدد.', 
'2022-07-05 11:45:00', TRUE, 'prop7'),

-- Contract renewal
('msg16', 'l1', 'r1', 'Your lease is expiring next month. Would you like to renew it for another year?', 
'عقد الإيجار الخاص بك سينتهي الشهر المقبل. هل ترغب في تجديده لمدة عام آخر؟', 
'2023-01-15 10:30:00', TRUE, 'prop1'),

('msg17', 'r1', 'l1', 'Yes, I would like to renew the lease. Will the rent remain the same?', 
'نعم، أرغب في تجديد عقد الإيجار. هل سيبقى الإيجار كما هو؟', 
'2023-01-15 14:20:00', TRUE, 'prop1'),

('msg18', 'l1', 'r1', 'Yes, the rent will remain the same for now. I will prepare the renewal documents.', 
'نعم، سيبقى الإيجار كما هو حاليًا. سأقوم بإعداد وثائق التجديد.', 
'2023-01-15 15:05:00', TRUE, 'prop1');

-- Insert applications
INSERT INTO applications (
    id, property_id, renter_id, status, created_at, id_card, proof_of_income, bank_statement, progress
)
VALUES
-- Successful applications for properties
('app1', 'prop1', 'rent1', 'approved', '2022-02-07', TRUE, TRUE, TRUE, 100),
('app2', 'prop2', 'rent2', 'approved', '2022-03-15', TRUE, TRUE, TRUE, 100),
('app3', 'prop4', 'rent3', 'approved', '2022-02-25', TRUE, TRUE, TRUE, 100),
('app4', 'prop5', 'rent4', 'approved', '2022-04-20', TRUE, TRUE, TRUE, 100),
('app5', 'prop7', 'rent5', 'approved', '2022-03-25', TRUE, TRUE, TRUE, 100),
('app6', 'prop8', 'rent6', 'approved', '2022-05-15', TRUE, TRUE, TRUE, 100),
('app7', 'prop10', 'rent7', 'approved', '2022-05-05', TRUE, TRUE, TRUE, 100),
('app8', 'prop11', 'rent8', 'approved', '2022-06-15', TRUE, TRUE, TRUE, 100),

-- Applications in progress for available properties
('app9', 'prop3', 'rent9', 'in_review', '2023-01-20', TRUE, TRUE, FALSE, 66),
('app10', 'prop6', 'rent10', 'in_review', '2023-02-25', TRUE, FALSE, TRUE, 66),
('app11', 'prop9', 'rent11', 'pending', '2023-03-15', TRUE, FALSE, FALSE, 33),
('app12', 'prop12', 'rent12', 'pending', '2023-04-15', FALSE, FALSE, FALSE, 0),

-- Rejected applications
('app13', 'prop1', 'rent13', 'rejected', '2022-01-25', TRUE, TRUE, TRUE, 100),
('app14', 'prop4', 'rent14', 'rejected', '2022-02-15', TRUE, FALSE, TRUE, 66),
('app15', 'prop7', 'rent15', 'rejected', '2022-03-10', TRUE, TRUE, FALSE, 66);

-- Insert evaluations
INSERT INTO evaluations (
    id, reviewer_id, reviewee_id, rating, comment_en, comment_ar, date, type
)
VALUES
-- Tenants reviewing landlords
('eval1', 'r1', 'l1', 4.8, 'Great landlord, very responsive and professional.', 
'مالك ممتاز، سريع الاستجابة ومحترف.', '2022-08-15', 'tenant_to_landlord'),

('eval2', 'r2', 'l1', 4.7, 'Very accommodating and easy to communicate with.', 
'متعاون جدًا وسهل التواصل معه.', '2022-09-10', 'tenant_to_landlord'),

('eval3', 'r3', 'l2', 4.6, 'Prompt in addressing maintenance issues.', 
'سريع في معالجة مشاكل الصيانة.', '2022-09-05', 'tenant_to_landlord'),

('eval4', 'r4', 'l2', 4.9, 'Excellent landlord who respects privacy and responds quickly to concerns.', 
'مالك ممتاز يحترم الخصوصية ويستجيب بسرعة للمخاوف.', '2022-10-20', 'tenant_to_landlord'),

('eval5', 'r5', 'l3', 4.4, 'Good landlord overall, though sometimes slow to respond.', 
'مالك جيد بشكل عام، على الرغم من أنه بطيء أحيانًا في الرد.', '2022-10-15', 'tenant_to_landlord'),

-- Landlords reviewing tenants
('eval6', 'l1', 'r1', 4.8, 'Excellent tenant, pays rent on time and keeps the property in good condition.', 
'مستأجر ممتاز، يدفع الإيجار في الوقت المحدد ويحافظ على العقار في حالة جيدة.', '2022-08-20', 'landlord_to_tenant'),

('eval7', 'l1', 'r2', 4.9, 'Very respectful tenant who maintains the property well.', 
'مستأجر محترم جدًا يحافظ على العقار بشكل جيد.', '2022-09-15', 'landlord_to_tenant'),

('eval8', 'l2', 'r3', 4.7, 'Good tenant, communicates issues promptly.', 
'مستأجر جيد، يبلغ عن المشاكل على الفور.', '2022-09-10', 'landlord_to_tenant'),

('eval9', 'l2', 'r4', 4.8, 'Reliable tenant who pays on time and respects neighbors.', 
'مستأجر موثوق به يدفع في الوقت المحدد ويحترم الجيران.', '2022-10-25', 'landlord_to_tenant'),

('eval10', 'l3', 'r5', 4.3, 'Generally good tenant, occasionally late with payments.', 
'مستأجر جيد بشكل عام، متأخر أحيانًا في المدفوعات.', '2022-10-20', 'landlord_to_tenant'),

-- Property reviews
('eval11', 'r1', 'l1', 4.7, 'Beautiful apartment with great amenities. Location is perfect.', 
'شقة جميلة مع وسائل راحة رائعة. الموقع مثالي.', '2022-08-10', 'property'),

('eval12', 'r2', 'l1', 4.8, 'Spacious villa with modern features. The garden is lovely.', 
'فيلا فسيحة بميزات حديثة. الحديقة جميلة.', '2022-09-05', 'property'),

('eval13', 'r3', 'l2', 4.5, 'Great apartment with amazing sea views. Some minor maintenance issues.', 
'شقة رائعة مع إطلالات بحرية مذهلة. بعض مشاكل الصيانة البسيطة.', '2022-09-01', 'property'),

('eval14', 'r4', 'l2', 4.9, 'Luxurious penthouse with stunning views. Everything is high-end.', 
'شقة فاخرة مع إطلالات رائعة. كل شيء راقي.', '2022-10-15', 'property'),

('eval15', 'r5', 'l3', 4.4, 'Nice apartment with good features. Bathroom needs some updating.', 
'شقة لطيفة مع ميزات جيدة. الحمام يحتاج إلى بعض التحديث.', '2022-10-10', 'property'); 
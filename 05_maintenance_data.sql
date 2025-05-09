-- Insert maintenance requests
INSERT INTO maintenance_requests (
    id, renter_id, property_id, title_en, title_ar, description_en, description_ar,
    location_en, location_ar, status, priority, created_at, updated_at, completed_at
)
VALUES
-- Completed maintenance requests
('mreq1', 'rent1', 'prop1', 'Leaking Kitchen Sink', 'تسرب في حوض المطبخ',
'The kitchen sink has a leak underneath. Water is collecting in the cabinet below.', 
'يوجد تسرب في حوض المطبخ من الأسفل. المياه تتجمع في الخزانة أدناه.',
'Kitchen', 'المطبخ', 'completed', 'medium', '2022-04-05 09:30:00', '2022-04-06 15:00:00', '2022-04-06 15:00:00'),

('mreq2', 'rent2', 'prop2', 'Air Conditioning Not Working', 'مكيف الهواء لا يعمل',
'The AC in the master bedroom is not cooling. It turns on but only blows warm air.', 
'مكيف الهواء في غرفة النوم الرئيسية لا يبرد. يعمل ولكنه ينفخ هواءً دافئًا فقط.',
'Master Bedroom', 'غرفة النوم الرئيسية', 'completed', 'high', '2022-05-20 14:15:00', '2022-05-22 10:30:00', '2022-05-22 10:30:00'),

('mreq3', 'rent3', 'prop4', 'Bathroom Door Won\'t Lock', 'باب الحمام لا يقفل',
'The lock on the main bathroom door is broken and won\'t engage properly.', 
'قفل باب الحمام الرئيسي مكسور ولا يعمل بشكل صحيح.',
'Main Bathroom', 'الحمام الرئيسي', 'completed', 'low', '2022-06-10 11:45:00', '2022-06-11 16:20:00', '2022-06-11 16:20:00'),

('mreq4', 'rent4', 'prop5', 'Water Heater Not Working', 'سخان المياه لا يعمل',
'The water heater is not heating water. We have no hot water for showers or washing.', 
'سخان المياه لا يسخن الماء. ليس لدينا ماء ساخن للاستحمام أو الغسيل.',
'Utility Room', 'غرفة المرافق', 'completed', 'high', '2022-07-05 08:00:00', '2022-07-05 16:15:00', '2022-07-05 16:15:00'),

-- In-progress maintenance requests
('mreq5', 'rent5', 'prop7', 'Light Fixtures Flickering', 'تضاؤل مصابيح الإضاءة',
'The light fixtures in the living room are flickering and sometimes go out completely.', 
'مصابيح الإضاءة في غرفة المعيشة تومض وأحيانًا تنطفئ تمامًا.',
'Living Room', 'غرفة المعيشة', 'in_progress', 'medium', '2023-02-15 13:30:00', '2023-02-16 09:45:00', NULL),

('mreq6', 'rent6', 'prop8', 'Garage Door Stuck', 'باب المرآب عالق',
'The automatic garage door opens halfway and then gets stuck. Unable to park car inside.', 
'باب المرآب الآلي يفتح حتى المنتصف ثم يعلق. غير قادر على ركن السيارة بالداخل.',
'Garage', 'المرآب', 'in_progress', 'medium', '2023-03-02 10:00:00', '2023-03-02 14:30:00', NULL),

-- Pending maintenance requests
('mreq7', 'rent7', 'prop10', 'Cracked Tile in Bathroom', 'بلاط مكسور في الحمام',
'There is a cracked floor tile in the guest bathroom that needs replacement.', 
'هناك بلاطة أرضية مكسورة في حمام الضيوف تحتاج إلى استبدال.',
'Guest Bathroom', 'حمام الضيوف', 'pending', 'low', '2023-03-20 15:45:00', '2023-03-20 15:45:00', NULL),

('mreq8', 'rent8', 'prop11', 'Pool Pump Making Noise', 'مضخة المسبح تصدر ضوضاء',
'The swimming pool pump is making a loud grinding noise when operating.', 
'مضخة حمام السباحة تصدر ضوضاء طحن عالية عند التشغيل.',
'Swimming Pool', 'حمام سباحة', 'pending', 'medium', '2023-04-05 11:30:00', '2023-04-05 11:30:00', NULL);

-- Insert maintenance status history
INSERT INTO maintenance_status_history (
    id, request_id, previous_status, new_status, changed_by, changed_at, notes_en, notes_ar
)
VALUES
-- History for request 1 (Leaking Kitchen Sink)
('mstat1', 'mreq1', NULL, 'pending', 'r1', '2022-04-05 09:30:00', 
'Maintenance request submitted', 'تم تقديم طلب الصيانة'),

('mstat2', 'mreq1', 'pending', 'in_progress', 'l1', '2022-04-05 11:00:00', 
'Scheduled plumber for tomorrow', 'تم جدولة السباك ليوم غد'),

('mstat3', 'mreq1', 'in_progress', 'completed', 'l1', '2022-04-06 15:00:00', 
'Plumber replaced leaking pipe and sealed connections', 'قام السباك باستبدال الأنبوب المتسرب وختم الوصلات'),

-- History for request 2 (AC Not Working)
('mstat4', 'mreq2', NULL, 'pending', 'r2', '2022-05-20 14:15:00', 
'Maintenance request submitted', 'تم تقديم طلب الصيانة'),

('mstat5', 'mreq2', 'pending', 'in_progress', 'l1', '2022-05-21 09:30:00', 
'HVAC technician scheduled for tomorrow morning', 'تم جدولة فني التكييف لصباح غد'),

('mstat6', 'mreq2', 'in_progress', 'completed', 'l1', '2022-05-22 10:30:00', 
'Technician recharged refrigerant and fixed fan issue', 'قام الفني بإعادة شحن غاز التبريد وإصلاح مشكلة المروحة'),

-- History for request 3 (Bathroom Door Lock)
('mstat7', 'mreq3', NULL, 'pending', 'r3', '2022-06-10 11:45:00', 
'Maintenance request submitted', 'تم تقديم طلب الصيانة'),

('mstat8', 'mreq3', 'pending', 'in_progress', 'l2', '2022-06-11 10:00:00', 
'Locksmith scheduled for today afternoon', 'تم جدولة قفال لفترة ما بعد الظهر اليوم'),

('mstat9', 'mreq3', 'in_progress', 'completed', 'l2', '2022-06-11 16:20:00', 
'Lock mechanism replaced and tested', 'تم استبدال آلية القفل واختبارها'),

-- History for request 4 (Water Heater)
('mstat10', 'mreq4', NULL, 'pending', 'r4', '2022-07-05 08:00:00', 
'Maintenance request submitted as urgent', 'تم تقديم طلب الصيانة كحالة طارئة'),

('mstat11', 'mreq4', 'pending', 'in_progress', 'l2', '2022-07-05 09:15:00', 
'Plumber dispatched immediately', 'تم إرسال السباك على الفور'),

('mstat12', 'mreq4', 'in_progress', 'completed', 'l2', '2022-07-05 16:15:00', 
'Heating element replaced and water heater now functioning properly', 'تم استبدال عنصر التسخين وسخان المياه يعمل الآن بشكل صحيح'),

-- History for request 5 (Light Fixtures)
('mstat13', 'mreq5', NULL, 'pending', 'r5', '2023-02-15 13:30:00', 
'Maintenance request submitted', 'تم تقديم طلب الصيانة'),

('mstat14', 'mreq5', 'pending', 'in_progress', 'l3', '2023-02-16 09:45:00', 
'Electrician scheduled for inspection', 'تم جدولة كهربائي للفحص'),

-- History for request 6 (Garage Door)
('mstat15', 'mreq6', NULL, 'pending', 'r6', '2023-03-02 10:00:00', 
'Maintenance request submitted', 'تم تقديم طلب الصيانة'),

('mstat16', 'mreq6', 'pending', 'in_progress', 'l3', '2023-03-02 14:30:00', 
'Garage door technician scheduled for this week', 'تم جدولة فني باب المرآب لهذا الأسبوع');

-- Insert maintenance attachments
INSERT INTO maintenance_attachments (
    id, request_id, file_url, file_type, created_at
)
VALUES
-- Attachments for request 1 (Leaking Kitchen Sink)
('matt1', 'mreq1', 'maintenance-attachments/mreq1_leak1.jpg', 'image/jpeg', '2022-04-05 09:30:00'),
('matt2', 'mreq1', 'maintenance-attachments/mreq1_leak2.jpg', 'image/jpeg', '2022-04-05 09:30:00'),
('matt3', 'mreq1', 'maintenance-attachments/mreq1_fixed.jpg', 'image/jpeg', '2022-04-06 15:00:00'),

-- Attachments for request 2 (AC Not Working)
('matt4', 'mreq2', 'maintenance-attachments/mreq2_ac.jpg', 'image/jpeg', '2022-05-20 14:15:00'),
('matt5', 'mreq2', 'maintenance-attachments/mreq2_thermostat.jpg', 'image/jpeg', '2022-05-20 14:15:00'),

-- Attachments for request 3 (Bathroom Door Lock)
('matt6', 'mreq3', 'maintenance-attachments/mreq3_lock.jpg', 'image/jpeg', '2022-06-10 11:45:00'),

-- Attachments for request 4 (Water Heater)
('matt7', 'mreq4', 'maintenance-attachments/mreq4_heater.jpg', 'image/jpeg', '2022-07-05 08:00:00'),
('matt8', 'mreq4', 'maintenance-attachments/mreq4_element.jpg', 'image/jpeg', '2022-07-05 16:15:00'),

-- Attachments for request 5 (Light Fixtures)
('matt9', 'mreq5', 'maintenance-attachments/mreq5_lights.jpg', 'image/jpeg', '2023-02-15 13:30:00'),
('matt10', 'mreq5', 'maintenance-attachments/mreq5_video.mp4', 'video/mp4', '2023-02-15 13:30:00'),

-- Attachments for request 6 (Garage Door)
('matt11', 'mreq6', 'maintenance-attachments/mreq6_garage.jpg', 'image/jpeg', '2023-03-02 10:00:00'),
('matt12', 'mreq6', 'maintenance-attachments/mreq6_video.mp4', 'video/mp4', '2023-03-02 10:00:00'),

-- Attachments for request 7 (Cracked Tile)
('matt13', 'mreq7', 'maintenance-attachments/mreq7_tile.jpg', 'image/jpeg', '2023-03-20 15:45:00'),

-- Attachments for request 8 (Pool Pump)
('matt14', 'mreq8', 'maintenance-attachments/mreq8_pump.jpg', 'image/jpeg', '2023-04-05 11:30:00'),
('matt15', 'mreq8', 'maintenance-attachments/mreq8_audio.mp3', 'audio/mpeg', '2023-04-05 11:30:00'); 
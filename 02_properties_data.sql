-- Insert properties
INSERT INTO properties (
    id, title_en, title_ar, description_en, description_ar, rent_amount, security_deposit, status,
    listing_date, number_of_rooms, square_footage, property_type_en, property_type_ar,
    availability_date, owner_id, city_en, city_ar, area_en, area_ar, latitude, longitude, views, inquiries, days_listed
)
VALUES
-- Ahmed Khan's properties (l1/land1)
('prop1', 'Luxury Apartment in Al Olaya', 'شقة فاخرة في العليا', 
'Spacious 3-bedroom apartment with modern amenities, located in the heart of Riyadh.', 
'شقة واسعة مكونة من 3 غرف نوم مع وسائل راحة حديثة، تقع في قلب الرياض.',
4500, 4500, 'rented', '2022-02-01', 3, 150, 'Apartment', 'شقة', '2022-02-15', 'land1',
'Riyadh', 'الرياض', 'Al Olaya', 'العليا', 24.7136, 46.6753, 1250, 45, 14),

('prop2', 'Modern Villa in Al Yasmin', 'فيلا عصرية في الياسمين',
'Beautiful 5-bedroom villa with private garden and swimming pool, perfect for families.',
'فيلا جميلة مكونة من 5 غرف نوم مع حديقة خاصة وحمام سباحة، مثالية للعائلات.',
8500, 8500, 'rented', '2022-03-10', 5, 320, 'Villa', 'فيلا', '2022-03-25', 'land1',
'Riyadh', 'الرياض', 'Al Yasmin', 'الياسمين', 24.8137, 46.6890, 2100, 63, 15),

('prop3', 'Cozy Studio in Al Muruj', 'استوديو مريح في المروج',
'Compact studio apartment with all necessary amenities, ideal for students or young professionals.',
'شقة استوديو مدمجة مع جميع وسائل الراحة الضرورية، مثالية للطلاب أو المهنيين الشباب.',
2800, 2800, 'available', '2023-01-05', 0, 50, 'Studio', 'استوديو', '2023-01-20', 'land1',
'Riyadh', 'الرياض', 'Al Muruj', 'المروج', 24.7689, 46.6741, 820, 30, 0),

-- Fatima Ali's properties (l2/land2)
('prop4', 'Seafront Apartment in Al Hamra', 'شقة على الواجهة البحرية في الحمراء',
'Stunning 2-bedroom apartment with sea views, fully furnished and recently renovated.',
'شقة رائعة مكونة من غرفتي نوم مع إطلالات على البحر، مفروشة بالكامل وتم تجديدها مؤخرًا.',
5200, 5200, 'rented', '2022-02-20', 2, 120, 'Apartment', 'شقة', '2022-03-05', 'land2',
'Jeddah', 'جدة', 'Al Hamra', 'الحمراء', 21.5850, 39.1725, 1450, 52, 13),

('prop5', 'Luxurious Penthouse in Al Shati', 'شقة فاخرة في الشاطئ',
'Exclusive 4-bedroom penthouse with panoramic city views, private terrace, and premium finishes.',
'شقة حصرية مكونة من 4 غرف نوم مع إطلالات بانورامية على المدينة، وشرفة خاصة، وتشطيبات فاخرة.',
12000, 12000, 'rented', '2022-04-15', 4, 280, 'Penthouse', 'بنتهاوس', '2022-05-01', 'land2',
'Jeddah', 'جدة', 'Al Shati', 'الشاطئ', 21.6054, 39.1142, 1800, 70, 16),

('prop6', 'Charming Townhouse in Al Rawdah', 'منزل تاون هاوس ساحر في الروضة',
'Modern 3-bedroom townhouse with small garden, close to schools and shopping centers.',
'منزل تاون هاوس حديث مكون من 3 غرف نوم مع حديقة صغيرة، قريب من المدارس ومراكز التسوق.',
6800, 6800, 'available', '2023-02-10', 3, 200, 'Townhouse', 'تاون هاوس', '2023-02-25', 'land2',
'Jeddah', 'جدة', 'Al Rawdah', 'الروضة', 21.5691, 39.1663, 950, 35, 0),

-- Omar Hassan's properties (l3/land3)
('prop7', 'Modern Apartment in Al Faisaliyah', 'شقة عصرية في الفيصلية',
'Contemporary 2-bedroom apartment with smart home features and modern design.',
'شقة معاصرة مكونة من غرفتي نوم مع ميزات المنزل الذكي وتصميم حديث.',
4000, 4000, 'rented', '2022-03-20', 2, 110, 'Apartment', 'شقة', '2022-04-05', 'land3',
'Dammam', 'الدمام', 'Al Faisaliyah', 'الفيصلية', 26.4239, 50.0864, 1100, 40, 16),

('prop8', 'Family Home in Al Rakah', 'منزل عائلي في الراكة',
'Spacious 4-bedroom house with garden, perfect for families, close to schools and parks.',
'منزل واسع مكون من 4 غرف نوم مع حديقة، مثالي للعائلات، قريب من المدارس والحدائق.',
7500, 7500, 'rented', '2022-05-10', 4, 250, 'House', 'منزل', '2022-05-25', 'land3',
'Dammam', 'الدمام', 'Al Rakah', 'الراكة', 26.4096, 50.1140, 1300, 48, 15),

('prop9', 'Studio Apartment in Al Aziziyah', 'شقة استوديو في العزيزية',
'Compact but well-designed studio apartment, perfect for singles or couples.',
'شقة استوديو مدمجة ولكن مصممة جيدًا، مثالية للأفراد أو الأزواج.',
2500, 2500, 'available', '2023-03-05', 0, 45, 'Studio', 'استوديو', '2023-03-20', 'land3',
'Dammam', 'الدمام', 'Al Aziziyah', 'العزيزية', 26.3964, 50.1791, 780, 28, 0),

-- Layla Mahmoud's properties (l4/land4)
('prop10', 'Elegant Apartment in Al Nakheel', 'شقة أنيقة في النخيل',
'Sophisticated 3-bedroom apartment with high-end finishes and ample natural light.',
'شقة راقية مكونة من 3 غرف نوم مع تشطيبات راقية وإضاءة طبيعية وافرة.',
5500, 5500, 'rented', '2022-05-01', 3, 160, 'Apartment', 'شقة', '2022-05-15', 'land4',
'Riyadh', 'الرياض', 'Al Nakheel', 'النخيل', 24.7489, 46.6977, 1400, 50, 14),

('prop11', 'Luxury Villa in Al Aqiq', 'فيلا فاخرة في العقيق',
'Premium 6-bedroom villa with swimming pool, garden, and entertainment area.',
'فيلا فاخرة مكونة من 6 غرف نوم مع حمام سباحة وحديقة ومنطقة ترفيهية.',
14000, 14000, 'rented', '2022-06-10', 6, 400, 'Villa', 'فيلا', '2022-06-25', 'land4',
'Riyadh', 'الرياض', 'Al Aqiq', 'العقيق', 24.7608, 46.6618, 2400, 75, 15),

('prop12', 'Modern Apartment in Al Wadi', 'شقة عصرية في الوادي',
'Contemporary 2-bedroom apartment with balcony and city views.',
'شقة معاصرة مكونة من غرفتي نوم مع شرفة وإطلالات على المدينة.',
4200, 4200, 'available', '2023-04-05', 2, 120, 'Apartment', 'شقة', '2023-04-20', 'land4',
'Riyadh', 'الرياض', 'Al Wadi', 'الوادي', 24.7741, 46.7281, 850, 32, 0);

-- Insert property images
INSERT INTO property_images (id, property_id, image_url, upload_date, is_main_image)
VALUES
-- Property 1 images
('img1', 'prop1', 'property-images/prop1_main.jpg', '2022-02-01', TRUE),
('img2', 'prop1', 'property-images/prop1_living.jpg', '2022-02-01', FALSE),
('img3', 'prop1', 'property-images/prop1_bedroom.jpg', '2022-02-01', FALSE),
('img4', 'prop1', 'property-images/prop1_kitchen.jpg', '2022-02-01', FALSE),
('img5', 'prop1', 'property-images/prop1_bathroom.jpg', '2022-02-01', FALSE),

-- Property 2 images
('img6', 'prop2', 'property-images/prop2_main.jpg', '2022-03-10', TRUE),
('img7', 'prop2', 'property-images/prop2_living.jpg', '2022-03-10', FALSE),
('img8', 'prop2', 'property-images/prop2_bedroom.jpg', '2022-03-10', FALSE),
('img9', 'prop2', 'property-images/prop2_kitchen.jpg', '2022-03-10', FALSE),
('img10', 'prop2', 'property-images/prop2_garden.jpg', '2022-03-10', FALSE),
('img11', 'prop2', 'property-images/prop2_pool.jpg', '2022-03-10', FALSE),

-- Property 3 images
('img12', 'prop3', 'property-images/prop3_main.jpg', '2023-01-05', TRUE),
('img13', 'prop3', 'property-images/prop3_interior.jpg', '2023-01-05', FALSE),
('img14', 'prop3', 'property-images/prop3_kitchen.jpg', '2023-01-05', FALSE),
('img15', 'prop3', 'property-images/prop3_bathroom.jpg', '2023-01-05', FALSE),

-- Property 4 images
('img16', 'prop4', 'property-images/prop4_main.jpg', '2022-02-20', TRUE),
('img17', 'prop4', 'property-images/prop4_living.jpg', '2022-02-20', FALSE),
('img18', 'prop4', 'property-images/prop4_bedroom.jpg', '2022-02-20', FALSE),
('img19', 'prop4', 'property-images/prop4_view.jpg', '2022-02-20', FALSE),
('img20', 'prop4', 'property-images/prop4_kitchen.jpg', '2022-02-20', FALSE),

-- Add a few more for the other properties
('img21', 'prop5', 'property-images/prop5_main.jpg', '2022-04-15', TRUE),
('img22', 'prop5', 'property-images/prop5_living.jpg', '2022-04-15', FALSE),
('img23', 'prop5', 'property-images/prop5_terrace.jpg', '2022-04-15', FALSE),

('img24', 'prop6', 'property-images/prop6_main.jpg', '2023-02-10', TRUE),
('img25', 'prop6', 'property-images/prop6_garden.jpg', '2023-02-10', FALSE),

('img26', 'prop7', 'property-images/prop7_main.jpg', '2022-03-20', TRUE),
('img27', 'prop7', 'property-images/prop7_living.jpg', '2022-03-20', FALSE),

('img28', 'prop8', 'property-images/prop8_main.jpg', '2022-05-10', TRUE),
('img29', 'prop8', 'property-images/prop8_garden.jpg', '2022-05-10', FALSE),

('img30', 'prop9', 'property-images/prop9_main.jpg', '2023-03-05', TRUE),
('img31', 'prop9', 'property-images/prop9_interior.jpg', '2023-03-05', FALSE),

('img32', 'prop10', 'property-images/prop10_main.jpg', '2022-05-01', TRUE),
('img33', 'prop10', 'property-images/prop10_living.jpg', '2022-05-01', FALSE),

('img34', 'prop11', 'property-images/prop11_main.jpg', '2022-06-10', TRUE),
('img35', 'prop11', 'property-images/prop11_pool.jpg', '2022-06-10', FALSE),

('img36', 'prop12', 'property-images/prop12_main.jpg', '2023-04-05', TRUE),
('img37', 'prop12', 'property-images/prop12_view.jpg', '2023-04-05', FALSE); 
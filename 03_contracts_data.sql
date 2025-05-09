-- Insert rental contracts for rented properties
INSERT INTO rental_contracts (
    id, property_id, renter_id, start_date, end_date, monthly_rent, security_deposit,
    status, payment_due_day, created_at, signed_document, document_url
)
VALUES
-- Property 1 (Ahmed Khan's apartment) rented to Mohammad Abbas
('contract1', 'prop1', 'rent1', '2022-02-15', '2023-02-14', 4500, 4500, 
'active', 1, '2022-02-10', TRUE, 'contracts/contract1.pdf'),

-- Property 2 (Ahmed Khan's villa) rented to Sarah Talal
('contract2', 'prop2', 'rent2', '2022-03-25', '2023-03-24', 8500, 8500, 
'active', 1, '2022-03-20', TRUE, 'contracts/contract2.pdf'),

-- Property 4 (Fatima Ali's seafront apartment) rented to Khalid Nasser
('contract3', 'prop4', 'rent3', '2022-03-05', '2023-03-04', 5200, 5200, 
'active', 5, '2022-02-28', TRUE, 'contracts/contract3.pdf'),

-- Property 5 (Fatima Ali's penthouse) rented to Nora Saeed
('contract4', 'prop5', 'rent4', '2022-05-01', '2023-04-30', 12000, 12000, 
'active', 5, '2022-04-25', TRUE, 'contracts/contract4.pdf'),

-- Property 7 (Omar Hassan's apartment) rented to Yusuf Malik
('contract5', 'prop7', 'rent5', '2022-04-05', '2023-04-04', 4000, 4000, 
'active', 10, '2022-03-30', TRUE, 'contracts/contract5.pdf'),

-- Property 8 (Omar Hassan's family home) rented to Aisha Faisal
('contract6', 'prop8', 'rent6', '2022-05-25', '2023-05-24', 7500, 7500, 
'active', 10, '2022-05-20', TRUE, 'contracts/contract6.pdf'),

-- Property 10 (Layla Mahmoud's elegant apartment) rented to Rashid Abdullah
('contract7', 'prop10', 'rent7', '2022-05-15', '2023-05-14', 5500, 5500, 
'active', 15, '2022-05-10', TRUE, 'contracts/contract7.pdf'),

-- Property 11 (Layla Mahmoud's luxury villa) rented to Maryam Zain
('contract8', 'prop11', 'rent8', '2022-06-25', '2023-06-24', 14000, 14000, 
'active', 15, '2022-06-20', TRUE, 'contracts/contract8.pdf'),

-- Historical contracts (already completed)
-- Property 1 previous tenant
('contract9', 'prop1', 'rent9', '2021-02-15', '2022-02-14', 4300, 4300, 
'completed', 1, '2021-02-10', TRUE, 'contracts/contract9.pdf'),

-- Property 4 previous tenant
('contract10', 'prop4', 'rent10', '2021-03-05', '2022-03-04', 5000, 5000, 
'completed', 5, '2021-02-28', TRUE, 'contracts/contract10.pdf');

-- Insert payments for active contracts
INSERT INTO payments (
    id, contract_id, amount, payment_date, due_date, payment_type, status, transaction_reference
)
VALUES
-- Payments for Contract 1 (Mohammad Abbas - Monthly rent: 4500)
('pay1', 'contract1', 4500, '2022-02-15', '2022-02-15', 'bank_transfer', 'completed', 'TR123456'),
('pay2', 'contract1', 4500, '2022-03-01', '2022-03-01', 'bank_transfer', 'completed', 'TR123457'),
('pay3', 'contract1', 4500, '2022-04-01', '2022-04-01', 'bank_transfer', 'completed', 'TR123458'),
('pay4', 'contract1', 4500, '2022-05-01', '2022-05-01', 'bank_transfer', 'completed', 'TR123459'),
('pay5', 'contract1', 4500, '2022-06-01', '2022-06-01', 'bank_transfer', 'completed', 'TR123460'),
('pay6', 'contract1', 4500, '2022-07-01', '2022-07-01', 'bank_transfer', 'completed', 'TR123461'),
('pay7', 'contract1', 4500, '2022-08-01', '2022-08-01', 'bank_transfer', 'completed', 'TR123462'),
('pay8', 'contract1', 4500, '2022-09-01', '2022-09-01', 'bank_transfer', 'completed', 'TR123463'),
('pay9', 'contract1', 4500, '2022-10-01', '2022-10-01', 'bank_transfer', 'completed', 'TR123464'),
('pay10', 'contract1', 4500, '2022-11-01', '2022-11-01', 'bank_transfer', 'completed', 'TR123465'),
('pay11', 'contract1', 4500, '2022-12-01', '2022-12-01', 'bank_transfer', 'completed', 'TR123466'),
('pay12', 'contract1', 4500, '2023-01-01', '2023-01-01', 'bank_transfer', 'completed', 'TR123467'),
('pay13', 'contract1', 4500, '2023-02-01', '2023-02-01', 'bank_transfer', 'completed', 'TR123468'),

-- Payments for Contract 2 (Sarah Talal - Monthly rent: 8500)
('pay14', 'contract2', 8500, '2022-03-25', '2022-03-25', 'credit_card', 'completed', 'TR223456'),
('pay15', 'contract2', 8500, '2022-04-01', '2022-04-01', 'credit_card', 'completed', 'TR223457'),
('pay16', 'contract2', 8500, '2022-05-01', '2022-05-01', 'credit_card', 'completed', 'TR223458'),
('pay17', 'contract2', 8500, '2022-06-01', '2022-06-01', 'credit_card', 'completed', 'TR223459'),
('pay18', 'contract2', 8500, '2022-07-01', '2022-07-01', 'credit_card', 'completed', 'TR223460'),
('pay19', 'contract2', 8500, '2022-08-01', '2022-08-01', 'credit_card', 'completed', 'TR223461'),
('pay20', 'contract2', 8500, '2022-09-01', '2022-09-01', 'credit_card', 'completed', 'TR223462'),
('pay21', 'contract2', 8500, '2022-10-01', '2022-10-01', 'credit_card', 'completed', 'TR223463'),
('pay22', 'contract2', 8500, '2022-11-01', '2022-11-01', 'credit_card', 'completed', 'TR223464'),
('pay23', 'contract2', 8500, '2022-12-01', '2022-12-01', 'credit_card', 'completed', 'TR223465'),
('pay24', 'contract2', 8500, '2023-01-01', '2023-01-01', 'credit_card', 'completed', 'TR223466'),
('pay25', 'contract2', 8500, '2023-02-01', '2023-02-01', 'credit_card', 'completed', 'TR223467'),
('pay26', 'contract2', 8500, '2023-03-01', '2023-03-01', 'credit_card', 'completed', 'TR223468'),

-- Payments for Contract 3 (Khalid Nasser - Monthly rent: 5200)
('pay27', 'contract3', 5200, '2022-03-05', '2022-03-05', 'bank_transfer', 'completed', 'TR323456'),
('pay28', 'contract3', 5200, '2022-04-05', '2022-04-05', 'bank_transfer', 'completed', 'TR323457'),
('pay29', 'contract3', 5200, '2022-05-05', '2022-05-05', 'bank_transfer', 'completed', 'TR323458'),
('pay30', 'contract3', 5200, '2022-06-05', '2022-06-05', 'bank_transfer', 'completed', 'TR323459'),
('pay31', 'contract3', 5200, '2022-07-05', '2022-07-05', 'bank_transfer', 'completed', 'TR323460'),
('pay32', 'contract3', 5200, '2022-08-05', '2022-08-05', 'bank_transfer', 'completed', 'TR323461'),
('pay33', 'contract3', 5200, '2022-09-05', '2022-09-05', 'bank_transfer', 'completed', 'TR323462'),
('pay34', 'contract3', 5200, '2022-10-05', '2022-10-05', 'bank_transfer', 'completed', 'TR323463'),
('pay35', 'contract3', 5200, '2022-11-05', '2022-11-05', 'bank_transfer', 'completed', 'TR323464'),
('pay36', 'contract3', 5200, '2022-12-05', '2022-12-05', 'bank_transfer', 'completed', 'TR323465'),
('pay37', 'contract3', 5200, '2023-01-05', '2023-01-05', 'bank_transfer', 'completed', 'TR323466'),
('pay38', 'contract3', 5200, '2023-02-05', '2023-02-05', 'bank_transfer', 'completed', 'TR323467'),

-- Add a few other sample payments for other contracts
('pay39', 'contract4', 12000, '2022-05-01', '2022-05-01', 'credit_card', 'completed', 'TR423456'),
('pay40', 'contract4', 12000, '2022-06-05', '2022-06-05', 'credit_card', 'completed', 'TR423457'),
('pay41', 'contract4', 12000, '2022-07-05', '2022-07-05', 'credit_card', 'completed', 'TR423458'),

('pay42', 'contract5', 4000, '2022-04-10', '2022-04-10', 'bank_transfer', 'completed', 'TR523456'),
('pay43', 'contract5', 4000, '2022-05-10', '2022-05-10', 'bank_transfer', 'completed', 'TR523457'),
('pay44', 'contract5', 4000, '2022-06-10', '2022-06-10', 'bank_transfer', 'completed', 'TR523458'),

-- Add a late payment
('pay45', 'contract6', 7500, '2022-05-28', '2022-05-25', 'bank_transfer', 'completed', 'TR623456'),
('pay46', 'contract6', 7500, '2022-06-25', '2022-06-25', 'bank_transfer', 'completed', 'TR623457'),
('pay47', 'contract6', 7500, '2022-07-25', '2022-07-25', 'bank_transfer', 'completed', 'TR623458'),

-- Add missing payment
('pay48', 'contract7', 5500, '2022-05-15', '2022-05-15', 'credit_card', 'completed', 'TR723456'),
('pay49', 'contract7', 5500, '2022-06-15', '2022-06-15', 'credit_card', 'completed', 'TR723457'),
-- Missing July payment for contract7
('pay50', 'contract7', 5500, '2022-07-20', '2022-07-15', 'credit_card', 'pending', NULL);

-- Insert transactions
INSERT INTO transactions (
    id, property_id, renter_id, landlord_id, amount, currency, type, status,
    due_date, paid_date, description_en, description_ar
)
VALUES
-- Security deposit transactions
('trans1', 'prop1', 'rent1', 'land1', 4500, 'SAR', 'security_deposit', 'completed',
'2022-02-15', '2022-02-15', 'Security deposit for Luxury Apartment in Al Olaya', 'تأمين للشقة الفاخرة في العليا'),

('trans2', 'prop2', 'rent2', 'land1', 8500, 'SAR', 'security_deposit', 'completed',
'2022-03-25', '2022-03-25', 'Security deposit for Modern Villa in Al Yasmin', 'تأمين للفيلا العصرية في الياسمين'),

-- Rent transactions
('trans3', 'prop1', 'rent1', 'land1', 4500, 'SAR', 'rent', 'completed',
'2022-03-01', '2022-03-01', 'March 2022 rent for Luxury Apartment in Al Olaya', 'إيجار مارس 2022 للشقة الفاخرة في العليا'),

('trans4', 'prop2', 'rent2', 'land1', 8500, 'SAR', 'rent', 'completed',
'2022-04-01', '2022-04-01', 'April 2022 rent for Modern Villa in Al Yasmin', 'إيجار أبريل 2022 للفيلا العصرية في الياسمين'),

-- Maintenance fee
('trans5', 'prop1', 'rent1', 'land1', 350, 'SAR', 'maintenance', 'completed',
'2022-04-10', '2022-04-15', 'Plumbing repair in bathroom', 'إصلاح السباكة في الحمام'),

-- Late payment fee
('trans6', 'prop6', 'rent6', 'land3', 200, 'SAR', 'late_fee', 'completed',
'2022-05-26', '2022-05-28', 'Late payment fee for May 2022', 'رسوم تأخير الدفع لشهر مايو 2022'); 
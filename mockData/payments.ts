import { Bill, PaymentMethod } from '@/types/payment';

export const mockBills: Bill[] = [
  {
    id: '1',
    type: 'electricity',
    amount: 75.5,
    dueDate: '2024-04-15',
    status: 'pending',
    description: 'Electricity Bill - March 2024',
    billNumber: 'EL-2024-03-001',
    propertyId: 'prop-001',
    electricityCompany: 'IDECO',
    contractNumber: '123456789',
  },
  {
    id: '2',
    type: 'water',
    amount: 25.0,
    dueDate: '2024-04-10',
    status: 'pending',
    description: 'Water Bill - March 2024',
    billNumber: 'WT-2024-03-001',
    propertyId: 'prop-001',
    subscriberNumber: '987654321',
  },
  {
    id: '3',
    type: 'rent',
    amount: 500.0,
    dueDate: '2024-04-01',
    status: 'pending',
    description: 'Monthly Rent - April 2024',
    propertyId: 'prop-001',
    period: 'April 2024',
    landlordPaymentNumber: 'JO123456789012345678901234',
  },
];

export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'credit_card',
    name: 'Credit Card',
    icon: 'credit-card',
  },
  {
    id: '2',
    type: 'bank_transfer',
    name: 'Bank Transfer',
    icon: 'bank',
  },
  {
    id: '3',
    type: 'e_wallet',
    name: 'e-Wallet',
    icon: 'wallet',
  },
];

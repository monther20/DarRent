export type BillType = 'electricity' | 'water' | 'rent';

export interface Bill {
  id: string;
  type: BillType;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  billNumber?: string;
  propertyId?: string;
  period?: string;
  // e-Fawateercom specific fields
  subscriberNumber?: string; // For water bills
  electricityCompany?: 'IDECO' | 'JEPCO' | 'EDCO'; // For electricity bills
  contractNumber?: string; // For electricity bills
  landlordPaymentNumber?: string; // For rent payments
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'bank_transfer' | 'e_wallet';
  name: string;
  icon: string;
}

export interface PaymentTransaction {
  id: string;
  billId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: PaymentMethod;
  timestamp: string;
  referenceNumber: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  referenceNumber: string;
  message: string;
}

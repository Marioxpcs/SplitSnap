// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Groups: undefined;
  History: undefined;
  Scan: undefined;
};

export type ScanStackParamList = {
  ScanCamera: undefined;
  Split: { receiptData: ReceiptData };
};

// Domain types

export type User = {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
};

export type Group = {
  id: string;
  name: string;
  description?: string;
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type SplitType = 'equal' | 'exact' | 'percentage' | 'shares';

export type Split = {
  userId: string;
  amount: number;      // absolute amount owed by this user
  percentage?: number; // used when splitType === 'percentage'
  shares?: number;     // used when splitType === 'shares'
  isPaid: boolean;
};

export type Expense = {
  id: string;
  groupId: string;
  description: string;
  totalAmount: number;
  currency: string;
  paidBy: string;       // userId of who paid
  splitType: SplitType;
  splits: Split[];
  receiptImageUrl?: string;
  category?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Balance = {
  fromUserId: string;   // who owes
  toUserId: string;     // who is owed
  amount: number;
  currency: string;
  groupId?: string;     // undefined means across all groups
};

// Receipt / scanning types

export type ReceiptItem = {
  name: string;
  price: number;
};

export type ReceiptData = {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
};

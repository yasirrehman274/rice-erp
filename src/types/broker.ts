export type BrokerStatus = "active" | "inactive";
export type CommissionType = "fixed" | "percentage";

export interface Broker {
  id: string;
  brokerNumber: string;
  name: string;
  phone: string;
  alternatePhone: string;
  city: string;
  address: string;
  commissionType: "" | CommissionType;
  commissionRate: number;
  status: BrokerStatus;
  notes: string;
  createdAt: string;
}

export interface BrokerFormValues {
  name: string;
  phone: string;
  alternatePhone: string;
  city: string;
  address: string;
  commissionType: "" | CommissionType;
  commissionRate: string;
  status: BrokerStatus;
  notes: string;
}

export type BrokerDealType = "purchase" | "sale";

export interface BrokerDeal {
  id: string;
  number: string;
  type: BrokerDealType;
  date: string;
  counterpartName: string;
  productName: string;
  quantity: string;
  amount: number;
  status: string;
  paymentStatus: string;
}

export interface BrokerStats {
  purchaseDeals: number;
  purchaseAmount: number;
  salesDeals: number;
  salesAmount: number;
  deals: BrokerDeal[];
}

export interface BrokerReportRow {
  brokerId: string;
  brokerName: string;
  status: BrokerStatus | "";
  purchaseDeals: number;
  purchaseAmount: number;
  salesDeals: number;
  salesAmount: number;
}
export interface DeliverySlot {
  value: string;
  label: string;
}

export type OrderType = "delivery" | "pickup";
export type PaymentMethod = "cash" | "card";

export interface CheckoutFormData {
  orderType: OrderType;
  name: string;
  phone: string;
  email: string;
  addressLine: string;
  addressNotes?: string;
  deliveryTime: string;
  driverNotes?: string;
  paymentMethod: PaymentMethod;
  geo?: {
    lat: number;
    lng: number;
  };
}

export interface PickupSlot {
  value: string;
  label: string;
}

export interface CheckoutFormData {
  name: string;
  phone: string;
  email: string;
  pickupSlot: string;
  notes?: string;
}

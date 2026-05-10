export type CarCategory = "5 Seater" | "7 Seater";
export type CarStatus = "tersedia" | "disewa" | "perbaikan";
export type BookingStatus = "menunggu" | "dikonfirmasi" | "selesai" | "dibatalkan";

export interface Car {
  id: string;
  name: string;
  category: CarCategory;
  price: number;
  transmission: "AT" | "MT";
  status: CarStatus;
  image?: string;
  isDriverIncluded?: boolean;
}

export interface Booking {
  id: string;
  carId: string;
  carName: string;
  userId: string;
  userName: string;
  userPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: BookingStatus;
  paymentProof?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isAdmin: boolean;
  role: 'admin' | 'customer';
  createdAt?: string;
}

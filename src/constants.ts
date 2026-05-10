import { Car } from "./types";

export const CAR_DATA: Partial<Car>[] = [
  // 5 Seater (Mulai Rp 420.000)
  { name: "New Brio AT", category: "5 Seater", price: 420000, transmission: "AT" },
  { name: "Toyota Agya AT", category: "5 Seater", price: 420000, transmission: "AT" },
  { name: "Honda Jazz RS", category: "5 Seater", price: 550000, transmission: "AT" },
  { name: "Toyota Raize GR", category: "5 Seater", price: 550000, transmission: "AT" },
  { name: "Mazda 2 Soul Red", category: "5 Seater", price: 600000, transmission: "AT" },
  
  // 7 Seater (Mulai Rp 450.000)
  { name: "All New Xenia MT", category: "7 Seater", price: 450000, transmission: "MT" },
  { name: "All New Xenia AT", category: "7 Seater", price: 500000, transmission: "AT" },
  { name: "Toyota Calya Premium", category: "7 Seater", price: 450000, transmission: "AT" },
  { name: "Toyota Avanza Facelift", category: "7 Seater", price: 500000, transmission: "AT" },
  { name: "Mitsubishi Xpander Ultimate", category: "7 Seater", price: 580000, transmission: "AT" },
  { name: "Suzuki Ertiga Hybrid", category: "7 Seater", price: 500000, transmission: "AT" },
  { name: "Toyota Innova Reborn Diesel", category: "7 Seater", price: 780000, transmission: "AT" },
  { name: "Toyota Innova Zenix Q", category: "7 Seater", price: 1400000, transmission: "AT" },
  { name: "Toyota Fortuner VRZ", category: "7 Seater", price: 1200000, transmission: "AT" },
  { name: "Toyota Alphard Gen 4", category: "7 Seater", price: 3500000, transmission: "AT", isDriverIncluded: true },
];

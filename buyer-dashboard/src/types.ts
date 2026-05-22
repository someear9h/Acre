export interface CropListing {
  id: number;
  farmer_name: string;
  phone: string;
  district: string;
  commodity: string;
  quantity: string;
  grade: string;
  emoji: string;
  askingPrice?: string | number;
}

export interface EvaluateOfferResponse {
  status: string;
  commodity: string;
  district: string;
  market: string;
  official_mandi_price: number;
  buyer_offer_price: number;
  price_difference: number;
  ai_advisory: string;
}

export interface Toast {
  id: number;
  type: "success" | "error";
  title: string;
  message: string;
}

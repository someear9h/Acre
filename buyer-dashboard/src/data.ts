import type { CropListing } from "./types";

export const CROP_LISTINGS: CropListing[] = [
  {
    id: 1,
    farmer_name: "Ram Singh",
    phone: "+918983404900",
    district: "Patiala",
    commodity: "Potato",
    quantity: "50 Quintals",
    grade: "Grade A",
    emoji: "🥔",
    askingPrice: 750,
  },
  {
    id: 2,
    farmer_name: "Gurpreet Kaur",
    phone: "+919876543210",
    district: "Jalandhar",
    commodity: "Bottle gourd",
    quantity: "30 Quintals",
    grade: "Grade A",
    emoji: "🫛",
    askingPrice: 1200,
  },
  {
    id: 3,
    farmer_name: "Amarjit Dhillon",
    phone: "+919812345678",
    district: "Ludhiana",
    commodity: "Wheat",
    quantity: "120 Quintals",
    grade: "Grade A+",
    emoji: "🌾",
    askingPrice: 2200,
  },
];

export const API_BASE_URL = "http://localhost:8000";

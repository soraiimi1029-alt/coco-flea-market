export interface VendorRow {
  id: string;
  booth_number: string;
  store_name: string;
  profile: string;
  emoji: string;
  avatar_bg: string;
  avatar_url: string | null;
  category: string;
  instagram: string | null;
  target_gender: string;
}

export interface ProductRow {
  id: string;
  vendor_id: string;
  name: string;
  price: number | null;
  description: string;
  photo_url: string | null;
  category: string;
  condition: string;
  in_stock: boolean;
  like_count: number;
}

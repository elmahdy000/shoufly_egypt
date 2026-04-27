import { IconType } from "react-icons";

export type UserRole = 'CLIENT' | 'VENDOR' | 'ADMIN' | 'DELIVERY' | null;

export interface Category {
  id: string | number;
  name: string;
  icon: any; // Can be a string key or IconType component
  slug?: string;
  count?: number;
}

export interface FeaturedService {
  id: string | number;
  name: string;
  desc: string;
  icon: any;
  popular?: boolean;
  slug?: string;
}

export interface Deal {
  id: string | number;
  title: string;
  vendor: string;
  price: string | number;
  oldPrice?: string | number;
  img: string;
}

export interface TrustMetric {
  label: string;
  value: string;
  sub: string;
  icon: any;
}

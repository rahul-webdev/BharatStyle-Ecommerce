import { siteConfig as config } from "@/lib/config";

export const siteConfig = config;

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export type Category = {
  title: string;
  slug: string;
};

export const categories: Category[] = [
  { title: "Men's Clothes", slug: "men-clothes" },
  { title: "Women's Clothes", slug: "women-clothes" },
  { title: "Kids Clothes", slug: "kids-clothes" },
  { title: "Bags and Shoes", slug: "bag-shoes" },
];

export const dressStyles = [
  { id: 1, title: "Casual", slug: "casual", url: "/shop?style=casual" },
  { id: 2, title: "Formal", slug: "formal", url: "/shop?style=formal" },
  { id: 3, title: "Party", slug: "party", url: "/shop?style=party" },
  { id: 4, title: "Gym", slug: "gym", url: "/shop?style=gym" },
];

export type Product = {
  id: string | number;
  title: string;
  srcUrl?: string;
  gallery?: string[];
  category: string;
  price: number;
  stock: number;
  status: string;
  discount: {
    amount: number;
    percentage: number;
  };
  rating: number;
};

export const products: Product[] = [
  {
    id: 1,
    title: "T-Shirt",
    category: "Clothing",
    price: 500,
    stock: 100,
    status: "active",
    discount: { amount: 0, percentage: 0 },
    rating: 4.5,
  },
  {
    id: 2,
    title: "Jeans",
    category: "Clothing",
    price: 1500,
    stock: 50,
    status: "active",
    discount: { amount: 0, percentage: 10 },
    rating: 4.0,
  },
  {
    id: 3,
    title: "Sneakers",
    category: "Footwear",
    price: 2500,
    stock: 2,
    status: "low_stock",
    discount: { amount: 0, percentage: 0 },
    rating: 4.8,
  },
  {
    id: 4,
    title: "Watch",
    category: "Accessories",
    price: 5000,
    stock: 0,
    status: "out_of_stock",
    discount: { amount: 0, percentage: 0 },
    rating: 4.2,
  },
];

export type OrderItem = {
  id: string | number;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  date: string;
  status: "pending" | "processing" | "delivered" | "cancelled" | "completed";
  total: number;
  customer: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
};

export const orders: Order[] = [
  {
    id: "ORD-001",
    date: "2024-02-01",
    status: "processing",
    total: 2500,
    customer: "John Doe",
    items: [
      { id: 1, name: "T-Shirt", quantity: 2, price: 500 },
      { id: 2, name: "Jeans", quantity: 1, price: 1500 }
    ],
    shippingAddress: "123 Main St, Mumbai",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-002",
    date: "2024-02-02",
    status: "completed",
    total: 1200,
    customer: "Jane Smith",
    items: [
      { id: 1, name: "T-Shirt", quantity: 2, price: 600 }
    ],
    shippingAddress: "456 Park Ave, Delhi",
    paymentMethod: "UPI",
  },
  {
    id: "ORD-003",
    date: "2024-02-03",
    status: "pending",
    total: 5000,
    customer: "Bob Johnson",
    items: [
      { id: 4, name: "Watch", quantity: 1, price: 5000 }
    ],
    shippingAddress: "789 Lake Rd, Bangalore",
    paymentMethod: "COD",
  },
  {
    id: "ORD-004",
    date: "2024-02-04",
    status: "cancelled",
    total: 3000,
    customer: "Alice Brown",
    items: [
      { id: 3, name: "Sneakers", quantity: 1, price: 2500 },
      { id: 1, name: "T-Shirt", quantity: 1, price: 500 }
    ],
    shippingAddress: "321 Hill St, Chennai",
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-005",
    date: "2024-02-05",
    status: "completed",
    total: 4500,
    customer: "Charlie Wilson",
    items: [
      { id: 2, name: "Jeans", quantity: 3, price: 1500 }
    ],
    shippingAddress: "654 River Dr, Kolkata",
    paymentMethod: "UPI",
  },
];

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  orders: number;
  spent: number;
  totalSpent: number;
  lastOrder?: string;
  joinDate?: string;
};

export const customers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
    status: "active",
    orders: 5,
    spent: 12000,
    totalSpent: 12000,
    lastOrder: "2024-02-01",
    joinDate: "2023-12-01",
  },
  {
    id: "CUST-002",
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "+91 98765 43211",
    status: "active",
    orders: 3,
    spent: 5000,
    totalSpent: 5000,
    lastOrder: "2024-02-02",
    joinDate: "2024-01-10",
  },
  {
    id: "CUST-003",
    name: "Bob Johnson",
    email: "bob@example.com",
    phone: "+91 98765 43212",
    status: "inactive",
    orders: 1,
    spent: 1000,
    totalSpent: 1000,
    lastOrder: "2024-01-15",
    joinDate: "2024-01-15",
  },
];

export type NavItem = {
  id: number;
  label: string;
  url: string;
  type: string;
  children?: NavItem[];
};

export const navbar: NavItem[] = [
  { id: 1, label: "Shop", url: "/shop", type: "MenuList", children: [] },
  { id: 2, label: "On Sale", url: "/shop#on-sale", type: "MenuItem" },
  { id: 3, label: "New Arrivals", url: "/shop#new-arrivals", type: "MenuItem" },
  { id: 4, label: "Brands", url: "/shop#brands", type: "MenuItem" },
];

export type FooterLink = {
  id: number;
  title: string;
  children: { id: number; label: string; url: string }[];
};

export const footerLinks: FooterLink[] = [
  {
    id: 1,
    title: "company",
    children: [
      { id: 11, label: "about", url: "#" },
      { id: 12, label: "features", url: "#" },
    ],
  },
];

export type Brand = {
  id: string | number;
  name?: string;
  srcUrl?: string;
};

export const brands: Brand[] = [
  { id: 1, name: "Versace", srcUrl: "/icons/versace.svg" },
  { id: 2, name: "Zara", srcUrl: "/icons/zara.svg" },
  { id: 3, name: "Gucci", srcUrl: "/icons/gucci.svg" },
];

export type Review = {
  id: number;
  user: string;
  content: string;
  rating: number;
  date: string;
};

export const reviews: Review[] = [
  { id: 1, user: "Alex M.", content: "Great product!", rating: 5, date: "2024-01-01" },
  { id: 2, user: "Sarah K.", content: "Good quality.", rating: 4, date: "2024-01-05" },
];

export type SiteConfig = typeof siteConfig;

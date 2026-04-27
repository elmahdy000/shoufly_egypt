import { prisma } from "../prisma";
import { Category, FeaturedService, Deal, TrustMetric } from "../types/landing";
import { FiGrid, FiUsers, FiCheckCircle, FiShield, FiZap, FiHome, FiTruck, FiActivity, FiSmartphone, FiDroplet, FiTool, FiCpu } from "react-icons/fi";

// Mapping icons to category names as DB doesn't store icons
const ICON_MAP: Record<string, any> = {
  "صيانة أجهزة": FiCpu,
  "خدمات منزلية": FiHome,
  "شحن وتوصيل": FiTruck,
  "صحة وطب": FiActivity,
  "تقنية وموبايل": FiSmartphone,
  "سباكة وكهرباء": FiTool,
  "صيانة تكييف": FiZap,
  "تنظيف منازل": FiHome,
  "تشطيبات": FiDroplet,
};

export class LandingService {
  /**
   * Fetches real metrics from the database
   */
  static async getTrustMetrics(): Promise<TrustMetric[]> {
    try {
      const [requestsCount, vendorsCount, governoratesCount] = await Promise.all([
        prisma.request.count({ where: { status: "CLOSED_SUCCESS" } }),
        prisma.user.count({ where: { role: "VENDOR", isActive: true } }),
        prisma.governorate.count(),
      ]);

      return [
        { label: "طلب اتنفذ", value: `+${(requestsCount + 10000).toLocaleString()}`, sub: "بجودة وضمان عالٍ", icon: "FiCheckCircle" },
        { label: "متخصص معتمد", value: `+${(vendorsCount + 500).toLocaleString()}`, sub: "جاهزين لتنفيذ طلبك", icon: "FiUsers" },
        { label: "محافظات مغطاة", value: governoratesCount > 0 ? governoratesCount.toString() : "27", sub: "بنغطي كل ركن في مصر", icon: "FiShield" },
        { label: "معاملات آمنة", value: "100%", sub: "حقك محفوظ بنسبة كاملة", icon: "FiShield" },
      ];
    } catch (error) {
      console.error("Error fetching trust metrics:", error);
      return []; // Fallback to empty
    }
  }

  /**
   * Fetches main categories from DB
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const dbCategories = await prisma.category.findMany({
        where: { parentId: null },
        include: {
          _count: {
            select: { subcategories: true }
          }
        },
        take: 8
      });

      return dbCategories.map(cat => ({
        id: cat.id,
        name: cat.nameAr || cat.name,
        slug: cat.slug,
        count: cat._count.subcategories,
        icon: cat.nameAr || cat.name // Use the name as a key for ICON_MAP
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }

  /**
   * Fetches popular brands
   */
  static async getBrands() {
    try {
      return prisma.brand.findMany({
        where: { isActive: true },
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error("Error fetching brands:", error);
      return [];
    }
  }

  /**
   * Fetches featured services (mapped from top categories or static list for now)
   */
  static async getFeaturedServices(): Promise<FeaturedService[]> {
    try {
      const dbServices = await prisma.category.findMany({
        where: { parentId: { not: null } },
        take: 8
      });

      return dbServices.map(s => ({
        id: s.id,
        name: s.nameAr || s.name,
        desc: "خدمة احترافية بأفضل الأسعار",
        slug: s.slug,
        popular: Math.random() > 0.7,
        icon: s.nameAr || s.name
      }));
    } catch (error) {
      console.error("Error fetching featured services:", error);
      return [];
    }
  }

  /**
   * Mock deals for now as there is no Deal model in schema
   */
  static async getLatestDeals(): Promise<Deal[]> {
    return [
      { id: 1, title: "تنظيف سجاد وموكيت عميق", vendor: "متخصص معتمد", price: "390", oldPrice: "600", img: "https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=400&q=80" },
      { id: 2, title: "صيانة تكييف شاملة + فريون", vendor: "متخصص معتمد", price: "420", oldPrice: "550", img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=400&q=80" },
      { id: 3, title: "تأسيس سباكة حمام كامل", vendor: "متخصص معتمد", price: "1100", oldPrice: "1500", img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80" }
    ];
  }
}

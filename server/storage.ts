import {
  type User,
  type UpsertUser,
  type Tool,
  type InsertTool,
  type Category,
  type InsertCategory,
  type Purchase,
  type InsertPurchase,
  type DiscountCode,
  type InsertDiscountCode,
  type Payment,
  type InsertPayment,
  type KeyValidation,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { mockCategories, mockTools, mockUser, mockAdminUser, mockPayments, mockPurchases } from "../client/src/lib/mockData";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: string): Promise<User>;
  updateUserProfile(userId: string, profile: { firstName?: string; lastName?: string; email?: string }): Promise<User>;
  updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>;

  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Tool operations
  getTools(): Promise<(Tool & { category?: Category })[]>;
  getToolById(id: string): Promise<(Tool & { category?: Category }) | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: string, tool: Partial<InsertTool>): Promise<Tool>;
  deleteTool(id: string): Promise<void>;
  incrementToolViews(id: string): Promise<void>;

  // Purchase operations
  getUserPurchases(userId: string): Promise<(Purchase & { tool: Tool })[]>;
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchaseByKey(keyValue: string): Promise<(Purchase & { user: User; tool: Tool }) | undefined>;
  updatePurchaseKey(purchaseId: string, newKey: string): Promise<Purchase>;

  // Discount code operations
  getDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode>;
  useDiscountCode(id: string): Promise<DiscountCode>;

  // Payment operations
  getUserPayments(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;

  // Key validation operations
  logKeyValidation(validation: Omit<KeyValidation, 'id' | 'createdAt'>): Promise<KeyValidation>;
  getKeyValidationStats(): Promise<{ totalToday: number; successToday: number; failedToday: number }>;
  getRecentKeyValidations(limit?: number): Promise<(KeyValidation & { user?: User; tool?: Tool })[]>;

  // Admin operations
  getUsersWithStats(): Promise<(User & { purchaseCount: number; totalSpent: string })[]>;
  getSystemStats(): Promise<{
    totalUsers: number;
    totalTools: number;
    monthlyRevenue: string;
    totalRevenue: string;
  }>;
}

export class MemStorage implements IStorage {
  // In-memory storage
  private users: Map<string, User> = new Map();
  private tools: Map<string, Tool & { category?: Category }> = new Map();
  private categories: Map<string, Category> = new Map();
  private purchases: Map<string, Purchase & { user?: User; tool?: Tool }> = new Map();
  private discountCodes: Map<string, DiscountCode> = new Map();
  private payments: Map<string, Payment> = new Map();
  private keyValidations: Map<string, KeyValidation & { user?: User; tool?: Tool }> = new Map();

  constructor() {
    // Initialize mock data
    mockCategories.forEach(cat => this.categories.set(cat.id, cat));
    mockTools.forEach(tool => this.tools.set(tool.id, tool));
    this.users.set(mockUser.id, mockUser);
    this.users.set(mockAdminUser.id, mockAdminUser);
    mockPayments.forEach(payment => this.payments.set(payment.id, payment));
    mockPurchases.forEach(purchase => this.purchases.set(purchase.id, purchase));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: string, amount: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const currentBalance = Number(user.balance) || 0;
    const amountNum = Number(amount);
    const newBalance = currentBalance + amountNum;
    
    const updatedUser = { ...user, balance: String(newBalance), updatedAt: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserProfile(userId: string, profile: { firstName?: string; lastName?: string; email?: string }): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...profile, updatedAt: new Date() };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // For demo users, check against the hardcoded passwords in DEMO_USERS
    const DEMO_USERS = {
      'demo-user-1': { password: 'demo123' },
      'admin-user-1': { password: 'admin123' }
    } as Record<string, { password: string }>;
    
    const demoUser = DEMO_USERS[userId];
    if (!demoUser) {
      // For non-demo users, we don't have password storage in memory
      throw new Error("Password update not supported for this user");
    }
    
    if (demoUser.password !== currentPassword) {
      throw new Error("Current password is incorrect");
    }
    
    // Update the demo user password (in real app, this would be hashed)
    demoUser.password = newPassword;
    return true;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { id, ...category, createdAt: new Date() };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Tool operations
  async getTools(): Promise<(Tool & { category?: Category })[]> {
    return Array.from(this.tools.values());
  }

  async getToolById(id: string): Promise<(Tool & { category?: Category }) | undefined> {
    return this.tools.get(id);
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const id = randomUUID();
    const newTool: Tool = {
      id,
      ...tool,
      views: 0,
      rating: "0.0",
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tools.set(id, newTool);
    return newTool;
  }

  async updateTool(id: string, toolData: Partial<InsertTool>): Promise<Tool> {
    const tool = this.tools.get(id);
    if (!tool) throw new Error("Tool not found");
    
    const updatedTool = { ...tool, ...toolData, updatedAt: new Date() };
    this.tools.set(id, updatedTool);
    return updatedTool;
  }

  async deleteTool(id: string): Promise<void> {
    this.tools.delete(id);
  }

  async incrementToolViews(id: string): Promise<void> {
    const tool = this.tools.get(id);
    if (tool) {
      const updatedTool = { ...tool, views: (tool.views || 0) + 1 };
      this.tools.set(id, updatedTool);
    }
  }

  // Purchase operations
  async getUserPurchases(userId: string): Promise<(Purchase & { tool: Tool })[]> {
    return Array.from(this.purchases.values())
      .filter(p => p.userId === userId)
      .map(p => ({ ...p, tool: p.tool! }));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const id = randomUUID();
    const keyValue = randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase();
    const newPurchase: Purchase = {
      id,
      ...purchase,
      keyValue,
      createdAt: new Date(),
    };
    this.purchases.set(id, newPurchase);
    return newPurchase;
  }

  async getPurchaseByKey(keyValue: string): Promise<(Purchase & { user: User; tool: Tool }) | undefined> {
    const purchase = Array.from(this.purchases.values())
      .find(p => p.keyValue === keyValue && p.isActive && p.expiresAt > new Date());
    
    if (!purchase) return undefined;

    const user = this.users.get(purchase.userId);
    const tool = this.tools.get(purchase.toolId);
    
    if (!user || !tool) return undefined;

    return { ...purchase, user, tool };
  }

  async updatePurchaseKey(purchaseId: string, newKey: string): Promise<Purchase> {
    const purchase = this.purchases.get(purchaseId);
    if (!purchase) throw new Error("Purchase not found");
    
    const updatedPurchase = { ...purchase, keyValue: newKey };
    this.purchases.set(purchaseId, updatedPurchase);
    return updatedPurchase;
  }

  // Discount code operations
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return Array.from(this.discountCodes.values());
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    return Array.from(this.discountCodes.values())
      .find(dc => dc.code === code && dc.isActive);
  }

  async createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode> {
    const id = randomUUID();
    const newDiscountCode: DiscountCode = {
      id,
      ...discountCode,
      usageCount: 0,
      createdAt: new Date(),
    };
    this.discountCodes.set(id, newDiscountCode);
    return newDiscountCode;
  }

  async useDiscountCode(id: string): Promise<DiscountCode> {
    const discountCode = this.discountCodes.get(id);
    if (!discountCode) throw new Error("Discount code not found");
    
    const updatedCode = { ...discountCode, usageCount: discountCode.usageCount + 1 };
    this.discountCodes.set(id, updatedCode);
    return updatedCode;
  }

  // Payment operations
  async getUserPayments(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const newPayment: Payment = {
      id,
      ...payment,
      createdAt: new Date(),
    };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  // Key validation operations
  async logKeyValidation(validation: Omit<KeyValidation, 'id' | 'createdAt'>): Promise<KeyValidation> {
    const id = randomUUID();
    const newValidation: KeyValidation = {
      id,
      ...validation,
      createdAt: new Date(),
    };
    this.keyValidations.set(id, newValidation);
    return newValidation;
  }

  async getKeyValidationStats(): Promise<{ totalToday: number; successToday: number; failedToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayValidations = Array.from(this.keyValidations.values())
      .filter(v => v.createdAt >= today);
    
    const totalToday = todayValidations.length;
    const successToday = todayValidations.filter(v => v.isValid).length;
    
    return {
      totalToday,
      successToday,
      failedToday: totalToday - successToday,
    };
  }

  async getRecentKeyValidations(limit = 10): Promise<(KeyValidation & { user?: User; tool?: Tool })[]> {
    return Array.from(this.keyValidations.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Admin operations
  async getUsersWithStats(): Promise<(User & { purchaseCount: number; totalSpent: string })[]> {
    return Array.from(this.users.values()).map(user => {
      const userPurchases = Array.from(this.purchases.values())
        .filter(p => p.userId === user.id);
      
      const purchaseCount = userPurchases.length;
      const totalSpent = userPurchases
        .reduce((sum, p) => sum + Number(p.finalPrice), 0)
        .toString();
      
      return { ...user, purchaseCount, totalSpent };
    });
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalTools: number;
    monthlyRevenue: string;
    totalRevenue: string;
  }> {
    const totalUsers = this.users.size;
    const totalTools = Array.from(this.tools.values()).filter(t => t.isActive).length;
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const allPurchases = Array.from(this.purchases.values());
    const monthlyRevenue = allPurchases
      .filter(p => p.createdAt >= currentMonth)
      .reduce((sum, p) => sum + Number(p.finalPrice), 0)
      .toString();
    
    const totalRevenue = allPurchases
      .reduce((sum, p) => sum + Number(p.finalPrice), 0)
      .toString();
    
    return {
      totalUsers,
      totalTools,
      monthlyRevenue,
      totalRevenue,
    };
  }
}

export const storage = new MemStorage();
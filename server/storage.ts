import {
  users,
  tools,
  categories,
  purchases,
  discountCodes,
  payments,
  keyValidations,
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
import { db } from "./db";
import { eq, desc, and, sql, gte, count } from "drizzle-orm";
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

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserBalance(userId: string, amount: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        balance: sql`${users.balance} + ${amount}`,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, profile: { firstName?: string; lastName?: string; email?: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...profile,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserPassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // For database storage with demo users, we'll implement password checking
    // In real implementation, this would check against hashed passwords in database
    // For now, return true as placeholder - demo users don't have stored passwords
    return true;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Tool operations
  async getTools(): Promise<(Tool & { category?: Category })[]> {
    return await db
      .select()
      .from(tools)
      .leftJoin(categories, eq(tools.categoryId, categories.id))
      .where(eq(tools.isActive, true))
      .orderBy(desc(tools.createdAt));
  }

  async getToolById(id: string): Promise<(Tool & { category?: Category }) | undefined> {
    const [result] = await db
      .select()
      .from(tools)
      .leftJoin(categories, eq(tools.categoryId, categories.id))
      .where(and(eq(tools.id, id), eq(tools.isActive, true)));
    
    if (!result) return undefined;
    
    return {
      ...result.tools,
      category: result.categories || undefined,
    };
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const [newTool] = await db.insert(tools).values(tool).returning();
    return newTool;
  }

  async updateTool(id: string, tool: Partial<InsertTool>): Promise<Tool> {
    const [updatedTool] = await db
      .update(tools)
      .set({ ...tool, updatedAt: new Date() })
      .where(eq(tools.id, id))
      .returning();
    return updatedTool;
  }

  async deleteTool(id: string): Promise<void> {
    await db.update(tools)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(tools.id, id));
  }

  async incrementToolViews(id: string): Promise<void> {
    await db
      .update(tools)
      .set({ views: sql`${tools.views} + 1` })
      .where(eq(tools.id, id));
  }

  // Purchase operations
  async getUserPurchases(userId: string): Promise<(Purchase & { tool: Tool })[]> {
    return await db
      .select()
      .from(purchases)
      .innerJoin(tools, eq(purchases.toolId, tools.id))
      .where(and(eq(purchases.userId, userId), eq(purchases.isActive, true)))
      .orderBy(desc(purchases.createdAt));
  }

  async createPurchase(purchase: InsertPurchase): Promise<Purchase> {
    const keyValue = randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase();
    
    const [newPurchase] = await db
      .insert(purchases)
      .values({ ...purchase, keyValue })
      .returning();
    
    return newPurchase;
  }

  async getPurchaseByKey(keyValue: string): Promise<(Purchase & { user: User; tool: Tool }) | undefined> {
    const [result] = await db
      .select()
      .from(purchases)
      .innerJoin(users, eq(purchases.userId, users.id))
      .innerJoin(tools, eq(purchases.toolId, tools.id))
      .where(and(
        eq(purchases.keyValue, keyValue), 
        eq(purchases.isActive, true),
        gte(purchases.expiresAt, new Date())
      ));
    
    if (!result) return undefined;
    
    return {
      ...result.purchases,
      user: result.users,
      tool: result.tools,
    };
  }

  async updatePurchaseKey(purchaseId: string, newKey: string): Promise<Purchase> {
    const [updatedPurchase] = await db
      .update(purchases)
      .set({ keyValue: newKey })
      .where(eq(purchases.id, purchaseId))
      .returning();
    return updatedPurchase;
  }

  // Discount code operations
  async getDiscountCodes(): Promise<DiscountCode[]> {
    return await db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const [discountCode] = await db
      .select()
      .from(discountCodes)
      .where(and(
        eq(discountCodes.code, code), 
        eq(discountCodes.isActive, true)
      ));
    return discountCode;
  }

  async createDiscountCode(discountCode: InsertDiscountCode): Promise<DiscountCode> {
    const [newDiscountCode] = await db
      .insert(discountCodes)
      .values(discountCode)
      .returning();
    return newDiscountCode;
  }

  async useDiscountCode(id: string): Promise<DiscountCode> {
    const [updatedCode] = await db
      .update(discountCodes)
      .set({ usageCount: sql`${discountCodes.usageCount} + 1` })
      .where(eq(discountCodes.id, id))
      .returning();
    return updatedCode;
  }

  // Payment operations
  async getUserPayments(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  // Key validation operations
  async logKeyValidation(validation: Omit<KeyValidation, 'id' | 'createdAt'>): Promise<KeyValidation> {
    const [newValidation] = await db
      .insert(keyValidations)
      .values(validation)
      .returning();
    return newValidation;
  }

  async getKeyValidationStats(): Promise<{ totalToday: number; successToday: number; failedToday: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [totalResult] = await db
      .select({ count: count() })
      .from(keyValidations)
      .where(gte(keyValidations.createdAt, today));
    
    const [successResult] = await db
      .select({ count: count() })
      .from(keyValidations)
      .where(and(
        gte(keyValidations.createdAt, today),
        eq(keyValidations.isValid, true)
      ));

    const totalToday = totalResult?.count || 0;
    const successToday = successResult?.count || 0;
    
    return {
      totalToday,
      successToday,
      failedToday: totalToday - successToday,
    };
  }

  async getRecentKeyValidations(limit = 10): Promise<(KeyValidation & { user?: User; tool?: Tool })[]> {
    return await db
      .select()
      .from(keyValidations)
      .leftJoin(users, eq(keyValidations.userId, users.id))
      .leftJoin(tools, eq(keyValidations.toolId, tools.id))
      .orderBy(desc(keyValidations.createdAt))
      .limit(limit);
  }

  // Admin operations
  async getUsersWithStats(): Promise<(User & { purchaseCount: number; totalSpent: string })[]> {
    return await db
      .select({
        ...users,
        purchaseCount: sql<number>`COALESCE(COUNT(${purchases.id}), 0)`,
        totalSpent: sql<string>`COALESCE(SUM(${purchases.finalPrice}), 0)`,
      })
      .from(users)
      .leftJoin(purchases, eq(users.id, purchases.userId))
      .groupBy(users.id)
      .orderBy(desc(users.createdAt));
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalTools: number;
    monthlyRevenue: string;
    totalRevenue: string;
  }> {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [toolCount] = await db.select({ count: count() }).from(tools).where(eq(tools.isActive, true));
    
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const [monthlyRevenueResult] = await db
      .select({ revenue: sql<string>`COALESCE(SUM(${purchases.finalPrice}), 0)` })
      .from(purchases)
      .where(gte(purchases.createdAt, currentMonth));
    
    const [totalRevenueResult] = await db
      .select({ revenue: sql<string>`COALESCE(SUM(${purchases.finalPrice}), 0)` })
      .from(purchases);
    
    return {
      totalUsers: userCount?.count || 0,
      totalTools: toolCount?.count || 0,
      monthlyRevenue: monthlyRevenueResult?.revenue || "0",
      totalRevenue: totalRevenueResult?.revenue || "0",
    };
  }
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

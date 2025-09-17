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

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserBalance(userId: string, amount: string): Promise<User>;

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

export const storage = new DatabaseStorage();

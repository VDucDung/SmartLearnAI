import { sql } from 'drizzle-orm';
import { 
  pgTable, 
  varchar, 
  text, 
  integer, 
  timestamp, 
  boolean, 
  jsonb,
  index,
  decimal
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  balance: decimal("balance", { precision: 10, scale: 0 }).default("0"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for tools
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  slug: varchar("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tools table
export const tools = pgTable("tools", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 0 }).notNull(),
  prices: jsonb("prices"), // Array of pricing options with duration and amount
  purchases: integer("purchases").default(0), // Total number of purchases
  categoryId: varchar("category_id").references(() => categories.id),
  imageUrl: varchar("image_url"),
  videoUrl: varchar("video_url"),
  instructions: text("instructions"), // Markdown content
  downloadUrl: varchar("download_url"),
  views: integer("views").default(0),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("review_count").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User purchases
export const purchases = pgTable("purchases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  toolId: varchar("tool_id").references(() => tools.id).notNull(),
  price: decimal("price", { precision: 10, scale: 0 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 0 }).default("0"),
  finalPrice: decimal("final_price", { precision: 10, scale: 0 }).notNull(),
  discountCodeId: varchar("discount_code_id").references(() => discountCodes.id),
  expiresAt: timestamp("expires_at").notNull(),
  keyValue: varchar("key_value").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Discount codes
export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  discountType: varchar("discount_type").notNull(), // 'percentage' or 'fixed'
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minPurchaseAmount: decimal("min_purchase_amount", { precision: 10, scale: 0 }).default("0"),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment history
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 0 }).notNull(),
  type: varchar("type").notNull(), // 'deposit' or 'purchase'
  status: varchar("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  description: text("description"),
  transactionId: varchar("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Key validation logs
export const keyValidations = pgTable("key_validations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyValue: varchar("key_value").notNull(),
  userId: varchar("user_id").references(() => users.id),
  toolId: varchar("tool_id").references(() => tools.id),
  isValid: boolean("is_valid").notNull(),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  purchases: many(purchases),
  payments: many(payments),
}));

export const toolsRelations = relations(tools, ({ one, many }) => ({
  category: one(categories, {
    fields: [tools.categoryId],
    references: [categories.id],
  }),
  purchases: many(purchases),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tools: many(tools),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  user: one(users, {
    fields: [purchases.userId],
    references: [users.id],
  }),
  tool: one(tools, {
    fields: [purchases.toolId],
    references: [tools.id],
  }),
  discountCode: one(discountCodes, {
    fields: [purchases.discountCodeId],
    references: [discountCodes.id],
  }),
}));

export const discountCodesRelations = relations(discountCodes, ({ many }) => ({
  purchases: many(purchases),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const keyValidationsRelations = relations(keyValidations, ({ one }) => ({
  user: one(users, {
    fields: [keyValidations.userId],
    references: [users.id],
  }),
  tool: one(tools, {
    fields: [keyValidations.toolId],
    references: [tools.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  views: true,
  rating: true,
  reviewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  keyValue: true,
  createdAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  usageCount: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Tool = typeof tools.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type KeyValidation = typeof keyValidations.$inferSelect;

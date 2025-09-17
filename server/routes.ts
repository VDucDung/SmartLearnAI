import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertToolSchema, insertCategorySchema, insertDiscountCodeSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Tools
  app.get('/api/tools', async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  app.get('/api/tools/:id', async (req, res) => {
    try {
      const tool = await storage.getToolById(req.params.id);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }
      
      // Increment view count
      await storage.incrementToolViews(req.params.id);
      
      res.json(tool);
    } catch (error) {
      console.error("Error fetching tool:", error);
      res.status(500).json({ message: "Failed to fetch tool" });
    }
  });

  app.post('/api/tools', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const toolData = insertToolSchema.parse(req.body);
      const tool = await storage.createTool(toolData);
      res.status(201).json(tool);
    } catch (error) {
      console.error("Error creating tool:", error);
      res.status(500).json({ message: "Failed to create tool" });
    }
  });

  app.put('/api/tools/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const toolData = insertToolSchema.partial().parse(req.body);
      const tool = await storage.updateTool(req.params.id, toolData);
      res.json(tool);
    } catch (error) {
      console.error("Error updating tool:", error);
      res.status(500).json({ message: "Failed to update tool" });
    }
  });

  app.delete('/api/tools/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      await storage.deleteTool(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tool:", error);
      res.status(500).json({ message: "Failed to delete tool" });
    }
  });

  // Purchases
  app.get('/api/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getUserPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post('/api/purchases', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { toolId, discountCodeId } = req.body;
      const tool = await storage.getToolById(toolId);
      if (!tool) {
        return res.status(404).json({ message: "Tool not found" });
      }

      let discountAmount = "0";
      let finalPrice = tool.price;

      // Apply discount if provided
      if (discountCodeId) {
        const discountCode = await storage.getDiscountCodeByCode(discountCodeId);
        if (discountCode) {
          if (discountCode.discountType === 'percentage') {
            discountAmount = String(Math.floor(Number(tool.price) * Number(discountCode.discountValue) / 100));
          } else {
            discountAmount = String(Number(discountCode.discountValue) * 100); // Convert to cents
          }
          finalPrice = String(Number(tool.price) - Number(discountAmount));
          await storage.useDiscountCode(discountCode.id);
        }
      }

      // Check if user has enough balance
      if (Number(user.balance) < Number(finalPrice)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Create purchase with 30 days expiry
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      const purchase = await storage.createPurchase({
        userId,
        toolId,
        price: tool.price,
        discountAmount,
        finalPrice,
        discountCodeId: discountCodeId || null,
        expiresAt,
        isActive: true,
      });

      // Deduct from user balance
      await storage.updateUserBalance(userId, `-${finalPrice}`);

      // Log purchase payment
      await storage.createPayment({
        userId,
        amount: `-${finalPrice}`,
        type: "purchase",
        status: "completed",
        description: `Purchased ${tool.name}`,
      });

      res.status(201).json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      res.status(500).json({ message: "Failed to create purchase" });
    }
  });

  // Update purchase key
  app.put('/api/purchases/:id/key', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { newKey } = req.body;
      
      // Verify purchase belongs to user
      const purchases = await storage.getUserPurchases(userId);
      const purchase = purchases.find(p => p.id === req.params.id);
      
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      const updatedPurchase = await storage.updatePurchaseKey(req.params.id, newKey);
      res.json(updatedPurchase);
    } catch (error) {
      console.error("Error updating purchase key:", error);
      res.status(500).json({ message: "Failed to update purchase key" });
    }
  });

  // Discount codes
  app.get('/api/discount-codes', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const discountCodes = await storage.getDiscountCodes();
      res.json(discountCodes);
    } catch (error) {
      console.error("Error fetching discount codes:", error);
      res.status(500).json({ message: "Failed to fetch discount codes" });
    }
  });

  app.post('/api/discount-codes/validate', async (req, res) => {
    try {
      const { code } = req.body;
      const discountCode = await storage.getDiscountCodeByCode(code);
      
      if (!discountCode) {
        return res.status(404).json({ message: "Invalid discount code" });
      }

      // Check if expired
      if (discountCode.expiresAt && discountCode.expiresAt < new Date()) {
        return res.status(400).json({ message: "Discount code has expired" });
      }

      // Check usage limit
      if (discountCode.usageLimit && discountCode.usageCount >= discountCode.usageLimit) {
        return res.status(400).json({ message: "Discount code usage limit exceeded" });
      }

      res.json(discountCode);
    } catch (error) {
      console.error("Error validating discount code:", error);
      res.status(500).json({ message: "Failed to validate discount code" });
    }
  });

  app.post('/api/discount-codes', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const discountCodeData = insertDiscountCodeSchema.parse(req.body);
      const discountCode = await storage.createDiscountCode(discountCodeData);
      res.status(201).json(discountCode);
    } catch (error) {
      console.error("Error creating discount code:", error);
      res.status(500).json({ message: "Failed to create discount code" });
    }
  });

  // Payments & Balance
  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payments = await storage.getUserPayments(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/deposit', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { amount, description } = req.body;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Create payment record
      await storage.createPayment({
        userId,
        amount: String(amount),
        type: "deposit",
        status: "completed",
        description: description || "Balance deposit",
      });

      // Update user balance
      const user = await storage.updateUserBalance(userId, String(amount));
      res.json({ balance: user.balance });
    } catch (error) {
      console.error("Error processing deposit:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  // Key validation API
  app.post('/api/validate-key', async (req, res) => {
    try {
      const { key } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent') || '';

      if (!key) {
        await storage.logKeyValidation({
          keyValue: '',
          isValid: false,
          ipAddress,
          userAgent,
        });
        return res.json({ valid: false });
      }

      const purchase = await storage.getPurchaseByKey(key);
      
      if (!purchase) {
        await storage.logKeyValidation({
          keyValue: key,
          isValid: false,
          ipAddress,
          userAgent,
        });
        return res.json({ valid: false });
      }

      // Log successful validation
      await storage.logKeyValidation({
        keyValue: key,
        userId: purchase.user.id,
        toolId: purchase.tool.id,
        isValid: true,
        ipAddress,
        userAgent,
      });

      res.json({
        valid: true,
        userName: `${purchase.user.firstName} ${purchase.user.lastName}`.trim() || purchase.user.email,
        expiresAt: purchase.expiresAt,
        toolName: purchase.tool.name,
      });
    } catch (error) {
      console.error("Error validating key:", error);
      res.status(500).json({ message: "Failed to validate key" });
    }
  });

  // Admin endpoints
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getUsersWithStats();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const systemStats = await storage.getSystemStats();
      const keyValidationStats = await storage.getKeyValidationStats();
      
      res.json({
        ...systemStats,
        keyValidation: keyValidationStats,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/key-validations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const validations = await storage.getRecentKeyValidations(limit);
      res.json(validations);
    } catch (error) {
      console.error("Error fetching key validations:", error);
      res.status(500).json({ message: "Failed to fetch key validations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

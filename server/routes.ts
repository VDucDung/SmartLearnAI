import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { insertToolSchema, insertCategorySchema, insertDiscountCodeSchema } from "@shared/schema";

// Demo user credentials
const DEMO_USERS = {
  demo: {
    id: "demo-user-1",
    username: "demo",
    password: "demo123",
    email: "demo@example.com",
    firstName: "Demo",
    lastName: "User", 
    profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    balance: "1000000",
    isAdmin: false,
  },
  admin: {
    id: "admin-user-1", 
    username: "admin",
    password: "admin123",
    email: "admin@example.com",
    firstName: "Admin",
    lastName: "User",
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    balance: "5000000",
    isAdmin: true,
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Demo login endpoint
  app.post('/api/auth/demo-login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Check if credentials match demo users
      const user = Object.values(DEMO_USERS).find(u => u.username === username && u.password === password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Create a demo session by storing user info in session
      (req.session as any).demoUser = user;
      
      // Ensure demo user exists in storage for backend compatibility
      try {
        await storage.upsertUser({
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          balance: user.balance,
          isAdmin: user.isAdmin,
        });
      } catch (storageError) {
        console.error("Error upserting demo user to storage:", storageError);
        // Continue even if storage fails - demo might work without DB
      }
      
      res.json({ 
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          balance: user.balance,
          isAdmin: user.isAdmin,
        }
      });
    } catch (error) {
      console.error("Error during demo login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Demo logout endpoint
  app.post('/api/auth/demo-logout', async (req, res) => {
    try {
      delete (req.session as any).demoUser;
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Error during demo logout:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Auth routes - Modified to support both demo and real auth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is using demo authentication
      if ((req.session as any)?.demoUser) {
        const demoUser = (req.session as any).demoUser;
        return res.json({
          id: demoUser.id,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          profileImageUrl: demoUser.profileImageUrl,
          balance: demoUser.balance,
          isAdmin: demoUser.isAdmin,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      // Original authentication logic
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
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

  // User profile routes
  app.patch('/api/user/profile', async (req: any, res) => {
    try {
      let userId: string;
      
      // Check if user is using demo authentication
      if ((req.session as any)?.demoUser) {
        userId = (req.session as any).demoUser.id;
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { firstName, lastName, email } = req.body;
      
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }
      
      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim(),
      });
      
      // Update demo session if using demo auth
      if ((req.session as any)?.demoUser) {
        (req.session as any).demoUser = {
          ...(req.session as any).demoUser,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
        };
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.patch('/api/user/password', async (req: any, res) => {
    try {
      let userId: string;
      
      // Check if user is using demo authentication
      if ((req.session as any)?.demoUser) {
        userId = (req.session as any).demoUser.id;
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      } else {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      
      const success = await storage.updateUserPassword(userId, currentPassword, newPassword);
      
      if (!success) {
        return res.status(400).json({ message: "Failed to update password" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      if (error instanceof Error && error.message === "Current password is incorrect") {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      res.status(500).json({ message: "Failed to update password" });
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
      if (discountCode.usageLimit && (discountCode.usageCount || 0) >= discountCode.usageLimit) {
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
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        });
        return res.json({ valid: false });
      }

      const purchase = await storage.getPurchaseByKey(key);
      
      if (!purchase) {
        await storage.logKeyValidation({
          keyValue: key,
          isValid: false,
          ipAddress: ipAddress || null,
          userAgent: userAgent || null,
        });
        return res.json({ valid: false });
      }

      // Log successful validation
      await storage.logKeyValidation({
        keyValue: key,
        userId: purchase.user.id,
        toolId: purchase.tool.id,
        isValid: true,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
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

import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiService } from "./ai-service";
import {
  insertCustomerSchema,
  insertServiceSchema,
  insertStaffSchema,
  insertAppointmentSchema,
  insertProductSchema,
  insertSupplierSchema,
  insertInventoryTransactionSchema,
  insertTransactionSchema,
  insertTimeRecordSchema,
  insertNotificationSettingsSchema
} from "@shared/schema";
import { sendAppointmentNotification } from "./notification-service";
import { paymentGateway } from "./payment-gateway";
import multer from "multer";
import path from "path";
import { promises as fs } from "fs";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Customers routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create customer" });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid customer data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Services routes
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.put("/api/services/:id", async (req, res) => {
    try {
      const serviceData = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(req.params.id, serviceData);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid service data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteService(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  // Staff authentication routes
  app.post("/api/staff/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const staff = await storage.authenticateStaff(email, password);
      if (!staff) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Store staff in session
      (req as any).session.staffId = staff.id;
      
      res.json({ message: "Login successful", staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role } });
    } catch (error) {
      console.error("Staff login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/staff/me", async (req, res) => {
    try {
      const staffId = (req as any).session.staffId;
      
      if (!staffId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const staff = await storage.getStaff(staffId);
      if (!staff) {
        return res.status(401).json({ message: "Staff not found" });
      }

      res.json({ id: staff.id, name: staff.name, email: staff.email, role: staff.role });
    } catch (error) {
      console.error("Get staff me error:", error);
      res.status(500).json({ message: "Failed to get staff info" });
    }
  });

  app.post("/api/staff/logout", async (req, res) => {
    try {
      delete (req as any).session.staffId;
      res.json({ message: "Logout successful" });
    } catch (error) {
      console.error("Staff logout error:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  // Staff routes
  app.get("/api/staff", async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch staff" });
    }
  });

  app.post("/api/staff", async (req, res) => {
    try {
      const staffData = insertStaffSchema.parse(req.body);
      const staff = await storage.createStaff(staffData);
      res.status(201).json(staff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid staff data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create staff member" });
    }
  });

  app.put("/api/staff/:id", async (req, res) => {
    try {
      const staffData = insertStaffSchema.partial().parse(req.body);
      const staff = await storage.updateStaff(req.params.id, staffData);
      if (!staff) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.json(staff);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid staff data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update staff member" });
    }
  });

  app.delete("/api/staff/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStaff(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Staff member not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete staff member" });
    }
  });

  // Appointments routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const { date } = req.query;
      if (date && typeof date === "string") {
        const appointments = await storage.getAppointmentsByDate(date);
        res.json(appointments);
      } else {
        const appointments = await storage.getAppointments();
        res.json(appointments);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      
      // Send confirmation email in the background
      sendAppointmentNotification(appointment.id, 'confirmation').catch(error => {
        console.error('Failed to send appointment confirmation:', error);
      });
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create appointment" });
    }
  });

  app.put("/api/appointments/:id", async (req, res) => {
    try {
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(req.params.id, appointmentData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update appointment" });
    }
  });

  // Cancel appointment (set status to cancelled)
  app.patch("/api/appointments/:id/cancel", async (req, res) => {
    try {
      const appointment = await storage.updateAppointment(req.params.id, { 
        status: "cancelled" 
      });
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      // Send cancellation notification in the background
      sendAppointmentNotification(appointment.id, 'reminder').catch(error => {
        console.error('Failed to send appointment cancellation:', error);
      });
      
      res.json({ message: "Appointment cancelled successfully", appointment });
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAppointment(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete appointment" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/low-stock", async (req, res) => {
    try {
      const products = await storage.getLowStockProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", async (req, res) => {
    try {
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  app.put("/api/suppliers/:id", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, supplierData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Inventory Transactions routes
  app.get("/api/inventory-transactions", async (req, res) => {
    try {
      const transactions = await storage.getInventoryTransactions();
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory transactions" });
    }
  });

  app.get("/api/inventory-transactions/product/:productId", async (req, res) => {
    try {
      const transactions = await storage.getInventoryTransactionsByProduct(req.params.productId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory transactions by product" });
    }
  });

  app.post("/api/inventory-transactions", async (req, res) => {
    try {
      const transactionData = insertInventoryTransactionSchema.parse(req.body);
      const transaction = await storage.createInventoryTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory transaction" });
    }
  });

  // Configure multer for file uploads
  const storage_multer = multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadDir = 'uploads/products';
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storage_multer,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit (increased for better quality)
      files: 5 // Max 5 files per request
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'image/svg+xml';
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only image files (JPEG, PNG, GIF, WebP, SVG) are allowed.`));
      }
    }
  });

  // AI Product Generation endpoint
  app.post("/api/ai/generate-product", async (req, res) => {
    try {
      const { category, productType, existingData } = req.body;
      
      if (!category) {
        return res.status(400).json({ message: "Category is required" });
      }

      const aiData = await aiService.generateProductData(category, productType, existingData);
      const sku = existingData?.sku || aiService.generateSKU(category, aiData.brand, aiData.name);
      const barcode = existingData?.barcode || aiService.generateBarcode();

      const hasExistingData = existingData && Object.keys(existingData).some(key => existingData[key] && existingData[key] !== "" && existingData[key] !== "0");

      const productData = {
        ...aiData,
        sku,
        barcode,
        category,
        aiGenerated: true,
        aiPrompt: hasExistingData 
          ? `Enhanced user input with Philippine market research for ${category} category`
          : `Generated for ${category} category using Philippine market research`
      };

      res.json(productData);
    } catch (error) {
      console.error('AI Product Generation Error:', error);
      res.status(500).json({ 
        message: "Failed to generate product data",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // File upload endpoint for product images with optimization
  app.post("/api/upload/product-image", upload.single('image'), async (req, res) => {
    let filePath = '';
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      filePath = req.file.path;
      let finalPath = filePath;
      
      // Optimize image if not SVG
      if (!req.file.originalname.toLowerCase().endsWith('.svg')) {
        try {
          const sharp = require('sharp');
          const optimizedPath = filePath.replace(path.extname(filePath), '-optimized.webp');
          
          await sharp(filePath)
            .resize(800, 800, { 
              fit: 'inside',
              withoutEnlargement: true 
            })
            .webp({ quality: 85 })
            .toFile(optimizedPath);
          
          // Remove original file and use optimized version
          await fs.unlink(filePath);
          finalPath = optimizedPath;
        } catch (optimizationError) {
          console.warn('Image optimization failed, using original:', optimizationError);
          // Continue with original file if optimization fails
        }
      }

      const fileName = path.basename(finalPath);
      const imageUrl = `/uploads/products/${fileName}`;
      
      res.json({
        imageUrl,
        imageName: req.file.originalname,
        fileName,
        size: (await fs.stat(finalPath)).size,
        optimized: !req.file.originalname.toLowerCase().endsWith('.svg')
      });
    } catch (error) {
      console.error('File Upload Error:', error);
      
      // Cleanup failed upload
      if (filePath && await fs.access(filePath).then(() => true).catch(() => false)) {
        await fs.unlink(filePath).catch(() => {});
      }
      
      res.status(500).json({ 
        message: "Failed to upload and process image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Multiple file upload endpoint
  app.post("/api/upload/product-images", upload.array('images', 5), async (req, res) => {
    const uploadedFiles: any[] = [];
    const failedFiles: any[] = [];
    
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      for (const file of req.files) {
        try {
          let finalPath = file.path;
          
          // Optimize image if not SVG
          if (!file.originalname.toLowerCase().endsWith('.svg')) {
            const sharp = require('sharp');
            const optimizedPath = file.path.replace(path.extname(file.path), '-optimized.webp');
            
            await sharp(file.path)
              .resize(800, 800, { 
                fit: 'inside',
                withoutEnlargement: true 
              })
              .webp({ quality: 85 })
              .toFile(optimizedPath);
            
            await fs.unlink(file.path);
            finalPath = optimizedPath;
          }

          const fileName = path.basename(finalPath);
          uploadedFiles.push({
            imageUrl: `/uploads/products/${fileName}`,
            imageName: file.originalname,
            fileName,
            size: (await fs.stat(finalPath)).size,
            optimized: !file.originalname.toLowerCase().endsWith('.svg')
          });
        } catch (fileError) {
          failedFiles.push({ 
            name: file.originalname, 
            error: fileError instanceof Error ? fileError.message : 'Unknown error' 
          });
          // Cleanup failed file
          await fs.unlink(file.path).catch(() => {});
        }
      }
      
      res.json({
        uploaded: uploadedFiles,
        failed: failedFiles,
        total: req.files.length,
        successful: uploadedFiles.length
      });
    } catch (error) {
      console.error('Multiple File Upload Error:', error);
      res.status(500).json({ 
        message: "Failed to process images",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // File deletion endpoint
  app.delete("/api/upload/product-image/:filename", async (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join('uploads/products', filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ message: "File not found" });
      }
      
      // Delete the file
      await fs.unlink(filePath);
      
      res.json({ message: "File deleted successfully", filename });
    } catch (error) {
      console.error('File Deletion Error:', error);
      res.status(500).json({ 
        message: "Failed to delete file",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Generate SKU endpoint
  app.post("/api/ai/generate-sku", async (req, res) => {
    try {
      const { category, brand, name } = req.body;
      
      if (!category || !brand || !name) {
        return res.status(400).json({ message: "Category, brand, and name are required" });
      }

      const sku = aiService.generateSKU(category, brand, name);
      res.json({ sku });
    } catch (error) {
      console.error('SKU Generation Error:', error);
      res.status(500).json({ 
        message: "Failed to generate SKU",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Generate Barcode endpoint
  app.post("/api/ai/generate-barcode", async (req, res) => {
    try {
      const barcode = aiService.generateBarcode();
      res.json({ barcode });
    } catch (error) {
      console.error('Barcode Generation Error:', error);
      res.status(500).json({ 
        message: "Failed to generate barcode",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // AI Connection Test endpoint
  app.post("/api/ai/test-connection", async (req, res) => {
    try {
      // Test with a simple product generation request
      const testData = await aiService.generateProductData('retail', 'test product');
      res.json({ 
        status: 'success',
        message: 'AI service is working properly',
        testResult: {
          name: testData.name,
          provider: 'openrouter'
        }
      });
    } catch (error) {
      console.error('AI Connection Test Error:', error);
      res.status(500).json({ 
        status: 'error',
        message: "AI connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Settings endpoints
  app.post("/api/settings/profile", async (req, res) => {
    try {
      const profileData = req.body;
      
      // Save profile data to database using storage layer
      const savedProfile = await storage.createOrUpdateBusinessProfile(profileData);
      
      res.json({ 
        message: "Profile saved successfully",
        profile: savedProfile 
      });
    } catch (error) {
      console.error('Profile Save Error:', error);
      res.status(500).json({ 
        message: "Failed to save profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.post("/api/settings/ai", async (req, res) => {
    try {
      const aiSettings = req.body;
      
      // Save AI settings to database using storage layer
      const savedSettings = await storage.createOrUpdateAiSettings(aiSettings);
      
      res.json({ 
        message: "AI settings saved successfully",
        settings: savedSettings 
      });
    } catch (error) {
      console.error('AI Settings Save Error:', error);
      res.status(500).json({ 
        message: "Failed to save AI settings",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/settings/profile", async (req, res) => {
    try {
      // Get profile data from database
      const profile = await storage.getBusinessProfile();
      
      // Return stored profile or default values if none exists
      const profileData = profile || {
        businessName: "JustPause Salon & Spa",
        ownerName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        businessType: "both",
        logo: "",
        description: "A premier spa and salon experience in the Philippines",
        website: "",
        socialMedia: {
          facebook: "",
          instagram: "",
          tiktok: "",
        },
      };
      
      res.json(profileData);
    } catch (error) {
      console.error('Profile Fetch Error:', error);
      res.status(500).json({ 
        message: "Failed to fetch profile",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/settings/ai", async (req, res) => {
    try {
      // Get AI settings from database
      const settings = await storage.getAiSettings();
      
      // Return stored settings or default values if none exists
      const aiSettings = settings || {
        openrouterApiKey: "",
        preferredModel: "meta-llama/llama-3.1-8b-instruct:free",
        autoFillProducts: true,
        marketResearch: true,
        competitorAnalysis: false,
        priceOptimization: true,
        generateTags: true,
        generateDescriptions: true,
        promptCustomization: "",
      };
      
      res.json(aiSettings);
    } catch (error) {
      console.error('AI Settings Fetch Error:', error);
      res.status(500).json({ 
        message: "Failed to fetch AI settings",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Dashboard Stats Error:', error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Marketing stats endpoint
  app.get("/api/marketing/stats", async (req, res) => {
    try {
      const stats = await storage.getMarketingStats();
      res.json(stats);
    } catch (error) {
      console.error('Marketing Stats Error:', error);
      res.status(500).json({ message: "Failed to fetch marketing stats" });
    }
  });

  // POS Transactions endpoints
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error) {
      console.error('Get Transactions Error:', error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      // Generate unique transaction number
      const transactionNumber = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const transactionData = {
        ...req.body,
        transactionNumber
      };
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Create Transaction Error:', error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error('Get Transaction Error:', error);
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  // Time Records endpoints
  app.get("/api/time-records", async (req, res) => {
    try {
      const timeRecords = await storage.getTimeRecords();
      res.json(timeRecords);
    } catch (error) {
      console.error('Get Time Records Error:', error);
      res.status(500).json({ message: "Failed to fetch time records" });
    }
  });

  app.get("/api/time-records/active/:staffId", async (req, res) => {
    try {
      const activeRecord = await storage.getActiveTimeRecord(req.params.staffId);
      res.json(activeRecord);
    } catch (error) {
      console.error('Get Active Time Record Error:', error);
      res.status(500).json({ message: "Failed to fetch active time record" });
    }
  });

  app.get("/api/time-records/report", async (req, res) => {
    try {
      const report = await storage.getAttendanceReport();
      res.json(report);
    } catch (error) {
      console.error('Get Attendance Report Error:', error);
      res.status(500).json({ message: "Failed to fetch attendance report" });
    }
  });

  app.post("/api/time-records/clock-in", async (req, res) => {
    try {
      const timeRecord = await storage.clockIn(req.body);
      res.status(201).json(timeRecord);
    } catch (error) {
      console.error('Clock In Error:', error);
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post("/api/time-records/clock-out/:id", async (req, res) => {
    try {
      const timeRecord = await storage.clockOut(req.params.id, req.body);
      res.json(timeRecord);
    } catch (error) {
      console.error('Clock Out Error:', error);
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  app.post("/api/time-records/break-start/:id", async (req, res) => {
    try {
      const timeRecord = await storage.startBreak(req.params.id, req.body);
      res.json(timeRecord);
    } catch (error) {
      console.error('Start Break Error:', error);
      res.status(500).json({ message: "Failed to start break" });
    }
  });

  app.post("/api/time-records/break-end/:id", async (req, res) => {
    try {
      const timeRecord = await storage.endBreak(req.params.id, req.body);
      res.json(timeRecord);
    } catch (error) {
      console.error('End Break Error:', error);
      res.status(500).json({ message: "Failed to end break" });
    }
  });

  // Notification Settings routes
  app.get("/api/notification-settings", async (req, res) => {
    try {
      const settings = await storage.getNotificationSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification settings" });
    }
  });

  app.post("/api/notification-settings", async (req, res) => {
    try {
      const settingsData = insertNotificationSettingsSchema.parse(req.body);
      const settings = await storage.createOrUpdateNotificationSettings(settingsData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save notification settings" });
    }
  });

  // Notification Log routes
  app.get("/api/notification-log", async (req, res) => {
    try {
      const { appointmentId } = req.query;
      const logs = await storage.getNotificationLogs(appointmentId as string);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notification logs" });
    }
  });

  // Manual notification triggers
  app.post("/api/notifications/send-confirmation/:appointmentId", async (req, res) => {
    try {
      const success = await sendAppointmentNotification(req.params.appointmentId, 'confirmation');
      if (success) {
        res.json({ message: "Confirmation email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send confirmation email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send confirmation email" });
    }
  });

  app.post("/api/notifications/send-reminder/:appointmentId", async (req, res) => {
    try {
      const success = await sendAppointmentNotification(req.params.appointmentId, 'reminder');
      if (success) {
        res.json({ message: "Reminder email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send reminder email" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to send reminder email" });
    }
  });

  // Email Marketing Campaign routes
  app.get("/api/marketing/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns();
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/marketing/campaigns", async (req, res) => {
    try {
      const campaignData = req.body;
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to create campaign" });
    }
  });

  app.post("/api/marketing/campaigns/:id/send", async (req, res) => {
    try {
      const campaign = await storage.sendCampaign(req.params.id);
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: "Failed to send campaign" });
    }
  });

  app.delete("/api/marketing/campaigns/:id", async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete campaign" });
    }
  });

  // Email Leads routes
  app.get("/api/marketing/leads", async (req, res) => {
    try {
      const leads = await storage.getEmailLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leads" });
    }
  });

  const csvUpload = multer({ 
    dest: './uploads/',
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv') {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  });

  app.post("/api/marketing/leads/upload", csvUpload.single('csv'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No CSV file uploaded" });
      }

      const csvContent = await fs.readFile(req.file.path, 'utf-8');
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const emailIndex = headers.indexOf('email');
      const firstNameIndex = headers.indexOf('firstname') !== -1 ? headers.indexOf('firstname') : headers.indexOf('first_name');
      const lastNameIndex = headers.indexOf('lastname') !== -1 ? headers.indexOf('lastname') : headers.indexOf('last_name');
      const phoneIndex = headers.indexOf('phone');

      if (emailIndex === -1) {
        return res.status(400).json({ message: "CSV must contain an 'email' column" });
      }

      const leads = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
        if (values[emailIndex] && values[emailIndex].includes('@')) {
          leads.push({
            email: values[emailIndex],
            firstName: firstNameIndex !== -1 ? values[firstNameIndex] : null,
            lastName: lastNameIndex !== -1 ? values[lastNameIndex] : null,
            phone: phoneIndex !== -1 ? values[phoneIndex] : null,
            source: 'csv_upload'
          });
        }
      }

      let successCount = 0;
      for (const lead of leads) {
        try {
          await storage.createEmailLead(lead);
          successCount++;
        } catch (error) {
          // Skip duplicate emails
        }
      }

      // Clean up uploaded file
      await fs.unlink(req.file.path);

      res.json({ 
        message: "Leads uploaded successfully",
        count: successCount,
        total: leads.length
      });
    } catch (error) {
      console.error('CSV upload error:', error);
      res.status(500).json({ message: "Failed to process CSV file" });
    }
  });

  // Marketing stats
  app.get("/api/marketing/stats", async (req, res) => {
    try {
      const stats = await storage.getMarketingStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch marketing stats" });
    }
  });

  // Enhanced Inventory Management API Routes
  app.get("/api/inventory/alerts", async (req, res) => {
    try {
      const alerts = await storage.getInventoryAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory alerts" });
    }
  });

  app.post("/api/inventory/alerts", async (req, res) => {
    try {
      const alertData = req.body;
      const alert = await storage.createInventoryAlert(alertData);
      res.status(201).json(alert);
    } catch (error) {
      res.status(500).json({ message: "Failed to create inventory alert" });
    }
  });

  app.get("/api/inventory/movements", async (req, res) => {
    try {
      const { productId, limit } = req.query;
      const movements = await storage.getStockMovements(
        productId as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(movements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock movements" });
    }
  });

  app.get("/api/inventory/overview", async (req, res) => {
    try {
      const overview = await storage.getInventoryOverview();
      res.json(overview);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory overview" });
    }
  });

  // Payment Gateway Endpoints
  app.post("/api/payments/process", async (req, res) => {
    try {
      const { paymentMethod, amount, customerInfo } = req.body;
      
      if (!paymentMethod || !amount) {
        return res.status(400).json({ message: "Payment method and amount are required" });
      }

      // For cash payments, just return success
      if (paymentMethod === 'cash') {
        return res.json({
          referenceNumber: `CASH-${Date.now()}`,
          status: 'completed',
          amount
        });
      }

      // For digital payments, process through gateway
      const paymentData = await paymentGateway.processDigitalPayment(paymentMethod, parseFloat(amount), customerInfo);
      res.json(paymentData);
    } catch (error) {
      console.error('Payment Processing Error:', error);
      res.status(500).json({ message: (error as Error).message || "Failed to process payment" });
    }
  });

  app.get("/api/payments/status/:referenceNumber", async (req, res) => {
    try {
      const status = await paymentGateway.checkTransactionStatus(req.params.referenceNumber);
      res.json(status);
    } catch (error) {
      console.error('Payment Status Check Error:', error);
      res.status(500).json({ message: "Failed to check payment status" });
    }
  });

  // Customer Portal Routes (Public API)
  app.get('/api/customer/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      const activeServices = services.filter(service => service.isActive);
      res.json(activeServices);
    } catch (error) {
      console.error('Error fetching services for customer portal:', error);
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  });

  app.get('/api/customer/staff', async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      const activeStaff = staff.filter(member => member.isActive);
      res.json(activeStaff);
    } catch (error) {
      console.error('Error fetching staff for customer portal:', error);
      res.status(500).json({ message: 'Failed to fetch staff' });
    }
  });

  app.post('/api/customer/book', async (req, res) => {
    try {
      const { customerId, serviceId, staffId, date, time, customerNotes } = req.body;
      
      // Get service details for pricing
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      const appointment = await storage.createAppointment({
        customerId,
        serviceId,
        staffId,
        date,
        time,
        duration: service.duration,
        status: 'confirmed',
        totalAmount: service.price,
        bookingSource: 'online',
        customerNotes,
      });

      res.json(appointment);
    } catch (error) {
      console.error('Error creating customer booking:', error);
      res.status(500).json({ message: 'Failed to create booking' });
    }
  });

  app.post('/api/customer/register', async (req, res) => {
    try {
      const { name, email, phone, address, dateOfBirth, portalPin } = req.body;
      
      const customer = await storage.createCustomer({
        name,
        email,
        phone,
        address,
        dateOfBirth,
        customerPortalEnabled: true,
        portalPin,
      });

      res.json(customer);
    } catch (error) {
      console.error('Error registering customer:', error);
      res.status(500).json({ message: 'Failed to register customer' });
    }
  });

  app.post('/api/customer/login', async (req, res) => {
    try {
      const { phone, portalPin } = req.body;
      
      const customers = await storage.getCustomers();
      const customer = customers.find(c => c.phone === phone && c.portalPin === portalPin);
      
      if (!customer) {
        return res.status(401).json({ message: 'Invalid phone number or PIN' });
      }

      res.json(customer);
    } catch (error) {
      console.error('Error logging in customer:', error);
      res.status(500).json({ message: 'Failed to login' });
    }
  });

  app.get('/api/customer/:customerId/appointments', async (req, res) => {
    try {
      const { customerId } = req.params;
      const appointments = await storage.getAppointments();
      const customerAppointments = appointments.filter(apt => apt.customerId === customerId);
      res.json(customerAppointments);
    } catch (error) {
      console.error('Error fetching customer appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  // Walk-in Registration Route (Staff Interface)
  // Walk-in Registration endpoints
  app.get("/api/walk-in/waiting-list", async (req, res) => {
    try {
      const waitingList = await storage.getWalkInWaitingList();
      res.json(waitingList);
    } catch (error) {
      console.error('Get Waiting List Error:', error);
      res.status(500).json({ message: "Failed to fetch waiting list" });
    }
  });

  app.get("/api/walk-in/quick-search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      
      const customers = await storage.searchCustomersQuick(query);
      res.json(customers);
    } catch (error) {
      console.error('Quick Search Error:', error);
      res.status(500).json({ message: "Failed to search customers" });
    }
  });

  app.post('/api/walk-in/register', async (req, res) => {
    try {
      const {
        customerId,
        name,
        phone,
        email,
        serviceId,
        staffId,
        notes,
        signature,
        isExistingCustomer
      } = req.body;

      let client;
      if (isExistingCustomer && customerId) {
        // Use existing customer
        client = await storage.getCustomer(customerId);
        if (!client) {
          return res.status(400).json({ message: "Customer not found" });
        }
      } else {
        // Check if customer already exists by phone
        const clients = await storage.getCustomers();
        client = clients.find(c => c.phone === phone);
        
        if (!client) {
          // Create new walk-in customer
          client = await storage.createCustomer({
            name,
            phone,
            email: email || `${phone}@walkin.local`,
            portalPin: '0000',
            customerPortalEnabled: false,
          });
        }
      }

      // Get service details
      const service = await storage.getService(serviceId);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // Get next waiting list position
      const waitingList = await storage.getWalkInWaitingList();
      const waitingListPosition = waitingList.length + 1;

      // Create appointment
      const now = new Date();
      const appointment = await storage.createAppointment({
        customerId: client.id,
        serviceId,
        staffId,
        date: now.toISOString().split('T')[0],
        time: now.toTimeString().split(' ')[0].substring(0, 5),
        duration: service.duration,
        status: 'confirmed',
        totalAmount: service.price,
        bookingSource: 'walk-in',
        notes,
        waitingListPosition,
        signatureUrl: signature || null,
        checkedInAt: new Date(),
      });

      res.json({ 
        client, 
        appointment, 
        waitingListPosition,
        message: "Walk-in registration successful"
      });
    } catch (error) {
      console.error('Error registering walk-in customer:', error);
      res.status(500).json({ message: 'Failed to register walk-in customer' });
    }
  });

  // Customer Portal authentication endpoints

  // Booking Availability API
  app.get('/api/booking/availability', async (req, res) => {
    try {
      const { date, serviceId, staffId } = req.query;
      
      if (!date || !serviceId) {
        return res.status(400).json({ message: 'Date and service ID are required' });
      }

      // Get service duration
      const service = await storage.getService(serviceId as string);
      if (!service) {
        return res.status(404).json({ message: 'Service not found' });
      }

      // Get all appointments for the date
      const appointments = await storage.getAppointments();
      const dayAppointments = appointments.filter(apt => apt.date === date);

      // Generate time slots (9 AM to 6 PM, 30-minute intervals)
      const generateTimeSlots = (): string[] => {
        const slots = [];
        for (let hour = 9; hour < 18; hour++) {
          slots.push(`${hour.toString().padStart(2, '0')}:00`);
          slots.push(`${hour.toString().padStart(2, '0')}:30`);
        }
        return slots;
      };

      // Check availability for each time slot
      const timeSlots = generateTimeSlots().map(time => {
        // Check if this time slot conflicts with existing appointments
        const conflicts = dayAppointments.filter(apt => {
          const aptStart = parseInt(apt.time.replace(':', ''));
          const aptEnd = aptStart + Math.floor(apt.duration / 60) * 100 + (apt.duration % 60);
          const slotStart = parseInt(time.replace(':', ''));
          const slotEnd = slotStart + Math.floor(service.duration / 60) * 100 + (service.duration % 60);
          
          // Check if there's any overlap
          return (slotStart < aptEnd && slotEnd > aptStart) && 
                 (!staffId || apt.staffId === staffId);
        });

        const conflictingAppointment = conflicts[0];
        
        return {
          time,
          available: conflicts.length === 0,
          staffId: conflictingAppointment?.staffId,
          staffName: conflictingAppointment ? 'Booked' : undefined
        };
      });

      res.json(timeSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      res.status(500).json({ message: 'Failed to fetch availability' });
    }
  });

  // Customer Portal API endpoints
  app.get('/api/customer/services', async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching services for customer:', error);
      res.status(500).json({ message: 'Failed to fetch services' });
    }
  });

  app.get('/api/customer/staff', async (req, res) => {
    try {
      const staff = await storage.getAllStaff();
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff for customer:', error);
      res.status(500).json({ message: 'Failed to fetch staff' });
    }
  });

  app.post('/api/customer/login', async (req, res) => {
    try {
      const { phone, pin } = req.body;
      
      // Find customer by phone and PIN
      const customers = await storage.getCustomers();
      const customer = customers.find(c => c.phone === phone && c.portalPin === pin);
      
      if (!customer) {
        return res.status(401).json({ message: 'Invalid phone number or PIN' });
      }
      
      // Store customer in session
      (req as any).session.customerId = customer.id;
      (req as any).session.customerData = customer;
      
      res.json(customer);
    } catch (error) {
      console.error('Error during customer login:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.post('/api/customer/register', async (req, res) => {
    try {
      const { name, phone, email, portalPin } = req.body;
      
      // Validate PIN is 4 digits
      if (!portalPin || portalPin.length !== 4 || !/^\d{4}$/.test(portalPin)) {
        return res.status(400).json({ message: 'PIN must be exactly 4 digits' });
      }
      
      // Check if customer already exists
      const customers = await storage.getCustomers();
      const existingCustomer = customers.find(c => c.phone === phone);
      
      if (existingCustomer) {
        return res.status(400).json({ message: 'Customer with this phone number already exists' });
      }
      
      const newCustomer = await storage.createCustomer({
        name,
        phone,
        email,
        portalPin,
        customerPortalEnabled: true,
        notes: 'Registered via customer portal'
      });
      
      // Automatically log in the new customer
      (req as any).session.customerId = newCustomer.id;
      (req as any).session.customerData = newCustomer;
      
      res.json(newCustomer);
    } catch (error) {
      console.error('Error during customer registration:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  // Customer Authentication Middleware
  const isCustomerAuthenticated = (req: any, res: any, next: any) => {
    if (!req.session.customerId) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    next();
  };

  // Get current customer data
  app.get('/api/customer/me', isCustomerAuthenticated, async (req, res) => {
    try {
      const customerId = (req as any).session.customerId;
      const customer = await storage.getCustomer(customerId);
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      res.json(customer);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      res.status(500).json({ message: 'Failed to fetch customer data' });
    }
  });

  // Customer logout
  app.post('/api/customer/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/customer/:id/appointments', isCustomerAuthenticated, async (req, res) => {
    try {
      const customerId = req.params.id;
      const sessionCustomerId = (req as any).session.customerId;
      
      // Ensure customer can only access their own appointments
      if (customerId !== sessionCustomerId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const appointments = await storage.getAppointments();
      const customerAppointments = appointments.filter(apt => apt.customerId === customerId);
      res.json(customerAppointments);
    } catch (error) {
      console.error('Error fetching customer appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.post('/api/customer/book', isCustomerAuthenticated, async (req, res) => {
    try {
      const { serviceId, staffId, date, time, customerNotes } = req.body;
      const customerId = (req as any).session.customerId;
      
      // Get service details for pricing and duration
      const service = await storage.getService(serviceId);
      
      if (!service) {
        return res.status(400).json({ message: 'Service not found' });
      }
      
      const appointment = await storage.createAppointment({
        customerId,
        serviceId,
        staffId,
        date,
        time,
        duration: service.duration,
        status: 'confirmed',
        totalAmount: service.price,
        bookingSource: 'online',
        customerNotes: customerNotes || '',
        notes: customerNotes || ''
      });
      
      res.json(appointment);
    } catch (error) {
      console.error('Error creating customer booking:', error);
      res.status(500).json({ message: 'Booking failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

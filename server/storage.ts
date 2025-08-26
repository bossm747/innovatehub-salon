import { db } from "./db";
import { eq, lt, sql, desc, and, or } from "drizzle-orm";
import {
  customers,
  services,
  staff,
  appointments,
  products,
  suppliers,
  inventoryTransactions,
  campaigns,
  emailLeads,
  businessProfile,
  aiSettings,
  inventoryAlerts,
  stockMovements,
  type Customer,
  type InsertCustomer,
  type Service,
  type InsertService,
  type Staff,
  type InsertStaff,
  type Appointment,
  type InsertAppointment,
  type Product,
  type InsertProduct,
  type Supplier,
  type InsertSupplier,
  type InventoryTransaction,
  type InsertInventoryTransaction,
  type Transaction,
  type InsertTransaction,
  type TimeRecord,
  type InsertTimeRecord,
  type NotificationSettings,
  type InsertNotificationSettings,
  type NotificationLog,
  type InsertNotificationLog,
  type Campaign,
  type InsertCampaign,
  type EmailLead,
  type InsertEmailLead,
  type BusinessProfile,
  type InsertBusinessProfile,
  type AiSettings,
  type InsertAiSettings,
  type InventoryAlert,
  type InsertInventoryAlert,
  type StockMovement,
  type InsertStockMovement,
  transactions,
  timeRecords,
  notificationSettings,
  notificationLog,
} from "@shared/schema";

export interface IStorage {
  // Customers
  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomers(): Promise<Customer[]>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: string): Promise<boolean>;

  // Services
  getService(id: string): Promise<Service | undefined>;
  getServices(): Promise<Service[]>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;

  // Staff
  getStaff(id: string): Promise<Staff | undefined>;
  getAllStaff(): Promise<Staff[]>;
  getStaffMember(id: string): Promise<Staff | undefined>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  updateStaff(id: string, staff: Partial<InsertStaff>): Promise<Staff | undefined>;
  deleteStaff(id: string): Promise<boolean>;
  authenticateStaff(email: string, password: string): Promise<Staff | null>;

  // Appointments
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

  // Walk-in Management
  getWalkInWaitingList(): Promise<any[]>;
  searchCustomersQuick(query: string): Promise<Customer[]>;

  // Products
  getProduct(id: string): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getLowStockProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Suppliers
  getSupplier(id: string): Promise<Supplier | undefined>;
  getSuppliers(): Promise<Supplier[]>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Inventory Transactions
  getInventoryTransaction(id: string): Promise<InventoryTransaction | undefined>;
  getInventoryTransactions(): Promise<InventoryTransaction[]>;
  getInventoryTransactionsByProduct(productId: string): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  updateInventoryTransaction(id: string, transaction: Partial<InsertInventoryTransaction>): Promise<InventoryTransaction | undefined>;
  deleteInventoryTransaction(id: string): Promise<boolean>;

  // POS Transactions
  getTransactions(): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;

  // Time Records
  getTimeRecords(): Promise<TimeRecord[]>;
  getActiveTimeRecord(staffId: string): Promise<TimeRecord | undefined>;
  clockIn(data: { staffId: string; notes?: string }): Promise<TimeRecord>;
  clockOut(id: string, data: { notes?: string }): Promise<TimeRecord>;
  startBreak(id: string, data: { notes?: string }): Promise<TimeRecord>;
  endBreak(id: string, data: { notes?: string }): Promise<TimeRecord>;
  getAttendanceReport(): Promise<any[]>;

  // Notification Settings
  getNotificationSettings(): Promise<NotificationSettings | undefined>;
  createOrUpdateNotificationSettings(settings: InsertNotificationSettings): Promise<NotificationSettings>;

  // Notification Log
  getNotificationLogs(appointmentId?: string): Promise<NotificationLog[]>;
  createNotificationLog(log: InsertNotificationLog): Promise<NotificationLog>;

  // Email Marketing Campaigns
  getCampaigns(): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<boolean>;
  sendCampaign(id: string): Promise<Campaign>;

  // Email Leads
  getEmailLeads(): Promise<EmailLead[]>;
  getEmailLead(id: string): Promise<EmailLead | undefined>;
  createEmailLead(lead: InsertEmailLead): Promise<EmailLead>;
  updateEmailLead(id: string, lead: Partial<InsertEmailLead>): Promise<EmailLead | undefined>;
  deleteEmailLead(id: string): Promise<boolean>;

  // Marketing Stats
  getMarketingStats(): Promise<{
    totalCampaigns: number;
    totalSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    todayAppointments: number;
    dailyRevenue: number;
    monthlyRevenue: number;
    totalClients: number;
    totalServices: number;
    totalStaff: number;
    recentAppointments: any[];
    upcomingAppointments: any[];
    lowStockProducts: any[];
    topServices: any[];
  }>;

  // Business Profile Settings
  getBusinessProfile(): Promise<BusinessProfile | undefined>;
  createOrUpdateBusinessProfile(profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile>;

  // AI Settings
  getAiSettings(): Promise<AiSettings | undefined>;
  createOrUpdateAiSettings(settings: Partial<InsertAiSettings>): Promise<AiSettings>;
}

export class DatabaseStorage implements IStorage {
  // Customer methods
  async getCustomer(id: string): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer || undefined;
  }

  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers);
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updatedCustomer] = await db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return updatedCustomer || undefined;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Service methods
  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updatedService] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return updatedService || undefined;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Staff methods
  async getStaff(id: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async getStaffMember(id: string): Promise<Staff | undefined> {
    const [staffMember] = await db.select().from(staff).where(eq(staff.id, id));
    return staffMember || undefined;
  }

  async getAllStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async createStaff(staffMember: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(staffMember).returning();
    return newStaff;
  }

  async updateStaff(id: string, staffMember: Partial<InsertStaff>): Promise<Staff | undefined> {
    const [updatedStaff] = await db.update(staff).set(staffMember).where(eq(staff.id, id)).returning();
    return updatedStaff || undefined;
  }

  async deleteStaff(id: string): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async authenticateStaff(email: string, password: string): Promise<Staff | null> {
    try {
      const [staffMember] = await db
        .select()
        .from(staff)
        .where(and(eq(staff.email, email), eq(staff.password, password), eq(staff.isActive, true)));

      return staffMember || null;
    } catch (error) {
      console.error("Staff authentication error:", error);
      return null;
    }
  }

  // Appointment methods
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointments(): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        customerId: appointments.customerId,
        serviceId: appointments.serviceId,
        staffId: appointments.staffId,
        date: appointments.date,
        time: appointments.time,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        totalAmount: appointments.totalAmount,
        createdAt: appointments.createdAt,
        clientName: customers.name,
        serviceName: services.name,
        staffName: staff.name,
        bookingSource: appointments.bookingSource,
        waitingListPosition: appointments.waitingListPosition,
        signatureUrl: appointments.signatureUrl,
        checkedInAt: appointments.checkedInAt,
        customerNotes: appointments.customerNotes,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id));
  }

  async getAppointmentsByDate(date: string): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        customerId: appointments.customerId,
        serviceId: appointments.serviceId,
        staffId: appointments.staffId,
        date: appointments.date,
        time: appointments.time,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        totalAmount: appointments.totalAmount,
        createdAt: appointments.createdAt,
        clientName: customers.name,
        serviceName: services.name,
        staffName: staff.name,
        bookingSource: appointments.bookingSource,
        waitingListPosition: appointments.waitingListPosition,
        signatureUrl: appointments.signatureUrl,
        checkedInAt: appointments.checkedInAt,
        customerNotes: appointments.customerNotes,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(eq(appointments.date, date));
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const safeAppointmentData = {
      ...appointmentData,
      bookingSource: appointmentData.bookingSource || 'walk-in',
      waitingListPosition: appointmentData.waitingListPosition || null,
      signatureUrl: appointmentData.signatureUrl || null,
      checkedInAt: appointmentData.checkedInAt || null,
      customerNotes: appointmentData.customerNotes || null,
    };

    const [newAppointment] = await db.insert(appointments).values(safeAppointmentData).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    try {
      const [updatedAppointment] = await db.update(appointments).set(appointmentData).where(eq(appointments.id, id)).returning();
      return updatedAppointment || undefined;
    } catch (error) {
      console.error('Update appointment error:', error);
      throw error;
    }
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Walk-in Management
  async getWalkInWaitingList(): Promise<any[]> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const waitingList = await db
        .select({
          id: appointments.id,
          name: customers.name,
          serviceName: services.name,
          phone: customers.phone,
        })
        .from(appointments)
        .innerJoin(customers, eq(appointments.customerId, customers.id))
        .innerJoin(services, eq(appointments.serviceId, services.id))
        .where(
          and(
            eq(appointments.date, today),
            eq(appointments.bookingSource, "walk-in"),
            eq(appointments.status, "confirmed")
          )
        )
        .orderBy(appointments.createdAt);

      return waitingList;
    } catch (error) {
      console.error("Get waiting list error:", error);
      return [];
    }
  }

  async searchCustomersQuick(query: string): Promise<Customer[]> {
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      const results = await db
        .select()
        .from(customers)
        .where(
          or(
            sql`LOWER(${customers.name}) LIKE ${searchTerm}`,
            sql`${customers.phone} LIKE ${searchTerm}`,
            sql`LOWER(${customers.email}) LIKE ${searchTerm}`
          )
        )
        .limit(10);

      return results;
    } catch (error) {
      console.error("Quick search error:", error);
      return [];
    }
  }

  // Product methods
  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await db.select().from(products).where(sql`${products.currentStock} <= ${products.minStockLevel}`);
  }

  // Enhanced Inventory Alerts
  async getInventoryAlerts(): Promise<InventoryAlert[]> {
    return await db.select().from(inventoryAlerts).where(eq(inventoryAlerts.isActive, true));
  }

  async createInventoryAlert(alertData: InsertInventoryAlert): Promise<InventoryAlert> {
    const [alert] = await db.insert(inventoryAlerts).values(alertData).returning();
    return alert;
  }

  async updateInventoryAlert(id: string, alertData: Partial<InsertInventoryAlert>): Promise<InventoryAlert> {
    const [alert] = await db.update(inventoryAlerts).set(alertData).where(eq(inventoryAlerts.id, id)).returning();
    return alert;
  }

  async deleteInventoryAlert(id: string): Promise<void> {
    await db.delete(inventoryAlerts).where(eq(inventoryAlerts.id, id));
  }

  async triggerInventoryAlert(id: string): Promise<void> {
    await db.update(inventoryAlerts).set({ lastTriggered: new Date() }).where(eq(inventoryAlerts.id, id));
  }

  // Stock Movement Tracking
  async getStockMovements(productId?: string, limit: number = 50): Promise<StockMovement[]> {
    let query = db.select().from(stockMovements).orderBy(desc(stockMovements.createdAt)).limit(limit);

    if (productId) {
      query = query.where(eq(stockMovements.productId, productId)) as any;
    }

    return await query;
  }

  async createStockMovement(movementData: InsertStockMovement): Promise<StockMovement> {
    const [movement] = await db.insert(stockMovements).values(movementData).returning();
    return movement;
  }

  async getInventoryOverview(): Promise<{
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    totalValue: number;
    recentMovements: number;
  }> {
    const totalProducts = await db.select({ count: sql`count(*)` }).from(products);
    const lowStock = await db.select({ count: sql`count(*)` }).from(products).where(sql`${products.currentStock} <= ${products.minStockLevel}`);
    const outOfStock = await db.select({ count: sql`count(*)` }).from(products).where(eq(products.currentStock, 0));
    const totalValue = await db.select({ total: sql`sum(${products.currentStock} * ${products.costPrice})` }).from(products);
    const recentMovements = await db.select({ count: sql`count(*)` }).from(stockMovements).where(sql`${stockMovements.createdAt} >= NOW() - INTERVAL '7 days'`);

    return {
      totalProducts: Number(totalProducts[0]?.count) || 0,
      lowStockCount: Number(lowStock[0]?.count) || 0,
      outOfStockCount: Number(outOfStock[0]?.count) || 0,
      totalValue: Number(totalValue[0]?.total) || 0,
      recentMovements: Number(recentMovements[0]?.count) || 0
    };
  }

  async checkAndTriggerStockAlerts(productId: string, newStock: number): Promise<void> {
    const product = await this.getProduct(productId);
    if (!product) return;

    // Check for low stock alert
    if (newStock <= (product.minStockLevel || 0) && (product.currentStock || 0) > (product.minStockLevel || 0)) {
      await this.createInventoryAlert({
        productId,
        alertType: 'low_stock',
        threshold: product.minStockLevel || 0,
        lastTriggered: new Date()
      });
    }

    // Check for out of stock alert
    if (newStock === 0 && (product.currentStock || 0) > 0) {
      await this.createInventoryAlert({
        productId,
        alertType: 'out_of_stock',
        threshold: 0,
        lastTriggered: new Date()
      });
    }

    // Check for overstock alert
    if (product.maxStockLevel && newStock > product.maxStockLevel && (product.currentStock || 0) <= product.maxStockLevel) {
      await this.createInventoryAlert({
        productId,
        alertType: 'overstock',
        threshold: product.maxStockLevel,
        lastTriggered: new Date()
      });
    }
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Transform array fields to comma-separated strings if needed
    const transformedProduct = {
      ...product,
      competitors: Array.isArray(product.competitors) ? product.competitors.join(',') : product.competitors,
      tags: Array.isArray(product.tags) ? product.tags.join(',') : product.tags
    };
    const [newProduct] = await db.insert(products).values([transformedProduct]).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    // Transform array fields to comma-separated strings if needed
    const transformedProduct = {
      ...product,
      competitors: Array.isArray(product.competitors) ? product.competitors.join(',') : product.competitors,
      tags: Array.isArray(product.tags) ? product.tags.join(',') : product.tags
    };
    const [updatedProduct] = await db.update(products).set(transformedProduct).where(eq(products.id, id)).returning();
    return updatedProduct || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Supplier methods
  async getSupplier(id: string): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [newSupplier] = await db.insert(suppliers).values(supplier).returning();
    return newSupplier;
  }

  async updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db.update(suppliers).set(supplier).where(eq(suppliers.id, id)).returning();
    return updatedSupplier || undefined;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Inventory Transaction methods
  async getInventoryTransaction(id: string): Promise<InventoryTransaction | undefined> {
    const [transaction] = await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.id, id));
    return transaction || undefined;
  }

  async getInventoryTransactions(): Promise<InventoryTransaction[]> {
    return await db.select().from(inventoryTransactions);
  }

  async getInventoryTransactionsByProduct(productId: string): Promise<InventoryTransaction[]> {
    return await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.productId, productId));
  }

  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    // Update product stock based on transaction type
    const product = await this.getProduct(transaction.productId);
    if (product) {
      let newStock = product.currentStock;

      switch (transaction.type) {
        case 'purchase':
        case 'adjustment':
          newStock += transaction.quantity;
          break;
        case 'sale':
        case 'waste':
          newStock -= transaction.quantity;
          break;
      }

      await this.updateProduct(transaction.productId, { currentStock: newStock });
    }

    const [newTransaction] = await db.insert(inventoryTransactions).values(transaction).returning();
    return newTransaction;
  }

  async updateInventoryTransaction(id: string, transaction: Partial<InsertInventoryTransaction>): Promise<InventoryTransaction | undefined> {
    const [updatedTransaction] = await db.update(inventoryTransactions).set(transaction).where(eq(inventoryTransactions.id, id)).returning();
    return updatedTransaction || undefined;
  }

  async deleteInventoryTransaction(id: string): Promise<boolean> {
    const result = await db.delete(inventoryTransactions).where(eq(inventoryTransactions.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  // POS Transactions methods
  async getTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values([transaction])
      .returning();
    return newTransaction;
  }

  // Time Records methods
  async getTimeRecords(): Promise<TimeRecord[]> {
    return await db.select().from(timeRecords).orderBy(desc(timeRecords.createdAt));
  }

  async getActiveTimeRecord(staffId: string): Promise<TimeRecord | undefined> {
    const [record] = await db
      .select()
      .from(timeRecords)
      .where(and(eq(timeRecords.staffId, staffId), eq(timeRecords.status, "active")));
    return record || undefined;
  }

  async clockIn(data: { staffId: string; notes?: string }): Promise<TimeRecord> {
    const [timeRecord] = await db
      .insert(timeRecords)
      .values({
        staffId: data.staffId,
        clockIn: new Date(),
        notes: data.notes,
        status: "active",
      })
      .returning();
    return timeRecord;
  }

  async clockOut(id: string, data: { notes?: string }): Promise<TimeRecord> {
    const clockOutTime = new Date();
    const [existing] = await db.select().from(timeRecords).where(eq(timeRecords.id, id));

    if (!existing) {
      throw new Error("Time record not found");
    }

    const clockInTime = new Date(existing.clockIn);
    const totalMs = clockOutTime.getTime() - clockInTime.getTime();
    const totalHours = (totalMs / (1000 * 60 * 60)).toFixed(2);

    // Calculate break duration if applicable
    let breakDuration = "0";
    if (existing.breakStart && existing.breakEnd) {
      const breakMs = new Date(existing.breakEnd).getTime() - new Date(existing.breakStart).getTime();
      breakDuration = (breakMs / (1000 * 60 * 60)).toFixed(2);
    }

    const regularHours = Math.max(0, parseFloat(totalHours) - parseFloat(breakDuration)).toFixed(2);
    const overtimeHours = Math.max(0, parseFloat(regularHours) - 8).toFixed(2);

    const [updatedRecord] = await db
      .update(timeRecords)
      .set({
        clockOut: clockOutTime,
        totalHours,
        regularHours,
        overtimeHours,
        breakDuration,
        status: "completed",
        notes: data.notes || existing.notes,
        updatedAt: new Date(),
      })
      .where(eq(timeRecords.id, id))
      .returning();

    return updatedRecord;
  }

  async startBreak(id: string, data: { notes?: string }): Promise<TimeRecord> {
    const [updatedRecord] = await db
      .update(timeRecords)
      .set({
        breakStart: new Date(),
        status: "on-break",
        updatedAt: new Date(),
      })
      .where(eq(timeRecords.id, id))
      .returning();

    return updatedRecord;
  }

  async endBreak(id: string, data: { notes?: string }): Promise<TimeRecord> {
    const [updatedRecord] = await db
      .update(timeRecords)
      .set({
        breakEnd: new Date(),
        status: "active",
        updatedAt: new Date(),
      })
      .where(eq(timeRecords.id, id))
      .returning();

    return updatedRecord;
  }

  // Notification Settings methods
  async getNotificationSettings(): Promise<NotificationSettings | undefined> {
    const [settings] = await db.select().from(notificationSettings).limit(1);
    return settings || undefined;
  }

  async createOrUpdateNotificationSettings(settingsData: InsertNotificationSettings): Promise<NotificationSettings> {
    // Check if settings already exist
    const existing = await this.getNotificationSettings();

    if (existing) {
      // Update existing settings
      const [updatedSettings] = await db
        .update(notificationSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(notificationSettings.id, existing.id))
        .returning();
      return updatedSettings;
    } else {
      // Create new settings
      const [newSettings] = await db
        .insert(notificationSettings)
        .values(settingsData)
        .returning();
      return newSettings;
    }
  }

  // Notification Log methods
  async getNotificationLogs(appointmentId?: string): Promise<NotificationLog[]> {
    if (appointmentId) {
      return await db
        .select()
        .from(notificationLog)
        .where(eq(notificationLog.appointmentId, appointmentId))
        .orderBy(desc(notificationLog.createdAt));
    } else {
      return await db
        .select()
        .from(notificationLog)
        .orderBy(desc(notificationLog.createdAt))
        .limit(100);
    }
  }

  async createNotificationLog(logData: InsertNotificationLog): Promise<NotificationLog> {
    const [newLog] = await db
      .insert(notificationLog)
      .values(logData)
      .returning();
    return newLog;
  }

  // Email Marketing Campaign methods
  async getCampaigns(): Promise<Campaign[]> {
    return await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign || undefined;
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const [updatedCampaign] = await db.update(campaigns).set(campaign).where(eq(campaigns.id, id)).returning();
    return updatedCampaign || undefined;
  }

  async deleteCampaign(id: string): Promise<boolean> {
    const result = await db.delete(campaigns).where(eq(campaigns.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async sendCampaign(id: string): Promise<Campaign> {
    // Update campaign status to sent and set sent date
    const [campaign] = await db
      .update(campaigns)
      .set({
        status: 'sent',
        sentDate: new Date(),
        updatedAt: new Date()
      })
      .where(eq(campaigns.id, id))
      .returning();

    return campaign;
  }

  // Email Lead methods
  async getEmailLeads(): Promise<EmailLead[]> {
    return await db.select().from(emailLeads).orderBy(desc(emailLeads.createdAt));
  }

  async getEmailLead(id: string): Promise<EmailLead | undefined> {
    const [lead] = await db.select().from(emailLeads).where(eq(emailLeads.id, id));
    return lead || undefined;
  }

  async createEmailLead(lead: InsertEmailLead): Promise<EmailLead> {
    const [newLead] = await db.insert(emailLeads).values(lead).returning();
    return newLead;
  }

  async updateEmailLead(id: string, lead: Partial<InsertEmailLead>): Promise<EmailLead | undefined> {
    const [updatedLead] = await db.update(emailLeads).set(lead).where(eq(emailLeads.id, id)).returning();
    return updatedLead || undefined;
  }

  async deleteEmailLead(id: string): Promise<boolean> {
    const result = await db.delete(emailLeads).where(eq(emailLeads.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMarketingStats(): Promise<{
    totalCampaigns: number;
    totalSent: number;
    openRate: number;
    clickRate: number;
    conversionRate: number;
  }> {
    const totalCampaigns = await db.select({ count: sql<number>`count(*)` }).from(campaigns);
    const sentCampaigns = await db.select({ count: sql<number>`count(*)` }).from(campaigns).where(eq(campaigns.status, 'sent'));

    return {
      totalCampaigns: totalCampaigns[0]?.count || 0,
      totalSent: sentCampaigns[0]?.count || 0,
      openRate: 68.5,
      clickRate: 12.3,
      conversionRate: 4.8,
    };
  }

  async getDashboardStats(): Promise<{
    todayAppointments: number;
    dailyRevenue: number;
    monthlyRevenue: number;
    totalClients: number;
    totalServices: number;
    totalStaff: number;
    recentAppointments: any[];
    upcomingAppointments: any[];
    lowStockProducts: any[];
    topServices: any[];
  }> {
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];

    // Get today's appointments with client and service names
    const todayAppointments = await this.getAppointmentsByDate(today);

    // Get monthly appointments for revenue calculation
    const monthlyAppointments = await db
      .select({
        totalAmount: appointments.totalAmount,
      })
      .from(appointments)
      .where(
        and(
          sql`${appointments.date} >= ${startOfMonth}`,
          sql`${appointments.date} <= ${endOfMonth}`
        )
      );

    // Calculate revenues
    const dailyRevenue = todayAppointments.reduce((sum, apt) => {
      return sum + parseFloat(apt.totalAmount || "0");
    }, 0);

    const monthlyRevenue = monthlyAppointments.reduce((sum, apt) => {
      return sum + parseFloat(apt.totalAmount || "0");
    }, 0);

    // Get totals
    const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(customers);
    const [serviceCount] = await db.select({ count: sql<number>`count(*)` }).from(services);
    const [staffCount] = await db.select({ count: sql<number>`count(*)` }).from(staff);

    // Get recent appointments (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAppointments = await db
      .select({
        id: appointments.id,
        date: appointments.date,
        time: appointments.time,
        clientName: customers.name,
        serviceName: services.name,
        status: appointments.status,
        totalAmount: appointments.totalAmount,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(sql`${appointments.date} >= ${sevenDaysAgo.toISOString().split('T')[0]}`)
      .orderBy(desc(appointments.createdAt))
      .limit(5);

    // Get upcoming appointments (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const upcomingAppointments = await db
      .select({
        id: appointments.id,
        date: appointments.date,
        time: appointments.time,
        clientName: customers.name,
        serviceName: services.name,
        status: appointments.status,
        totalAmount: appointments.totalAmount,
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(
        and(
          sql`${appointments.date} >= ${today}`,
          sql`${appointments.date} <= ${sevenDaysFromNow.toISOString().split('T')[0]}`,
          eq(appointments.status, 'confirmed')
        )
      )
      .orderBy(appointments.date, appointments.time)
      .limit(5);

    // Get low stock products
    const lowStockProducts = await this.getLowStockProducts();

    // Get top services (most booked in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const topServices = await db
      .select({
        serviceId: appointments.serviceId,
        serviceName: services.name,
        bookingCount: sql<number>`count(*)`,
        revenue: sql<number>`sum(${appointments.totalAmount})`,
      })
      .from(appointments)
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(sql`${appointments.date} >= ${thirtyDaysAgo.toISOString().split('T')[0]}`)
      .groupBy(appointments.serviceId, services.name)
      .orderBy(sql`count(*) desc`)
      .limit(5);

    return {
      todayAppointments: todayAppointments.length,
      dailyRevenue,
      monthlyRevenue,
      totalClients: customerCount?.count || 0,
      totalServices: serviceCount?.count || 0,
      totalStaff: staffCount?.count || 0,
      recentAppointments,
      upcomingAppointments,
      lowStockProducts: lowStockProducts.slice(0, 5),
      topServices,
    };
  }

  async getAttendanceReport(): Promise<any[]> {
    // Get time records grouped by staff
    const records = await db.select().from(timeRecords);
    const staffMembers = await db.select().from(staff);

    // Calculate attendance metrics for each staff member
    const report = staffMembers.map((staffMember) => {
      const staffRecords = records.filter(record => record.staffId === staffMember.id);

      const totalHours = staffRecords.reduce((sum, record) => {
        if (record.clockOut) {
          const start = new Date(record.clockIn);
          const end = new Date(record.clockOut);
          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          return sum + Math.max(0, hours);
        }
        return sum;
      }, 0);

      const daysWorked = staffRecords.filter(record => record.clockOut).length;
      const attendanceRate = Math.min(100, (daysWorked / 30) * 100); // Assuming 30-day period
      const punctualityScore = Math.random() * 30 + 70; // Mock score between 70-100

      return {
        staffId: staffMember.id,
        totalHours: Math.round(totalHours),
        daysWorked,
        attendanceRate: Math.round(attendanceRate),
        punctualityScore: Math.round(punctualityScore),
      };
    });

    return report;
  }

  // Business Profile Settings methods
  async getBusinessProfile(): Promise<BusinessProfile | undefined> {
    const [profile] = await db.select().from(businessProfile).limit(1);
    return profile || undefined;
  }

  async createOrUpdateBusinessProfile(profile: Partial<InsertBusinessProfile>): Promise<BusinessProfile> {
    const existingProfile = await this.getBusinessProfile();

    if (existingProfile) {
      const [updatedProfile] = await db.update(businessProfile)
        .set({ ...profile, updatedAt: new Date() })
        .where(eq(businessProfile.id, existingProfile.id))
        .returning();
      return updatedProfile;
    } else {
      const [newProfile] = await db.insert(businessProfile)
        .values({ ...profile, updatedAt: new Date() })
        .returning();
      return newProfile;
    }
  }

  // AI Settings methods
  async getAiSettings(): Promise<AiSettings | undefined> {
    const [settings] = await db.select().from(aiSettings).limit(1);
    return settings || undefined;
  }

  async createOrUpdateAiSettings(settings: Partial<InsertAiSettings>): Promise<AiSettings> {
    const existingSettings = await this.getAiSettings();

    if (existingSettings) {
      const [updatedSettings] = await db.update(aiSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(aiSettings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    } else {
      const [newSettings] = await db.insert(aiSettings)
        .values({ ...settings, updatedAt: new Date() })
        .returning();
      return newSettings;
    }
  }
}

export const storage = new DatabaseStorage();
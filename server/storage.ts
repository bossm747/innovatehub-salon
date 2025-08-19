import { db } from "./db";
import { eq, lt, sql, desc, and } from "drizzle-orm";
import {
  clients,
  services,
  staff,
  appointments,
  products,
  suppliers,
  inventoryTransactions,
  campaigns,
  emailLeads,
  type Client,
  type InsertClient,
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
  transactions,
  timeRecords,
  notificationSettings,
  notificationLog,
} from "@shared/schema";

export interface IStorage {
  // Clients
  getClient(id: string): Promise<Client | undefined>;
  getClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: string): Promise<boolean>;

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

  // Appointments
  getAppointment(id: string): Promise<Appointment | undefined>;
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;

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
}

export class DatabaseStorage implements IStorage {
  // Client methods
  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db.insert(clients).values(client).returning();
    return newClient;
  }

  async updateClient(id: string, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return updatedClient || undefined;
  }

  async deleteClient(id: string): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
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

  // Appointment methods
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointments(): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        clientId: appointments.clientId,
        serviceId: appointments.serviceId,
        staffId: appointments.staffId,
        date: appointments.date,
        time: appointments.time,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        totalAmount: appointments.totalAmount,
        createdAt: appointments.createdAt,
        clientName: clients.name,
        serviceName: services.name,
        staffName: staff.name,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id));
  }

  async getAppointmentsByDate(date: string): Promise<any[]> {
    return await db
      .select({
        id: appointments.id,
        clientId: appointments.clientId,
        serviceId: appointments.serviceId,
        staffId: appointments.staffId,
        date: appointments.date,
        time: appointments.time,
        duration: appointments.duration,
        status: appointments.status,
        notes: appointments.notes,
        totalAmount: appointments.totalAmount,
        createdAt: appointments.createdAt,
        clientName: clients.name,
        serviceName: services.name,
        staffName: staff.name,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(staff, eq(appointments.staffId, staff.id))
      .where(eq(appointments.date, date));
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    return updatedAppointment || undefined;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return (result.rowCount ?? 0) > 0;
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

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db.update(products).set(product).where(eq(products.id, id)).returning();
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
      .values(transaction)
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
    const [clientCount] = await db.select({ count: sql<number>`count(*)` }).from(clients);
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
        clientName: clients.name,
        serviceName: services.name,
        status: appointments.status,
        totalAmount: appointments.totalAmount,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
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
        clientName: clients.name,
        serviceName: services.name,
        status: appointments.status,
        totalAmount: appointments.totalAmount,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
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
      totalClients: clientCount?.count || 0,
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
}

export const storage = new DatabaseStorage();
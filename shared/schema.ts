import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  address: text("address"),
  dateOfBirth: text("date_of_birth"),
  notes: text("notes"),
  totalVisits: integer("total_visits").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  lastVisit: timestamp("last_visit"),
  status: text("status").default("active"), // active, inactive
  // Customer Portal Fields
  customerPortalEnabled: boolean("customer_portal_enabled").default(true),
  preferredStaffId: varchar("preferred_staff_id").references(() => staff.id),
  portalPin: text("portal_pin").notNull(), // Simple 4-digit PIN for customer portal access
  createdAt: timestamp("created_at").defaultNow(),
});

export const services = pgTable("services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // massage, facial, body-treatment, hair, nail-care
  duration: integer("duration").notNull(), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").notNull(),
  specialties: text("specialties").array(),
  experience: integer("experience"), // in years
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  serviceId: varchar("service_id").references(() => services.id).notNull(),
  staffId: varchar("staff_id").references(() => staff.id),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  duration: integer("duration").notNull(), // in minutes
  status: text("status").default("confirmed"), // confirmed, pending, cancelled, completed
  notes: text("notes"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }),
  // Customer Portal & Walk-in Tracking
  bookingSource: text("booking_source").default("walk-in"), // online, walk-in, phone, admin
  customerNotes: text("customer_notes"), // Notes added by customer during online booking
  waitingListPosition: integer("waiting_list_position"), // Position in waiting list for walk-ins
  signatureUrl: text("signature_url"), // Digital signature for walk-in customers
  checkedInAt: timestamp("checked_in_at"), // When walk-in customer checked in
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // hair-care, skin-care, tools, equipment, retail
  brand: text("brand"),
  sku: text("sku").unique(),
  barcode: text("barcode"),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  retailPrice: decimal("retail_price", { precision: 10, scale: 2 }),
  currentStock: integer("current_stock").default(0),
  minStockLevel: integer("min_stock_level").default(10),
  maxStockLevel: integer("max_stock_level"),
  unit: text("unit").default("pcs"), // pcs, ml, g, kg, etc.
  supplierId: varchar("supplier_id").references(() => suppliers.id),
  imageUrl: text("image_url"),
  imageName: text("image_name"),
  aiGenerated: boolean("ai_generated").default(false),
  aiPrompt: text("ai_prompt"), // stores the AI prompt used for generation
  marketPrice: decimal("market_price", { precision: 10, scale: 2 }), // AI-researched market price
  competitors: text("competitors").array(), // competitor products found by AI
  tags: text("tags").array(), // AI-generated tags
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").references(() => products.id).notNull(),
  type: text("type").notNull(), // purchase, sale, adjustment, waste
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  totalCost: decimal("total_cost", { precision: 10, scale: 2 }),
  reason: text("reason"),
  reference: text("reference"), // invoice number, appointment id, etc.
  staffId: varchar("staff_id").references(() => staff.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// POS Transactions
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  transactionNumber: text("transaction_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => customers.id),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  items: jsonb("items").notNull().$type<{
    type: 'service' | 'product';
    id: string;
    name: string;
    price: string;
    quantity: number;
    total: string;
  }[]>(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, gcash, maya, qrph, card
  paymentReference: text("payment_reference"), // reference number for digital payments
  paymentStatus: text("payment_status").notNull().default("completed"), // pending, completed, failed, refunded
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Staff Time Records
export const timeRecords = pgTable("time_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  staffId: varchar("staff_id").references(() => staff.id).notNull(),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  breakStart: timestamp("break_start"),
  breakEnd: timestamp("break_end"),
  totalHours: decimal("total_hours", { precision: 5, scale: 2 }),
  regularHours: decimal("regular_hours", { precision: 5, scale: 2 }),
  overtimeHours: decimal("overtime_hours", { precision: 5, scale: 2 }),
  breakDuration: decimal("break_duration", { precision: 5, scale: 2 }),
  notes: text("notes"),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notification Settings
export const notificationSettings = pgTable("notification_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  spaName: text("spa_name").notNull().default("JustPause Salon & Spa"),
  spaEmail: text("spa_email").notNull(),
  spaPhone: text("spa_phone"),
  emailEnabled: boolean("email_enabled").default(true),
  smsEnabled: boolean("sms_enabled").default(false),
  confirmationEnabled: boolean("confirmation_enabled").default(true),
  reminderEnabled: boolean("reminder_enabled").default(true),
  reminderHours: integer("reminder_hours").default(24), // hours before appointment
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notification Log
export const notificationLog = pgTable("notification_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id).notNull(),
  type: text("type").notNull(), // confirmation, reminder
  method: text("method").notNull(), // email, sms
  status: text("status").notNull(), // sent, failed, pending
  sentAt: timestamp("sent_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  totalVisits: true,
  totalSpent: true,
  lastVisit: true,
  createdAt: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
});

export const insertStaffSchema = createInsertSchema(staff).omit({
  id: true,
  createdAt: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  competitors: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
    typeof val === 'string' ? val : val?.join(',') || ''
  ),
  tags: z.union([z.string(), z.array(z.string())]).optional().transform(val => 
    typeof val === 'string' ? val : val?.join(',') || ''
  ),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  transactionNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTimeRecordSchema = createInsertSchema(timeRecords).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationLogSchema = createInsertSchema(notificationLog).omit({
  id: true,
  createdAt: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type TimeRecord = typeof timeRecords.$inferSelect;
export type InsertTimeRecord = z.infer<typeof insertTimeRecordSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationLog = typeof notificationLog.$inferSelect;
export type InsertNotificationLog = z.infer<typeof insertNotificationLogSchema>;

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  appointments: many(appointments),
  transactions: many(transactions),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointments: many(appointments),
}));

export const staffRelations = relations(staff, ({ many }) => ({
  appointments: many(appointments),
  inventoryTransactions: many(inventoryTransactions),
  transactions: many(transactions),
  timeRecords: many(timeRecords),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  customer: one(customers, {
    fields: [appointments.customerId],
    references: [customers.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  staff: one(staff, {
    fields: [appointments.staffId],
    references: [staff.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  inventoryTransactions: many(inventoryTransactions),
}));

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  products: many(products),
}));

export const inventoryTransactionsRelations = relations(inventoryTransactions, ({ one }) => ({
  product: one(products, {
    fields: [inventoryTransactions.productId],
    references: [products.id],
  }),
  staff: one(staff, {
    fields: [inventoryTransactions.staffId],
    references: [staff.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  customer: one(customers, {
    fields: [transactions.customerId],
    references: [customers.id],
  }),
  staff: one(staff, {
    fields: [transactions.staffId],
    references: [staff.id],
  }),
}));

export const timeRecordsRelations = relations(timeRecords, ({ one }) => ({
  staff: one(staff, {
    fields: [timeRecords.staffId],
    references: [staff.id],
  }),
}));

// Email Marketing Campaigns
export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  audience: text("audience").notNull(), // all_clients, recent_clients, vip_clients, uploaded_leads
  status: text("status").notNull().default("draft"), // draft, scheduled, sent, cancelled
  scheduledDate: timestamp("scheduled_date"),
  sentDate: timestamp("sent_date"),
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Campaign = typeof campaigns.$inferSelect;

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  recipientCount: true,
  openCount: true,
  clickCount: true,
  sentDate: true,
});

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;

// Email Leads (from CSV uploads)
export const emailLeads = pgTable("email_leads", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  source: text("source").default("csv_upload"), // csv_upload, manual, integration
  tags: text("tags").array(),
  subscribed: boolean("subscribed").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type EmailLead = typeof emailLeads.$inferSelect;

export const insertEmailLeadSchema = createInsertSchema(emailLeads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertEmailLead = z.infer<typeof insertEmailLeadSchema>;

// Business Profile Settings
export const businessProfile = pgTable("business_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull().default("JustPause Salon & Spa"),
  ownerName: text("owner_name"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  province: text("province"),
  postalCode: text("postal_code"),
  businessType: text("business_type").notNull().default("both"), // salon, spa, both
  logo: text("logo"),
  description: text("description"),
  website: text("website"),
  socialMedia: jsonb("social_media").$type<{
    facebook: string;
    instagram: string;
    tiktok: string;
  }>().default({
    facebook: "",
    instagram: "",
    tiktok: "",
  }),
  operatingHours: jsonb("operating_hours").$type<{
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Settings
export const aiSettings = pgTable("ai_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  openrouterApiKey: text("openrouter_api_key"),
  preferredModel: text("preferred_model").default("meta-llama/llama-3.1-8b-instruct:free"),
  autoFillProducts: boolean("auto_fill_products").default(true),
  marketResearch: boolean("market_research").default(true),
  competitorAnalysis: boolean("competitor_analysis").default(false),
  priceOptimization: boolean("price_optimization").default(true),
  generateTags: boolean("generate_tags").default(true),
  generateDescriptions: boolean("generate_descriptions").default(true),
  promptCustomization: text("prompt_customization"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAiSettingsSchema = createInsertSchema(aiSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BusinessProfile = typeof businessProfile.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;
export type AiSettings = typeof aiSettings.$inferSelect;
export type InsertAiSettings = z.infer<typeof insertAiSettingsSchema>;

// Enhanced Inventory Management
export const inventoryAlerts = pgTable("inventory_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  alertType: text("alert_type").notNull(), // 'low_stock', 'out_of_stock', 'overstock'
  threshold: integer("threshold").notNull(),
  isActive: boolean("is_active").default(true),
  lastTriggered: timestamp("last_triggered"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stockMovements = pgTable("stock_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  movementType: text("movement_type").notNull(), // 'in', 'out', 'adjustment'
  quantity: integer("quantity").notNull(),
  reason: text("reason").notNull(), // 'sale', 'purchase', 'waste', 'damage', 'adjustment'
  previousStock: integer("previous_stock").notNull(),
  newStock: integer("new_stock").notNull(),
  notes: text("notes"),
  staffId: varchar("staff_id").references(() => staff.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInventoryAlertSchema = createInsertSchema(inventoryAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertStockMovementSchema = createInsertSchema(stockMovements).omit({
  id: true,
  createdAt: true,
});

export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type InsertInventoryAlert = z.infer<typeof insertInventoryAlertSchema>;
export type StockMovement = typeof stockMovements.$inferSelect;
export type InsertStockMovement = z.infer<typeof insertStockMovementSchema>;

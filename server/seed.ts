import { db } from "./db";
import { 
  customers, 
  services, 
  staff, 
  appointments, 
  products
} from "@shared/schema";

export async function seedDatabase() {
  console.log("Seeding database with sample data...");

  try {
    // Clear existing data
    await db.delete(appointments);
    await db.delete(products);
    await db.delete(services);
    await db.delete(staff);
    await db.delete(customers);


    // Seed Staff
    const staffMembers = await db.insert(staff).values([
      {
        name: "Maria Santos",
        email: "maria.santos@serenity-spa.ph",
        phone: "+63 917 111 1111",
        role: "Senior Therapist",
        specialties: ["Facial", "Body Massage", "Aromatherapy"],
        experience: 5
      },
      {
        name: "Juan Dela Cruz", 
        email: "juan.delacruz@serenity-spa.ph",
        phone: "+63 917 222 2222",
        role: "Hair Stylist",
        specialties: ["Hair Cut", "Hair Color", "Hair Treatment"],
        experience: 3
      },
      {
        name: "Ana Reyes",
        email: "ana.reyes@serenity-spa.ph", 
        phone: "+63 917 333 3333",
        role: "Nail Technician",
        specialties: ["Manicure", "Pedicure", "Nail Art"],
        experience: 2
      },
      {
        name: "Carlos Lopez",
        email: "carlos.lopez@serenity-spa.ph",
        phone: "+63 917 444 4444", 
        role: "Massage Therapist",
        specialties: ["Swedish Massage", "Deep Tissue", "Hot Stone"],
        experience: 4
      }
    ]).returning();

    // Seed Services
    const serviceList = await db.insert(services).values([
      {
        name: "Classic Facial",
        description: "Deep cleansing facial with moisturizing treatment",
        category: "Facial",
        duration: 60,
        price: 1500.00
      },
      {
        name: "Anti-Aging Facial",
        description: "Premium anti-aging treatment with collagen mask",
        category: "Facial", 
        duration: 90,
        price: 2500.00
      },
      {
        name: "Swedish Massage",
        description: "Relaxing full body massage with aromatic oils",
        category: "Massage",
        duration: 60,
        price: 2000.00
      },
      {
        name: "Deep Tissue Massage",
        description: "Therapeutic deep tissue massage for muscle tension",
        category: "Massage",
        duration: 90,
        price: 2800.00
      },
      {
        name: "Hot Stone Massage",
        description: "Relaxing massage with heated volcanic stones",
        category: "Massage",
        duration: 75,
        price: 3200.00
      },
      {
        name: "Hair Cut & Style",
        description: "Professional hair cut with styling",
        category: "Hair",
        duration: 45,
        price: 800.00
      },
      {
        name: "Hair Color",
        description: "Full hair coloring service with premium products",
        category: "Hair",
        duration: 120,
        price: 3500.00
      },
      {
        name: "Hair Treatment",
        description: "Nourishing hair treatment for damaged hair",
        category: "Hair",
        duration: 60,
        price: 1200.00
      },
      {
        name: "Classic Manicure",
        description: "Professional nail care with polish",
        category: "Nails",
        duration: 30,
        price: 500.00
      },
      {
        name: "Gel Manicure",
        description: "Long-lasting gel polish manicure",
        category: "Nails",
        duration: 45,
        price: 800.00
      },
      {
        name: "Classic Pedicure",
        description: "Relaxing foot care with polish",
        category: "Nails",
        duration: 45,
        price: 700.00
      },
      {
        name: "Body Scrub",
        description: "Exfoliating full body scrub treatment",
        category: "Body Treatment",
        duration: 45,
        price: 1800.00
      }
    ]).returning();

    // Seed Clients
    const customerList = await db.insert(customers).values([
      {
        name: "Isabella Garcia",
        email: "isabella.garcia@gmail.com",
        phone: "+63 917 555 1111",
        address: "456 Ortigas Center, Pasig City",
        dateOfBirth: "1990-03-15",
        notes: "Prefers afternoon appointments"
      },
      {
        name: "Miguel Torres",
        email: "miguel.torres@yahoo.com",
        phone: "+63 917 555 2222", 
        address: "789 BGC, Taguig City",
        dateOfBirth: "1985-07-22",
        notes: "Regular customer, prefers Maria as therapist"
      },
      {
        name: "Sofia Mendoza",
        email: "sofia.mendoza@hotmail.com",
        phone: "+63 917 555 3333",
        address: "321 Alabang, Muntinlupa City",
        dateOfBirth: "1988-11-08",
        notes: "Allergic to lavender oil"
      },
      {
        name: "David Ramos",
        email: "david.ramos@gmail.com",
        phone: "+63 917 555 4444",
        address: "654 Quezon City",
        dateOfBirth: "1982-05-30",
        notes: "Prefers weekend appointments"
      },
      {
        name: "Carmen Villanueva",
        email: "carmen.v@gmail.com",
        phone: "+63 917 555 5555",
        address: "987 Marikina City",
        dateOfBirth: "1995-09-12",
        notes: "First-time client, interested in facial treatments"
      }
    ]).returning();

    // Seed Products
    await db.insert(products).values([
      {
        name: "Moisturizing Face Cream",
        description: "Premium anti-aging moisturizer with SPF 30",
        category: "skin-care",
        brand: "Serenity Pro",
        sku: "SER-MOIST-001",
        barcode: "1234567890123",
        costPrice: "800.00",
        retailPrice: "1500.00",
        currentStock: 25,
        minStockLevel: 5
      },
      {
        name: "Vitamin C Serum",
        description: "Brightening vitamin C serum for all skin types",
        category: "skin-care", 
        brand: "Serenity Pro",
        sku: "SER-VITC-002",
        barcode: "1234567890124",
        costPrice: "1200.00",
        retailPrice: "2200.00",
        currentStock: 18,
        minStockLevel: 3
      },
      {
        name: "Argan Hair Oil",
        description: "Nourishing argan oil for damaged hair",
        category: "hair-care",
        brand: "Moroccan Gold",
        sku: "MG-ARGAN-003",
        barcode: "1234567890125", 
        costPrice: "600.00",
        retailPrice: "1200.00",
        currentStock: 30,
        minStockLevel: 8
      },
      {
        name: "Relaxing Massage Oil",
        description: "Blend of essential oils for massage therapy",
        category: "retail",
        brand: "Serenity Pro",
        sku: "SER-MASS-004",
        barcode: "1234567890126",
        costPrice: "450.00",
        retailPrice: "900.00",
        currentStock: 40,
        minStockLevel: 10
      },
      {
        name: "Cuticle Oil",
        description: "Nourishing cuticle oil with vitamin E",
        category: "retail",
        brand: "Nail Perfect",
        sku: "NP-CUT-005",
        barcode: "1234567890127",
        costPrice: "200.00",
        retailPrice: "450.00",
        currentStock: 50,
        minStockLevel: 15
      }
    ]);

    // Seed Appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    await db.insert(appointments).values([
      {
        customerId: customerList[0].id,
        serviceId: serviceList[0].id,
        staffId: staffMembers[0].id,
        date: tomorrow.toISOString().split('T')[0],
        time: "10:00",
        duration: 60,
        status: "confirmed",
        notes: "First facial treatment"
      },
      {
        customerId: customerList[1].id,
        serviceId: serviceList[2].id,
        staffId: staffMembers[3].id,
        date: tomorrow.toISOString().split('T')[0],
        time: "14:00", 
        duration: 60,
        status: "confirmed",
        notes: "Regular Swedish massage"
      },
      {
        customerId: customerList[2].id,
        serviceId: serviceList[5].id,
        staffId: staffMembers[1].id,
        date: nextWeek.toISOString().split('T')[0],
        time: "11:00",
        duration: 45,
        status: "confirmed",
        notes: "Hair cut and style"
      },
      {
        customerId: customerList[3].id,
        serviceId: serviceList[3].id,
        staffId: staffMembers[3].id,
        date: nextWeek.toISOString().split('T')[0],
        time: "15:30",
        duration: 90,
        status: "confirmed",
        notes: "Deep tissue for back pain"
      }
    ]);

    console.log("✅ Database seeded successfully!");
    console.log(`👥 ${staffMembers.length} staff members added`);
    console.log(`💆 ${serviceList.length} services added`);
    console.log(`👤 ${customerList.length} customers added`);
    console.log(`📅 4 appointments scheduled`);
    console.log(`🛍️ 5 products in inventory`);

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
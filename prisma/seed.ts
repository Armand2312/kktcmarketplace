import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  // -------------------------
  // Categories
  // -------------------------

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "electronics" },
      update: {},
      create: {
        name: "Electronics",
        slug: "electronics",
        description: "Phones, computers, accessories and other electronics.",
      },
    }),

    prisma.category.upsert({
      where: { slug: "clothing" },
      update: {},
      create: {
        name: "Clothing",
        slug: "clothing",
        description: "Men's and women's clothing.",
      },
    }),

    prisma.category.upsert({
      where: { slug: "home-garden" },
      update: {},
      create: {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Products for your home and garden.",
      },
    }),

    prisma.category.upsert({
      where: { slug: "gaming" },
      update: {},
      create: {
        name: "Gaming",
        slug: "gaming",
        description: "Gaming hardware, accessories and equipment.",
      },
    }),
  ]);

  const [
    electronicsCategory,
    clothingCategory,
    homeCategory,
    gamingCategory,
  ] = categories;

  // -------------------------
  // Users
  // -------------------------

  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@test.com",
      role: "CUSTOMER",
    },
  });

  const sellerOne = await prisma.user.upsert({
    where: { email: "seller1@test.com" },
    update: {},
    create: {
      name: "Ahmet Electronics",
      email: "seller1@test.com",
      role: "SELLER",
    },
  });

  const sellerTwo = await prisma.user.upsert({
    where: { email: "seller2@test.com" },
    update: {},
    create: {
      name: "Leyla Fashion",
      email: "seller2@test.com",
      role: "SELLER",
    },
  });

  const pendingSeller = await prisma.user.upsert({
    where: { email: "pending@test.com" },
    update: {},
    create: {
      name: "Pending Seller",
      email: "pending@test.com",
      role: "CUSTOMER",
    },
  });

  const rejectedSeller = await prisma.user.upsert({
    where: { email: "rejected@test.com" },
    update: {},
    create: {
      name: "Rejected Seller",
      email: "rejected@test.com",
      role: "CUSTOMER",
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      name: "Marketplace Admin",
      email: "admin@test.com",
      role: "ADMIN",
    },
  });

  // -------------------------
  // Seller Applications
  // -------------------------

  await prisma.sellerApplication.upsert({
    where: {
      applicantId: sellerOne.id,
    },
    update: {},
    create: {
      businessName: "Ahmet Tech",
      description: "Electronics and gaming equipment seller.",
      phoneNumber: "0533 111 2233",
      businessEmail: "business@ahmettech.com",
      address: "Lefkoşa, North Cyprus",
      taxNumber: "TAX-10001",
      status: "APPROVED",
      reviewedAt: new Date(),
      applicantId: sellerOne.id,
    },
  });

  await prisma.sellerApplication.upsert({
    where: {
      applicantId: sellerTwo.id,
    },
    update: {},
    create: {
      businessName: "Leyla Fashion",
      description: "Clothing and fashion retailer.",
      phoneNumber: "0533 222 3344",
      businessEmail: "info@leylafashion.com",
      address: "Girne, North Cyprus",
      taxNumber: "TAX-10002",
      status: "APPROVED",
      reviewedAt: new Date(),
      applicantId: sellerTwo.id,
    },
  });

  await prisma.sellerApplication.upsert({
    where: {
      applicantId: pendingSeller.id,
    },
    update: {},
    create: {
      businessName: "Cyprus Home Store",
      description: "Home and garden products.",
      phoneNumber: "0533 333 4455",
      businessEmail: "contact@cyprushome.com",
      address: "Gazimağusa, North Cyprus",
      taxNumber: "TAX-10003",
      status: "PENDING",
      applicantId: pendingSeller.id,
    },
  });

  await prisma.sellerApplication.upsert({
    where: {
      applicantId: rejectedSeller.id,
    },
    update: {},
    create: {
      businessName: "Example Store",
      description: "Test rejected seller application.",
      phoneNumber: "0533 444 5566",
      businessEmail: "example@store.com",
      address: "Lefke, North Cyprus",
      taxNumber: "TAX-10004",
      status: "REJECTED",
      rejectionReason: "Business information could not be verified.",
      reviewedAt: new Date(),
      applicantId: rejectedSeller.id,
    },
  });

  // -------------------------
  // Stores
  // -------------------------

  const techStore = await prisma.store.upsert({
    where: {
      ownerId: sellerOne.id,
    },
    update: {},
    create: {
      name: "Ahmet Tech",
      description: "Electronics, gaming and computer accessories.",
      logoUrl: "/images/stores/ahmet-tech.png",
      ownerId: sellerOne.id,
    },
  });

  const fashionStore = await prisma.store.upsert({
    where: {
      ownerId: sellerTwo.id,
    },
    update: {},
    create: {
      name: "Leyla Fashion",
      description: "Fashion and clothing for everyday use.",
      logoUrl: "/images/stores/leyla-fashion.png",
      ownerId: sellerTwo.id,
    },
  });

  // -------------------------
  // Products
  // -------------------------

  await prisma.product.deleteMany({
    where: {
      storeId: {
        in: [techStore.id, fashionStore.id],
      },
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: "Wireless Gaming Mouse",
        description: "Lightweight wireless gaming mouse.",
        price: 49.99,
        stock: 25,
        isActive: true,
        storeId: techStore.id,
        categoryId: gamingCategory.id,
      },
      {
        name: "Mechanical Keyboard",
        description: "RGB mechanical gaming keyboard.",
        price: 89.99,
        stock: 15,
        isActive: true,
        storeId: techStore.id,
        categoryId: gamingCategory.id,
      },
      {
        name: "27 Inch Gaming Monitor",
        description: "1440p high refresh rate gaming monitor.",
        price: 329.99,
        stock: 8,
        isActive: true,
        storeId: techStore.id,
        categoryId: electronicsCategory.id,
      },
      {
        name: "USB-C Charger",
        description: "65W USB-C fast charger.",
        price: 34.99,
        stock: 40,
        isActive: true,
        storeId: techStore.id,
        categoryId: electronicsCategory.id,
      },
      {
        name: "Classic T-Shirt",
        description: "Comfortable cotton t-shirt.",
        price: 19.99,
        stock: 60,
        isActive: true,
        storeId: fashionStore.id,
        categoryId: clothingCategory.id,
      },
      {
        name: "Denim Jacket",
        description: "Classic blue denim jacket.",
        price: 69.99,
        stock: 18,
        isActive: true,
        storeId: fashionStore.id,
        categoryId: clothingCategory.id,
      },
      {
        name: "Summer Dress",
        description: "Lightweight summer dress.",
        price: 44.99,
        stock: 22,
        isActive: true,
        storeId: fashionStore.id,
        categoryId: clothingCategory.id,
      },
    ],
  });

  console.log("Database seeded successfully.");
  console.log(`Customer: ${customer.email}`);
  console.log(`Admin: ${admin.email}`);
  console.log(`Stores created: ${techStore.name}, ${fashionStore.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
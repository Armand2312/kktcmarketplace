# KKTC Marketplace - Project Blueprint

## 1. Project Goal

KKTC’deki yerel işletmelerin ürünlerini platforma yükleyip satış yapabildiği, müşterilerin ise ürünleri gezip sepete ekleyerek sipariş oluşturabildiği yerel bir e-commerce marketplace uygulaması geliştirmek.

---

## 2. User Roles

### CUSTOMER

- Ürünleri görüntüler
- Sepete ürün ekler
- Sipariş oluşturur
- Siparişlerini takip eder

### SELLER

- Satıcı başvurusu yapar
- Mağaza profilini yönetir
- Ürün ekler, günceller, siler
- Gelen siparişleri görüntüler

### ADMIN

- Satıcı başvurularını onaylar/reddeder
- Ürünleri onaylar/reddeder
- Kategorileri yönetir
- Siparişleri ve platform işleyişini takip eder

---

## 3. MVP Features

### Customer Features

- Register / Login
- Product Listing
- Product Detail Page
- Cart
- Order Creation
- My Orders Page

### Seller Features

- Seller Application
- Store Profile
- Product CRUD
- Product Image Upload
- Order List

### Admin Features

- Seller Approval
- Product Approval
- Category Management
- Order Monitoring
- User/Seller Management

---

## 4. Main User Flow

```text
Customer registers/logs in
↓
Seller applies to become a seller
↓
Admin approves seller
↓
Seller creates store
↓
Seller adds products
↓
Admin approves products
↓
Customer views products
↓
Customer adds product to cart
↓
Customer creates order
↓
Payment is processed
↓
Seller prepares order
↓
Order is completed
```

---

## 5. Initial Database Models


- User
- SellerApplication
- Store
- Product
- ProductImage
- Category
- Cart
- CartItem
- Order
- OrderItem
- Payment
- Shipment
- Review
- Commission

---

## 6. Technology Stack


- Framework: Next.js
- Language: TypeScript
- Styling: Tailwind CSS
- UI Components: shadcn/ui
- Database: PostgreSQL
- ORM: Prisma
- Authentication: Auth.js / NextAuth
- Image Storage: Cloudinary or AWS S3
- Payment Gateway: iyzico / PayTR Sandbox
- Deployment: Vercel + Neon / Supabase / Railway

---

## 7. First Development Milestone

1. Create database schema
2. Implement user roles
3. Build seller application form
4. Build admin seller approval panel
5. Build seller product CRUD
6. Build admin product approval panel
7. Show approved products on customer frontend
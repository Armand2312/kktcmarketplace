# KKTC Marketplace - Domain Model

## Core Entities

### User

A registered account on the platform.

Roles:
- CUSTOMER
- SELLER
- ADMIN

Relationships:
- A User can submit one SellerApplication
- A User can own one Store
- A User can create many Orders
- A User can create many Reviews

---

### SellerApplication

Represents a seller application submitted by a user.

Relationships:
- Belongs to one User
- Reviewed by one Admin

---

### Store

Represents a seller's marketplace store.

Relationships:
- Belongs to one User
- Has many Products

---

### Product

Represents a product listed on the marketplace.

Relationships:
- Belongs to one Store
- Belongs to one Category
- Has many ProductImages
- Can appear in many OrderItems

---

### Category

Represents a product category.

Relationships:
- Has many Products
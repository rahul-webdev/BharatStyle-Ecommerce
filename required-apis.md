# Required APIs Documentation

This document lists all the necessary API endpoints for the Ecommerce project, including their expected request payloads and response outputs.

## Authentication APIs

### 1. Send OTP
* **Endpoint:** `POST /api/auth/send-otp`
* **Description:** Sends a 6-digit OTP to the user's mobile number.
* **Payload:**
```json
{
  "mobile": "9876543210"
}
```
* **Output (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otpSent": true
}
```

### 2. Verify OTP
* **Endpoint:** `POST /api/auth/verify-otp`
* **Description:** Verifies the OTP and returns the user details with an authentication token.
* **Payload:**
```json
{
  "mobile": "9876543210",
  "otp": "123456"
}
```
* **Output (Success):**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "mobile": "9876543210",
    "firstName": "John",
    "lastName": "Doe",
    "address": {
      "street": "123 St",
      "city": "Mumbai",
      "state": "MH",
      "zipCode": "400001",
      "country": "India"
    }
  }
}
```

---

## User APIs

### 1. Get User Profile
* **Endpoint:** `GET /api/user/profile`
* **Description:** Retrieves the current authenticated user's profile information.
* **Output:**
```json
{
  "id": "user_id",
  "mobile": "9876543210",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 St",
    "city": "Mumbai",
    "state": "MH",
    "zipCode": "400001",
    "country": "India"
  }
}
```

### 2. Update User Profile
* **Endpoint:** `PUT /api/user/profile`
* **Description:** Updates the user's personal details and address.
* **Payload:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 St",
    "city": "Mumbai",
    "state": "MH",
    "zipCode": "400001",
    "country": "India"
  }
}
```
* **Output:**
```json
{
  "success": true,
  "user": { ...updatedUser }
}
```

---

## Product APIs

### 1. List Products
* **Endpoint:** `GET /api/products`
* **Description:** Returns a list of products with optional filtering and pagination.
* **Query Parameters:** `page`, `limit`, `category`, `style`, `minPrice`, `maxPrice`, `size`, `color`
* **Output:**
```json
{
  "products": [
    {
      "id": 1,
      "title": "T-Shirt",
      "srcUrl": "/images/pic1.png",
      "price": 500,
      "discount": { "amount": 0, "percentage": 10 },
      "rating": 4.5,
      "category": "Clothing",
      "slug": "t-shirt"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

### 2. Get Product Details
* **Endpoint:** `GET /api/products/:slug`
* **Description:** Fetches detailed information about a single product by its slug.
* **Output:**
```json
{
  "id": 1,
  "title": "T-Shirt",
  "description": "Product description here...",
  "price": 500,
  "srcUrl": "/images/pic1.png",
  "gallery": ["/images/pic1.png", "/images/pic2.png"],
  "discount": { "amount": 0, "percentage": 10 },
  "rating": 4.5,
  "reviews": [
    { "id": 1, "user": "User Name", "comment": "Good quality", "rating": 5 }
  ],
  "stock": 50,
  "attributes": {
    "colors": ["#000000", "#FFFFFF"],
    "sizes": ["S", "M", "L", "XL"]
  }
}
```

### 3. Get Categories
* **Endpoint:** `GET /api/categories`
* **Description:** Returns a list of all product categories.
* **Output:**
```json
[
  { "title": "Men's Clothes", "slug": "men-clothes" },
  { "title": "Women's Clothes", "slug": "women-clothes" }
]
```

---

## Cart APIs (Optional - if server-side persistence is required)

### 1. Get Cart
* **Endpoint:** `GET /api/cart`
* **Description:** Retrieves the user's current cart items.
* **Output:**
```json
{
  "items": [
    {
      "id": 1,
      "name": "T-Shirt",
      "price": 500,
      "quantity": 2,
      "attributes": ["Black", "L"],
      "discount": { "amount": 0, "percentage": 10 }
    }
  ],
  "totalPrice": 1000,
  "adjustedTotalPrice": 900
}
```

### 2. Add to Cart
* **Endpoint:** `POST /api/cart/add`
* **Payload:**
```json
{
  "id": 1,
  "quantity": 1,
  "attributes": ["Black", "L"]
}
```
* **Output:** Updated Cart Object

---

## Order APIs

### 1. Place Order
* **Endpoint:** `POST /api/orders`
* **Description:** Creates a new order for the authenticated user.
* **Payload:**
```json
{
  "items": [
    { "id": 1, "quantity": 2, "price": 500 }
  ],
  "total": 1000,
  "shippingAddress": "123 Fashion Street, Mumbai",
  "paymentMethod": "Credit Card"
}
```
* **Output:**
```json
{
  "id": "ORD12345",
  "date": "2024-03-20",
  "status": "pending",
  "total": 1000,
  "items": [...]
}
```

### 2. List User Orders
* **Endpoint:** `GET /api/orders`
* **Output:** `Order[]`

---

## Admin APIs

### 1. Dashboard Stats
* **Endpoint:** `GET /api/admin/stats`
* **Output:**
```json
{
  "totalSales": 50000,
  "totalOrders": 120,
  "totalCustomers": 45,
  "activeProducts": 25
}
```

### 2. Manage Products
* **GET /api/admin/products**: List all products (paginated)
* **POST /api/admin/products**: Create product (Payload: Product fields)
* **PUT /api/admin/products/:id**: Update product
* **DELETE /api/admin/products/:id**: Delete product

### 3. Manage Categories
* **GET /api/admin/categories**: List all categories
* **POST /api/admin/categories**: Create category
* **PUT /api/admin/categories/:id**: Update category
* **DELETE /api/admin/categories/:id**: Delete category

### 4. Manage Orders
* **GET /api/admin/orders**: List all orders across all users
* **PUT /api/admin/orders/:id/status**: Update order status (`pending`, `delivered`, `cancelled`)

### 5. Manage Customers
* **GET /api/admin/customers**: List all registered customers

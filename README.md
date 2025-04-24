E-Commerce Backend API System
==============================

A comprehensive backend API system for e-commerce platforms with multi-level authentication, product management, order processing, and analytics.

Overview
--------
This project is a Node.js-based RESTful API that powers e-commerce applications. It provides all the necessary backend functionality including user authentication, product and category management, shopping cart capabilities, order processing, and administrative dashboards.

Features
--------
### Multi-level Authentication System
- User authentication with email verification
- Employee authentication
- Admin authentication
- Password reset functionality

### User Management
- User registration and profile management
- Update user data and password

### Product Management
- CRUD operations for products
- Category-based product organization
- Product inventory tracking

### Order System
- Order creation and tracking
- Order status updates
- Order history

### Shopping Cart
- Add/remove items
- Update quantities
- Calculate totals

### Category Management
- Create, update, delete categories
- Associate products with categories

### Dashboard & Analytics
- User, product, category, and employee counts
- Sales analytics
- 30-day sales reports for delivered orders

### Employee Management
- Add, update, delete employees
- Role-based access control

Technologies Used
-----------------
- **Backend Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Custom AES encryption, Cookie-based auth
- **Email Service:** Nodemailer with Gmail
- **Security:** bcrypt for password hashing, HTTP-only cookies
- **Other Tools:** crypto, cors, cookie-parser

Project Structure
-----------------
```
├── .env                   # Environment variables
├── app.js                 # Entry point for application
├── api/                   # API routes
│   ├── admin.js           # Admin routes
│   ├── auth.js            # Authentication routes
│   ├── cart.js            # Shopping cart routes
│   ├── categories.js      # Categories routes
│   ├── dashboard.js       # Dashboard routes
│   ├── employee.js        # Employee routes
│   ├── order.js           # Order routes
│   └── product.js         # Product routes
├── controllers/           # Controller functions
│   ├── admin.js           # Admin controllers
│   ├── auth.js            # Auth controllers
│   ├── cart.js            # Cart controllers
│   ├── categories.js      # Category controllers
│   ├── dashboard.js       # Dashboard controllers
│   ├── employee.js        # Employee controllers
│   ├── order.js           # Order controllers
│   └── product.js         # Product controllers
├── libs/                  # Utilities
│   ├── crypto.js          # Encryption utilities
│   └── db.js              # Database connection
├── middleware/            # Custom middleware
│   ├── checkAdmin.js           # Admin authorization
│   ├── checkAdminOrEmployee.js # Admin/Employee authorization
│   ├── checkEmployee.js        # Employee authorization
│   └── checkUser.js            # User authorization
└── model/                 # Data models
    ├── admin.js           # Admin model
    ├── auth.js            # User model
    ├── cart.js            # Cart model
    ├── categories.js      # Category model
    ├── employee.js        # Employee model
    ├── order.js           # Order model
    └── product.js         # Product model
```

Setup and Installation
----------------------
1. Clone the repository
```bash
git clone <repository-url>
```
2. Install dependencies
```bash
npm install
```
3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
EMAIL_USER=<your-email>
EMAIL_PASS=<your-email-app-password>
PORT=5000
```
4. Start the server
```bash
npm start
```

API Endpoints
-------------
### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify user email
- `POST /api/auth/forgot` - Request password reset
- `POST /api/auth/verifyResetCode` - Verify password reset code
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get user profile
- `PUT /api/auth/user` - Update user profile
- `PUT /api/auth/password` - Update user password

### Admin
- `POST /api/admin/register` - Register a new admin
- `POST /api/admin/verify` - Verify admin email
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/forgot` - Request admin password reset
- `POST /api/admin/reset` - Reset admin password
- `GET /api/admin/profile` - Get admin profile
- `PUT /api/admin/profile` - Update admin profile
- `PUT /api/admin/password` - Update admin password

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get a specific order
- `PUT /api/orders/:id` - Update order status

### Employees
- `POST /api/employees` - Add a new employee
- `GET /api/employees` - Get all employees
- `DELETE /api/employees/:id` - Delete an employee
- `PUT /api/employees/:id` - Update an employee
- `POST /api/employees/login` - Employee login
- `PUT /api/employees/updatePassword/:id` - Update employee password

### Dashboard
- `GET /api/dashboard` - Get counts of users, products, categories and employees
- `GET /api/dashboard/grafic` - Get sales analytics for the last 30 days

### Shopping Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

Authentication System
---------------------
This system uses a custom cookie-based authentication system with AES encryption. The authentication flow is as follows:

1. User/Admin/Employee logs in with credentials
2. Server validates credentials and creates an encrypted token
3. Token is stored in an HTTP-only cookie
4. Middleware validates the token for protected routes

Security Features
-----------------
- Passwords are hashed using bcrypt
- Authentication tokens are encrypted using AES-256-GCM
- HTTP-only cookies prevent client-side access to tokens
- Email verification required for registration
- Password strength validation enforces secure passwords
- Separate authentication flows for users, employees, and admins

License
-------
This project is licensed under the ISC License.


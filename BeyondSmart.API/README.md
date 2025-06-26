# BeyondSmart API

A comprehensive ASP.NET Core 8 Web API for the BeyondSmart ERP System, designed to integrate seamlessly with React frontends.

## Features

- **JWT Authentication** - Secure login with role-based access control
- **Entity Framework Core** - InMemory database for development
- **CORS Enabled** - Ready for React frontend integration
- **Swagger Documentation** - Interactive API documentation
- **Full CRUD Operations** - Complete REST API for all entities
- **Role-Based Authorization** - Admin, Sales, and Warehouse roles

## Entities

### User
- Id, Name, Email, PasswordHash, Role (Admin, Sales, Warehouse)

### Client
- Id, Name, Phone, Email, City

### Quotation
- Id, ClientId, ItemType, Area, DeviceCount, PricePerMeter, Discount, Total, CreatedAt

### Project
- Id, QuotationId, ClientId, Status (NotStarted, Ongoing, Completed), StartDate, EndDate

### InventoryItem
- Id, ProductName, Unit (sqm, pcs), Quantity

### MaintenanceRequest
- Id, ProjectId, Title, Description, CreatedAt

## Getting Started

### Prerequisites
- .NET 8.0 or later
- Visual Studio 2022 or VS Code

### Running the API

1. Clone the repository
2. Navigate to the BeyondSmart.API directory
3. Run the following commands:

```bash
dotnet restore
dotnet build
dotnet run
```

The API will be available at: `http://localhost:5181`
Swagger documentation: `http://localhost:5181/swagger`

## Authentication

### Default Users
The API comes with pre-seeded users for testing:

| Email | Password | Role |
|-------|----------|------|
| admin@beyondsmart.com | admin123 | Admin |
| sales@beyondsmart.com | sales123 | Sales |
| warehouse@beyondsmart.com | warehouse123 | Warehouse |

### Login Process

1. **POST** `/api/auth/login`
   ```json
   {
     "email": "admin@beyondsmart.com",
     "password": "admin123"
   }
   ```

2. **Response:**
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "name": "Admin User",
       "email": "admin@beyondsmart.com",
       "role": "Admin"
     }
   }
   ```

3. **Use the token** in subsequent requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (Admin only)

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/{id}` - Get user by ID
- `PUT /api/users/{id}` - Update user (Admin only)
- `DELETE /api/users/{id}` - Delete user (Admin only)

### Clients
- `GET /api/clients` - Get all clients
- `GET /api/clients/{id}` - Get client by ID
- `POST /api/clients` - Create client (Admin, Sales)
- `PUT /api/clients/{id}` - Update client (Admin, Sales)
- `DELETE /api/clients/{id}` - Delete client (Admin only)

### Quotations
- `GET /api/quotations` - Get all quotations
- `GET /api/quotations/{id}` - Get quotation by ID
- `POST /api/quotations` - Create quotation (Admin, Sales)
- `PUT /api/quotations/{id}` - Update quotation (Admin, Sales)
- `DELETE /api/quotations/{id}` - Delete quotation (Admin only)

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/{id}` - Get project by ID
- `POST /api/projects` - Create project (Admin, Sales)
- `PUT /api/projects/{id}` - Update project (Admin, Sales)
- `DELETE /api/projects/{id}` - Delete project (Admin only)

### Inventory Items
- `GET /api/inventoryitems` - Get all inventory items
- `GET /api/inventoryitems/{id}` - Get inventory item by ID
- `POST /api/inventoryitems` - Create inventory item (Admin, Warehouse)
- `PUT /api/inventoryitems/{id}` - Update inventory item (Admin, Warehouse)
- `DELETE /api/inventoryitems/{id}` - Delete inventory item (Admin, Warehouse)

### Maintenance Requests
- `GET /api/maintenancerequests` - Get all maintenance requests
- `GET /api/maintenancerequests/{id}` - Get maintenance request by ID
- `POST /api/maintenancerequests` - Create maintenance request
- `PUT /api/maintenancerequests/{id}` - Update maintenance request
- `DELETE /api/maintenancerequests/{id}` - Delete maintenance request (Admin only)

## CORS Configuration

The API is configured to accept requests from:
- `http://localhost:3000` (React development server)
- `http://localhost:5173` (Vite development server)

## Sample Data

The API includes sample data for testing:
- 3 Users (Admin, Sales, Warehouse)
- 2 Clients (ABC Corporation, XYZ Industries)
- 3 Inventory Items (Security Camera, Fiber Optic Cable, Network Switch)

## React Frontend Integration

To connect your React app to this API:

1. Set the base URL: `http://localhost:5181`
2. Include the JWT token in request headers
3. Handle CORS properly (already configured on API side)

Example React service:

```javascript
const API_BASE_URL = 'http://localhost:5181/api';

const apiService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return response.json();
  },
  
  getClients: async (token) => {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};
```

## Technology Stack

- **ASP.NET Core 8** - Web API framework
- **Entity Framework Core** - ORM with InMemory provider
- **JWT Bearer Authentication** - Secure authentication
- **BCrypt.Net** - Password hashing
- **Swashbuckle.AspNetCore** - Swagger documentation
- **Microsoft.AspNetCore.Authentication.JwtBearer** - JWT middleware

## License

This project is licensed under the MIT License.

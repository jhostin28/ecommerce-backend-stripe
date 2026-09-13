# E-commerce Backend — REST API with JWT, Prisma & Stripe

REST API for an e-commerce platform: user authentication, product catalog,
shopping cart, order management and card payments through Stripe.

**Author:** Jhostin Raposo Chala
**Frontend repo:** https://github.com/jhostin28/ecommerce-frontend-stripe

---

## Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (JSON Web Tokens) |
| Payments | Stripe API |
| Password hashing | bcrypt |

---

## Features

- User registration and login with hashed passwords and JWT-based sessions.
- Route protection through authentication middleware.
- Product catalog with full CRUD operations.
- Shopping cart tied to the authenticated user.
- Checkout flow integrated with Stripe.
- Order persistence and status tracking.
- Relational data model managed with Prisma migrations.

---

## Data model

<!-- FILL THIS IN: paste your prisma/schema.prisma models here, or just list them.
     Example of the format:

| Model | Relations |
|---|---|
| User | 1..N Orders |
| Product | N..N Orders through OrderItem |
| Order | belongs to User, has many OrderItems |
| OrderItem | belongs to Order and Product |
-->

---

## API endpoints

<!-- FILL THIS IN with your real routes. Format:

### Auth
| Method | Route | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Create a new account | No |
| POST | /api/auth/login | Return a JWT | No |

### Products
| Method | Route | Description | Auth |
|---|---|---|---|
| GET | /api/products | List products | No |
| POST | /api/products | Create a product | Yes |
-->

---

## Getting started

### Requirements

- Node.js 18 or higher
- PostgreSQL
- A Stripe account (test mode is enough)

### Installation

```bash
git clone https://github.com/jhostin28/ecommerce-backend-stripe.git
cd ecommerce-backend-stripe
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce"
JWT_SECRET="your_secret_here"
STRIPE_SECRET_KEY="sk_test_..."
PORT=3000
```

### Database setup

```bash
npx prisma migrate dev
npx prisma generate
```

### Run

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

---

## Testing the payment flow

Use Stripe's test cards. The standard successful card is `4242 4242 4242 4242`
with any future expiry date and any CVC.

---



## Roadmap

- [ ] Automated tests
- [ ] Dockerfile and docker-compose
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Deployment

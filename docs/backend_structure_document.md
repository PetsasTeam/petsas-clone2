# Backend Structure Document

This document outlines the backend architecture, database setup, API design, hosting, infrastructure, security, and maintenance practices for the car rental website project. It is written in everyday language to ensure clarity.

## 1. Backend Architecture

**Overall Design**
- We will build a single, well-structured Express.js application running on Node.js.  
- The code follows the Model-View-Controller (MVC) pattern:  
  - Models handle data and business logic.  
  - Controllers process incoming requests and return responses.  
  - Routes map URLs to controllers.  
- We’ll organize code into modules: authentication, vehicles, bookings, payments, admin, etc.

**Scalability, Maintainability, Performance**
- **Scalability**: The app can be deployed across multiple instances behind a load balancer. We can split services later (e.g., move payments into its own service) without big rewrites.  
- **Maintainability**: Clear folder structure and naming conventions make it easy for new developers to find and update code. Unit tests and documentation accompany each module.  
- **Performance**: We leverage connection pooling for the database, use Express middleware for gzip compression, and offload static assets to a CDN.

## 2. Database Management

**Technology**
- We use PostgreSQL (a SQL database) hosted on AWS RDS.  
- Optional ORM: Sequelize or Knex.js (developers can choose based on team preference).

**Data Practices**
- **Structured Tables**: Entities like Users, Vehicles, Bookings, Extras, Insurance, Locations, Payments, and Roles each have their own table.  
- **Access**: We use parameterized queries (via ORM) to prevent SQL injection.  
- **Backups & Migrations**: Automated daily RDS snapshots. Database schema migrations managed via a tool like Sequelize CLI or Flyway.

## 3. Database Schema

Below is a human-readable overview of the main tables, followed by the SQL schema (PostgreSQL).

**Tables and Purpose**
- **Users**: Stores user account details and roles (customer, super-admin, branch manager).  
- **Locations**: Pickup/drop-off locations with address details.  
- **Vehicles**: Information about each car (make, model, group, type, transmission, fuel, seats, photo URLs, base price).  
- **Extras**: Optional items (GPS, child seat, booster, roof rack, ski rack).  
- **InsuranceOptions**: Options like CDW, SCDW, TWU.  
- **Bookings**: Records each rental booking, associated with a user, vehicle, location, dates, payment option, total cost.  
- **BookingExtras**: Junction table linking bookings to chosen extras.  
- **BookingInsurance**: Junction table linking bookings to chosen insurance.  
- **PromoCodes**: Discount codes and their rules.  
- **Payments**: Payment records, status, method (online or on-arrival), discount applied.  

**SQL Schema (PostgreSQL)**
```sql
CREATE TABLE Users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(20) NOT NULL, -- customer | super-admin | branch-manager
  language_preference VARCHAR(5) DEFAULT 'en'
);

CREATE TABLE Locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT,
  city VARCHAR(50),
  country VARCHAR(50) DEFAULT 'Cyprus'
);

CREATE TABLE Vehicles (
  id SERIAL PRIMARY KEY,
  make VARCHAR(50),
  model VARCHAR(50),
  group_name VARCHAR(50),
  type VARCHAR(20), -- sedan, SUV, etc.
  transmission VARCHAR(20), -- automatic | manual
  fuel_type VARCHAR(20),
  seating_capacity INT,
  photo_urls TEXT[],
  base_price DECIMAL(10,2) NOT NULL
);

CREATE TABLE Extras (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price_per_day DECIMAL(8,2) NOT NULL
);

CREATE TABLE InsuranceOptions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price_per_day DECIMAL(8,2) NOT NULL
);

CREATE TABLE Bookings (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES Users(id),
  vehicle_id INT REFERENCES Vehicles(id),
  pickup_location_id INT REFERENCES Locations(id),
  dropoff_location_id INT REFERENCES Locations(id),
  pickup_date DATE NOT NULL,
  dropoff_date DATE NOT NULL,
  payment_method VARCHAR(20) NOT NULL, -- online | on-arrival
  promo_code VARCHAR(20),
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE BookingExtras (
  booking_id INT REFERENCES Bookings(id),
  extra_id INT REFERENCES Extras(id),
  PRIMARY KEY (booking_id, extra_id)
);

CREATE TABLE BookingInsurance (
  booking_id INT REFERENCES Bookings(id),
  insurance_id INT REFERENCES InsuranceOptions(id),
  PRIMARY KEY (booking_id, insurance_id)
);

CREATE TABLE PromoCodes (
  code VARCHAR(20) PRIMARY KEY,
  description TEXT,
  discount_percent INT CHECK (discount_percent >= 0 AND discount_percent <= 100),
  valid_from DATE,
  valid_to DATE
);

CREATE TABLE Payments (
  id SERIAL PRIMARY KEY,
  booking_id INT REFERENCES Bookings(id),
  status VARCHAR(20) NOT NULL, -- pending | completed | failed
  amount DECIMAL(10,2) NOT NULL,
  discount_applied DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```  

## 4. API Design and Endpoints

We follow a RESTful design, using JSON for requests and responses.

**Authentication**
- `POST /auth/register` – create a new user account.  
- `POST /auth/login` – log in and receive a JWT token.  
- `POST /auth/logout` – invalidate the token (optional).

**User Management**
- `GET /users/me` – retrieve current user profile.  
- `PATCH /users/me` – update profile details.

**Vehicles & Availability**
- `GET /vehicles` – list vehicles (with optional filters: location, dates, type).  
- `GET /vehicles/:id` – get detailed info for one vehicle.  
- `GET /availability` – check availability based on location and date range.

**Extras & Insurance**
- `GET /extras` – list all extra items.  
- `GET /insurance-options` – list all insurance options.

**Bookings**
- `POST /bookings` – create a booking (with extras, insurance, promo code).  
- `GET /bookings/:id` – retrieve booking details.  
- `GET /users/me/bookings` – list user’s past and upcoming bookings.

**Payments**
- `POST /payments/:bookingId` – initiate payment via JCC API.  
- `POST /payments/:bookingId/confirm` – confirm payment callback.

**Admin Endpoints** (super-admin and branch-manager roles)
- `GET /admin/users` – list users.  
- `POST /admin/vehicles` – add a new vehicle.  
- `PATCH /admin/vehicles/:id` – update vehicle data.  
- `DELETE /admin/vehicles/:id` – remove a vehicle.  
- `GET /admin/bookings` – list all bookings.

## 5. Hosting Solutions

**Environment**
- **AWS EC2 or ECS**: Runs the Node.js/Express application. We can start with EC2 instances behind an Application Load Balancer, then migrate to ECS (Docker containers) for easier scaling.  
- **AWS RDS (PostgreSQL)**: Managed database with automated backups and Multi-AZ for high availability.  
- **AWS S3**: Stores vehicle images and static assets (CSS, JS).  
- **AWS CloudFront** (CDN): Distributes static assets globally for faster load times.

**Benefits**
- **Reliability**: RDS Multi-AZ and load-balanced EC2/ECS instances keep services up.  
- **Scalability**: Auto Scaling groups adjust number of app servers based on traffic.  
- **Cost-Effectiveness**: Pay-as-you-go with AWS. Use smaller instances at launch, then scale up as user base grows.

## 6. Infrastructure Components

**Load Balancer**
- AWS Application Load Balancer (ALB) routes incoming HTTP(S) requests across multiple EC2/ECS instances.

**Content Delivery Network (CDN)**
- AWS CloudFront caches and serves images and static files from S3 closer to users.

**Auto Scaling**
- EC2 Auto Scaling group increases or decreases instances based on CPU or request metrics.

## 7. Security Measures

**Authentication & Authorization**
- JWT tokens secure API requests.  
- Role-based access control (customer vs. super-admin vs. branch-manager).

**Data Protection**
- All traffic encrypted via HTTPS (TLS/SSL).  
- RDS encryption at rest and in transit.  
- Secure HTTP headers via Helmet middleware.

**API Hardening**
- Input validation to prevent SQL injection and XSS.  
- Rate limiting on sensitive endpoints (login, payment).  
- CORS policy restricted to known frontend domains.

**Payment Security**
- Integrate with JCC Payment API over secure channels.  
- No sensitive card data stored on our servers—JCC handles card processing.

## 8. Monitoring and Maintenance

**Monitoring**
- AWS CloudWatch for server and RDS metrics (CPU, memory, disk I/O).  
- Application logs shipped to CloudWatch Logs or a log-management service.  
- Custom alerts (error rate, high latency) trigger email or Slack notifications.

**Maintenance**
- Automated weekly dependency checks and vulnerability scans.  
- Scheduled database maintenance windows (minor version upgrades, patching).  
- CI/CD pipeline (GitHub Actions or AWS CodePipeline) for automated testing and deployments.

## 9. Conclusion and Overall Backend Summary

This backend setup uses a modular Express.js application with PostgreSQL on AWS. It leverages managed services (RDS, S3, CloudFront) and best practices (MVC pattern, JWT security, load balancing, auto scaling) to ensure:
- Fast, reliable performance for customers in Cyprus and beyond.  
- Easy maintenance and clear separation of concerns for developers.  
- Secure handling of user data and payments via JCC.

With this architecture, the car rental website is well-positioned to grow its feature set, user base, and geography over time, while keeping infrastructure costs and operational overhead under control.
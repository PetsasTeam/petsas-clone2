# Tech Stack Document

This document explains, in clear everyday language, the technologies chosen for our car rental website. Each section describes why we picked certain tools and how they help create a fast, reliable, and user-friendly experience.

## 1. Frontend Technologies

The frontend is everything your customer sees and interacts with in their web browser.

- **React**
  • What it is: A popular JavaScript library for building interactive user interfaces.
  • Why we chose it: React lets us create responsive, fast-loading pages where elements update smoothly (for example, price totals updating instantly when you add extras).

- **React DatePicker**
  • What it is: A ready-made calendar widget for selecting dates.
  • Why we chose it: It provides a familiar, accessible calendar look and feel so users can pick rental dates without confusion.

- **i18next**
  • What it is: A tool for handling translations.
  • Why we chose it: It makes it easy to display the site in English or Russian, matching our international customer needs.

- **CSS Modules / styled-components**
  • What they are: Modern styling approaches that keep styles organized and specific to each component.
  • Why we chose them: They help us maintain a consistent look (colors, fonts, spacing) and avoid conflicts between different page elements.

- **Cursor (IDE)**
  • What it is: An AI-powered coding assistant integrated into our development environment.
  • Why we chose it: It speeds up coding tasks, offers smart suggestions, and reduces the chance of simple errors, helping us deliver features faster.

## 2. Backend Technologies

The backend powers all the data processing, storage, and business logic behind the scenes.

- **Node.js & Express**
  • What they are: Node.js lets us run JavaScript on the server, while Express is a lightweight framework for handling web requests.
  • Why we chose them: Together, they allow us to build a fast, scalable server that responds quickly to search queries and booking requests.

- **PostgreSQL**
  • What it is: A reliable, open-source relational database.
  • Why we chose it: It stores all data—vehicles, bookings, user accounts—in an organized way, supports complex queries (like availability checks), and ensures data integrity.

- **JWT Authentication**
  • What it is: A token-based system for user sign-in and session management.
  • Why we chose it: It keeps user sessions secure without heavy server-side overhead, making login and guest checkout flows seamless.

- **RESTful API Design**
  • What it is: A standard way for the frontend to talk to the backend using clear, structured web addresses.
  • Why we chose it: It provides a predictable, easy-to-test interface for all data operations (search vehicles, book a car, view history).

- **Email Service (NodeMailer + AWS SES)**
  • What it is: A tool for sending confirmation emails via Amazon’s email system.
  • Why we chose it: It ensures booking confirmations and support messages reach customers reliably.

## 3. Infrastructure and Deployment

These choices ensure our site stays online, scales with traffic, and can be updated smoothly.

- **AWS S3 (Static Assets)**
  • Role: Hosts images (vehicle photos, logos) and other static files.
  • Benefit: Highly available storage, fast delivery, and automatic backups.

- **AWS EC2 / ECS (App Hosting)**
  • Role: Runs our backend server and application code.
  • Benefit: Can scale up or down based on demand, ensuring reliable performance during busy booking periods.

- **AWS RDS (PostgreSQL Database)**
  • Role: Managed database service for our vehicle, booking, and user data.
  • Benefit: Automatic backups, updates, and high availability without heavy maintenance.

- **AWS CloudFront (CDN)**
  • Role: Distributes static assets globally.
  • Benefit: Users get faster load times because files are served from a location near them.

- **GitHub (Version Control)**
  • Role: Stores all source code, tracks changes, and enables collaboration.
  • Benefit: Keeps development organized and allows easy rollbacks if needed.

- **GitHub Actions (CI/CD Pipeline)**
  • Role: Automatically tests code and deploys updates when changes are approved.
  • Benefit: Reduces manual steps, speeds up safe releases, and catches errors before they go live.

- **Postman (API Testing)**
  • Role: Tool for manually or automatically testing our API endpoints.
  • Benefit: Ensures data flows correctly between frontend and backend before public release.

## 4. Third-Party Integrations

These services enhance key features without reinventing the wheel.

- **JCC Payment API**
  • Purpose: Handles secure credit/debit card transactions.
  • Benefit: Offers both online-payment and pay-on-arrival options, applies discounts automatically, and offloads PCI-compliance to a trusted provider.

- **i18next** *(also listed under Frontend)*
  • Purpose: Manages translations for English and Russian.
  • Benefit: Simplifies adding more languages in the future.

- **AWS SES** *(also listed under Backend Email Service)*
  • Purpose: Sends confirmation and contact-form emails.
  • Benefit: Ensures high delivery rates and reporting on email status.

## 5. Security and Performance Considerations

We’ve built in multiple layers of protection and speed enhancements.

- **Security Measures**
  • HTTPS / TLS Encryption: All data travels over secure channels to prevent eavesdropping.
  • JWT Tokens: Keeps user sessions safe without storing sensitive data on the browser.
  • OWASP Best Practices: Input validation, protection against common web attacks (SQL injection, XSS, CSRF).
  • PCI-DSS Compliance: Outsourced to JCC for card data handling, minimizing our scope.

- **Performance Optimizations**
  • Lazy Loading Images: Only load photos when they appear on screen, speeding up initial page loads.
  • CDN for Static Assets: AWS CloudFront delivers images, scripts, and styles from nearby servers.
  • Database Indexing: Speeds up frequent queries (e.g., checking vehicle availability).
  • Caching Strategies: Short-term in-memory caching for repeated lookups (e.g., location lists).

## 6. Conclusion and Overall Tech Stack Summary

Our chosen technologies work together to deliver a smooth, secure, and scalable car rental experience:

- **User-friendly Interface** (React, React DatePicker, CSS Modules) keeps interactions intuitive.
- **Robust Backend** (Node.js, Express, PostgreSQL, JWT) ensures reliable data handling and fast responses.
- **Scalable Infrastructure** (AWS S3, EC2/ECS, RDS, CloudFront) maintains performance even during peak booking times.
- **Trusted Integrations** (JCC Payment API, AWS SES) offload specialized tasks like payment processing and email delivery.
- **Strong Security & Speed** measures protect user data and keep pages loading quickly.

Together, this tech stack aligns with our goals of minimizing booking friction, ensuring trust through secure payments, and supporting both local and international customers in English and Russian. The result is a modern, maintainable platform that can grow with your business.
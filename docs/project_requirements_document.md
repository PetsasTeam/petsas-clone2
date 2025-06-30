# Project Requirements Document

## 1. Project Overview

This project is a responsive car-rental website for Cyprus modeled after sites like petsas.com.cy, hertz.com.cy, and europcar.com.cy. Customers land on a clear homepage where they pick a pickup and drop-off location, choose rental dates via an interactive calendar, browse available vehicles with full specs and photos, add extras (GPS, child seats, insurance, etc.), and complete their booking with secure payment. The goal is to streamline the entire rental workflow—from search to confirmation—while minimizing clicks and confusion.

We’re building this site to serve both local and international travelers who want a fast, modern booking experience. Key success criteria include:\
• A working booking system with real‐time availability updates and accurate pricing (including pay-online vs. pay-on-arrival discounts)\
• Secure payment via JCC with PCI-compliant handling of credit/debit cards\
• User accounts (with booking history) and an admin portal (branch manager & super-admin roles)\
• English & Russian support, clear FAQ and contact form, plus a special-offers section

## 2. In-Scope vs. Out-of-Scope

### In-Scope (Version 1)

*   **Search & Availability Calendar**: Pickup/drop-off locations in Cyprus, date selection with live availability.

*   **Vehicle Listings**: Make, model, group, type, photos, transmission, fuel, seating, base rate.

*   **Extras & Insurance**: GPS, child seat, booster seat, roof rack, ski rack, CDW/SCDW, underbody, windscreen.

*   **Booking Workflow**: Review summary, guest checkout or sign-in, personal info form, final review.

*   **Payment Integration**: Credit/debit cards via JCC; pay-online (15% discount) vs. pay-on-arrival (10% discount).

*   **User Accounts**: Profile management, booking history, password reset.

*   **Admin Portal**:

    *   **Super-Admin**: Full control over users, vehicles, pricing, reporting.
    *   **Branch Manager**: Manage fleet and bookings for a specific location.

*   **Content Pages**: FAQ, special offers, contact form.

*   **Localization**: English (primary) and Russian toggle.

*   **Responsive Design**: Desktop, tablet, mobile layouts.

### Out-of-Scope (Phase 2+)

*   Live chat or chatbot support
*   Customer reviews or ratings
*   SMS notifications or two-factor authentication
*   Integration with third-party fleet or inventory systems
*   Loyalty points program or tiered rewards beyond basic promo code support
*   Dynamic price-forecasting engine beyond seasonal/demand adjustments

## 3. User Flow

A new visitor lands on the homepage and sees a clean search form with dropdowns for pickup/drop-off locations and a date-picker widget. They select their dates and locations, then click “Search.” The site queries the database and immediately displays available vehicles in a card layout. Each card shows a high-quality image, make/model, group, type, transmission, fuel, seating capacity, and base price per day.

When the user clicks a vehicle card, they go to the detail page: an image gallery, full specs, insurance options, and a list of extras with daily rates. They toggle on or off any extras, and the price updates in real time. Clicking “Review Booking” leads to a summary page showing all selections and discounts. The user chooses to sign in or continue as a guest, fills in contact/payment details, picks pay-online or pay-on-arrival, and completes the booking. A confirmation screen with a reference number appears, and an email is sent. If signed in, the user can later view upcoming and past rentals in their dashboard.

## 4. Core Features

*   **Search & Availability**\
    • Location dropdowns for pickup/drop-off\
    • Calendar widget with real-time blocking of booked dates
*   **Vehicle Listings**\
    • Card view: photo, make, model, group, type, transmission, fuel, seating, base rate
*   **Vehicle Detail & Extras**\
    • Image gallery\
    • Insurance packages (CDW, SCDW)\
    • Optional extras: GPS, child seat, booster seat, roof rack, ski rack, underbody, windscreen
*   **Booking Summary & Checkout**\
    • Real-time price calculations with discounts\
    • Guest or registered-user flows\
    • Payment options: JCC credit/debit (online vs. on-arrival)
*   **User Account Management**\
    • Registration/login/password reset\
    • Profile editing\
    • Booking history and details
*   **Admin Portal**\
    • **Super-Admin**: manage users, vehicles, pricing rules, promotions, reporting\
    • **Branch Manager**: manage local fleet, view/confirm branch bookings
*   **Content & Localization**\
    • FAQ page, contact form, special-offers page\
    • English and Russian translations
*   **Pricing Engine**\
    • Dynamic seasonal/demand-based rates\
    • Promo codes and manual discount overrides

## 5. Tech Stack & Tools

*   **Frontend**\
    • React (functional components, hooks)\
    • React DatePicker for calendar\
    • i18next for translations\
    • CSS Modules or styled-components for scoped styles
*   **Backend**\
    • Node.js + Express\
    • PostgreSQL relational database\
    • JWT for authentication\
    • RESTful API design
*   **Storage & Hosting**\
    • AWS S3 for images and assets\
    • AWS EC2 or ECS for backend services\
    • PostgreSQL on AWS RDS
*   **Payment**\
    • JCC Payment API integration (credit/debit)
*   **Developer Tools**\
    • Cursor: advanced IDE with AI suggestions\
    • GitHub for source control\
    • Postman for API testing

## 6. Non-Functional Requirements

*   **Performance**\
    • Page load ≤ 3 seconds on 4G connections\
    • Calendar queries and availability checks under 500 ms
*   **Security & Compliance**\
    • HTTPS everywhere (TLS 1.2+)\
    • PCI-DSS compliance for card data (via JCC)\
    • OWASP Top 10 protections (SQL injection, XSS, CSRF)\
    • GDPR-friendly data handling (user data export/deletion)
*   **Usability**\
    • WCAG 2.1 AA accessibility\
    • Mobile-first responsive design\
    • Clear error messages and form validation
*   **Reliability**\
    • 99.5% uptime SLA\
    • Automated daily backups of database
*   **Localization**\
    • All UI text stored as keys for easy translation\
    • Date/time formatting per locale

## 7. Constraints & Assumptions

*   No integration with third-party fleet or inventory systems—site handles its own data.
*   JCC payment gateway available and supports both upfront and on-arrival workflows.
*   Only English and Russian are required in V1.
*   Rental locations are limited to Cyprus.
*   Vehicle images and descriptions will be provided ahead of development.
*   AWS environment already provisioned or under procurement.

## 8. Known Issues & Potential Pitfalls

*   **Concurrency & Overbooking**\
    • Two users might attempt to book the same car simultaneously.\
    • Mitigation: database‐level locking or optimistic concurrency with availability checks.
*   **Payment Gateway Downtime**\
    • If JCC is inaccessible, bookings can’t finalize.\
    • Mitigation: show a friendly error and offer to retry later or switch to on-arrival.
*   **Localization Gaps**\
    • Missing translations could lead to mixed‐language screens.\
    • Mitigation: fail-safe defaults in English and continuous translation review.
*   **Dynamic Pricing Complexity**\
    • Overly aggressive demand-based pricing can confuse users.\
    • Mitigation: cap rate fluctuations to a reasonable percentage per day.
*   **Image Loading Performance**\
    • High-res photos may slow pages.\
    • Mitigation: use responsive image sizes and lazy loading.

This document fully defines the first‐version scope, user journeys, major features, and technical foundations for the car rental website. All subsequent technical specs (frontend guidelines, backend structure, security rules, etc.) should reference this PRD to ensure consistency and avoid ambiguity.

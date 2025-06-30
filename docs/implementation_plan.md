# Implementation plan

## Phase 1: Environment Setup

1. **Prevalidation**: Check if current directory is a Git repo and contains `package.json` or `.git`; if yes, skip redundant initialization. (Ref: general best practice)
2. Install **Node.js v20.2.1** if not present. (Ref: Tech Stack: Backend)
3. **Validation**: Run `node -v` and confirm output is `v20.2.1`. (Ref: Tech Stack: Backend)
4. Check that **Git** is installed; if not, install Git. (Ref: general best practice)
5. **Validation**: Run `git --version` to confirm. (Ref: general best practice)
6. Initialize a Git repository at project root:  
   `git init`  
   (Ref: general best practice)
7. Create the following directories at project root: `/frontend`, `/backend`, `/infra`, and `/docs`. (Ref: Project structure)
8. Create a `README.md` file in the project root with placeholder title and overview. (Ref: Project Goal)
9. Create a `cursor_metrics.md` file at the project root. (Ref: Tech Stack: Cursor)
10. Instruct developer to open `cursor_project_rules.mdc` and follow guidelines for populating `cursor_metrics.md`. (Ref: Tech Stack: Cursor)

## Phase 2: Frontend Development

11. **Prevalidation**: If `/frontend` contains React project files (`package.json`, `src/`), skip CRA initialization. (Ref: general best practice)
12. Create a new React PWA in `/frontend` using Create React App v5.0.1:  
    `npx create-react-app@5.0.1 frontend --template cra-template-pwa`  
    (Ref: Tech Stack: Frontend)
13. Navigate to `/frontend` and install dependencies:  
    `npm install react-router-dom@6.14.2 axios i18next react-i18next react-datepicker styled-components@6.0.4`  
    (Ref: Tech Stack: Frontend)
14. Create `/frontend/src/i18n.js` and configure `i18next` with English and Russian locales. (Ref: Tech Stack: Frontend)
15. Create `/frontend/src/components/BookingForm.jsx` featuring `react-datepicker` for date selection and dropdowns for pick-up/drop-off locations. (Ref: Key Features: Booking System & Availability Calendar)
16. Create `/frontend/src/components/VehicleList.jsx` that maps an array of vehicles to `/frontend/src/components/VehicleCard.jsx`. (Ref: Key Features: Vehicle Listings)
17. Create `/frontend/src/components/VehicleCard.jsx` to display vehicle image, make, model, group, transmission, fuel type, seating capacity, and price. (Ref: Key Features: Vehicle Listings)
18. Create `/frontend/src/components/ExtrasSelection.jsx` with checkboxes for GPS, child seats, roof racks, CDW, SCDW, tyre/windscreen/underbody protection, each showing price. (Ref: Key Features: Extras and Insurance)
19. Create `/frontend/src/components/BookingSummary.jsx` to summarize vehicle, dates, extras, payment method, and calculate total with discounts. (Ref: Booking Workflow)
20. Create `/frontend/src/components/Auth/Login.jsx` and `/frontend/src/components/Auth/Register.jsx` to handle guest checkout and account sign-in. (Ref: Booking Workflow)
21. Configure React Router in `/frontend/src/App.jsx` to route `/`, `/vehicles/:id`, `/checkout`, `/login`, `/register`, and `/confirmation`. (Ref: Booking Workflow)
22. Add global theme via styled-components in `/frontend/src/theme.js` using blues, greens, and grays. (Ref: Design & Branding)
23. **Validation**: Run `npm start` in `/frontend` and verify the `BookingForm` renders at `http://localhost:3000`. (Ref: general best practice)

## Phase 3: Backend Development

24. **Prevalidation**: If `/backend` contains `package.json`, skip initialization. (Ref: general best practice)
25. Initialize Node.js project in `/backend`:  
    `npm init -y`  
    (Ref: Tech Stack: Backend)
26. Install dependencies in `/backend`:  
    `npm install express@4.18.2 pg@8.11.1 jsonwebtoken@9.0.0 bcrypt@5.1.1 dotenv@16.0.3 nodemailer@6.9.3 cors@2.8.5`  
    (Ref: Tech Stack: Backend)
27. Install dev-dependency:  
    `npm install --save-dev nodemon@2.0.22`  
    (Ref: Tech Stack: Backend)
28. Create `/backend/.env` with placeholders for `PORT`, `DATABASE_URL`, `JWT_SECRET`, `JCC_API_KEY`, `EMAIL_HOST`, `EMAIL_USER`, and `EMAIL_PASS`. (Ref: Tech Stack: Backend)
29. Add `/backend/.env` to `.gitignore`. (Ref: general best practice)
30. Create `/backend/server.js` configuring Express with `cors()`, `express.json()`, and mounting routes. (Ref: Tech Stack: Backend)
31. Create `/backend/db/index.js` exporting a `Pool` instance from `pg` using `process.env.DATABASE_URL`. (Ref: Tech Stack: Backend)
32. Add Postgres schema file `/docs/db-schema.sql` defining tables: `users`, `roles`, `locations`, `vehicles`, `extras`, `bookings`, `booking_extras`. (Ref: Key Features: Data Model)
33. **Validation**: Instruct user to run `psql "$DATABASE_URL" -f docs/db-schema.sql` to create the schema. (Ref: general best practice)
34. Create `/backend/routes/auth.js` implementing `POST /api/v1/register` and `POST /api/v1/login` using `bcrypt` and `jsonwebtoken`. (Ref: User Account Management)
35. Create `/backend/routes/vehicles.js` implementing `GET /api/v1/vehicles` with query params for pick-up, drop-off, start/end dates. (Ref: Booking System & Availability Calendar)
36. Create `/backend/routes/bookings.js` implementing `POST /api/v1/bookings` to insert into `bookings` and `booking_extras`. (Ref: Booking Workflow)
37. Create `/backend/services/jcc.js` to integrate with the JCC Payment API using `process.env.JCC_API_KEY`. (Ref: Payment)
38. Create `/backend/services/email.js` using `nodemailer` to send booking confirmation emails. (Ref: Booking Workflow)
39. **Validation**: Add a Postman collection `/backend/tests/CarRental.postman_collection.json` and run against local server to verify endpoints return `200`. (Ref: general best practice)

## Phase 4: Integration

40. In `/frontend/src/services/api.js`, configure an `axios` instance with `baseURL: 'http://localhost:3001/api/v1'`. (Ref: Integration)
41. Replace placeholder data in frontend components with real API calls (`getVehicles`, `createBooking`, `login`, `register`). (Ref: Integration)
42. Configure CORS in `/backend/server.js`:  
    `app.use(cors({ origin: 'http://localhost:3000', credentials: true }));`  
    (Ref: Tech Stack: Backend)
43. **Validation**: Perform an end-to-end workflow: search for vehicles, select extras, complete guest checkout, and verify confirmation email. (Ref: Booking Workflow)

## Phase 5: Deployment

44. Create an **S3 bucket** named `car-rental-assets` in `us-east-1` for storing vehicle images. (Ref: Storage & Hosting)
45. Upload a sample image to the bucket via AWS CLI:  
    `aws s3 cp docs/sample-car.jpg s3://car-rental-assets/`  
    (Ref: Storage & Hosting)
46. Provision a **PostgreSQL 15.3** instance on AWS RDS in `us-east-1` with identifier `car-rental-db`. (Ref: Tech Stack: Database)
47. Launch an **EC2 instance** (t3.small) in `us-east-1`, tag it `Name=CarRentalApp`, install Node.js v20.2.1, clone project, and run `npm install`. (Ref: Storage & Hosting)
48. Install and configure **PM2** on EC2 to run `/backend/server.js` as a service:  
    `pm2 start backend/server.js --name car-rental-backend`  
    (Ref: Deployment)
49. Build frontend for production:  
    `cd frontend && npm run build`  
    then deploy to S3:  
    `aws s3 sync build/ s3://car-rental-assets/ --acl public-read`  
    (Ref: Deployment)
50. **Validation**: Access the public S3 URL or EC2 public IP and perform a smoke test of the full booking flow in production. (Ref: general best practice)

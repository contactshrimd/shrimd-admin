# API Usage

## Principles

- All data via backend
- No direct DB access
- Role-based endpoints

---

## Endpoints

GET /admin/dashboard  
GET /admin/patient/search  
GET /admin/patient/{id}  
GET /admin/refills  
GET /admin/subscriptions  

POST /admin/action/resend-notification  
POST /admin/action/trigger-refill-review  

---

## Auth

- Firebase Auth required
- Role validated via backend
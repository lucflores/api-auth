# Ecommerce Auth + Users CRUD (Express/Mongo + Passport-JWT)

## Arranque
1. `cp .env.example .env` y completar variables (MONGO_URI, JWT_SECRET, etc.).
2. `npm install`
3. `npm run dev`
4. Endpoints:
   - `POST /api/sessions/register`
   - `POST /api/sessions/login`
   - `GET /api/sessions/current`
   - `POST /api/sessions/logout`
   - `GET /api/users` (admin)
   - `GET /api/users/me`
   - `POST /api/users` (admin)
   - `PUT /api/users/:id` (propietario o admin)
   - `DELETE /api/users/:id` (admin)
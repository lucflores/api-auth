Ecommerce API — Autenticación, Autorización y Arquitectura en Capas

Backend en Node.js + Express + MongoDB (Mongoose) con JWT (cookie HttpOnly/Bearer), Passport-JWT, Repository + DAO, DTOs, reset de contraseña por email, roles y owner de carrito.

Features

- Modelo User con password hash (bcrypt) y select:false.

- JWT en cookie HttpOnly (y soporta Bearer).

- Passport-JWT con extractor de cookie y Authorization: Bearer.

- /current devuelve DTO sin datos sensibles.

- Patrón Repository + DAO para User, Product, Cart.

- Reset de contraseña con token de 1 h, un solo uso y bloqueo si repite la anterior.

- Autorización por roles:

   - admin: crear/editar/eliminar productos.

   - user: operar su propio carrito (owner).

- Checkout: valida stock, descuenta y vacía carrito.

- Arquitectura profesional: capas + env + mailing + middlewares.Ecommerce API — Autenticación, Autorización y Arquitectura en Capas
 
-----------------------------------------------------------------------------------------------------------------------------------------

Cliente (Postman/Frontend)
   ↓ HTTP (JSON + cookies)
Router → Controller → Service → Repository → DAO → Model(Mongoose) → MongoDB
        (valida)    (orquesta)  (API datos)    (queries)   (schemas)

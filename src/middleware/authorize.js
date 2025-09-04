
export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: "No autenticado" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "No autorizado" });
  }
  next();
};

export const authorizeCartOwner = (req, res, next) => {
  if (req.user?.role !== "user") {
    return res.status(403).json({ error: "Solo usuarios pueden operar carritos" });
  }
  const cid = String(req.params.cid);
  const userCart = String(req.user.cart || "");
  if (cid !== userCart) {
    return res.status(403).json({ error: "No es tu carrito" });
  }
  next();
};

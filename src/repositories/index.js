import ProductDAO from "../dao/product.dao.js";
import ProductRepository from "./product.repository.js";
import CartDAO from "../dao/cart.dao.js";
import CartRepository from "./cart.repository.js";

export const productRepo = new ProductRepository(new ProductDAO());
export const cartRepo    = new CartRepository(new CartDAO());

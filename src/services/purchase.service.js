export default class PurchaseService {
  constructor({ cartRepo, productRepo }) {
    this.cartRepo = cartRepo;
    this.productRepo = productRepo;
  }

  // Solo usuarios pueden comprar; validar stock, calcular total, etc.
  async checkout({ user, cartId }) {
    if (user.role !== "user") {
      throw new Error("Solo usuarios pueden realizar compras");
    }
    if (String(user.cart) !== String(cartId)) {
      throw new Error("No puedes comprar con un carrito que no es tuyo");
    }

    const cart = await this.cartRepo.getById(cartId);
    if (!cart || !cart.products?.length) throw new Error("Carrito vacío");

    let total = 0;
    for (const item of cart.products) {
      const product = await this.productRepo.getById(item.product);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Sin stock para ${product?.title || item.product}`);
      }
      total += product.price * item.quantity;
    }

    // descontar stock (transacción idealmente)
    for (const item of cart.products) {
      await this.productRepo.decrementStock(item.product, item.quantity);
    }

    // generar ticket/orden (omito por brevedad)
    return { total };
  }
}

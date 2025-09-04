export const toUserCurrentDTO = (user) => ({
  id: user._id,
  name: `${user.first_name} ${user.last_name}`.trim(),
  email: user.email,
  age: user.age,
  role: user.role,
  cartId: user.cart?._id ?? user.cart,
});

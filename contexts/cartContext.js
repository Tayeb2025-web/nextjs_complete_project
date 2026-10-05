// context/CartContext.js
"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // بارگذاری سبد خرید از localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart");

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      localStorage.removeItem("cart");
    }
    setIsLoaded(true)
  }, []);

  // ذخیره خودکار سبد خرید در localStorage
  useEffect(() => {
    if(!isLoaded) return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart , isLoaded]);

  const addToCart = (course) => {
    setCart((prev) => {
      const exists = prev.some((item) => item._id === course._id);

      if (exists) return prev;

      return [...prev, course];
    });
  };

  const removeFromCart = (courseId) => {
    setCart((prev) => prev.filter((item) => item._id !== courseId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const isInCart = (courseId) => {
    return cart.some((item) => item._id === courseId);
  };

  const cartCount = cart.length;

  const totalPrice = cart.reduce((sum, item) => sum + (item.discountPrice || item.price || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
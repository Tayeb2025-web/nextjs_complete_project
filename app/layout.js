import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthProvider } from "@/contexts/authContext";
import { CartProvider } from "@/contexts/cartContext";

export const metadata = {
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <AuthProvider>
          <CartProvider>
            {children}
            <Toaster richColors />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CompareBar from "@/components/CompareBar";

export default function ShopLayout({ children }) {
  return (
    <>
      <CartDrawer />
      <CompareBar />
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}

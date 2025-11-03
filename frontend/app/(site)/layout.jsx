import Footer from "../../components/Footer";
import NavBar from "../../components/NavBar";
import "../globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900">
        <NavBar />
        <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

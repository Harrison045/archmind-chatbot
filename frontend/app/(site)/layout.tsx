import Nav from "@/components/nav";
import Footer from "@/components/footer";
import Mascot from "@/components/mascot";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
      <Mascot />
    </div>
  );
}

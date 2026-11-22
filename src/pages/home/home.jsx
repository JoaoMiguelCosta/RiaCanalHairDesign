// src/pages/home/home.jsx

import Header from "@widgets/header/ui/header.jsx";
import Hero from "@widgets/hero/ui/hero.jsx";
import AboutUs from "@widgets/aboutUs/ui/aboutUs.jsx";
import TeamAndServices from "@widgets/teamAndServices/ui/teamAndServices.jsx";
import Portfolio from "@widgets/portfolio/ui/portfolio.jsx";
import BeforeAndAfterSection from "@widgets/beforeAndAfter/ui/beforeAndAfter.jsx";
import Space from "@widgets/space/ui/space.jsx";
import Instagram from "@widgets/instagram/ui/instagram.jsx";
import Testimonials from "@widgets/testimonials/ui/testimonials.jsx";
import Contact from "@widgets/contact/ui/contact.jsx";
import Footer from "@widgets/footer/ui/footer.jsx";

function Home() {
  return (
    <>
      <Header />
      {/* ✅ usa o container global */}
      {/* tabIndex -1: destino focável do skip link e da navegação entre rotas */}
      <main id="main" className="container" tabIndex={-1}>
        <Hero />
        <AboutUs />
        <TeamAndServices />
        <Portfolio />
        <BeforeAndAfterSection />
        <Space />
        <Instagram />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default Home;

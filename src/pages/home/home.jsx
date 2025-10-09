// src/pages/home/home.jsx
import "@app/styles/global.css";

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

import styles from "./home.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <Header />
      <Hero />
      <AboutUs />
      <TeamAndServices />
      <Portfolio />
      <BeforeAndAfterSection />
      <Space />
      <Instagram />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

export default Home;

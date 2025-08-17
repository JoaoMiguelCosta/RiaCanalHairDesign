import Header from "../sections/01-Header/Header.jsx";
import Hero from "../sections/02-Hero/Hero.jsx";
import AboutUs from "../sections/03-AboutUs/AboutUs.jsx";
import TeamAndServices from "../sections/04-TeamAndServices/TeamAndServices.jsx";
import Portfolio from "../sections/05-Portfolio/Portfolio.jsx";
import BeforeAndAfter from "../sections/06-BeforeAndAfter/BeforeAndAfter.jsx";
import Space from "../sections/07-Space/Space.jsx";
import Instagram from "../sections/08-Instagram/Instagram.jsx";
import Testimonials from "../sections/08-Testimonials/Testimonials.jsx";
import Contact from "../sections/09-Contact/Contact.jsx";
import Footer from "../sections/10-Footer/Footer.jsx";
import styles from "./Home.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <Header />
      <Hero />
      <AboutUs />
      <TeamAndServices />
      <Portfolio />
      <BeforeAndAfter />
      <Space />
      <Instagram />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

export default Home;

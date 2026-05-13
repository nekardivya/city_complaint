import React from "react";
import { Link } from "react-router-dom";
import cleaningWorkersHero from "../assets/cleaning-workers-hero.png";
import cleaningWorkersHeroTwo from "../assets/cleaning-workers-hero-2.png";
import cleaningWorkersHeroThree from "../assets/cleaning-workers-hero-3.png";
import "./Home.css";

const heroSlides = [
  {
    src: cleaningWorkersHero,
    alt: "Cleaning workers clearing litter from a city street"
  },
  {
    src: cleaningWorkersHeroTwo,
    alt: "Cleaning workers collecting litter from a public park"
  },
  {
    src: cleaningWorkersHeroThree,
    alt: "Municipal workers cleaning a neighborhood street"
  }
];

function Home() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-slideshow" aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <img
              key={slide.src}
              className="home-hero-image"
              src={slide.src}
              alt=""
              style={{ animationDelay: `${index * 4}s` }}
            />
          ))}
        </div>

        <img className="home-hero-sr-image" src={heroSlides[0].src} alt={heroSlides[0].alt} />

        <div className="home-hero-overlay" />

        <div className="home-hero-content">
          <p className="home-kicker">City Complaint</p>
          <h1>Clean City, Better Living</h1>
          <p className="home-subtitle">
            Report garbage, road, water, and electricity problems so your city
            team can respond faster.
          </p>

          <div className="home-actions">
            <Link className="home-primary" to="/add-complaint">
              Raise Complaint
            </Link>
            <Link className="home-secondary" to="/my-complaints">
              Track Complaints
            </Link>
          </div>
        </div>
      </section>

      <section className="home-highlights" aria-label="City cleanliness goals">
        <article>
          <span>01</span>
          <h2>Garbage Clearing</h2>
          <p>Send details about waste piles, missed pickups, and dirty public spaces.</p>
        </article>

        <article>
          <span>02</span>
          <h2>Street Cleaning</h2>
          <p>Help workers locate areas that need sweeping, drainage cleanup, or repair.</p>
        </article>

        <article>
          <span>03</span>
          <h2>Faster Action</h2>
          <p>Keep every complaint organized with category, address, type, and status.</p>
        </article>
      </section>
    </main>
  );
}

export default Home;

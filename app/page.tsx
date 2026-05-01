"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const SLIDES = [
  { src: "/studio-img/1S.jpeg", mirror: true },
  { src: "/studio-img/2S.jpeg", mirror: true },
  { src: "/studio-img/3S.jpeg", mirror: false },
  { src: "/studio-img/4S.jpeg", mirror: false },
];

const GALLERY_IMAGES = [
  { src: "/studio-img/1S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/2S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/3S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/4S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/7S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/8S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/12S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/13S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/9S.jpeg", alt: "Karyan Nine" },
  { src: "/studio-img/14S.jpeg", alt: "Karyan Nine" },
  { src: "/images/img-1.jpeg", alt: "Karyan Nine" },
  { src: "/images/img-2.jpeg", alt: "Karyan Nine" },
];

const TITLE_MAP: Record<string, string> = {
  brochure: "Download Brochure",
  location: "Get Location",
  "location-details": "Get Location Details",
  "floor-plan": "Get Floor Plan",
  "site-visit": "Book a free site visit",
};

export default function Home() {
  const router = useRouter();

  /* ─ Slider ─ */
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const startAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % SLIDES.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nextSlide = () => {
    setCurrentSlide((p) => (p + 1) % SLIDES.length);
    startAutoPlay();
  };
  const prevSlide = () => {
    setCurrentSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length);
    startAutoPlay();
  };

  /* ─ Mobile menu ─ */
  const [menuOpen, setMenuOpen] = useState(false);

  /* ─ Modal ─ */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Download Brochure");
  const [modalSubmitLabel, setModalSubmitLabel] = useState("Submit");
  const [formSubmitSource, setFormSubmitSource] = useState("");

  const openModal = (source: string, submitLabel?: string) => {
    setFormSubmitSource(source);
    setModalTitle(TITLE_MAP[source] || "Book a free site visit");
    setModalSubmitLabel(
      submitLabel ||
        (source === "brochure" ? "Download Brochure" : "Book Site Visit"),
    );
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
  };

  /* ─ Gallery popup ─ */
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupImages, setPopupImages] = useState<
    { src: string; alt: string }[]
  >([]);
  const [popupIndex, setPopupIndex] = useState(0);

  const openPopup = (images: { src: string; alt: string }[], index: number) => {
    setPopupImages(images);
    setPopupIndex(index);
    setPopupOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closePopup = () => {
    setPopupOpen(false);
    document.body.style.overflow = "";
  };
  const nextPopup = () => setPopupIndex((p) => (p + 1) % popupImages.length);
  const prevPopup = () =>
    setPopupIndex((p) => (p - 1 + popupImages.length) % popupImages.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!popupOpen) return;
      if (e.key === "Escape") closePopup();
      else if (e.key === "ArrowRight") nextPopup();
      else if (e.key === "ArrowLeft") prevPopup();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupOpen, popupIndex, popupImages]);

  /* ─ Forms (single API + shared overlay) ─ */
  const LEAD_BUTTON_LABEL = "Book Site Visit";
  const [submitOverlay, setSubmitOverlay] = useState<{
    title: string;
    subtitle: string;
  } | null>(null);

  const handleLeadSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitOverlay({
      title: "Sending your details",
      subtitle: `${LEAD_BUTTON_LABEL} · securing your request`,
    });
    const form = e.currentTarget;
    const params = new URLSearchParams();
    new FormData(form).forEach((v, k) => params.append(k, v.toString()));
    params.set("formType", LEAD_BUTTON_LABEL);
    try {
      const res = await fetch("/api/lead-form", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        form.reset();
        setSubmitOverlay(null);
        document.body.style.overflow = "";
        router.push("/thank-you");
      } else {
        alert(data.message || "Server error. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitOverlay(null);
      document.body.style.overflow = "";
    }
  };

  const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const label = modalSubmitLabel;
    const src = formSubmitSource;
    setSubmitOverlay({
      title: "Sending your details",
      subtitle: `${label} · we’re on it`,
    });
    const form = e.currentTarget;
    const params = new URLSearchParams();
    new FormData(form).forEach((v, k) => params.append(k, v.toString()));
    params.set("formType", label);
    try {
      const res = await fetch("/api/lead-form", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        form.reset();
        closeModal();
        setSubmitOverlay(null);
        document.body.style.overflow = "";
        if (src === "brochure") {
          const link = document.createElement("a");
          link.href = "/images/kcB.pdf";
          link.download = "Karyan_Heights_Brochure.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => router.push("/thank-you"), 500);
        } else {
          router.push("/thank-you");
        }
      } else {
        alert(data.message || "Server error. Please try again.");
      }
    } catch {
      alert("Network error. Please try again.");
    } finally {
      setSubmitOverlay(null);
      document.body.style.overflow = "";
      setFormSubmitSource("");
    }
  };

  /* ─ Intersection Observer animations ─ */
  useEffect(() => {
    if (!submitOverlay) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [submitOverlay]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = "1";
            entry.target.classList.add("animate-fadeInUp");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    document
      .querySelectorAll(
        ".section-title, .price-card, .gallery-item, .stat-item, .contact-item",
      )
      .forEach((el) => {
        (el as HTMLElement).style.opacity = "0";
        observer.observe(el);
      });
    return () => observer.disconnect();
  }, []);

  const currentPopup = popupImages[popupIndex];

  return (
    <>
      {submitOverlay && (
        <div
          className="form-submit-overlay"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="form-submit-backdrop" />
          <div className="form-submit-card">
            <div className="form-submit-spinner" aria-hidden>
              <span className="form-submit-ring" />
            </div>
            <p className="form-submit-title">{submitOverlay.title}</p>
            <p className="form-submit-sub">{submitOverlay.subtitle}</p>
            <div className="form-submit-progress" aria-hidden>
              <div className="form-submit-progress-bar" />
            </div>
          </div>
        </div>
      )}

      {/* ─ HEADER ─ */}
      <header className="header">
        <nav className="nav-container">
          <div className="logo">
            <img src="/images/logo.png" alt="Karyan Nine" />
          </div>
          <ul className={`nav-links${menuOpen ? " active" : ""}`}>
            <li>
              <a href="#price">Highlights</a>
            </li>
            <li>
              <a href="#floor-plan">Location</a>
            </li>
            <li>
              <a href="#gallery">Gallery</a>
            </li>
            <li>
              <a href="#virtual-tour">Why Invest</a>
            </li>
            <li>
              <a href="#location">Contact</a>
            </li>
            <li>
              <button
                className="btn-download-brochure"
                onClick={() => openModal("brochure", "Download Brochure")}
              >
                Download Brochure
              </button>
            </li>
          </ul>
          <button
            className="menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{ background: "none", border: "none" }}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <div className="main-container">
        {/* ─ MAIN CONTENT ─ */}
        <main className="main-content">
          {/* ── HERO ── */}
          <section className="banner">
            <div
              className="slider"
              onTouchStart={(e) => {
                touchStartX.current = e.changedTouches[0].screenX;
              }}
              onTouchEnd={(e) => {
                const diff = touchStartX.current - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
              }}
            >
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className={`slide${currentSlide === i ? " active" : ""}`}
                >
                  <div className="rera-badge">
                    <i className="fas fa-shield-alt"></i> Premium Commercial
                    Tower
                  </div>
                  <img
                    src={slide.src}
                    alt="Karyan Nine"
                    className={slide.mirror ? "banner-image-mirror" : ""}
                  />
                  <div className="banner-info">
                    <div className="info-badge">Karyan Nine</div>
                    <h1>Iconic Luxury Studio Tower opposite to Wave City</h1>
                    <p className="banner-expressway-line">
                      <i className="fas fa-road"></i>Bang On the Delhi-Meerut
                      Expressway
                    </p>
                    <p className="location">
                      <i className="fas fa-map-marker-alt"></i> Premium Studio
                      Apartments — modern design, premium connectivity, high
                      visibility.
                    </p>
                    <div className="key-features">
                      <div className="feature">
                        <i className="fas fa-building feature-icon-fa"></i>
                        <span className="feature-label">Tower</span>
                        <span className="feature-value">12 Floor Premium</span>
                      </div>
                      <div className="feature">
                        <i className="fas fa-gem feature-icon-fa"></i>
                        <span className="feature-label">Inventory</span>
                        <span className="feature-value">
                          25 Exclusive Units on a Per Floor
                        </span>
                      </div>
                      <div className="feature">
                        <i className="fas fa-th-large feature-icon-fa"></i>
                        <span className="feature-label">Design</span>
                        <span className="feature-value">Iconic Facade</span>
                      </div>
                      <div className="feature">
                        <i className="fas fa-arrow-up feature-icon-fa"></i>
                        <span className="feature-label">Lifts</span>
                        <span className="feature-value">
                          6 Dedicated High-Speed Lifts
                        </span>
                      </div>
                    </div>
                    <p className="banner-price-heading">
                      <span className="banner-price-label">Starting Price</span>
                      <span className="banner-price-main">
                        ₹65 Lacs<sup>*</sup>
                      </span>
                      <span className="banner-price-onwards">Onwards</span>
                    </p>
                  </div>
                </div>
              ))}

              <button
                className="slider-btn prev"
                onClick={prevSlide}
                aria-label="Previous slide"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                className="slider-btn next"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              <div className="slider-dots">
                {SLIDES.map((_, i) => (
                  <span
                    key={i}
                    className={`dot${currentSlide === i ? " active" : ""}`}
                    onClick={() => {
                      setCurrentSlide(i);
                      startAutoPlay();
                    }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ── ABOUT ── */}
          <section className="overview">
            <div className="section-container">
              <span className="section-tag">
                <i className="fas fa-info-circle"></i> About the Project
              </span>
              <h2 className="section-title">
                A new landmark on the Delhi-Meerut Expressway. Strategically
                located opposite to Wave City
              </h2>
              <div className="overview-content">
                <div className="overview-text">
                  <p className="section-subtitle">
                    Karyan Nine is a premium studio tower designed for modern
                    investors, business owners and future-focused buyers.
                    Located right on Delhi-Meerut Expressway and opposite to
                    Wave City, this project offers strong visibility, easy
                    access and a premium address.
                  </p>
                  <p className="overview-para">
                    With 25 units on a per floor in a 12-floor tower, every
                    space is planned for comfort, convenience and better value.
                    Limited inventory and iconic frontage make it a smart
                    investment for years to come.
                  </p>
                  <div className="about-cta-row">
                    <button
                      className="btn-primary"
                      onClick={() => openModal("site-visit", "Enquire Now")}
                    >
                      <i className="fas fa-paper-plane"></i> Enquire Now
                    </button>
                    <button
                      className="btn-primary btn-download-brochure"
                      onClick={() => openModal("brochure", "Download Brochure")}
                    >
                      <i className="fas fa-download"></i> Download Brochure
                    </button>
                  </div>
                </div>
                <div className="overview-stats">
                  <div className="stat-item">
                    <div className="stat-icon-wrap">
                      <i className="fas fa-road"></i>
                    </div>
                    <div>
                      <div className="stat-label">Location</div>
                      <div className="stat-number">
                        Bang on Delhi-Meerut Expressway
                      </div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon-wrap">
                      <i className="fas fa-gem"></i>
                    </div>
                    <div>
                      <div className="stat-label">Exclusivity</div>
                      <div className="stat-number">
                        25 Premium Units on a per floor
                      </div>
                    </div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-icon-wrap">
                      <i className="fas fa-city"></i>
                    </div>
                    <div>
                      <div className="stat-label">Neighbours</div>
                      <div className="stat-number">opposite to Wave City</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── HIGHLIGHTS ── */}
          <section id="price" className="highlights-section">
            <div className="section-container">
              <span className="section-tag">
                <i className="fas fa-star"></i> Why Karyan Nine
              </span>
              <h2 className="section-title">Project Highlights</h2>
              <div className="highlights-grid">
                {[
                  { icon: "fa-building", text: "Iconic Studio Luxury Tower" },
                  {
                    icon: "fa-layer-group",
                    text: "12 Floors Premium Development",
                  },
                  { icon: "fa-gem", text: "Only 25 Units in per floor" },
                  {
                    icon: "fa-border-all",
                    text: "Full Glass Facade Elevation",
                  },
                  { icon: "fa-compass", text: "Vastu-Compliant" },
                  {
                    icon: "fa-sort-amount-up",
                    text: "6 Dedicated High-Speed Lifts",
                  },
                  { icon: "fa-ruler-combined", text: "6 ft. wide corridors" },
                  { icon: "fa-concierge-bell", text: "Premium Entry Lobby" },
                  {
                    icon: "fa-binoculars",
                    text: "High Visibility from Highway",
                  },
                  { icon: "fa-landmark", text: "Modern Architecture" },
                ].map((item) => (
                  <div className="highlight-card" key={item.text}>
                    <div className="highlight-icon">
                      <i className={`fas ${item.icon}`}></i>
                    </div>
                    <span className="highlight-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── LOCATION ── */}
          <section id="floor-plan" className="location-benefits">
            <div className="section-container">
              <span className="section-tag">
                <i className="fas fa-map-marker-alt"></i> Location Advantage
              </span>
              <h2 className="section-title">Prime Location Benefits</h2>
              <div className="location-benefits-inner">
                <div>
                  <ul className="loc-list">
                    <li>
                      <i className="fas fa-road"></i>Nearby Ganga Expressway
                      &amp; Eastern Peripheral Expressway
                    </li>
                    <li>
                      <i className="fas fa-city"></i>Just opposite to Wave City
                    </li>
                    <li>
                      <i className="fas fa-hospital"></i>Manipal Hospital – 1.5
                      KM
                    </li>
                    <li>
                      <i className="fas fa-hospital-alt"></i>Metro Station ~ 15
                      Minutes
                    </li>
                    <li>
                      <i className="fas fa-graduation-cap"></i>IMS College – 10
                      Minutes
                    </li>
                    <li>
                      <i className="fas fa-graduation-cap"></i>ABES College – 5
                      Minutes
                    </li>
                    <li>
                      <i className="fas fa-store"></i>Near Expo Center
                    </li>
                    <li>
                      <i className="fas fa-network-wired"></i>Easy Connectivity
                      to Noida, Delhi &amp; Ghaziabad
                    </li>
                  </ul>
                </div>
                <div className="location-visual-pane">
                  <div className="blur-placeholder">
                    <img
                      src="/studio-img/2S.jpeg"
                      alt="Location Map"
                      className="blur-image"
                      style={{ filter: "blur(1px) brightness(0.65)" }}
                    />
                  </div>
                  <button
                    className="btn-primary image-cta-below"
                    onClick={() => openModal("location", "Get Location")}
                  >
                    <i className="fas fa-map-pin"></i> View Location
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── AMENITIES ── */}
          <section id="layout-plan" className="amenities-section">
            <div className="section-container">
              <span className="section-tag">
                <i className="fas fa-th-large"></i> Features &amp; Amenities
              </span>
              <h2 className="section-title">Modern Features</h2>
              <div className="amenities-grid">
                {[
                  { icon: "fa-sort-amount-up-alt", name: "High-Speed Lifts" },
                  { icon: "fa-bolt", name: "100% Power Backup" },
                  { icon: "fa-video", name: "CCTV Surveillance" },
                  { icon: "fa-car", name: "Ample Parking Space" },
                  { icon: "fa-border-none", name: "Premium Glass Facade" },
                  {
                    icon: "fa-door-open",
                    name: "Grand Double-Height Entrance",
                  },
                  { icon: "fa-trophy", name: "Branded Commercial Ambience" },
                ].map((a) => (
                  <div className="amenity-card" key={a.name}>
                    <div className="amenity-icon">
                      <i className={`fas ${a.icon}`}></i>
                    </div>
                    <div className="amenity-name">{a.name}</div>
                  </div>
                ))}
              </div>
              <div className="blur-placeholder" style={{ maxWidth: "780px" }}>
                <img
                  src="/studio-img/6S.jpeg"
                  alt="Floor Plan"
                  className="blur-image"
                />
              </div>
              <button
                className="btn-primary image-cta-below"
                onClick={() => openModal("floor-plan", "Get Floor Plan")}
              >
                <i className="fas fa-file-alt"></i> Get Floor Plan
              </button>
            </div>
          </section>

          {/* ── GALLERY ── */}
          <section id="gallery" className="gallery">
            <div className="section-container">
              <span className="section-tag">
                <i className="fas fa-images"></i> Visual Tour
              </span>
              <h2 className="section-title">Project Gallery</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                Take a look inside Karyan 9 - premium studio spaces built for
                strong rental demand &amp; future growth.
              </p>
              <div className="gallery-grid">
                {GALLERY_IMAGES.map((img, i) => (
                  <div
                    className="gallery-item"
                    key={i}
                    onClick={() => openPopup(GALLERY_IMAGES, i)}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="gallery-popup-img"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── WHY INVEST ── */}
          <section id="virtual-tour" className="why-invest">
            <div className="section-container">
              <div className="why-invest-inner">
                <div>
                  <span className="section-tag">
                    <i className="fas fa-chart-line"></i> Investment Potential
                  </span>
                  <h2 className="section-title">Why Choose Karyan Nine</h2>
                  <p>
                    This project is built at one of the fastest growing
                    locations of Ghaziabad. With direct highway access, nearby
                    hospitals, colleges and residential catchment, it gives
                    strong business potential and future appreciation.
                  </p>
                  <p>
                    Limited inventory and iconic frontage make it a smart
                    investment option for the discerning buyer.
                  </p>
                  <div className="invest-points">
                    <div className="invest-point">
                      <div className="invest-point-icon">
                        <i className="fas fa-route"></i>
                      </div>
                      <div>
                        <strong>Connected to Everything</strong>
                        <p>
                          Smooth highway access to Noida, Delhi &amp; Ghaziabad
                          — every important destination is minutes away.
                        </p>
                      </div>
                    </div>
                    <div className="invest-point">
                      <div className="invest-point-icon">
                        <i className="fas fa-hand-holding-usd"></i>
                      </div>
                      <div>
                        <strong>High ROI Potential</strong>
                        <p>
                          Prime highway frontage + limited supply = strong
                          appreciation and rental yield over time.
                        </p>
                      </div>
                    </div>
                    <div className="invest-point">
                      <div className="invest-point-icon">
                        <i className="fas fa-users"></i>
                      </div>
                      <div>
                        <strong>Large Catchment Area</strong>
                        <p>
                          Hospitals, colleges, residential zones and tech parks
                          all within 5–10 minutes radius.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: "2rem" }}>
                    <button
                      className="btn-white"
                      onClick={() => openModal("site-visit", "Enquire Now")}
                    >
                      <i className="fas fa-paper-plane"></i> Enquire Now
                    </button>
                  </div>
                </div>
                <div className="why-invest-img">
                  <img src="/studio-img/1S.jpeg" alt="Karyan Nine" />
                </div>
              </div>
            </div>
          </section>

          {/* ── CTA ── */}
          <section id="location" className="cta-section">
            <div className="section-container">
              <h2 className="section-title center">
                Book Your Studio Space on the Delhi-Meerut Expressway, opposite
                to Wave City
              </h2>
              <p className="cta-subtitle">
                <span style={{ display: "block" }}>
                  <span className="prelaunch-highlight">
                    Get Pre-Launch Benefit for 50 Units
                  </span>
                </span>
                <span style={{ display: "block" }}>
                  Connect with our team today for pricing, floor plan and site
                  visit.
                </span>
              </p>
              <div className="cta-buttons">
                <button
                  className="btn-white"
                  onClick={() => openModal("site-visit", "Enquire Now")}
                >
                  <i className="fas fa-paper-plane"></i> Enquire Now
                </button>
                <button
                  className="btn-white btn-download-brochure"
                  onClick={() => openModal("brochure", "Download Brochure")}
                >
                  <i className="fas fa-download"></i> Download Brochure
                </button>
                <a className="btn-outline-white" href="tel:+919953298484">
                  <i className="fas fa-phone-alt"></i> Call Now
                </a>
              </div>
              <p className="cta-tagline">
                Karyan Nine — Premium Studio Landmark on Delhi-Meerut Expressway
              </p>
              <div className="blur-placeholder" style={{ marginTop: "3rem" }}>
                <img
                  src="/studio-img/3S.jpeg"
                  alt="Location"
                  className="blur-image"
                />
              </div>
              <button
                className="btn-white image-cta-below"
                onClick={() => openModal("location-details", "Get Location")}
              >
                <i className="fas fa-map-pin"></i> Get Location Details
              </button>
            </div>
          </section>
        </main>

        {/* ─ LEAD FORM ─ */}
        <aside className="lead-form">
          <div className="form-container">
            <div className="form-header-icon">
              <i className="fas fa-building"></i>
            </div>
            <h2 className="anim">Book a Site Visit</h2>
            <p className="anim2">
              <i className="fas fa-phone-alt"></i> +91 995-329-8484
            </p>
            <form id="leadForm" onSubmit={handleLeadSubmit}>
              <div className="form-icon-group">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  name="name"
                  placeholder="Your Full Name"
                  required
                />
              </div>
              <div className="form-icon-group">
                <i className="fas fa-mobile-alt"></i>
                <input
                  type="tel"
                  name="mobile"
                  placeholder="Mobile Number"
                  required
                  inputMode="numeric"
                  minLength={10}
                  maxLength={10}
                  pattern="\d{10}"
                  title="Enter exactly 10 digits"
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.value = t.value.replace(/[^0-9]/g, "").slice(0, 10);
                  }}
                />
              </div>
              <div className="form-icon-group">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-submit"
                disabled={!!submitOverlay}
              >
                <i className="fas fa-paper-plane"></i> {LEAD_BUTTON_LABEL}
              </button>
            </form>
            <p className="prelaunch-pill">
              <i className="fas fa-gift"></i>
              Get Pre-Launch Benefit for 50 Units
            </p>
          </div>
        </aside>
      </div>

      {/* ─ FOOTER ─ */}
      <footer className="footer-section">
        <div className="section-container">
          <div className="about-karyan-group">
            <h2 className="contact-title">About Karyan Group</h2>
            <p>
              Karyan Group stands at the forefront of real estate development,
              distinguished by its commitment to architectural excellence,
              meticulous project execution, and strategic partnerships with
              renowned entities.
            </p>
            <p>
              With an unwavering dedication to innovation and sustainability,
              the company consistently delivers developments that redefine
              industry benchmarks. Guided by principles of integrity and
              transparency, Karyan Group not only meets but surpasses
              expectations, cultivating enduring trust and confidence among its
              stakeholders.
            </p>
            <p>
              Through visionary leadership and a steadfast pursuit of
              excellence, the company continues to shape the future of real
              estate, reinforcing its position as a trusted and forward-thinking
              industry leader.
            </p>
          </div>
          <br />
          <div className="contact-details">
            <h2 className="contact-title">CONTACT DETAILS</h2>
            <div className="contact-info">
              <div className="contact-item">
                <span className="label">
                  <i className="fas fa-map-marker-alt"></i> Address
                </span>
                <span className="value">
                  Karyan Nine, Delhi Meerut Expressway, Ghaziabad
                </span>
              </div>
              <div className="contact-item">
                <span className="label">
                  <i className="fas fa-phone-alt"></i> Phone
                </span>
                <a href="tel:+919953298484" className="value phone-link">
                  +91 995-329-8484
                </a>
              </div>
              <div className="contact-item">
                <span className="label">
                  <i className="fas fa-envelope"></i> Email
                </span>
                <a
                  href="mailto:sales@karyaninfratech.co.in"
                  className="value email-link"
                >
                  sales@karyaninfratech.co.in
                </a>
              </div>
            </div>
          </div>

          <div className="disclaimer-section">
            <p className="disclaimer-text">
              For Photos, Layouts and Maps – The Pictures and details are
              tentative depictions only. This is not a legal offer. Mentioned
              features are indicative and are subject to change without any
              prior notice as may be decided by the company or competent
              authority Terms and Conditions Apply. Special Scheme by the
              developer.1sq Mtr =10.764 Sq. Ft &amp; 1sq. Yd. = 9 Sq. feet. This
              is not the official website of developer &amp; property, it
              belongs to authorised channel partner for information purpose
              only.
            </p>
          </div>
          <div className="sys">
            <p>Copyright 2026, all right reserved with Channel Partner.</p>
          </div>
        </div>

        {/* Mobile Fixed Bottom Nav */}
        <div className="mobile-bottom-nav">
          <button
            className="btn-brochure"
            onClick={() => openModal("site-visit", "Book a free site visit")}
          >
            Book a free site visit
          </button>
        </div>
      </footer>

      {/* ─ MODAL ─ */}
      <div
        className={`modal${modalOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal-content">
          <button className="close-modal" onClick={closeModal}>
            &times;
          </button>
          <h2>{modalTitle}</h2>
          <form className="modal-form" onSubmit={handleModalSubmit}>
            <div className="form-icon-group">
              <i className="fas fa-user"></i>
              <input
                type="text"
                name="name"
                placeholder="Your Full Name"
                required
              />
            </div>
            <div className="form-icon-group">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
              />
            </div>
            <div className="form-icon-group">
              <i className="fas fa-mobile-alt"></i>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                required
                inputMode="numeric"
                minLength={10}
                maxLength={10}
                pattern="\d{10}"
                title="Enter exactly 10 digits"
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.value = t.value.replace(/[^0-9]/g, "").slice(0, 10);
                }}
              />
            </div>
            <button
              type="submit"
              className="btn-submit"
              disabled={!!submitOverlay}
            >
              <i className="fas fa-paper-plane"></i> {modalSubmitLabel}
            </button>
          </form>
        </div>
      </div>

      {/* ─ IMAGE POPUP ─ */}
      <div
        className={`image-popup${popupOpen ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closePopup();
        }}
      >
        <div className="popup-content">
          <button className="close-popup" onClick={closePopup}>
            &times;
          </button>
          {currentPopup && (
            <img
              id="popupImage"
              src={currentPopup.src}
              alt={currentPopup.alt}
            />
          )}
          {popupImages.length > 1 && (
            <div className="popup-nav">
              <button className="popup-nav-btn" onClick={prevPopup}>
                &#10094;
              </button>
              <button className="popup-nav-btn" onClick={nextPopup}>
                &#10095;
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

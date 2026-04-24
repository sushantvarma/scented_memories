"use client";

import { useState, useEffect, useRef } from "react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  product: string;
  initial: string;
  color: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "The Lavender Essential Oil has completely transformed my bedtime routine. I add a few drops to my diffuser and the whole room fills with the most calming, authentic scent. Nothing synthetic about it — pure, earthy, and deeply relaxing. I've already ordered my second bottle.",
    product: "Lavender Essential Oil",
    initial: "P",
    color: "bg-[#D4C5E2]",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    location: "Bengaluru",
    rating: 5,
    text: "Bought the Calm & Sleep Fragrance Kit as a gift for my wife and she absolutely loves it. The packaging is beautiful, the quality is exceptional, and the sandalwood dhoop cones are unlike anything we've tried before. Will definitely be ordering more for family.",
    product: "Calm & Sleep Fragrance Kit",
    initial: "A",
    color: "bg-[#C5D4C2]",
  },
  {
    id: 3,
    name: "Kavitha Nair",
    location: "Chennai",
    rating: 5,
    text: "I was skeptical about ordering fragrance online but ScentedMemories exceeded every expectation. The Rose Water is absolutely pure — I use it as a toner every morning and my skin has never felt better. The checkout was smooth and delivery was quick. Highly recommend.",
    product: "Pure Rose Water",
    initial: "K",
    color: "bg-[#E2D4C5]",
  },
  {
    id: 4,
    name: "Rohan Desai",
    location: "Pune",
    rating: 5,
    text: "The Ultrasonic Aroma Diffuser is a work of art. It runs silently for hours and the LED lighting creates such a beautiful ambience. Paired with the Lemongrass Aroma Oil, my home office feels like a spa. Productivity has genuinely improved — I'm not even joking.",
    product: "Ultrasonic Aroma Diffuser",
    initial: "R",
    color: "bg-[#C5D0E2]",
  },
  {
    id: 5,
    name: "Sneha Iyer",
    location: "Hyderabad",
    rating: 5,
    text: "The Jasmine Incense Sticks are the closest thing to the real jasmine garlands my grandmother used to keep at home. That nostalgia hit me the moment I lit the first one. These are hand-rolled with such care — you can tell the difference immediately.",
    product: "Jasmine Incense Sticks",
    initial: "S",
    color: "bg-[#E2C5C5]",
  },
  {
    id: 6,
    name: "Vikram Pillai",
    location: "Kochi",
    rating: 5,
    text: "Ordered the Eucalyptus Essential Oil for steam inhalation during the monsoon season. The quality is outstanding — sharp, clean, and exactly what I needed. The website was easy to navigate, the order arrived well-packaged, and the price is very fair for this quality.",
    product: "Eucalyptus Essential Oil",
    initial: "V",
    color: "bg-[#C5E2D4]",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? "text-gold" : "text-sand"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function goTo(index: number) {
    if (animating || index === active) return;
    setAnimating(true);
    setTimeout(() => {
      setActive(index);
      setAnimating(false);
    }, 300);
  }

  function next() {
    goTo((active + 1) % TESTIMONIALS.length);
  }

  function prev() {
    goTo((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }

  // Auto-advance every 6 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((a) => (a + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  // Reset timer on manual navigation
  function handleNav(fn: () => void) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    fn();
    intervalRef.current = setInterval(() => {
      setActive((a) => (a + 1) % TESTIMONIALS.length);
    }, 6000);
  }

  const t = TESTIMONIALS[active];

  return (
    <section className="bg-espresso text-cream py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Voices</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-cream tracking-wide">
            What Our Customers Say
          </h2>
          <div className="w-12 h-px bg-gold mx-auto mt-4" />
        </div>

        {/* Main testimonial card */}
        <div className="max-w-3xl mx-auto">
          <div
            className={`transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}
          >
            {/* Quote mark */}
            <div className="text-center mb-8">
              <span className="font-serif text-7xl text-gold/30 leading-none select-none">"</span>
            </div>

            {/* Text */}
            <blockquote className="font-serif text-xl md:text-2xl font-light text-cream/90 text-center leading-relaxed mb-10 px-4">
              {t.text}
            </blockquote>

            {/* Product tag */}
            <div className="flex justify-center mb-8">
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold border border-gold/30 px-4 py-1.5">
                {t.product}
              </span>
            </div>

            {/* Author */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full ${t.color} flex items-center justify-center flex-shrink-0`}>
                <span className="font-serif text-lg text-espresso font-medium">{t.initial}</span>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-cream tracking-wide">{t.name}</p>
                <p className="text-xs text-cream/50 tracking-widest uppercase mt-0.5">{t.location}</p>
              </div>
              <StarRating rating={t.rating} />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-6 mt-12">
            <button
              onClick={() => handleNav(prev)}
              className="w-10 h-10 border border-white/20 text-cream/60 hover:border-gold hover:text-gold transition-all duration-200 flex items-center justify-center"
              aria-label="Previous testimonial"
            >
              ←
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleNav(() => goTo(i))}
                  className={`transition-all duration-300 rounded-full ${
                    i === active
                      ? "w-6 h-1.5 bg-gold"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => handleNav(next)}
              className="w-10 h-10 border border-white/20 text-cream/60 hover:border-gold hover:text-gold transition-all duration-200 flex items-center justify-center"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>

        {/* Bottom row — all reviewer avatars */}
        <div className="flex justify-center gap-3 mt-14 flex-wrap">
          {TESTIMONIALS.map((testimonial, i) => (
            <button
              key={testimonial.id}
              onClick={() => handleNav(() => goTo(i))}
              className={`transition-all duration-200 ${
                i === active
                  ? "ring-2 ring-gold ring-offset-2 ring-offset-espresso scale-110"
                  : "opacity-40 hover:opacity-70"
              }`}
              aria-label={`View ${testimonial.name}'s testimonial`}
            >
              <div className={`w-9 h-9 rounded-full ${testimonial.color} flex items-center justify-center`}>
                <span className="font-serif text-sm text-espresso font-medium">{testimonial.initial}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

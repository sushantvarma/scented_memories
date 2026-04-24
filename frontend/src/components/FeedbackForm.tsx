"use client";

import { useState } from "react";

export default function FeedbackForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "", rating: 5 });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.message.trim()) errs.message = "Please share your experience";
    if (form.message.trim().length < 20) errs.message = "Please write at least 20 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // MVP: no backend storage. Show thank-you state.
    // Post-MVP: send to backend API or email service.
    console.log("Feedback submitted:", form);
    setSubmitted(true);

    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", message: "", rating: 5 });
    }, 5000);
  }

  if (submitted) {
    return (
      <section className="bg-warm-white py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Thank you</p>
          <h2 className="font-serif text-3xl text-espresso font-light mb-4">
            Your voice matters
          </h2>
          <p className="text-sm text-brown leading-relaxed max-w-md mx-auto">
            We've received your feedback and truly appreciate you taking the time to share your experience with us.
            Your words help us grow and serve you better.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-warm-white py-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] uppercase text-gold mb-3">Share</p>
          <h2 className="font-serif text-3xl md:text-4xl font-light text-espresso tracking-wide">
            Tell Us Your Story
          </h2>
          <div className="w-12 h-px bg-gold mx-auto my-4" />
          <p className="text-sm text-taupe leading-relaxed max-w-md mx-auto">
            Your experience with our fragrances matters. Share your thoughts, memories, or moments
            that our scents have touched.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="bg-white border border-sand p-6 sm:p-10 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-3">
              How would you rate your experience?
            </label>
            <div className="flex gap-2 justify-center sm:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, rating: star }))}
                  className="transition-all duration-150 hover:scale-110"
                  aria-label={`${star} stars`}
                >
                  <svg
                    className={`w-8 h-8 ${star <= form.rating ? "text-gold" : "text-sand"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="feedback-name" className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
              Your Name <span className="text-gold">*</span>
            </label>
            <input
              id="feedback-name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className={`input-field ${errors.name ? "input-error" : ""}`}
              placeholder="Priya Sharma"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="feedback-email" className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
              Email Address <span className="text-gold">*</span>
            </label>
            <input
              id="feedback-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className={`input-field ${errors.email ? "input-error" : ""}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Message */}
          <div>
            <label htmlFor="feedback-message" className="block text-[10px] tracking-[0.2em] uppercase text-taupe mb-1.5">
              Your Experience <span className="text-gold">*</span>
            </label>
            <textarea
              id="feedback-message"
              value={form.message}
              onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
              rows={5}
              className={`input-field resize-none ${errors.message ? "input-error" : ""}`}
              placeholder="Share your story — which product did you love? How did it make you feel? What moment or memory does it bring back?"
            />
            {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
            <p className="text-xs text-taupe mt-1.5">
              {form.message.length} / 500 characters
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-espresso text-cream text-sm tracking-widest uppercase font-medium hover:bg-brown transition-colors duration-300"
          >
            Share Your Experience
          </button>

          <p className="text-xs text-taupe text-center leading-relaxed">
            Your feedback helps us craft better experiences. We read every message.
          </p>
        </form>
      </div>
    </section>
  );
}

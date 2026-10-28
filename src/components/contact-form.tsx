"use client";
import { ArrowUpRight } from "lucide-react";
import type { FormEvent } from "react";
import { contactEmail } from "@/data/contact";
import { createContactDraft } from "@/lib/contact";

export function ContactForm() {
  function openDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const message = String(data.get("message") || "").trim();
    if (name.length < 2 || message.length < 10) {
      const field = form.elements.namedItem(
        name.length < 2 ? "name" : "message",
      ) as HTMLInputElement | HTMLTextAreaElement;
      field.setCustomValidity(
        name.length < 2
          ? "Please enter your name."
          : "Please write a message of at least 10 characters.",
      );
      field.reportValidity();
      return;
    }
    window.location.href = createContactDraft({
      name,
      email: String(data.get("email")),
      topic: String(data.get("topic")),
      message,
    });
  }
  return (
    <form
      className="contact-form"
      action={`mailto:${contactEmail}`}
      method="post"
      encType="text/plain"
      onSubmit={openDraft}
      onInput={(event) => {
        const field = event.target as HTMLInputElement | HTMLTextAreaElement;
        if (typeof field.setCustomValidity === "function")
          field.setCustomValidity("");
      }}
    >
      <div className="contact-form-row">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Full name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label>
        What can we help with?
        <select name="topic" defaultValue="" required>
          <option value="" disabled>
            Select a topic
          </option>
          <option>Finding a watch</option>
          <option>Product details</option>
          <option>Watch care</option>
          <option>General enquiry</option>
        </select>
      </label>
      <label>
        Your message
        <textarea
          name="message"
          rows={6}
          required
          minLength={10}
          maxLength={3000}
          placeholder="Tell us a little about your question…"
        />
      </label>
      <p id="contact-draft-note" className="small muted">
        This opens your email app with a draft. Nothing is sent or stored by
        this website.
      </p>
      <button
        type="submit"
        className="button"
        aria-describedby="contact-draft-note"
      >
        Open email draft <ArrowUpRight size={17} />
      </button>
      <noscript>
        <p>
          Email us directly at{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
        </p>
      </noscript>
    </form>
  );
}

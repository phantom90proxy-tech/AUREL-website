import Link from "next/link";
import { Mail, ArrowUpRight } from "lucide-react";
import { contactEmail } from "@/data/contact";
import { ContactForm } from "@/components/contact-form";

export const metadata = {
  title: "Contact",
  description:
    "Get in touch with AUREL about watch collections, product details, and finding a timepiece for your personal style.",
};

export default function ContactPage() {
  return (
    <>
      <section className="info-introduction">
        <div className="section">
          <p className="eyebrow">LET’S TALK</p>
          <h1>Contact AUREL.</h1>
          <p>
            A question about a timepiece, a collection, or caring for your
            watch? Start a conversation.
          </p>
        </div>
      </section>
      <section className="section contact-layout" aria-label="Contact options">
        <aside className="contact-details">
          <p className="eyebrow">A PERSONAL CONVERSATION</p>
          <h2>
            Here to help you
            <br />
            find <em>your AUREL.</em>
          </h2>
          <p>
            Whether you are exploring a new style or looking more closely at the
            details, we welcome your questions.
          </p>
          <div className="contact-email">
            <Mail size={22} strokeWidth={1.4} />
            <div>
              <p className="eyebrow">EMAIL AUREL</p>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          </div>
          <p className="small muted">
            Prefer your own email app? Use the address above or prepare a draft
            with the form.
          </p>
          <div className="contact-help">
            <p className="eyebrow">WHILE YOU EXPLORE</p>
            <Link href="/watches">
              Browse product specifications <ArrowUpRight size={16} />
            </Link>
            <Link href="/collections">
              Find your collection <ArrowUpRight size={16} />
            </Link>
            <Link href="/about">
              Get to know AUREL <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
        <div>
          <h2 className="contact-form-heading">Write to us.</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

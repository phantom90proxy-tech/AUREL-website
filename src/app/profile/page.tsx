import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = { title: "Your profile" };

export default function ProfilePage() {
  return (
    <>
      <section className="info-introduction">
        <div className="section">
          <p className="eyebrow">YOUR AUREL</p>
          <h1>Your personal collection.</h1>
          <p>Keep the watches that speak to you close.</p>
        </div>
      </section>
      <section
        className="section about-values"
        aria-label="Your shopping space"
      >
        <article>
          <h2>Saved watches</h2>
          <p>Return to the timepieces on your wishlist.</p>
          <Link href="/wishlist" className="text-link">
            View wishlist <ArrowUpRight size={16} />
          </Link>
        </article>
        <article>
          <h2>Your bag</h2>
          <p>Review your selection and adjust quantities.</p>
          <Link href="/bag" className="text-link">
            View shopping bag <ArrowUpRight size={16} />
          </Link>
        </article>
        <article>
          <h2>Here to help</h2>
          <p>Ask about a watch or find help choosing your next piece.</p>
          <Link href="/contact" className="text-link">
            Contact AUREL <ArrowUpRight size={16} />
          </Link>
        </article>
        <p>
          Your wishlist and bag are saved in this browser. No account or sign-in
          is required.
        </p>
      </section>
    </>
  );
}

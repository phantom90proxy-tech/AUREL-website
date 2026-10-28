import Link from "next/link";
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <Link href="/" className="footer-wordmark">
            AUREL
          </Link>
        </div>
        <div>
          <p className="eyebrow">EXPLORE</p>
          <Link href="/watches">All watches</Link>
          <Link href="/collections">Collections</Link>
          <Link href="/limited-editions">Limited editions</Link>
        </div>
        <div>
          <p className="eyebrow">YOUR AUREL</p>
          <Link href="/wishlist">Your wishlist</Link>
          <Link href="/bag">Shopping bag</Link>
          <Link href="/about">About us</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/#our-story">Our story</Link>
        </div>
        <div className="footer-note">
          <p className="eyebrow">CONSIDERED IN EVERY DETAIL</p>
          <p>
            Distinctive timepieces.
            <br />
            For the moments that are yours.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} AUREL. All rights reserved.</span>
        <span>Frontend demonstration · No orders or payments</span>
      </div>
    </footer>
  );
}

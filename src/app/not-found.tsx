import Link from "next/link";
export default function NotFound() {
  return (
    <div className="empty-state section">
      <p className="eyebrow">404 / A MOMENT MISPLACED</p>
      <h1>This page has moved on.</h1>
      <Link href="/watches" className="button">
        Explore watches
      </Link>
    </div>
  );
}

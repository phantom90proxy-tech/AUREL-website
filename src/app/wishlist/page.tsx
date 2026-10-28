import { SavedProducts } from "@/components/shopping";
export const metadata = { title: "Your Wishlist" };
export default function Page() {
  return (
    <section className="section page-section">
      <p className="eyebrow">A PERSONAL SELECTION</p>
      <h1>Your wishlist.</h1>
      <p className="page-intro">
        The timepieces that caught your eye. Saved for another moment.
      </p>
      <SavedProducts />
    </section>
  );
}

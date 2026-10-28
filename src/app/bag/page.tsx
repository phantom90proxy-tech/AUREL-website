import { Bag } from "@/components/shopping";
export const metadata = { title: "Your Shopping Bag" };
export default function Page() {
  return (
    <section className="section page-section">
      <p className="eyebrow">ONE STEP CLOSER TO YOUR AUREL</p>
      <h1>Your shopping bag.</h1>
      <p className="page-intro">A thoughtful selection, made personal.</p>
      <Bag />
    </section>
  );
}

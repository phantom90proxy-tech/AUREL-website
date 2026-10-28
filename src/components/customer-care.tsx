import { customerCare } from "@/data/customer-care";
import { Reveal } from "@/components/motion";
import { CustomerCareDisclosures } from "@/components/customer-care-disclosures";

export function CustomerCare() {
  return (
    <section className="customer-care" aria-labelledby="customer-care-title">
      <div className="section">
        <Reveal className="customer-care-heading" duration={0.75}>
          <p className="eyebrow">{customerCare.label}</p>
          <h2 id="customer-care-title">{customerCare.heading}</h2>
          <p>{customerCare.description}</p>
        </Reveal>
        <CustomerCareDisclosures items={customerCare.items} />
      </div>
    </section>
  );
}

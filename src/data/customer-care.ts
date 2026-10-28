export interface CustomerCareItem {
  id: string;
  icon: "truck" | "shield-check" | "wrench";
  title: string;
  description: string;
  status: string;
  details: string[];
}

// The source catalog contains a generic two-year warranty statement, but no
// approved sitewide terms or claims process. Do not turn it into a new promise.
// No verified shipping policy or repair-price schedule was found in the project.
// General care guidance below comes from original-watches.ts; products stay intact.
export const customerCare = {
  label: "AUREL CUSTOMER CARE",
  heading: "Designed around you.",
  description: "Essential information for your AUREL experience.",
  items: [
    {
      id: "shipping",
      icon: "truck",
      title: "Shipping Information",
      description:
        "Find information about shipping options, delivery arrangements, and order handling.",
      status: "Details to be confirmed",
      details: [
        "Shipping options, delivery arrangements, and order-handling policies have not yet been confirmed.",
      ],
    },
    {
      id: "warranty-care",
      icon: "shield-check",
      title: "Warranty & Watch Care",
      description:
        "Learn about warranty information and how to care for your AUREL timepiece.",
      status: "Details to be confirmed",
      details: [
        "Sitewide warranty terms and claim arrangements need confirmation. Refer to the information for your specific watch model.",
        "For everyday care, wipe the case with a soft, dry cloth. Keep leather straps away from water, perfume, and excessive sunlight. Avoid strong impacts, extreme temperatures, and magnetic fields. Follow your model’s care guide before exposing the watch to water.",
      ],
    },
    {
      id: "repairs",
      icon: "wrench",
      title: "Repair Pricing",
      description:
        "Explore repair-service information, pricing details, and quotation options.",
      status: "Quote required",
      details: [
        "Repair prices and official service availability have not yet been confirmed. Any repair cost would require an individual quotation before proceeding.",
      ],
    },
  ] satisfies CustomerCareItem[],
};

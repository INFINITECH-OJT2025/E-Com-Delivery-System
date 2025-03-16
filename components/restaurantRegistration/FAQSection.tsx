"use client";

import { Accordion, AccordionItem } from "@heroui/react"; // Import Hero UI's Accordion components

export const FAQSection = () => {
  return (
    <section className="my-16 px-8 py-8 container mx-auto ">
      <h2 className="text-3xl font-semibold text-center mb-6">Any questions?</h2>
      <Accordion
        variant="light"
        fullWidth
        showDivider={true} // Show divider between items
        defaultSelectedKeys={["question1"]} // Set default open question
      >
        {/* Accordion Item 1 */}
        <AccordionItem
          title="How do I get started?"
          subtitle="Follow this simple guide to set up."
          id="question1"
        >
          <p className="mt-2 text-lg">
            You can start by signing up with your restaurant details and selecting a business plan.
          </p>
        </AccordionItem>

        {/* Accordion Item 2 */}
        <AccordionItem
          title="Why should my restaurant partner with E-com delivery Service?"
          subtitle="Join us for better opportunities."
          id="question2"
        >
          <p className="mt-2 text-lg">
            E-com delivery Service brings in new customers, provides delivery infrastructure, and helps grow your sales.
          </p>
        </AccordionItem>

        {/* Accordion Item 3 */}
        <AccordionItem
          title="How far do you deliver?"
          subtitle="We cover large areas."
          id="question3"
        >
          <p className="mt-2 text-lg">
            We deliver within the range specified in your restaurant profile during setup.
          </p>
        </AccordionItem>

        {/* Accordion Item 4 */}
        <AccordionItem
          title="How does a partnership with E-com delivery Service work?"
          subtitle="Here's how the process works."
          id="question4"
        >
          <p className="mt-2 text-lg">
            You simply cook while we do the rest! We create your online profile, receive orders, and our riders deliver the food.
          </p>
        </AccordionItem>

        {/* Accordion Item 5 */}
        <AccordionItem
          title="Can I stop orders if it gets too busy?"
          subtitle="Yes, you can pause orders during peak times."
          id="question5"
        >
          <p className="mt-2 text-lg">
            Yes, you can pause or manage orders via the vendor app during peak times.
          </p>
        </AccordionItem>
      </Accordion>
    </section>
  );
};

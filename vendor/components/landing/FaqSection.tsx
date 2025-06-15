"use client";

import { Accordion, AccordionItem } from "@heroui/react";

export default function FaqSection() {
  return (
    <section className="bg-gray-100 py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          Have questions about joining E-COMM VENDOR? Find answers to common questions below.
        </p>

        <Accordion
          variant="light"
          fullWidth
          showDivider
          defaultSelectedKeys={["question1"]}
          className="text-left"
        >
          <AccordionItem
            id="question1"
            title="How do I get started?"
            subtitle="Follow this simple guide to set up."
          >
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              You can start by signing up with your restaurant details and selecting a business plan.
            </p>
          </AccordionItem>

          <AccordionItem
            id="question2"
            title="Why should my restaurant partner with E-COMM Delivery Service?"
            subtitle="Join us for better opportunities."
          >
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              E-COMM Delivery Service brings in new customers, provides delivery infrastructure, and helps grow your sales.
            </p>
          </AccordionItem>

          <AccordionItem
            id="question3"
            title="How far do you deliver?"
            subtitle="We cover large areas."
          >
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              We deliver within the range specified in your restaurant profile during setup.
            </p>
          </AccordionItem>

          <AccordionItem
            id="question4"
            title="How does a partnership with E-COMM Delivery Service work?"
            subtitle="Here's how the process works."
          >
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              You simply cook while we do the rest! We create your online profile, receive orders, and our riders deliver the food.
            </p>
          </AccordionItem>

          <AccordionItem
            id="question5"
            title="Can I stop orders if it gets too busy?"
            subtitle="Yes, you can pause orders during peak times."
          >
            <p className="mt-2 text-sm text-gray-700 leading-relaxed">
              Yes, you can pause or manage orders via the vendor app during peak times.
            </p>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
};

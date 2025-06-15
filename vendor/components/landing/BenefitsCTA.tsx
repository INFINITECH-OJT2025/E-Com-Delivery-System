"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@heroui/react";
import Link from "next/link";

const benefits = [
  "Easy setup and onboarding",
  "Real-time order management",
  "Analytics and performance tracking",
  "No upfront costs",
];

export default function BenefitsCTA() {
  return (
    <section className="bg-primary text-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Why Choose E-COMM VENDOR?</h2>
          <p className="mt-4 text-white/90 text-sm max-w-xl mx-auto">
            Whether you're a new restaurant or an established brand, E-COMM VENDOR gives you the tools to thrive in a fast-paced digital world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto ">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
              <p className="text-white text-sm">{benefit}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/vendor/register">
            <Button size="lg" color="secondary" className="text-primary bg-white font-semibold">
              Get Started as a Vendor ->
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

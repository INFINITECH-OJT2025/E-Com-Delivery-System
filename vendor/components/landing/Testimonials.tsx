"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Chef Alonzo Reyes",
    role: "Owner, Alonzo's Grill",
    quote:
      "E-COMM VENDOR has completely streamlined our delivery operations. Orders come in smoothly, and customer satisfaction has gone up!",
    image: "/images/inifnitech_default_profile1.jpg",
  },
  {
    name: "Maria Tan",
    role: "Co-Founder, M&T Café",
    quote:
      "The vendor dashboard is intuitive and packed with features. We've seen a 40% boost in orders since joining.",
    image: "/images/inifnitech_default_profile2.jpg",
  },
  {
    name: "Jerome Santos",
    role: "Marketing Head, Foodie Hub",
    quote:
      "What I love most is the insights we get. It helps us adjust our strategy quickly based on actual performance.",
    image: "/images/inifnitech_default_profile3.jpg",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold mb-4 text-gray-900">What Our Vendors Say</h2>
        <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
          Real stories from restaurant owners who are growing with E-COMM VENDOR.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm text-left hover:shadow-md transition-all"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-3 text-yellow-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} fill="currentColor" stroke="none" className="w-4 h-4" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-800 text-sm mb-6 leading-relaxed">“{item.quote}”</p>

              {/* Profile */}
              <div className="flex items-center gap-4">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover border"
                />
                <div>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

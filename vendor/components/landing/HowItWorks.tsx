"use client";

import {
  Store,
  ClipboardCheck,
  DollarSign,
  Truck,
} from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    title: "1. Register Your Restaurant",
    description: "Sign up and create your vendor profile to join the platform.",
    icon: Store,
  },
  {
    title: "2. Add Your Menu",
    description: "Easily upload your products, categories, and prices.",
    icon: ClipboardCheck,
  },
  {
    title: "3. Start Receiving Orders",
    description: "Get real-time notifications and manage incoming orders.",
    icon: DollarSign,
  },
  {
    title: "4. Deliver & Earn",
    description: "Fulfill orders with integrated delivery or pickup system.",
    icon: Truck,
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-gray-100 py-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">How It Works</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-16">
          Getting started with E-COMM VENDOR is simple. Follow the steps below and start accepting orders in no time.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center hover:scale-[1.03] transition-all duration-300"
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4"
              >
                <step.icon className="w-7 h-7" strokeWidth={2.4} />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

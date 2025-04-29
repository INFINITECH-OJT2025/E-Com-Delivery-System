"use client";

import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

export default function StatsSection() {
  const stats = [
    { label: "Restaurant Partners", value: 5000, suffix: "+" },
    { label: "Monthly Orders", value: 2000000, suffix: "+" },
    { label: "Partner Satisfaction", value: 98, suffix: "%" },
    { label: "Average Revenue Increase", value: 30, suffix: "%" },
  ];

  return (
    <section className="w-full bg-gray-100 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center"
        >
          {stats.map((stat, idx) => {
            const count = useCountUp(stat.value);

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
              >
                <h3 className="text-4xl font-extrabold text-gray-900">
                  {count}
                  {stat.suffix}
                </h3>
                <p className="text-base text-gray-500 mt-2">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

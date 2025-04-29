"use client";

import {
  BarChart3,
  ClipboardList,
  Truck,
  Users,
  Megaphone,
  Package,
} from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Real-time Analytics",
    icon: BarChart3,
    description:
      "Track your sales, orders, and customer behavior with powerful analytics tools.",
    bullets: [
      "Sales and revenue tracking",
      "Customer behavior insights",
      "Performance reports",
    ],
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Easy Menu Management",
    icon: ClipboardList,
    description:
      "Create and update your menu items, prices, and availability in real-time.",
    bullets: ["Drag-and-drop builder", "Item controls", "Promotions and offers"],
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    title: "Delivery Management",
    icon: Truck,
    description:
      "Streamline delivery operations with our integrated dispatch system.",
    bullets: ["Real-time tracking", "Zone management", "Auto dispatch system"],
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    title: "Customer Engagement",
    icon: Users,
    description:
      "Build relationships with reviews, loyalty programs, and feedback.",
    bullets: ["Review management", "Loyalty programs", "Promotions"],
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    title: "Marketing Tools",
    icon: Megaphone,
    description: "Grow your business with email, SMS, and campaign tools.",
    bullets: [
      "Promotional campaigns",
      "Email/SMS tools",
      "Discount automation",
    ],
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600",
  },
  {
    title: "Operational Insights",
    icon: Package,
    description:
      "Monitor performance and make data-driven decisions with confidence.",
    bullets: ["Efficiency metrics", "Sales summaries", "Top product views"],
    bgColor: "bg-red-100",
    iconColor: "text-red-600",
  },
];

export default function FeatureHighlights() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
          Everything You Need to Succeed
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-16">
          Our platform provides all the tools and features you need to manage
          your restaurant and grow your business.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm cursor-pointer transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${feature.bgColor}`}
              >
                <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
              </div>

              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{feature.description}</p>

              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {feature.bullets.map((bullet, i) => (
                  <li key={i}>✓ {bullet}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

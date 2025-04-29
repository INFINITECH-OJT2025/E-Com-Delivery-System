"use client";

import { Button, Chip } from "@heroui/react";
import Image from "next/image";
import { CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="w-full py-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col-reverse lg:flex-row items-center justify-between gap-16">
        {/* LEFT: Text Content with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="max-w-xl text-center lg:text-left space-y-6"
        >
          <Chip color="primary" variant="bordered" className="text-sm font-medium">
            Restaurant Partners • Join Now
          </Chip>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Grow your restaurant business with{" "}
            <span className="text-primary">E-COMM VENDOR</span>
          </h1>

          <p className="text-gray-600 text-lg">
            Join thousands of successful restaurants on our platform. Increase your
            sales, reach new customers, and streamline your delivery operations.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Button color="primary" className="w-full sm:w-auto">
              Register Your Restaurant →
            </Button>
            <Button variant="bordered" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600 mt-3">
            <span className="flex items-center gap-2">
              <CheckCircle className="text-primary-500 w-4 h-4" />
              Free to join
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="text-primary-500 w-4 h-4" />
              No setup fees
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle className="text-primary-500 w-4 h-4" />
              Easy onboarding
            </span>
          </div>
        </motion.div>

        {/* RIGHT: Image and Floating Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative flex items-center"
        >
          {/* Floating Stat Card with Hover */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute lg:-left-20 left-1/2 bottom-4 transform lg:translate-x-0 -translate-x-1/2 z-10 bg-white border shadow-md rounded-xl p-4 w-[240px] transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                <Clock className="w-4 h-4 text-green-700" />
              </div>
              <span className="text-sm text-gray-600">Today's Sales</span>
            </div>
            <p className="text-xl font-bold text-gray-900">₱1,248.42</p>
            <p className="text-sm text-green-600 mt-1">
              <span className="text-green-500">↑ +18%</span> from yesterday
            </p>
          </motion.div>

          {/* Right Image */}
          <Image
            src="/images/chat-bg-1.png"
            alt="Delivery Panda"
            width={600}
            height={400}
            className="rounded-xl object-cover shadow-lg"
          />
        </motion.div>
      </div>
    </section>
  );
}

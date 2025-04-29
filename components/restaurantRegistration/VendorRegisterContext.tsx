"use client";

import React, { createContext, useContext, useState } from "react";

interface FormData {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  password_confirmation: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_phone: string;
  latitude: number | null;
  longitude: number | null;
  restaurant_category_id: string;
  service_type: string;
  open_24_hours: boolean;
  opening_time: string;
  closing_time: string;
  minimum_order_amount: string;
  visibility: boolean;
  agreed_to_terms: boolean;
  custom_schedule_json: Record<string, any>;
  restaurant_description: string;
  restaurant_logo: File | null;
  restaurant_banner: File | null;
}

interface VendorRegisterContextProps {
  step: number;
  formData: FormData;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (name: string, value: any) => void;
}

const VendorRegisterContext = createContext<VendorRegisterContextProps | undefined>(undefined);

export const VendorRegisterProvider = ({ children }: { children: React.ReactNode }) => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    restaurant_name: "",
    restaurant_address: "",
    restaurant_phone: "",
    latitude: null,
    longitude: null,
    restaurant_category_id: "",
    service_type: "both",
    open_24_hours: false,
    opening_time: "",
    closing_time: "",
    minimum_order_amount: "",
    visibility: true,
    agreed_to_terms: false,
    custom_schedule_json: {},
    restaurant_description: "",
    restaurant_logo: null,
    restaurant_banner: null,
  });

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <VendorRegisterContext.Provider value={{ step, formData, nextStep, prevStep, updateFormData }}>
      {children}
    </VendorRegisterContext.Provider>
  );
};

export const useVendorRegister = () => {
  const context = useContext(VendorRegisterContext);
  if (!context) {
    throw new Error("useVendorRegister must be used inside VendorRegisterProvider");
  }
  return context;
};

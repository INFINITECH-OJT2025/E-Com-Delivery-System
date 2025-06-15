"use client";
import { Tabs, Tab } from "@heroui/react";
import { IoBicycle, IoWalk, IoFastFood } from "react-icons/io5";

export default function TabsSection({ selectedTab, setSelectedTab }) {
    return (
        <div className="w-full flex flex-col justify-center px-4">
            <Tabs
                aria-label="Service Type"
                selectedKey={selectedTab}
                onSelectionChange={setSelectedTab}
                className="w-full max-w-lg text-lg"
            >
                {/* All (Both Delivery & Pickup) */}
                <Tab 
                    key="both" 
                    title={
                        <div className="flex items-center gap-3 py-3">
                            <IoFastFood className="text-2xl text-orange-500" />
                            <span className="font-medium text-gray-800">All</span>
                        </div>
                    } 
                />

                {/* Delivery */}
                <Tab 
                    key="delivery" 
                    title={
                        <div className="flex items-center gap-3 py-3">
                            <IoBicycle className="text-2xl text-blue-500" />
                            <span className="font-medium text-gray-800">Delivery</span>
                        </div>
                    } 
                />

                {/* Pick up */}
                <Tab 
                    key="pickup" 
                    title={
                        <div className="flex items-center gap-3 py-3">
                            <IoWalk className="text-2xl text-green-500" />
                            <span className="font-medium text-gray-800">Pick up</span>
                        </div>
                    } 
                />
            </Tabs>
        </div>
    );
}

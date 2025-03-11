"use client";

import { Card } from "@heroui/react";
import { Gift, HelpCircle, Ticket, Users } from "lucide-react";

export default function ProfileMenu() {
    return (
        <div className="m-4">
            {/* ✅ Perks Section */}
            <Card className="p-4">
                <h3 className="text-sm font-bold text-gray-700">Perks for You</h3>
                <div className="mt-3 space-y-2">
                    <MenuItem icon={Users} text="Try membership for free" />
                    <MenuItem icon={Ticket} text="Vouchers" />
                    <MenuItem icon={Gift} text="Rewards" />
                </div>
            </Card>

            {/* ✅ General Section */}
            <Card className="p-4 mt-4">
                <h3 className="text-sm font-bold text-gray-700">General</h3>
                <div className="mt-3 space-y-2">
                    <MenuItem icon={HelpCircle} text="Help Center" />
                </div>
            </Card>
        </div>
    );
}

// ✅ Menu Item Component
function MenuItem({ icon: Icon, text }: { icon: any; text: string }) {
    return (
        <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer">
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <p className="text-sm">{text}</p>
            </div>
        </div>
    );
}

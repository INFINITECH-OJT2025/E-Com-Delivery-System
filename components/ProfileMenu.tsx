"use client";

import { useState } from "react";
import { Card } from "@heroui/react";
import { Gift, HelpCircle, Ticket, Users } from "lucide-react";
import HelpCenterModal from "@/components/HelpCenterModal"; // ✅ Import the Help Center Modal
import VoucherSavingsModal from "@/components/VoucherSavingsModal";

export default function ProfileMenu() {
    const [isHelpCenterOpen, setHelpCenterOpen] = useState(false);
    const [isVoucherOpen, setVoucherOpen] = useState(false);

    return (
        <div className="m-4">
            {/* ✅ Perks Section */}
            <Card className="p-4">
                <h3 className="text-sm font-bold text-gray-700">Perks for You</h3>
                <div className="mt-3 space-y-2">
                    <MenuItem icon={Users} text="Try membership for free" />
                    <MenuItem icon={Ticket} text="Voucher Savings" onClick={() => setVoucherOpen(true)} />
                    <MenuItem icon={Gift} text="Rewards" />
                </div>
            </Card>

            {/* ✅ General Section */}
            <Card className="p-4 mt-4">
                <h3 className="text-sm font-bold text-gray-700">General</h3>
                <div className="mt-3 space-y-2">
                    <MenuItem icon={HelpCircle} text="Help Center" onClick={() => setHelpCenterOpen(true)} />
                </div>
            </Card>

            {/* ✅ Help Center Modal */}
            <HelpCenterModal isOpen={isHelpCenterOpen} onClose={() => setHelpCenterOpen(false)} />
            <VoucherSavingsModal isOpen={isVoucherOpen} onClose={() => setVoucherOpen(false)} />

        </div>
    );
}

// ✅ Menu Item Component
function MenuItem({ icon: Icon, text, onClick }: { icon: any; text: string; onClick?: () => void }) {
    return (
        <div
            className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
            onClick={onClick} // ✅ Allow clicking to open modals
        >
            <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <p className="text-sm">{text}</p>
            </div>
        </div>
    );
}

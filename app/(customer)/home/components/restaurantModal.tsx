import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import RestaurantCard from "./restaurantCard";

interface RestaurantModalProps {
    isOpen: boolean;
    title: string;
    restaurants: any[];
    deliveryFees: Record<number, { fee?: number; distance_km?: number; estimated_time?: string }>; // ✅ Ensure correct data types
    onClose: () => void;
}

export default function RestaurantModal({ isOpen, title, restaurants, deliveryFees, onClose }: RestaurantModalProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="full">
            <ModalContent className="rounded-none shadow-none">
                <ModalHeader className="p-4 text-lg font-bold">{title}</ModalHeader>
                <ModalBody className="p-4 h-[calc(100vh-60px)] overflow-y-auto">
                    <div className="flex flex-col gap-4">
                        {restaurants.map((restaurant) => {
                            const deliveryInfo = deliveryFees[restaurant.id] || {};
                            return (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={{
                                        ...restaurant,
                                        distance_km: deliveryInfo.distance_km ?? "Unknown", // ✅ Pass correct distance
                                    }}
                                    deliveryFee={deliveryInfo.fee ?? null} // ✅ Pass preloaded delivery fee
                                />
                            );
                        })}
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import RestaurantCard from "./restaurantCard";

interface RestaurantModalProps {
    isOpen: boolean;
    title: string;
    restaurants: any[];
    onClose: () => void;
}

export default function RestaurantModal({ isOpen, title, restaurants, onClose }: RestaurantModalProps) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="full">
            <ModalContent className="rounded-none shadow-none">
                <ModalHeader className="p-4 text-lg font-bold flex justify-between items-center border-b">
                    {title}
          
                </ModalHeader>
                <ModalBody className="p-4 h-[calc(100vh-60px)] overflow-y-auto">
                    {restaurants.length === 0 ? (
                        <div className="text-gray-500 text-center py-10">
                            No restaurants available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {restaurants.map((restaurant) => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}

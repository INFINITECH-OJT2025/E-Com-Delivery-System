// components/orders/OrderStatusModal.tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import { FaCheck, FaTimes } from "react-icons/fa";

export default function OrderStatusModal({
  selectedOrder,
  confirmModalOpen,
  cancelModalOpen,
  closeAllModals,
  newStatus,
  updateStatus,
  cancelOrder,
}) {
  return (
    <>
      {/* Confirm Status Update Modal */}
      <Modal isOpen={confirmModalOpen} onOpenChange={closeAllModals} size="sm">
        <ModalContent>
          <ModalHeader>Confirm Status Update</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <p>
                Are you sure you want to mark order <strong>#{selectedOrder.id}</strong> as{" "}
                <span className="capitalize font-semibold">{newStatus}</span>?
              </p>
            )}
          </ModalBody>
          <ModalFooter className="flex justify-between">
            <Button variant="bordered" onPress={closeAllModals}>
              Cancel
            </Button>
            <Button color="success" onPress={updateStatus}>
              <FaCheck className="mr-2" /> Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal isOpen={cancelModalOpen} onOpenChange={closeAllModals} size="sm">
        <ModalContent>
          <ModalHeader>Cancel Order</ModalHeader>
          <ModalBody>
            {selectedOrder && (
              <p className="text-md">
                Are you sure you want to cancel order <strong>#{selectedOrder.id}</strong>?{" "}
                This action cannot be undone.
              </p>
            )}
          </ModalBody>
          <ModalFooter className="flex justify-between">
            <Button variant="bordered" onPress={closeAllModals}>
              Keep Order
            </Button>
            <Button color="danger" onPress={cancelOrder}>
              <FaTimes className="mr-2" /> Cancel Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

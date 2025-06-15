// components/TermsModal.tsx
"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

export default function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onClose} placement="center">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Terms and Conditions
            </ModalHeader>
            <ModalBody className="max-h-[60vh] overflow-y-auto text-sm space-y-4">
              <p>
                By registering as a vendor, you agree to the following terms:
              </p>
              <ul className="list-disc ml-5 space-y-2">
                <li>All information provided must be accurate and truthful.</li>
                <li>Vendors are responsible for fulfilling all accepted orders.</li>
                <li>Inappropriate content or counterfeit products are prohibited.</li>
                <li>Violation of these terms may result in account suspension.</li>
                <li>We reserve the right to update these terms at any time.</li>
              </ul>
              <p>
                If you have any questions, please contact our support team before proceeding.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

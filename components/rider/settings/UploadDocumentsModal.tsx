"use client";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  addToast,
} from "@heroui/react";
import { riderProfileService } from "@/services/riderProfileService";
import { X } from "lucide-react";

export default function UploadDocumentsModal({
  isOpen,
  onClose,
  licenseImage,
  onUploadSuccess, // ✅ Add this
}: {
  isOpen: boolean;
  onClose: () => void;
  licenseImage?: string;
  onUploadSuccess?: () => void; // ✅ Optional callback
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  // Set initial preview when modal opens
  useEffect(() => {
    if (isOpen) {
      setPreview(licenseImage || "");
      setFile(null); // Reset file selection
    }
  }, [isOpen, licenseImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      addToast({
        title: "⚠️ No File Selected",
        description: "Please select a license image to upload.",
        color: "warning",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await riderProfileService.uploadLicenseImage(file);
      if (res.success) {
        addToast({
          title: "✅ License Uploaded",
          description: "Your license image has been successfully updated.",
          color: "success",
        });

        if (onUploadSuccess) onUploadSuccess(); // ✅ Trigger parent refetch
        onClose(); // ✅ Close modal after success
      } else {
        addToast({
          title: "❌ Upload Failed",
          description: res.message || "Something went wrong.",
          color: "danger",
        });
      }
    } catch (err) {
      addToast({
        title: "❌ Error",
        description: "Failed to upload license image.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader className="p-4 bg-primary text-white relative">
          <h3 className="text-base font-semibold">📄 Upload Rider License</h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:opacity-80"
          >
            <X size={18} />
          </button>
        </ModalHeader>

        <ModalBody className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            description="Leave blank if you don't want to change"
            className="mt-3"
          />
          {preview && (
            <div className="text-center">
              <img
                src={preview}
                alt="License Preview"
                className="w-28 h-28 rounded-lg object-cover mx-auto"
              />
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleUpload} isDisabled={loading}>
            {loading ? <Spinner size="sm" /> : "Submit"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// app/admin/vouchers/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  SelectItem,
  Select,
  Chip,
} from "@heroui/react";
import { Plus } from "lucide-react";
import { getVouchers, createVoucher, updateVoucher, deleteVoucher } from "@/services/promoService";
import { addToast } from "@heroui/react";

const VouchersPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [form, setForm] = useState({
    type: "",
    code: "",
    discount_percentage: "",
    discount_amount: "",
    minimum_order: "",
    max_uses: "",
    valid_until: "",
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await getVouchers();
      setVouchers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidForm = () => {
    if (!form.code || !form.type || !form.valid_until) return false;
    if (!form.discount_percentage && !form.discount_amount) return false;
    return true;
  };

  const handleSubmit = async () => {
    if (!isValidForm()) {
      addToast({
        title: "Validation Error",
        description: "Please fill out required fields.",
        variant: "bordered",
        color: "danger",
      });
      return;
    }

    try {
      if (selectedVoucher) {
        await updateVoucher(selectedVoucher.id, form);
        addToast({
          title: "Voucher Updated",
          description: `Voucher ${form.code} updated successfully!`,
          variant: "bordered",
          color: "success",
        });
      } else {
        await createVoucher(form);
        addToast({
          title: "Voucher Created",
          description: `Voucher ${form.code} created successfully!`,
          variant: "bordered",
          color: "success",
        });
      }
      onOpenChange();
      fetchVouchers();
      resetForm();
    } catch (e) {
      addToast({
        title: "Error",
        description: "Something went wrong while saving the voucher.",
        variant: "bordered",
        color: "danger",
      });
    }
  };

  const resetForm = () => {
    setSelectedVoucher(null);
    setForm({
      type: "",
      code: "",
      discount_percentage: "",
      discount_amount: "",
      minimum_order: "",
      max_uses: "",
      valid_until: "",
    });
  };

  const handleEdit = (voucher) => {
    setSelectedVoucher(voucher);
    setForm({
        type: voucher.type || "",
        code: voucher.code || "",
        discount_percentage: voucher.discount_percentage?.toString() || "",
        discount_amount: voucher.discount_amount?.toString() || "",
        minimum_order: voucher.minimum_order?.toString() || "",
        max_uses: voucher.max_uses?.toString() || "",
        valid_until: voucher.valid_until?.split("T")[0] || "",
      });
          onOpen();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    await deleteVoucher(id);
    fetchVouchers();
    addToast({
      title: "Voucher Deleted",
      description: "The voucher has been removed.",
      variant: "bordered",
      color: "success",
    });
  };

  const filtered = vouchers.filter((v) =>
    v.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Voucher Management</h1>
        <p className="text-sm text-gray-500">Manage your store promo vouchers.</p>
      </div>

      <div className="flex justify-between items-center">
        <Input
          placeholder="Search by code..."
          className="w-full max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          className="bg-foreground text-background"
          endContent={<Plus size={16} />}
          onPress={() => {
            resetForm();
            onOpen();
          }}
        >
          Add Voucher
        </Button>
      </div>

      <Table aria-label="Vouchers Table">
        <TableHeader>
          <TableColumn>Code</TableColumn>
          <TableColumn>Type</TableColumn>
          <TableColumn>Discount</TableColumn>
          <TableColumn>Min Order</TableColumn>
          <TableColumn>Max Uses</TableColumn>
     
          <TableColumn>Valid Until</TableColumn>
          <TableColumn>Actions</TableColumn>
        </TableHeader>
        <TableBody isLoading={loading} items={filtered} emptyContent="No vouchers found">
          {(item) => (
            <TableRow key={item.id}>
              <TableCell>{item.code}</TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>
                {item.discount_percentage
                  ? `${item.discount_percentage}%`
                  : `₱${item.discount_amount}`}
              </TableCell>
              <TableCell>₱{item.minimum_order}</TableCell>
              <TableCell className="w-[140px]">
  <div className="flex flex-col gap-1">
    <Chip
      size="sm"
      variant="flat"
      className="font-semibold w-fit"
      color={
        item.usage_count >= item.max_uses
          ? "danger"
          : item.usage_count > 0
          ? "warning"
          : "success"
      }
    >
      {item.usage_count} / {item.max_uses}
    </Chip>
    <div className="h-2 w-full bg-default-200 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${
          item.usage_count >= item.max_uses
            ? "bg-danger"
            : item.usage_count > 0
            ? "bg-warning"
            : "bg-success"
        }`}
        style={{
          width: `${Math.min(
            (item.usage_count / item.max_uses) * 100,
            100
          )}%`,
        }}
      />
    </div>
  </div>
</TableCell>


              <TableCell>{new Date(item.valid_until).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="solid" onPress={() => handleEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="solid" color="danger" onPress={() => handleDelete(item.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{selectedVoucher ? "Edit Voucher" : "New Voucher"}</ModalHeader>
              <ModalBody className="grid grid-cols-2 gap-3">
  <Input
    isRequired
    label="Code"
    name="code"
    value={form.code}
    onChange={handleChange}
    errorMessage={!form.code && "Code is required"}
    isInvalid={!form.code}
  />

  <Select
    isRequired
    label="Type"
    name="type"
    selectedKeys={form.type ? [form.type] : []}
    onChange={(e) => setForm({ ...form, type: e.target.value })}
    errorMessage={!form.type && "Type is required"}
    isInvalid={!form.type}
  >
    <SelectItem key="shipping">Shipping</SelectItem>
    <SelectItem key="discount">Discount</SelectItem>
    <SelectItem key="special">Special</SelectItem>
  </Select>

  <Input
  label="Discount %"
  name="discount_percentage"
  type="number"
  value={form.discount_percentage}
  onChange={(e) => {
    setForm({
      ...form,
      discount_percentage: e.target.value,
      discount_amount: "", // Clear ₱ if % is being used
    });
  }}
  isDisabled={!!form.discount_amount}
/>

<Input
  label="Discount ₱"
  name="discount_amount"
  type="number"
  value={form.discount_amount}
  onChange={(e) => {
    setForm({
      ...form,
      discount_amount: e.target.value,
      discount_percentage: "", // Clear % if ₱ is being used
    });
  }}
  isDisabled={!!form.discount_percentage}
/>

  <Input
    label="Minimum Order"
    name="minimum_order"
    type="number"
    value={form.minimum_order}
    onChange={handleChange}
  />
  <Input
    label="Max Uses"
    name="max_uses"
    type="number"
    value={form.max_uses}
    onChange={handleChange}
  />
  <Input
    isRequired
    label="Valid Until"
    type="date"
    name="valid_until"
    value={form.valid_until}
    onChange={handleChange}
    errorMessage={!form.valid_until && "Valid until date is required"}
    isInvalid={!form.valid_until}
  />
</ModalBody>

              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={handleSubmit}>
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default VouchersPage;

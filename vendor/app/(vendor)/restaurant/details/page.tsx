"use client";

import { useEffect, useState, useRef } from "react";
import { Tabs, Tab, Card, CardBody, Button } from "@heroui/react";
import Image from "next/image";
import { addToast } from "@heroui/toast";
import { RestaurantService } from "@/services/restaurantService";
import { useVendorAuth } from "@/context/AuthContext";

import RestaurantBasicInfo from "@/components/restaurantDetails/RestaurantBasicInfo";
import RestaurantLocationForm from "@/components/restaurantDetails/RestaurantLocationForm";
import RestaurantHoursForm from "@/components/restaurantDetails/RestaurantHoursForm";
import RestaurantSettingsForm from "@/components/restaurantDetails/RestaurantSettingsForm";

const IMAGE_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/storage/`;

export default function RestaurantDetailsPage() {
  const { vendor } = useVendorAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [originalRestaurant, setOriginalRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await RestaurantService.getRestaurantDetails();
        setRestaurant(res);
        setOriginalRestaurant(res);
        setLogoPreview(res.logo ? IMAGE_BASE_URL + res.logo : null);
        setBannerPreview(res.banner_image ? IMAGE_BASE_URL + res.banner_image : null);
      } catch {
        addToast({ title: "Error", description: "Failed to fetch restaurant data.", color: "danger" });
      }

      try {
        const cats = await RestaurantService.getCategories();
        setCategories(cats);
      } catch {
        addToast({ title: "Error", description: "Failed to fetch categories.", color: "danger" });
      }
    };

    if (vendor) fetchData();
  }, [vendor]);

  const handleChange = (key: string, value: any) => {
    setRestaurant((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "banner") => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (type === "logo") {
        setLogoFile(file);
        setLogoPreview(previewUrl);
      } else {
        setBannerFile(file);
        setBannerPreview(previewUrl);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    setIsSaving(true);

    try {
      await RestaurantService.updateRestaurantDetails(restaurant, logoFile, bannerFile);

      const updated = await RestaurantService.getRestaurantDetails();
      const updatedCategories = await RestaurantService.getCategories();

      setRestaurant(updated);
      setOriginalRestaurant(updated);
      setCategories(updatedCategories);
      setIsEditing(false);

      addToast({ title: "Restaurant Updated", description: "Your changes were saved.", color: "success" });
    } catch {
      addToast({ title: "Update Failed", description: "Could not save changes.", color: "danger" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setRestaurant(originalRestaurant);
    setLogoPreview(originalRestaurant?.logo ? IMAGE_BASE_URL + originalRestaurant.logo : null);
    setBannerPreview(originalRestaurant?.banner_image ? IMAGE_BASE_URL + originalRestaurant.banner_image : null);
    setLogoFile(null);
    setBannerFile(null);
    setIsEditing(false);
  };

  const handleAccountDeletion = async () => {
    console.log("🚨 Placeholder: account deletion trigger here.");
    addToast({ title: "Feature Coming Soon", description: "Account deletion logic will be added.", color: "warning" });
  };

  const handleViewPublicProfile = () => {
    if (restaurant?.slug) {
      window.open(`/restaurants/${restaurant.slug}`, "_blank");
    }
  };

  if (!restaurant) {
    return <p className="p-6 text-center text-gray-500">Loading restaurant info...</p>;
  }

  return (
    <form onSubmit={handleSave} className="p-6 mx-auto  space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Restaurant Details</h1>
          <p className="text-gray-500">Manage your restaurant profile</p>
        </div>
        {isEditing ? (
          <div className="flex gap-3">
            <Button type="button" variant="bordered" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" color="primary" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(true)} color="primary" startContent="✏️">
            Edit Details
          </Button>
        )}
      </div>

      {/* Banner */}
      <div className="relative bg-gray-100 border rounded-xl h-64 flex items-center justify-center overflow-hidden">
        {bannerPreview ? (
          <Image src={bannerPreview} alt="Banner" layout="fill" objectFit="cover" />
        ) : (
          <div className="text-gray-400">No banner uploaded</div>
        )}
        {isEditing && (
          <div className="absolute bottom-4 right-4">
            <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "banner")} className="hidden" ref={bannerInputRef} />
            <Button size="sm" onPress={() => bannerInputRef.current?.click()} className="bg-black/70 text-white">
              Change Banner
            </Button>
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div className="relative w-28 h-28">
          <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, "logo")} className="hidden" ref={logoInputRef} />
          <div
            onClick={() => isEditing && logoInputRef.current?.click()}
            className={`w-28 h-28 bg-gray-200 rounded-full overflow-hidden cursor-pointer shadow-md border-4 border-white relative ${
              isEditing ? "hover:opacity-80" : "cursor-default"
            }`}
          >
            {logoPreview ? (
              <Image src={logoPreview} alt="Logo" width={112} height={112} className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
            )}
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-white text-xl">📷</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <h2 className="text-xl font-bold">{restaurant.name}</h2>
          <p className="text-sm text-gray-600">{restaurant.address}</p>
          <p className="text-sm text-gray-600">{restaurant.phone_number}</p>
          <p className="text-sm text-gray-600">Service: {restaurant.service_type}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs aria-label="Restaurant Tabs" className="w-full">
        <Tab key="basic" title="Basic Info">
          <Card>
            <CardBody>
              <RestaurantBasicInfo isEditing={isEditing} restaurant={restaurant} categories={categories} onChange={handleChange} />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="location" title="Location">
          <Card>
            <CardBody>
              <RestaurantLocationForm isEditing={isEditing} restaurant={restaurant} onChange={handleChange} />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="hours" title="Business Hours">
          <Card>
            <CardBody>
              <RestaurantHoursForm isEditing={isEditing} restaurant={restaurant} onChange={handleChange} setRestaurant={setRestaurant} />
            </CardBody>
          </Card>
        </Tab>
        <Tab key="settings" title="Settings">
          <Card>
            <CardBody>
              <RestaurantSettingsForm isEditing={isEditing} restaurant={restaurant} onChange={handleChange} />
            </CardBody>
          </Card>
        </Tab>
      </Tabs>

      {/* Footer Section (Additional Info) */}
      <Card>
  <CardBody className="space-y-4 p-6">
    {/* Section Title */}
    <h2 className="text-lg font-semibold">Additional Information</h2>

    {/* Metadata */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <p className="text-sm text-gray-500">Restaurant ID</p>
        <p className="font-semibold">{restaurant.id}</p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Created On</p>
        <p className="font-semibold">
          {new Date(restaurant.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div>
        <p className="text-sm text-gray-500">Last Updated</p>
        <p className="font-semibold">
          {new Date(restaurant.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>

    {/* Footer Buttons */}
    {/* <div className="flex justify-between items-center pt-4 border-t border-gray-200">
      <Button color="danger" variant="bordered" onPress={handleAccountDeletion}>
        Request Account Deletion
      </Button>
      <Button color="primary" variant="bordered" onPress={handleViewPublicProfile}>
        View Public Profile
      </Button>
    </div> */}
  </CardBody>
</Card>

    </form>
  );
}

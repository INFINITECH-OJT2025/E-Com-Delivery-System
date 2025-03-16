import Sidebar from "@/components/sidebar";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
     
      <div className="flex-1 bg-gray-100 p-6">{children}</div>
    </div>
  );
}

import { User } from "lucide-react";

export default function VendorAvatarPlaceholder({ size = 24 }: { size?: number }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-brand/60">
      <User size={size} className="text-white" fill="white" strokeWidth={0} />
    </div>
  );
}

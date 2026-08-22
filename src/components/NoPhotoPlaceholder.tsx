import { ImageOff } from "lucide-react";

export default function NoPhotoPlaceholder({ size = 28 }: { size?: number }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#E8E8E8]">
      <ImageOff size={size} className="text-[#B5B5B5]" strokeWidth={1.5} />
    </div>
  );
}

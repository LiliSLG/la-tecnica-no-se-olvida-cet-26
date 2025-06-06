import { Upload } from "lucide-react";
import { Button } from "./button";
import Image from "next/image";

interface FileUploadProps {
  value?: string;
  onChange: (file: File) => void;
  disabled?: boolean;
}

export function FileUpload({ value, onChange, disabled }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20">
        {value ? (
          <Image
            src={value}
            alt="Upload"
            fill
            className="rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed">
            <Upload className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          {value ? "Cambiar imagen" : "Subir imagen"}
        </Button>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
} 
import { useState } from "react";

export default function useImageUpload() {
  const [selectedFile, setSelectedFile] = useState<string>("");

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      console.log("No Files Provided to onSelectFile \n aborting.....");
      return;
    }

    const file = event.target.files[0];

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target?.result as string);
    };
    
  };

  return {
    selectedFile,
    onSelectFile,
  };
}

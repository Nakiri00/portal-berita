import Cropper from 'react-easy-crop';
import { useState } from 'react';
import { Button } from './ui/button';

interface Props {
  image: string;
  onCancel: () => void;
  onCropComplete: (file: File) => void;
}

export function CropAvatarModal({ image, onCancel, onCropComplete }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onComplete = (_: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  };

  const createCroppedImage = async () => {
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.src = image;

    await new Promise(resolve => (img.onload = resolve));

    const size = 300; // avatar 1:1
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      size,
      size
    );

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      onCropComplete(file);
    }, 'image/jpeg');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md p-4">
        <div className="relative h-64 w-full bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onComplete}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button onClick={createCroppedImage}>
            Gunakan
          </Button>
        </div>
      </div>
    </div>
  );
}

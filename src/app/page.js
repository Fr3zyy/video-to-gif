import VideoToGifConverter from '@/components/VideoToGifConverter.js';

export default function ConvertPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Video to GIF Converter</h1>
      <VideoToGifConverter />
    </div>
  );
}
import { EventAssetGenerator } from "@/components/event-asset-generator";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        <EventAssetGenerator />
      </div>
    </main>
  );
}


import { InfoNotice } from "@/components/InfoNotice";

// Standard content page: centred column with the "information, not advice"
// notice on top. The front page lays itself out and places the notice itself.
export function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <InfoNotice />
      {children}
    </div>
  );
}

export const metadata = {
  title: "Editor — Arc chair study — Meshlab",
};

export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="h-[calc(100vh-56px)] flex flex-col bg-[#141414] overflow-hidden"
      style={{ colorScheme: "dark" }}
    >
      {children}
    </div>
  );
}

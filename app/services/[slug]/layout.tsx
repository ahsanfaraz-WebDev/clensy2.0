import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cleaning Service | Clensy",
  description: "Professional cleaning services tailored to your needs.",
};

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

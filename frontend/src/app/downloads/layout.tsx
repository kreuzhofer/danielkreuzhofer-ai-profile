import type { ReactNode } from "react";
import "./downloads.css";

export default function DownloadsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="downloads-page">
      <main className="downloads-container">{children}</main>
    </div>
  );
}

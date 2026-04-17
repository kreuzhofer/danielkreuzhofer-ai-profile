import type { ReactNode } from "react";
import { DownloadButton } from "./DownloadButton";
import "./downloads.css";

export default function DownloadsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="downloads-page">
      <header className="downloads-header">
        <div className="downloads-header-inner">
          <div className="downloads-brand">
            <span className="downloads-brand-name">KI-Coaching mit Kante</span>
            <span className="downloads-brand-author">Daniel Kreuzhofer</span>
          </div>
          <DownloadButton />
        </div>
      </header>
      <main className="downloads-container">{children}</main>
    </div>
  );
}

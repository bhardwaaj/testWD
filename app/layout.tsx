import "./globals.css";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black">
        <Providers>
          <div className="flex min-h-screen flex-col">
            {props.children}
          </div>
        </Providers>
      </body>
    </html>
  );
}


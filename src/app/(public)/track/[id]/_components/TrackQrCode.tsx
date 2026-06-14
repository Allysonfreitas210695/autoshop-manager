"use client";

import { QRCodeSVG } from "qrcode.react";

interface TrackQrCodeProps {
  orderId: string;
}

export function TrackQrCode({ orderId }: TrackQrCodeProps) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== "undefined" ? window.location.origin : "");
  const value = `${baseUrl}/track/${orderId}`;

  return (
    <div className="mx-auto mb-4 flex items-center justify-center">
      <QRCodeSVG
        value={value}
        size={160}
        level="M"
        bgColor="transparent"
        fgColor="currentColor"
      />
    </div>
  );
}

"use client";

import { QRCodeSVG } from "qrcode.react";

type Props = {
  value: string;
  size?: number;
};

export function QrCodePix({ value, size = 80 }: Props) {
  return <QRCodeSVG value={value} size={size} />;
}

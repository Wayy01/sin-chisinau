import "server-only";
import QRCode from "qrcode";

export function memberPayload(code: string) {
  return `SIN:M:${code}`;
}

export function voucherPayload(code: string) {
  return `SIN:R:${code}`;
}

export async function qrSvg(text: string, dark = "#21150e") {
  return QRCode.toString(text, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark, light: "#00000000" },
  });
}

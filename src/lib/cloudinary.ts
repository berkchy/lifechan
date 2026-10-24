import crypto from "node:crypto";

type UploadResult = { url: string; thumbnailUrl: string; width?: number; height?: number };

export async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<UploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error("Cloudinary not configured");

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "lifechan";
  const params: Record<string, string | number> = { folder, timestamp };
  const signatureBase = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&") + apiSecret;
  const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(buffer)]), filename);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }
  const data = (await res.json()) as { secure_url: string; public_id: string; width?: number; height?: number };
  const thumbnailUrl = data.secure_url.replace("/upload/", "/upload/w_400,h_400,c_fill/");
  return { url: data.secure_url, thumbnailUrl, width: data.width, height: data.height };
}

export async function sendVerificationEmail(to: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify?token=${token}`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Lifechan <onboarding@resend.dev>",
      to,
      subject: "Verify your email",
      html: `<p>Click to verify: <a href="${url}">${url}</a></p>`,
    }),
  });
}

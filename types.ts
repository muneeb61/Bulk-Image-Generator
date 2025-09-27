export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

export interface GeneratedImageSet {
  prompt: string;
  images: string[]; // Array of base64 data URLs
}

import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  deviceFingerprint: z.string().min(1).max(256),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const postSchema = z.object({
  title: z.string().min(1).max(200),
  tags: z.array(z.string().min(1).max(32)).max(10).default([]),
});

export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional().nullable(),
});

export const profileSchema = z.object({
  isPrivate: z.boolean().optional(),
});

import { z } from 'zod';

// Схема для создания заметки
export const createNoteSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  content: z.string()
    .min(1, 'Content is required')
    .max(5000, 'Content must be less than 5000 characters')
    .trim()
});

// Схема для обновления заметки
export const updateNoteSchema = z.object({
  title: z.string()
    .min(1, 'Title cannot be empty')
    .max(100, 'Title must be less than 100 characters')
    .trim()
    .optional(),
  content: z.string()
    .min(1, 'Content cannot be empty')
    .max(5000, 'Content must be less than 5000 characters')
    .trim()
    .optional()
}).refine(data => data.title !== undefined || data.content !== undefined, {
  message: 'At least one field (title or content) must be provided'
});

// Типы из схем
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
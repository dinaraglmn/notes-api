// Тип для заметки
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Тип для создания заметки (без id и дат)
export interface CreateNoteDto {
  title: string;
  content: string;
}

// Тип для обновления заметки (все поля опциональны)
export interface UpdateNoteDto {
  title?: string;
  content?: string;
}
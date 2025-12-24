import express from 'express';
import cors from 'cors';
import { Note } from './types/note';

const app = express();
const PORT = 3000;

// Хранилище заметок (в памяти)
let notes: Note[] = [];
let currentId = 1;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (HTML interface)
app.use(express.static('public'));

// Add this route to redirect to HTML interface
app.get('/demo', (req, res) => {
  res.sendFile('index.html', { root: './public' });
});

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

// Генерация ID
const generateId = (): string => {
  return `note_${currentId++}`;
};

// Валидация создания заметки
const validateCreateNote = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!data.content || data.content.trim().length === 0) {
    errors.push('Content is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ========== МАРШРУТЫ API ==========

// 1. Получить все заметки
app.get('/api/notes', (req, res) => {
  res.json({
    success: true,
    data: notes,
    count: notes.length
  });
});

// 2. Получить одну заметку по ID
app.get('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const note = notes.find(n => n.id === id);
  
  if (!note) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }
  
  res.json({
    success: true,
    data: note
  });
});

// 3. Создать новую заметку
app.post('/api/notes', (req, res) => {
  const data: any = req.body;
  
  // Валидация
  const validation = validateCreateNote(data);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      errors: validation.errors
    });
  }
  
  // Создание заметки
  const now = new Date();
  const newNote: Note = {
    id: generateId(),
    title: data.title.trim(),
    content: data.content.trim(),
    createdAt: now,
    updatedAt: now
  };
  
  notes.push(newNote);
  
  res.status(201).json({
    success: true,
    data: newNote,
    message: 'Note created successfully'
  });
});

// 4. Обновить заметку
app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const data: any = req.body;
  
  // Найти заметку
  const noteIndex = notes.findIndex(n => n.id === id);
  if (noteIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }
  
  // Обновить только переданные поля
  const updatedNote = {
    ...notes[noteIndex],
    ...data,
    updatedAt: new Date()
  };
  
  // Обрезать пробелы если есть новые значения
  if (data.title !== undefined) {
    updatedNote.title = data.title.trim();
  }
  if (data.content !== undefined) {
    updatedNote.content = data.content.trim();
  }
  
  // Проверить что не пустые
  if (updatedNote.title.length === 0 || updatedNote.content.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Title and content cannot be empty'
    });
  }
  
  notes[noteIndex] = updatedNote;
  
  res.json({
    success: true,
    data: updatedNote,
    message: 'Note updated successfully'
  });
});

// 5. Удалить заметку
app.delete('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  
  const noteIndex = notes.findIndex(n => n.id === id);
  if (noteIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Note not found'
    });
  }
  
  // Удалить заметку
  const deletedNote = notes.splice(noteIndex, 1)[0];
  
  res.json({
    success: true,
    data: deletedNote,
    message: 'Note deleted successfully'
  });
});

// 6. Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    notesCount: notes.length
  });
});

// 7. Главная страница
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Notes API работает! 🎉',
    version: '1.0.0',
    endpoints: {
      'GET /api/notes': 'Get all notes',
      'GET /api/notes/:id': 'Get one note',
      'POST /api/notes': 'Create note',
      'PUT /api/notes/:id': 'Update note',
      'DELETE /api/notes/:id': 'Delete note',
      'GET /api/health': 'Health check'
    }
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
  console.log(`📚 Документация: http://localhost:3000/`);
});
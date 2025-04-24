import { 
  users, folders, notes, labels, noteLabels,
  type User, type InsertUser, 
  type Folder, type InsertFolder,
  type Note, type InsertNote,
  type Label, type InsertLabel
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, inArray } from "drizzle-orm";

// Extended storage interface for our notes application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Folder methods
  getFolders(): Promise<Folder[]>;
  getFolder(id: number): Promise<Folder | undefined>;
  createFolder(folder: InsertFolder): Promise<Folder>;
  updateFolder(id: number, folder: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<boolean>;
  
  // Note methods
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: number): Promise<boolean>;
  
  // Label methods
  getLabels(): Promise<Label[]>;
  getLabel(id: number): Promise<Label | undefined>;
  createLabel(label: InsertLabel): Promise<Label>;
  updateLabel(id: number, label: Partial<InsertLabel>): Promise<Label | undefined>;
  deleteLabel(id: number): Promise<boolean>;
  
  // Note-Label relationship methods
  addLabelToNote(noteId: number, labelId: number): Promise<boolean>;
  removeLabelFromNote(noteId: number, labelId: number): Promise<boolean>;
  getLabelsForNote(noteId: number): Promise<Label[]>;
  getNotesWithLabel(labelId: number): Promise<Note[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  // Folder methods
  async getFolders(): Promise<Folder[]> {
    return await db.select().from(folders);
  }
  
  async getFolder(id: number): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder;
  }
  
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [newFolder] = await db
      .insert(folders)
      .values(folder)
      .returning();
    return newFolder;
  }
  
  async updateFolder(id: number, folderData: Partial<InsertFolder>): Promise<Folder | undefined> {
    const [updatedFolder] = await db
      .update(folders)
      .set({
        ...folderData,
        updatedAt: new Date()
      })
      .where(eq(folders.id, id))
      .returning();
    return updatedFolder;
  }
  
  async deleteFolder(id: number): Promise<boolean> {
    // First mark all notes in this folder as trashed
    await db
      .update(notes)
      .set({
        isTrashed: true,
        updatedAt: new Date()
      })
      .where(eq(notes.folderId, id));
      
    // Then delete the folder
    const result = await db
      .delete(folders)
      .where(eq(folders.id, id))
      .returning({ id: folders.id });
      
    return result.length > 0;
  }
  
  // Note methods
  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes);
  }
  
  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }
  
  async createNote(noteData: InsertNote): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values(noteData)
      .returning();
    return newNote;
  }
  
  async updateNote(id: number, noteData: Partial<InsertNote>): Promise<Note | undefined> {
    const [updatedNote] = await db
      .update(notes)
      .set({
        ...noteData,
        updatedAt: new Date()
      })
      .where(eq(notes.id, id))
      .returning();
    return updatedNote;
  }
  
  async deleteNote(id: number): Promise<boolean> {
    // First delete all note-label relationships
    await db
      .delete(noteLabels)
      .where(eq(noteLabels.noteId, id));
      
    // Then delete the note
    const result = await db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning({ id: notes.id });
      
    return result.length > 0;
  }
  
  // Label methods
  async getLabels(): Promise<Label[]> {
    return await db.select().from(labels);
  }
  
  async getLabel(id: number): Promise<Label | undefined> {
    const [label] = await db.select().from(labels).where(eq(labels.id, id));
    return label;
  }
  
  async createLabel(labelData: InsertLabel): Promise<Label> {
    const [newLabel] = await db
      .insert(labels)
      .values(labelData)
      .returning();
    return newLabel;
  }
  
  async updateLabel(id: number, labelData: Partial<InsertLabel>): Promise<Label | undefined> {
    const [updatedLabel] = await db
      .update(labels)
      .set(labelData)
      .where(eq(labels.id, id))
      .returning();
    return updatedLabel;
  }
  
  async deleteLabel(id: number): Promise<boolean> {
    // First delete all note-label relationships
    await db
      .delete(noteLabels)
      .where(eq(noteLabels.labelId, id));
      
    // Then delete the label
    const result = await db
      .delete(labels)
      .where(eq(labels.id, id))
      .returning({ id: labels.id });
      
    return result.length > 0;
  }
  
  // Note-Label relationship methods
  async addLabelToNote(noteId: number, labelId: number): Promise<boolean> {
    try {
      await db
        .insert(noteLabels)
        .values({ noteId, labelId })
        .onConflictDoNothing();
      return true;
    } catch (error) {
      console.error("Error adding label to note:", error);
      return false;
    }
  }
  
  async removeLabelFromNote(noteId: number, labelId: number): Promise<boolean> {
    const result = await db
      .delete(noteLabels)
      .where(
        and(
          eq(noteLabels.noteId, noteId),
          eq(noteLabels.labelId, labelId)
        )
      )
      .returning({ noteId: noteLabels.noteId });
      
    return result.length > 0;
  }
  
  async getLabelsForNote(noteId: number): Promise<Label[]> {
    // Find all label IDs for this note
    const relations = await db
      .select()
      .from(noteLabels)
      .where(eq(noteLabels.noteId, noteId));
      
    if (relations.length === 0) {
      return [];
    }
    
    // Get all labels with these IDs
    const labelIds = relations.map(rel => rel.labelId);
    return await db
      .select()
      .from(labels)
      .where(inArray(labels.id, labelIds));
  }
  
  async getNotesWithLabel(labelId: number): Promise<Note[]> {
    // Find all note IDs with this label
    const relations = await db
      .select()
      .from(noteLabels)
      .where(eq(noteLabels.labelId, labelId));
      
    if (relations.length === 0) {
      return [];
    }
    
    // Get all notes with these IDs
    const noteIds = relations.map(rel => rel.noteId);
    return await db
      .select()
      .from(notes)
      .where(inArray(notes.id, noteIds));
  }
}

export const storage = new DatabaseStorage();

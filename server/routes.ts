import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertNoteSchema, 
  insertFolderSchema, 
  insertLabelSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Notes endpoints
  app.get("/api/notes", async (req, res) => {
    try {
      const notesList = await storage.getNotes();
      
      // For each note, fetch its labels
      const notesWithLabels = await Promise.all(
        notesList.map(async (note) => {
          const labels = await storage.getLabelsForNote(note.id);
          return { ...note, labels };
        })
      );
      
      res.json(notesWithLabels);
    } catch (error) {
      console.error("Error fetching notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const note = await storage.getNote(id);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Get labels for this note
      const labels = await storage.getLabelsForNote(id);
      const noteWithLabels = { ...note, labels };

      res.json(noteWithLabels);
    } catch (error) {
      console.error("Error fetching note:", error);
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  app.post("/api/notes", async (req, res) => {
    try {
      const noteData = insertNoteSchema.parse(req.body);
      const labels = req.body.labels || [];
      
      // Create the note first
      const note = await storage.createNote(noteData);
      
      // Then add the labels to the note
      if (labels.length > 0) {
        for (const labelId of labels) {
          await storage.addLabelToNote(note.id, labelId);
        }
      }
      
      // Fetch the note with its labels
      const noteLabels = await storage.getLabelsForNote(note.id);
      
      res.status(201).json({
        ...note,
        labels: noteLabels
      });
    } catch (error) {
      console.error("Error creating note:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create note" });
    }
  });

  app.put("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const noteData = insertNoteSchema.parse(req.body);
      const labels = req.body.labels || [];
      
      // Update the note
      const updatedNote = await storage.updateNote(id, noteData);
      
      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      // Get current labels for the note
      const currentLabels = await storage.getLabelsForNote(id);
      const currentLabelIds = currentLabels.map(l => l.id);
      
      // Add new labels
      for (const labelId of labels) {
        if (!currentLabelIds.includes(labelId)) {
          await storage.addLabelToNote(id, labelId);
        }
      }
      
      // Remove labels that are no longer associated
      for (const label of currentLabels) {
        if (!labels.includes(label.id)) {
          await storage.removeLabelFromNote(id, label.id);
        }
      }
      
      // Get updated labels
      const updatedLabels = await storage.getLabelsForNote(id);

      res.json({
        ...updatedNote,
        labels: updatedLabels
      });
    } catch (error) {
      console.error("Error updating note:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid note data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }

      const success = await storage.deleteNote(id);
      if (!success) {
        return res.status(404).json({ message: "Note not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });
  
  // Folders endpoints
  app.get("/api/folders", async (req, res) => {
    try {
      const folderList = await storage.getFolders();
      res.json(folderList);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });
  
  app.get("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const folder = await storage.getFolder(id);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      res.json(folder);
    } catch (error) {
      console.error("Error fetching folder:", error);
      res.status(500).json({ message: "Failed to fetch folder" });
    }
  });
  
  app.post("/api/folders", async (req, res) => {
    try {
      const folderData = insertFolderSchema.parse(req.body);
      const folder = await storage.createFolder(folderData);
      res.status(201).json(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create folder" });
    }
  });
  
  app.put("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const folderData = insertFolderSchema.parse(req.body);
      const updatedFolder = await storage.updateFolder(id, folderData);
      
      if (!updatedFolder) {
        return res.status(404).json({ message: "Folder not found" });
      }

      res.json(updatedFolder);
    } catch (error) {
      console.error("Error updating folder:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid folder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update folder" });
    }
  });
  
  app.delete("/api/folders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid folder ID" });
      }

      const success = await storage.deleteFolder(id);
      if (!success) {
        return res.status(404).json({ message: "Folder not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });
  
  // Labels endpoints
  app.get("/api/labels", async (req, res) => {
    try {
      const labelList = await storage.getLabels();
      res.json(labelList);
    } catch (error) {
      console.error("Error fetching labels:", error);
      res.status(500).json({ message: "Failed to fetch labels" });
    }
  });
  
  app.get("/api/labels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid label ID" });
      }

      const label = await storage.getLabel(id);
      if (!label) {
        return res.status(404).json({ message: "Label not found" });
      }

      res.json(label);
    } catch (error) {
      console.error("Error fetching label:", error);
      res.status(500).json({ message: "Failed to fetch label" });
    }
  });
  
  app.post("/api/labels", async (req, res) => {
    try {
      const labelData = insertLabelSchema.parse(req.body);
      const label = await storage.createLabel(labelData);
      res.status(201).json(label);
    } catch (error) {
      console.error("Error creating label:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid label data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create label" });
    }
  });
  
  app.put("/api/labels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid label ID" });
      }

      const labelData = insertLabelSchema.parse(req.body);
      const updatedLabel = await storage.updateLabel(id, labelData);
      
      if (!updatedLabel) {
        return res.status(404).json({ message: "Label not found" });
      }

      res.json(updatedLabel);
    } catch (error) {
      console.error("Error updating label:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid label data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update label" });
    }
  });
  
  app.delete("/api/labels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid label ID" });
      }

      const success = await storage.deleteLabel(id);
      if (!success) {
        return res.status(404).json({ message: "Label not found" });
      }

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting label:", error);
      res.status(500).json({ message: "Failed to delete label" });
    }
  });
  
  // Note-Label relationship endpoints
  app.get("/api/notes/:noteId/labels", async (req, res) => {
    try {
      const noteId = parseInt(req.params.noteId);
      if (isNaN(noteId)) {
        return res.status(400).json({ message: "Invalid note ID" });
      }
      
      const labels = await storage.getLabelsForNote(noteId);
      res.json(labels);
    } catch (error) {
      console.error("Error fetching labels for note:", error);
      res.status(500).json({ message: "Failed to fetch labels for note" });
    }
  });
  
  app.post("/api/notes/:noteId/labels/:labelId", async (req, res) => {
    try {
      const noteId = parseInt(req.params.noteId);
      const labelId = parseInt(req.params.labelId);
      
      if (isNaN(noteId) || isNaN(labelId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }
      
      const success = await storage.addLabelToNote(noteId, labelId);
      if (!success) {
        return res.status(404).json({ message: "Note or label not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error adding label to note:", error);
      res.status(500).json({ message: "Failed to add label to note" });
    }
  });
  
  app.delete("/api/notes/:noteId/labels/:labelId", async (req, res) => {
    try {
      const noteId = parseInt(req.params.noteId);
      const labelId = parseInt(req.params.labelId);
      
      if (isNaN(noteId) || isNaN(labelId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }
      
      const success = await storage.removeLabelFromNote(noteId, labelId);
      if (!success) {
        return res.status(404).json({ message: "Relationship not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error removing label from note:", error);
      res.status(500).json({ message: "Failed to remove label from note" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

"use client";

import React, { useState, useCallback } from "react";
import { TaskCreate, TaskUpdate } from "@/types/task";

interface TaskFormProps {
  task?: { title: string; description?: string };
  isEditing?: boolean;
  onSubmit: (task: TaskCreate | TaskUpdate) => Promise<void>;
}

export default function TaskForm({ task, isEditing = false, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [titleError, setTitleError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(() => {
    if (!title.trim()) {
      setTitleError("Title is required");
      return false;
    }
    if (title.length > 255) {
      setTitleError("Title must be 255 characters or less");
      return false;
    }
    if (description.length > 2000) {
      return false;
    }
    setTitleError("");
    return true;
  }, [title, description]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description || undefined });
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, title, description, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError && e.target.value.trim()) setTitleError("");
          }}
          className={`w-full px-3 py-2 border ${titleError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-2 focus:ring-blue-500`}
          placeholder="Enter task title..."
        />
        {titleError && <span data-testid="title-error" className="text-sm text-red-600">{titleError}</span>}
        <span className={`text-xs ml-auto ${title.length > 245 ? 'text-red-600' : 'text-gray-500'}`}>{title.length}/255</span>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task description (optional)..."
        />
        {description.length > 2000 && (
          <span data-testid="description-error" className="text-sm text-red-600 block">
            Description must be 2000 characters or less
          </span>
        )}
        <span className={`text-xs ${description.length > 1900 ? 'text-red-600' : 'text-gray-500'}`}>{description.length}/2000</span>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting || !!titleError}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            !isSubmitting && !titleError ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'
          }`}
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}

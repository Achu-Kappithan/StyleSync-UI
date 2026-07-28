import React, { useState } from 'react';
import './AddEditCategoryModal.css';

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: { name: string; subCategories?: string[] }) => Promise<void>;
}

export const AddEditCategoryModal: React.FC<AddEditCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [subCatInput, setSubCatInput] = useState('');
  const [subCategories, setSubCategories] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSubCat = () => {
    if (subCatInput.trim() && !subCategories.includes(subCatInput.trim())) {
      setSubCategories((prev) => [...prev, subCatInput.trim()]);
      setSubCatInput('');
    }
  };

  const handleRemoveSubCat = (catToRemove: string) => {
    setSubCategories((prev) => prev.filter((c) => c !== catToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Category Name is required.');
      return;
    }

    try {
      setSubmitting(true);
      await onSuccess({ name: name.trim(), subCategories });
      setName('');
      setSubCategories([]);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="srv-modal-backdrop" onClick={onClose}>
      <div className="srv-modal" onClick={(e) => e.stopPropagation()}>
        <div className="srv-modal__header">
          <div>
            <h3>Add Service Category</h3>
            <p>Create a main category and optional sub-categories</p>
          </div>
          <button type="button" className="srv-modal__close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && (
          <div className="srv-modal__error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="srv-modal__body">
          <div className="srv-form-group">
            <label>Category Name <span className="srv-req">*</span></label>
            <input
              type="text"
              placeholder="e.g. Hair Care, Skin & Facial, Nail Care"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="srv-form-group">
            <label>Sub-Categories (Optional)</label>
            <div className="srv-tag-input-row">
              <input
                type="text"
                placeholder="e.g. Haircuts, Hair Spa, Hair Color"
                value={subCatInput}
                onChange={(e) => setSubCatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubCat();
                  }
                }}
                disabled={submitting}
              />
              <button type="button" className="srv-btn-add-tag" onClick={handleAddSubCat}>
                + Add
              </button>
            </div>
            {subCategories.length > 0 && (
              <div className="srv-tags-container">
                {subCategories.map((subCat) => (
                  <span key={subCat} className="srv-tag">
                    {subCat}
                    <button type="button" onClick={() => handleRemoveSubCat(subCat)}>
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="srv-modal__footer">
            <button type="button" className="srv-btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="srv-btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

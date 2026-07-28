import React, { useState } from 'react';
import { useServices } from '../hooks/use-services';
import { ServiceCategory } from '../types/service.types';
import { AddEditCategoryModal } from '../components/AddEditCategoryModal';
import { serviceCatalogService } from '../services/service-catalog-service';
import './CategoriesPage.css';

export const CategoriesPage: React.FC = () => {
  const { categories, allServices, refetch, addCategory } = useServices();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = categories.filter((c) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase().trim();
    const matchName = c.name.toLowerCase().includes(term);
    const matchSub = c.subCategories?.some((s) => s.toLowerCase().includes(term));
    return matchName || matchSub;
  });

  const totalSubCategories = categories.reduce((sum, c) => sum + (c.subCategories?.length || 0), 0);

  const handleEdit = (category: ServiceCategory) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to deactivate category '${name}'?`)) return;
    try {
      await serviceCatalogService.deleteCategory(id);
      await refetch();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not delete category');
    }
  };

  return (
    <div className="cat-page">
      {/* Top Header */}
      <div className="cat-header">
        <div>
          <div className="cat-badge-title">📁 CATALOGUE HIERARCHY MASTER</div>
          <h2>Service Categories</h2>
          <p>Organize master service categories, sub-category tags, and display priority</p>
        </div>
        <button
          type="button"
          className="srv-btn srv-btn--primary"
          onClick={() => {
            setEditingCategory(null);
            setIsModalOpen(true);
          }}
        >
          + Add New Category
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="cat-stats-grid">
        <div className="cat-stat-card">
          <div className="cat-stat-icon">📁</div>
          <div>
            <span className="cat-stat-label">Total Categories</span>
            <div className="cat-stat-value">{categories.length}</div>
          </div>
        </div>
        <div className="cat-stat-card">
          <div className="cat-stat-icon">🏷️</div>
          <div>
            <span className="cat-stat-label">Sub-Category Tags</span>
            <div className="cat-stat-value">{totalSubCategories}</div>
          </div>
        </div>
        <div className="cat-stat-card">
          <div className="cat-stat-icon">✂️</div>
          <div>
            <span className="cat-stat-label">Linked Master Services</span>
            <div className="cat-stat-value">{allServices.length}</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="srv-error-banner">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="cat-card">
        <div className="cat-toolbar">
          <div className="cat-search-box">
            <span className="cat-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search categories by name or sub-category tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="cat-search-input"
            />
          </div>
          <span className="cat-count-indicator">Showing {filteredCategories.length} Categories</span>
        </div>

        <div className="srv-table-container">
          <table className="srv-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Sub-Categories</th>
                <th>Linked Services</th>
                <th>Display Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                    <div className="cat-empty">
                      <span>📁</span>
                      <p>No categories found. Click "+ Add New Category" to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const catIdStr = String(cat._id || (cat as any).id);
                  const linkedCount = allServices.filter(
                    (s) => String(s.categoryId) === catIdStr || s.categoryName === cat.name,
                  ).length;
                  return (
                    <tr key={catIdStr}>
                      <td>
                        <strong className="cat-title">{cat.name}</strong>
                      </td>
                      <td>
                        {cat.subCategories && cat.subCategories.length > 0 ? (
                          <div className="cat-sub-tags">
                            {cat.subCategories.map((sub) => (
                              <span key={sub} className="cat-sub-tag">
                                • {sub}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="srv-text-muted">None specified</span>
                        )}
                      </td>
                      <td>
                        <span className="cat-service-count-badge">{linkedCount} Services</span>
                      </td>
                      <td>
                        <span className="cat-priority-badge">Priority #{cat.displayOrder || 1}</span>
                      </td>
                      <td>
                        <span className="cat-status-badge">Active</span>
                      </td>
                      <td>
                        <div className="srv-action-btns">
                          <button
                            type="button"
                            className="srv-action-btn edit"
                            onClick={() => handleEdit(cat)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="srv-action-btn delete"
                            onClick={() => handleDelete(catIdStr, cat.name)}
                          >
                            🗑️ Deactivate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSuccess={async (data) => {
          if (editingCategory) {
            await serviceCatalogService.updateCategory(editingCategory._id || (editingCategory as any).id, data);
          } else {
            await addCategory(data);
          }
          await refetch();
        }}
      />
    </div>
  );
};

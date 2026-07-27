import React, { useState, useEffect } from 'react';
import { Employee, CreateEmployeePayload } from '../types/employee.types';
import { employeeService } from '../services/employee-service';
import './AddEditEmployeeModal.css';

interface AddEditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (employee: Employee) => void;
  initialEmployee?: Employee | null;
}

const ALLOWED_SKILLS = [
  'Haircut & Styling',
  'Hair Coloring & Dye',
  'Balayage & Highlights',
  'Keratin & Smoothing',
  'Manicure & Pedicure',
  'Nail Art & Extensions',
  'Facial & Skin Care',
  'Head Massage & Spa',
  'Threading & Waxing',
  'Bridal Makeup',
];

export const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialEmployee,
}) => {
  const [formData, setFormData] = useState<CreateEmployeePayload>({
    fullName: '',
    phone: '',
    gender: 'Female',
    email: '',
    role: 'SENIOR_STYLIST',
    skills: [],
    workingHours: { start: '09:00', end: '19:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
    joiningDate: new Date().toISOString().slice(0, 10),
  });

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialEmployee) {
      setFormData({
        fullName: initialEmployee.fullName || '',
        phone: initialEmployee.phone || '',
        gender: initialEmployee.gender || 'Female',
        email: initialEmployee.email || '',
        role: initialEmployee.role || 'SENIOR_STYLIST',
        skills: initialEmployee.skills || [],
        workingHours: initialEmployee.workingHours || { start: '09:00', end: '19:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
        joiningDate: initialEmployee.joiningDate ? initialEmployee.joiningDate.split('T')[0] : new Date().toISOString().slice(0, 10),
      });
    } else {
      setFormData({
        fullName: '',
        phone: '',
        gender: 'Female',
        email: '',
        role: 'SENIOR_STYLIST',
        skills: [],
        workingHours: { start: '09:00', end: '19:00', daysOfWeek: [1, 2, 3, 4, 5, 6] },
        joiningDate: new Date().toISOString().slice(0, 10),
      });
    }
    setErrorMessage(null);
  }, [initialEmployee, isOpen]);

  if (!isOpen) return null;

  const handleAddSkill = (skill: string) => {
    if (skill && !formData.skills?.includes(skill)) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), skill],
      }));
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setErrorMessage('Full Name must be at least 2 characters.');
      return;
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone.trim())) {
      setErrorMessage('Phone Number must be exactly 10 digits.');
      return;
    }

    if (!formData.gender) {
      setErrorMessage('Gender selection is required.');
      return;
    }

    try {
      setSubmitting(true);
      let result: Employee;
      if (initialEmployee) {
        result = await employeeService.updateEmployee(initialEmployee.id, formData);
      } else {
        result = await employeeService.createEmployee(formData);
      }
      onSuccess(result);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save staff profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="emp-modal-backdrop">
      <div className="emp-modal">
        <div className="emp-modal__header">
          <div>
            <h3>{initialEmployee ? 'Edit Staff Profile' : 'Onboard New Staff Member'}</h3>
            <p className="emp-modal__subtitle">
              {initialEmployee ? 'Update employee schedule and skills' : 'Register employee profile and working hours'}
            </p>
          </div>
          <button className="emp-modal__close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="emp-modal__form">
          {errorMessage && <div className="emp-modal__alert emp-modal__alert--error">{errorMessage}</div>}

          {/* CORE MANDATORY FIELDS */}
          <div className="emp-modal__section">
            <h4 className="emp-modal__section-title">Core Information</h4>
            <div className="emp-modal__grid">
              <div className="emp-field">
                <label>Full Name <span className="emp-required">*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="emp-field">
                <label>Phone Number (10-Digit) <span className="emp-required">*</span></label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  maxLength={10}
                  disabled={!!initialEmployee}
                  required
                />
              </div>

              <div className="emp-field">
                <label>Gender <span className="emp-required">*</span></label>
                <select
                  value={formData.gender || 'Female'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="emp-field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. staff@stylesync.com"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="emp-field">
                <label>Designation / Role</label>
                <select
                  value={formData.role || 'SENIOR_STYLIST'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="SENIOR_STYLIST">Senior Stylist</option>
                  <option value="HAIR_COLORIST">Hair Colorist</option>
                  <option value="NAIL_ARTIST">Nail Artist</option>
                  <option value="BEAUTICIAN">Beautician</option>
                  <option value="MASSAGE_THERAPIST">Massage Therapist</option>
                  <option value="ASSISTANT">Stylist Assistant</option>
                  <option value="RECEPTIONIST">Front Desk Receptionist</option>
                </select>
              </div>

              <div className="emp-field">
                <label>Joining Date</label>
                <input
                  type="date"
                  value={formData.joiningDate || ''}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* SKILLS MULTI-SELECT DROPDOWN */}
          <div className="emp-modal__section">
            <label className="emp-field__label">Skill Set Tags (Service Allocation)</label>
            <div className="emp-tag-input-row">
              <select
                value=""
                onChange={(e) => handleAddSkill(e.target.value)}
              >
                <option value="">-- Select Skill to Assign --</option>
                {ALLOWED_SKILLS.map((skill) => (
                  <option key={skill} value={skill} disabled={formData.skills?.includes(skill)}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>
            <div className="emp-tags-cloud">
              {formData.skills?.map((s) => (
                <span key={s} className="emp-tag-chip">
                  ✂️ {s}
                  <button type="button" onClick={() => handleRemoveSkill(s)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* WORKING HOURS SHIFT CONFIGURATION */}
          <div className="emp-modal__section">
            <h4 className="emp-modal__section-title">Working Hours & Roster Shift</h4>
            <div className="emp-modal__grid">
              <div className="emp-field">
                <label>Shift Start Time</label>
                <input
                  type="time"
                  value={formData.workingHours?.start || '09:00'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workingHours: {
                        ...(formData.workingHours || { end: '19:00', daysOfWeek: [1, 2, 3, 4, 5, 6] }),
                        start: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="emp-field">
                <label>Shift End Time</label>
                <input
                  type="time"
                  value={formData.workingHours?.end || '19:00'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      workingHours: {
                        ...(formData.workingHours || { start: '09:00', daysOfWeek: [1, 2, 3, 4, 5, 6] }),
                        end: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="emp-modal__footer">
            <button type="button" className="emp-btn emp-btn--outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="emp-btn emp-btn--primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialEmployee ? 'Update Staff Profile' : 'Onboard Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

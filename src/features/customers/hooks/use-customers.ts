import { useState, useCallback, useEffect } from 'react';
import { customerService } from '../services/customer-service';
import {
  Customer,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  CustomerFilterParams,
  PaginatedCustomersResponse,
  CustomerNote,
  CustomerHistoryItem,
  CustomerImageItem,
} from '../types/customer.types';

export function useCustomers(initialParams: CustomerFilterParams = {}) {
  const [params, setParams] = useState<CustomerFilterParams>(initialParams);
  const [data, setData] = useState<PaginatedCustomersResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await customerService.getCustomers(params);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    data,
    loading,
    error,
    params,
    setParams,
    refetch: fetchCustomers,
  };
}

export function useCustomerProfile(customerId: string | undefined) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<CustomerHistoryItem[]>([]);
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loyalty, setLoyalty] = useState<any>(null);
  const [images, setImages] = useState<CustomerImageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!customerId) return;
    try {
      setLoading(true);
      setError(null);
      const [custData, histData, notesData, loyData, imgData] = await Promise.all([
        customerService.getCustomerById(customerId),
        customerService.getCustomerHistory(customerId).catch(() => []),
        customerService.getCustomerNotes(customerId).catch(() => []),
        customerService.getCustomerLoyalty(customerId).catch(() => null),
        customerService.getCustomerImages(customerId).catch(() => []),
      ]);
      setCustomer(custData);
      setHistory(histData);
      setNotes(notesData);
      setLoyalty(loyData);
      setImages(imgData);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer profile');
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const addNote = async (note: string, isMedical?: boolean) => {
    if (!customerId) return;
    const newNote = await customerService.addCustomerNote(customerId, { note, isMedical });
    setNotes((prev) => [newNote, ...prev]);
    // Refresh history
    const histData = await customerService.getCustomerHistory(customerId).catch(() => []);
    setHistory(histData);
  };

  const addImage = async (imageUrl: string, caption?: string) => {
    if (!customerId) return;
    const newImg = await customerService.addCustomerImage(customerId, { imageUrl, caption });
    setImages((prev) => [newImg, ...prev]);
  };

  return {
    customer,
    history,
    notes,
    loyalty,
    images,
    loading,
    error,
    refetch: loadProfile,
    addNote,
    addImage,
  };
}

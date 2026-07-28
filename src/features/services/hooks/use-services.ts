import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ServiceCategory,
  ServiceItem,
  PackageItem,
  MembershipPlan,
  CreateServicePayload,
  CreatePackagePayload,
  CreateMembershipPayload,
} from '../types/service.types';
import { serviceCatalogService } from '../services/service-catalog-service';

export function useServices() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [allServices, setAllServices] = useState<ServiceItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [memberships, setMemberships] = useState<MembershipPlan[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, srvs, pkgs, mems] = await Promise.all([
        serviceCatalogService.getCategories(),
        serviceCatalogService.getServices(), // Fetch all services for complete catalogue
        serviceCatalogService.getPackages(),
        serviceCatalogService.getMemberships(),
      ]);
      setCategories(cats);
      setAllServices(srvs);
      setPackages(pkgs);
      setMemberships(mems);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load catalogue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Derived filtered services list for active view
  const services = useMemo(() => {
    return allServices.filter((s) => {
      // Category filter
      if (selectedCategoryId) {
        const catObj = categories.find((c) => (c._id || (c as any).id) === selectedCategoryId);
        const matchesId = String(s.categoryId) === String(selectedCategoryId);
        const matchesName = catObj && s.categoryName === catObj.name;
        if (!matchesId && !matchesName) return false;
      }

      // Search term filter
      if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = s.name.toLowerCase().includes(term);
        const matchesCat = s.categoryName.toLowerCase().includes(term);
        const matchesSub = s.subCategory ? s.subCategory.toLowerCase().includes(term) : false;
        if (!matchesName && !matchesCat && !matchesSub) return false;
      }

      return true;
    });
  }, [allServices, categories, selectedCategoryId, searchTerm]);

  const addCategory = async (data: { name: string; subCategories?: string[] }) => {
    const newCat = await serviceCatalogService.createCategory(data);
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const addService = async (payload: CreateServicePayload) => {
    const created = await serviceCatalogService.createService(payload);
    setAllServices((prev) => [created, ...prev]);
    return created;
  };

  const updateService = async (id: string, payload: Partial<CreateServicePayload>) => {
    const updated = await serviceCatalogService.updateService(id, payload);
    setAllServices((prev) => prev.map((s) => (s.id === id ? updated : s)));
    return updated;
  };

  const deleteService = async (id: string) => {
    await serviceCatalogService.deleteService(id);
    setAllServices((prev) => prev.filter((s) => s.id !== id));
  };

  const addPackage = async (payload: CreatePackagePayload) => {
    const created = await serviceCatalogService.createPackage(payload);
    setPackages((prev) => [created, ...prev]);
    return created;
  };

  const addMembership = async (payload: CreateMembershipPayload) => {
    const created = await serviceCatalogService.createMembership(payload);
    setMemberships((prev) => [...prev, created]);
    return created;
  };

  return {
    categories,
    allServices,
    services,
    packages,
    memberships,
    selectedCategoryId,
    setSelectedCategoryId,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    refetch: loadAll,
    addCategory,
    addService,
    updateService,
    deleteService,
    addPackage,
    addMembership,
  };
}

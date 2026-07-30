import { useState, useEffect, useCallback, useMemo } from 'react';
import { billingService } from '../services/billing-service';
import {
  Bill,
  CartItem,
  PaymentEntry,
  CreateBillPayload,
  BillQueryParams,
} from '../types/billing.types';
import { Service } from '../../services/types/service.types';
import { Employee } from '../../employees/types/employee.types';

export const useBilling = () => {
  // History state
  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [queryParams, setQueryParams] = useState<BillQueryParams>({ page: 1, limit: 20 });
  const [totalPages, setTotalPages] = useState(1);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('stylesync_checkout_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('stylesync_checkout_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [cart]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | undefined>(undefined);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Modals state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Bill | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Fetch Bills History ──────────────────────────────────────────────────
  const fetchBillsHistory = useCallback(async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const data = await billingService.fetchBills(queryParams);
      setBills(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err: any) {
      setHistoryError(err.message || 'Failed to fetch billing history');
    } finally {
      setLoadingHistory(false);
    }
  }, [queryParams]);

  useEffect(() => {
    fetchBillsHistory();
  }, [fetchBillsHistory]);

  // ─── Cart Actions ─────────────────────────────────────────────────────────
  const addToCart = useCallback((service: Service) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.serviceId === service.id || item.serviceId === (service as any)._id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          serviceId: service.id || (service as any)._id,
          name: service.name,
          priceInclusive: service.price,
          gstRate: service.gstRate ?? 18,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((serviceId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.serviceId === serviceId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }, []);

  const removeFromCart = useCallback((serviceId: string) => {
    setCart((prev) => prev.filter((item) => item.serviceId !== serviceId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('stylesync_checkout_cart');
    localStorage.removeItem('stylesync_checkout_customer');
    localStorage.removeItem('stylesync_item_stylists');
    setCustomerName('');
    setCustomerPhone('');
    setSelectedCustomerId(undefined);
    setSelectedEmployeeId(undefined);
    setDiscountAmount(0);
    setNotes('');
  }, []);

  // ─── GST & Price Math ─────────────────────────────────────────────────────
  const cartSummary = useMemo(() => {
    let subtotalInclusive = 0;
    let subtotalBase = 0;
    let taxTotal = 0;

    cart.forEach((item) => {
      const lineInclusive = item.priceInclusive * item.quantity;
      const lineBase = (item.priceInclusive / (1 + item.gstRate / 100)) * item.quantity;
      const lineTax = lineInclusive - lineBase;

      subtotalInclusive += lineInclusive;
      subtotalBase += lineBase;
      taxTotal += lineTax;
    });

    const finalGrandTotal = Math.max(0, subtotalInclusive - discountAmount);

    return {
      subtotalInclusive: Number(subtotalInclusive.toFixed(2)),
      subtotalBase: Number(subtotalBase.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      grandTotal: Number(finalGrandTotal.toFixed(2)),
    };
  }, [cart, discountAmount]);

  // ─── Finalize Bill ────────────────────────────────────────────────────────
  const finalizeBill = useCallback(
    async (checkoutData: {
      customerId?: string;
      customerName: string;
      customerPhone: string;
      employeeId?: string;
      payments: PaymentEntry[];
    }) => {
      if (cart.length === 0) {
        alert('Cart is empty');
        return;
      }

      setSubmitting(true);
      try {
        const payload: CreateBillPayload = {
          customerId: checkoutData.customerId,
          customerName: checkoutData.customerName,
          customerPhone: checkoutData.customerPhone,
          employeeId: checkoutData.employeeId,
          items: cart.map((item) => ({ serviceId: item.serviceId, quantity: item.quantity })),
          discountAmount,
          payments: checkoutData.payments.map((p) => ({
            method: p.method,
            amount: p.amount,
            ...(p.tip && p.tip > 0 ? { tip: p.tip } : {}),
          })),
          notes: notes.trim() || undefined,
        };

        const createdBill = await billingService.createBill(payload);
        setSelectedInvoice(createdBill);
        setIsCheckoutModalOpen(false);
        clearCart();
        fetchBillsHistory();
      } catch (err: any) {
        alert(err.message || 'Failed to process bill');
      } finally {
        setSubmitting(false);
      }
    },
    [cart, discountAmount, notes, clearCart, fetchBillsHistory],
  );

  return {
    bills,
    loadingHistory,
    historyError,
    queryParams,
    setQueryParams,
    totalPages,
    fetchBillsHistory,

    // Cart
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSummary,

    // Customer & Stylist
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    selectedCustomerId,
    setSelectedCustomerId,
    selectedEmployeeId,
    setSelectedEmployeeId,
    discountAmount,
    setDiscountAmount,
    notes,
    setNotes,

    // Modals
    isCheckoutModalOpen,
    setIsCheckoutModalOpen,
    selectedInvoice,
    setSelectedInvoice,
    submitting,
    finalizeBill,
  };
};

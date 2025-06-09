import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  client_id: string;
}

interface InvoiceEditorProps {
  invoice: Invoice;
  items: InvoiceItem[];
  clients: Client[];
  onClose: () => void;
  onSave: (invoiceData: Partial<Invoice>, items: InvoiceItem[]) => Promise<void>;
}

export function InvoiceEditor({ invoice, items: initialItems, clients, onClose, onSave }: InvoiceEditorProps) {
  const [invoiceData, setInvoiceData] = useState({
    title: invoice.title,
    client_id: invoice.client_id,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    notes: invoice.notes || '',
    tax_rate: invoice.tax_rate,
  });

  const [items, setItems] = useState<InvoiceItem[]>(initialItems);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceData.tax_rate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      
      await onSave({
        ...invoiceData,
        subtotal,
        tax_amount: taxAmount,
        total,
      }, items);
      
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Edit Invoice #{invoice.invoice_number}
            </h2>
            <div className="flex items-center space-x-2">
              <Button onClick={handleSave} loading={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Invoice Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Client Selection */}
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Client</h3>
                  <select
                    value={invoiceData.client_id}
                    onChange={(e) => setInvoiceData({ ...invoiceData, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} {client.company && `(${client.company})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Invoice Details */}
                <div className="space-y-4">
                  <Input
                    label="Invoice Title"
                    value={invoiceData.title}
                    onChange={(e) => setInvoiceData({ ...invoiceData, title: e.target.value })}
                    placeholder="e.g., Web Development Services"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Issue Date"
                      type="date"
                      value={invoiceData.issue_date}
                      onChange={(e) => setInvoiceData({ ...invoiceData, issue_date: e.target.value })}
                    />
                    <Input
                      label="Due Date"
                      type="date"
                      value={invoiceData.due_date}
                      onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Items</h3>
                    <Button variant="outline" size="sm" onClick={addItem}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-5">
                          <Input
                            label={index === 0 ? "Description" : ""}
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            label={index === 0 ? "Qty" : ""}
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            label={index === 0 ? "Rate" : ""}
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            label={index === 0 ? "Amount" : ""}
                            value={`$${item.amount.toFixed(2)}`}
                            readOnly
                            className="bg-slate-50"
                          />
                        </div>
                        <div className="col-span-1">
                          {items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="p-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <Input
                    label="Tax Rate (%)"
                    type="number"
                    value={invoiceData.tax_rate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, tax_rate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes or terms..."
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Summary */}
              <div>
                <div className="bg-slate-50 p-4 rounded-lg sticky top-6">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Invoice Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax ({invoiceData.tax_rate}%):</span>
                      <span className="font-medium">${taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-slate-900">Total:</span>
                        <span className="text-lg font-bold text-slate-900">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
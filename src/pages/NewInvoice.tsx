import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface NewClient {
  name: string;
  email: string;
  company: string;
  address: string;
  phone: string;
}

export function NewInvoice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClient, setNewClient] = useState<NewClient>({
    name: '',
    email: '',
    company: '',
    address: '',
    phone: '',
  });
  
  const [invoiceData, setInvoiceData] = useState({
    title: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    taxRate: 0,
  });
  
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadClients();
  }, [user]);

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, company')
        .eq('user_id', user!.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const handleCreateClient = async () => {
    if (!newClient.name || !newClient.email) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .insert({
          user_id: user!.id,
          name: newClient.name,
          email: newClient.email,
          company: newClient.company || null,
          address: newClient.address || null,
          phone: newClient.phone || null,
        })
        .select()
        .single();

      if (error) throw error;

      setClients([...clients, data]);
      setSelectedClient(data.id);
      setShowNewClientModal(false);
      setNewClient({ name: '', email: '', company: '', address: '', phone: '' });
    } catch (error) {
      console.error('Error creating client:', error);
    }
  };

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
    const taxAmount = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const generateInvoiceNumber = () => {
    return `INV-${Date.now()}`;
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!selectedClient || !invoiceData.title) return;

    setLoading(true);
    
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      const invoiceNumber = generateInvoiceNumber();

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user!.id,
          client_id: selectedClient,
          invoice_number: invoiceNumber,
          title: invoiceData.title,
          status,
          issue_date: invoiceData.issueDate,
          due_date: invoiceData.dueDate,
          subtotal,
          tax_rate: invoiceData.taxRate,
          tax_amount: taxAmount,
          total,
          notes: invoiceData.notes || null,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      const invoiceItems = items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount,
      }));

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItems);

      if (itemsError) throw itemsError;

      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
            <p className="text-slate-600">Create a new invoice for your client</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleSave('draft')} loading={loading}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave('sent')} loading={loading}>
            Send Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Selection */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Client Information</h2>
            <div className="flex space-x-3">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={() => setShowNewClientModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Client
              </Button>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  value={invoiceData.issueDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, issueDate: e.target.value })}
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Items</h2>
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
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Information</h2>
            <div className="space-y-4">
              <Input
                label="Tax Rate (%)"
                type="number"
                value={invoiceData.taxRate}
                onChange={(e) => setInvoiceData({ ...invoiceData, taxRate: parseFloat(e.target.value) || 0 })}
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
        </div>

        {/* Invoice Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 sticky top-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Invoice Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax ({invoiceData.taxRate}%):</span>
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

      {/* New Client Modal */}
      <Modal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        title="Add New Client"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            placeholder="Client's full name"
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
            placeholder="client@example.com"
            required
          />
          <Input
            label="Company"
            value={newClient.company}
            onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
            placeholder="Company name (optional)"
          />
          <Input
            label="Address"
            value={newClient.address}
            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
            placeholder="Business address (optional)"
          />
          <Input
            label="Phone"
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
            placeholder="Phone number (optional)"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowNewClientModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClient}>
              Create Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
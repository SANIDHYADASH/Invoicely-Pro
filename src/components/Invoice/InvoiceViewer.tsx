import React from 'react';
import { X, Download, Printer, Edit, Trash2, Send } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../ui/Button';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Client {
  name: string;
  email: string;
  company: string | null;
  address: string | null;
  phone: string | null;
}

interface Profile {
  full_name: string;
  company_name: string | null;
  company_address: string | null;
  phone: string | null;
  email: string;
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
}

interface InvoiceViewerProps {
  invoice: Invoice;
  client: Client;
  profile: Profile;
  items: InvoiceItem[];
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: (format: 'A4' | 'A5') => void;
  onPrint: (format: 'A4' | 'A5') => void;
  onStatusChange: (status: 'draft' | 'sent' | 'paid' | 'overdue') => void;
}

export function InvoiceViewer({
  invoice,
  client,
  profile,
  items,
  onClose,
  onEdit,
  onDelete,
  onDownload,
  onPrint,
  onStatusChange,
}: InvoiceViewerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Invoice #{invoice.invoice_number}
              </h2>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={invoice.status}
                onChange={(e) => onStatusChange(e.target.value as any)}
                className="px-3 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => onDownload('A4')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    Download A4 PDF
                  </button>
                  <button
                    onClick={() => onDownload('A5')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    Download A5 PDF
                  </button>
                </div>
              </div>
              <div className="relative group">
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <button
                    onClick={() => onPrint('A4')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    Print A4
                  </button>
                  <button
                    onClick={() => onPrint('A5')}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    Print A5
                  </button>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Invoice Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div id="invoice-content" className="bg-white">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">INVOICE</h1>
                  <p className="text-slate-600">#{invoice.invoice_number}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-semibold text-slate-900">{profile.company_name || profile.full_name}</h2>
                  {profile.company_address && (
                    <p className="text-slate-600 whitespace-pre-line">{profile.company_address}</p>
                  )}
                  {profile.phone && <p className="text-slate-600">{profile.phone}</p>}
                  <p className="text-slate-600">{profile.email}</p>
                </div>
              </div>

              {/* Bill To & Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">BILL TO:</h3>
                  <div className="text-slate-700">
                    <p className="font-medium">{client.name}</p>
                    {client.company && <p>{client.company}</p>}
                    {client.address && <p className="whitespace-pre-line">{client.address}</p>}
                    {client.phone && <p>{client.phone}</p>}
                    <p>{client.email}</p>
                  </div>
                </div>
                <div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Issue Date:</span>
                      <span className="font-medium">{format(new Date(invoice.issue_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Due Date:</span>
                      <span className="font-medium">{format(new Date(invoice.due_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Title */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900">{invoice.title}</h2>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-3 text-sm font-semibold text-slate-900">Description</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-900 w-20">Qty</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-900 w-24">Rate</th>
                      <th className="text-right py-3 text-sm font-semibold text-slate-900 w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-3 text-slate-700">{item.description}</td>
                        <td className="py-3 text-right text-slate-700">{item.quantity}</td>
                        <td className="py-3 text-right text-slate-700">${item.rate.toFixed(2)}</td>
                        <td className="py-3 text-right font-medium text-slate-900">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tax ({invoice.tax_rate}%):</span>
                      <span className="font-medium">${invoice.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-slate-900">Total:</span>
                        <span className="text-lg font-bold text-slate-900">${invoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">NOTES:</h3>
                  <p className="text-slate-700 whitespace-pre-line">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
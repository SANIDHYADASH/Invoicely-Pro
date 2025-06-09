import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from '@react-pdf/renderer';
import React from 'react';

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

interface InvoicePDFProps {
  invoice: Invoice;
  client: Client;
  profile: Profile;
  items: InvoiceItem[];
  format: 'A4' | 'A5';
}

const createStyles = (format: 'A4' | 'A5') => {
  const isA5 = format === 'A5';
  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#fff',
      padding: isA5 ? 20 : 40,
      fontSize: isA5 ? 9 : 12,
      fontFamily: 'Helvetica',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: isA5 ? 18 : 28,
      borderBottomWidth: 2,
      borderBottomColor: '#e5e7eb',
      paddingBottom: isA5 ? 8 : 12,
    },
    logoBox: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    companyInfo: {
      flex: 1,
      alignItems: 'flex-end',
      textAlign: 'right',
    },
    companyName: {
      fontSize: isA5 ? 13 : 18,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 2,
    },
    companyDetails: {
      fontSize: isA5 ? 8 : 10,
      color: '#64748b',
      marginBottom: 1,
    },
    invoiceInfo: {
      flex: 1,
      alignItems: 'flex-end',
      textAlign: 'right',
    },
    invoiceTitle: {
      fontSize: isA5 ? 16 : 22,
      fontWeight: 'bold',
      color: '#1e293b',
      marginBottom: 2,
    },
    invoiceNumber: {
      fontSize: isA5 ? 9 : 12,
      color: '#64748b',
      marginBottom: 2,
    },
    statusBadge: {
      fontSize: isA5 ? 8 : 10,
      fontWeight: 'bold',
      color: '#fff',
      backgroundColor: '#64748b',
      borderRadius: 4,
      paddingHorizontal: 8,
      paddingVertical: 2,
      alignSelf: 'flex-end',
      marginTop: 2,
    },
    section: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: isA5 ? 10 : 18,
      marginBottom: isA5 ? 10 : 18,
    },
    billTo: {
      flex: 1,
      marginRight: isA5 ? 10 : 30,
    },
    billToTitle: {
      fontWeight: 'bold',
      color: '#374151',
      fontSize: isA5 ? 9 : 11,
      marginBottom: 3,
    },
    billToDetails: {
      fontSize: isA5 ? 8 : 10,
      color: '#374151',
      lineHeight: 1.4,
    },
    invoiceDetails: {
      flex: 1,
      alignItems: 'flex-end',
      textAlign: 'right',
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    detailsLabel: {
      fontSize: isA5 ? 8 : 10,
      color: '#64748b',
      minWidth: 60,
    },
    detailsValue: {
      fontSize: isA5 ? 8 : 10,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    table: {
      marginTop: isA5 ? 6 : 12,
      marginBottom: isA5 ? 12 : 18,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f1f5f9',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#e5e7eb',
      paddingVertical: isA5 ? 4 : 6,
    },
    tableHeaderCell: {
      fontWeight: 'bold',
      color: '#374151',
      fontSize: isA5 ? 8 : 10,
      flex: 1,
      textAlign: 'center',
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      paddingVertical: isA5 ? 3 : 5,
    },
    tableCell: {
      fontSize: isA5 ? 8 : 10,
      color: '#374151',
      flex: 1,
      textAlign: 'center',
    },
    descriptionColumn: {
      flex: 2,
      textAlign: 'left',
      paddingLeft: 4,
    },
    totalsSection: {
      alignSelf: 'flex-end',
      width: isA5 ? 140 : 200,
      marginTop: isA5 ? 8 : 12,
      marginBottom: isA5 ? 10 : 16,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    totalLabel: {
      fontSize: isA5 ? 8 : 10,
      color: '#64748b',
    },
    totalValue: {
      fontSize: isA5 ? 8 : 10,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: '#e5e7eb',
      marginTop: 4,
      paddingTop: 4,
    },
    grandTotalLabel: {
      fontSize: isA5 ? 10 : 13,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    grandTotalValue: {
      fontSize: isA5 ? 10 : 13,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    notesSection: {
      marginTop: isA5 ? 10 : 18,
      padding: isA5 ? 6 : 10,
      backgroundColor: '#f9fafb',
      borderRadius: 4,
    },
    notesTitle: {
      fontWeight: 'bold',
      color: '#374151',
      fontSize: isA5 ? 9 : 11,
      marginBottom: 2,
    },
    notesText: {
      fontSize: isA5 ? 8 : 10,
      color: '#4b5563',
      lineHeight: 1.4,
    },
  });
};

const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, client, profile, items, format }) => {
  const styles = createStyles(format);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'sent': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <Document>
      <Page size={format} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.companyName}>
              {profile.company_name || profile.full_name}
            </Text>
            {profile.company_address && (
              <Text style={styles.companyDetails}>{profile.company_address}</Text>
            )}
            {profile.phone && <Text style={styles.companyDetails}>{profile.phone}</Text>}
            <Text style={styles.companyDetails}>{profile.email}</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
            <Text style={[styles.statusBadge, { backgroundColor: getStatusColor(invoice.status) }]}>
              {invoice.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Bill To & Invoice Details */}
        <View style={styles.section}>
          <View style={styles.billTo}>
            <Text style={styles.billToTitle}>Bill To</Text>
            <Text style={styles.billToDetails}>{client.name}</Text>
            {client.company && <Text style={styles.billToDetails}>{client.company}</Text>}
            {client.address && <Text style={styles.billToDetails}>{client.address}</Text>}
            {client.phone && <Text style={styles.billToDetails}>{client.phone}</Text>}
            <Text style={styles.billToDetails}>{client.email}</Text>
          </View>
          <View style={styles.invoiceDetails}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Issue Date:</Text>
              <Text style={styles.detailsValue}>{formatDate(invoice.issue_date)}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Due Date:</Text>
              <Text style={styles.detailsValue}>{formatDate(invoice.due_date)}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionColumn]}>Description</Text>
            <Text style={styles.tableHeaderCell}>Qty</Text>
            <Text style={styles.tableHeaderCell}>Rate</Text>
            <Text style={styles.tableHeaderCell}>Amount</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionColumn]}>{item.description}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>${item.rate.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${item.amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>${invoice.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({invoice.tax_rate}%):</Text>
            <Text style={styles.totalValue}>${invoice.tax_amount.toFixed(2)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total:</Text>
            <Text style={styles.grandTotalValue}>${invoice.total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export const generateInvoicePDF = async (
  invoice: Invoice,
  client: Client,
  profile: Profile,
  items: InvoiceItem[],
  format: 'A4' | 'A5' = 'A4'
) => {
  const doc = React.createElement(InvoicePDF, { invoice, client, profile, items, format });
  return await pdf(doc).toBlob();
};

export const downloadInvoicePDF = async (
  invoice: Invoice,
  client: Client,
  profile: Profile,
  items: InvoiceItem[],
  format: 'A4' | 'A5' = 'A4'
) => {
  const blob = await generateInvoicePDF(invoice, client, profile, items, format);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `invoice-${invoice.invoice_number}-${format}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const printInvoice = (format: 'A4' | 'A5' = 'A4') => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    const content = document.getElementById('invoice-content');
    if (content) {
      const printContent = content.cloneNode(true) as HTMLElement;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice</title>
            <style>
              @page {
                size: ${format};
                margin: ${format === 'A5' ? '15mm' : '20mm'};
              }
              body {
                font-family: Arial, sans-serif;
                font-size: ${format === 'A5' ? '10px' : '12px'};
                line-height: 1.4;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .invoice-content {
                max-width: 100%;
              }
              @media print {
                body { -webkit-print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="invoice-content">${printContent.innerHTML}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  }
};
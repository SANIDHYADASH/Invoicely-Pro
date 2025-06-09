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
      backgroundColor: '#FFFFFF',
      padding: isA5 ? 20 : 30,
      fontSize: isA5 ? 8 : 10,
      fontFamily: 'Helvetica',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: isA5 ? 15 : 20,
    },
    title: {
      fontSize: isA5 ? 18 : 24,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    invoiceNumber: {
      fontSize: isA5 ? 8 : 10,
      color: '#64748b',
      marginTop: 4,
    },
    companyInfo: {
      textAlign: 'right',
      fontSize: isA5 ? 8 : 10,
    },
    companyName: {
      fontSize: isA5 ? 10 : 12,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    section: {
      marginBottom: isA5 ? 10 : 15,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    billToSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: isA5 ? 15 : 20,
    },
    billTo: {
      flex: 1,
      marginRight: 20,
    },
    invoiceDetails: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: isA5 ? 8 : 9,
      fontWeight: 'bold',
      color: '#374151',
      marginBottom: 6,
    },
    clientInfo: {
      fontSize: isA5 ? 8 : 9,
      lineHeight: 1.4,
    },
    clientName: {
      fontWeight: 'bold',
      marginBottom: 2,
    },
    invoiceTitle: {
      fontSize: isA5 ? 10 : 12,
      fontWeight: 'bold',
      marginBottom: isA5 ? 10 : 15,
      color: '#1e293b',
    },
    table: {
      marginBottom: isA5 ? 15 : 20,
    },
    tableHeader: {
      flexDirection: 'row',
      borderBottomWidth: 2,
      borderBottomColor: '#e2e8f0',
      paddingBottom: 6,
      marginBottom: 6,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f5f9',
    },
    tableHeaderCell: {
      fontSize: isA5 ? 7 : 8,
      fontWeight: 'bold',
      color: '#374151',
    },
    tableCell: {
      fontSize: isA5 ? 7 : 8,
      color: '#4b5563',
    },
    descriptionColumn: {
      flex: 3,
    },
    quantityColumn: {
      flex: 1,
      textAlign: 'right',
    },
    rateColumn: {
      flex: 1,
      textAlign: 'right',
    },
    amountColumn: {
      flex: 1,
      textAlign: 'right',
    },
    totalsSection: {
      alignSelf: 'flex-end',
      width: isA5 ? 120 : 150,
      marginBottom: isA5 ? 15 : 20,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 2,
    },
    totalLabel: {
      fontSize: isA5 ? 7 : 8,
      color: '#64748b',
    },
    totalValue: {
      fontSize: isA5 ? 7 : 8,
      fontWeight: 'bold',
    },
    grandTotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
      borderTopWidth: 1,
      borderTopColor: '#e2e8f0',
      marginTop: 4,
    },
    grandTotalLabel: {
      fontSize: isA5 ? 9 : 10,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    grandTotalValue: {
      fontSize: isA5 ? 9 : 10,
      fontWeight: 'bold',
      color: '#1e293b',
    },
    notesSection: {
      marginTop: isA5 ? 10 : 15,
    },
    notesTitle: {
      fontSize: isA5 ? 8 : 9,
      fontWeight: 'bold',
      marginBottom: 4,
      color: '#374151',
    },
    notesText: {
      fontSize: isA5 ? 7 : 8,
      lineHeight: 1.4,
      color: '#4b5563',
    },
    statusBadge: {
      backgroundColor: '#f1f5f9',
      padding: 4,
      borderRadius: 4,
      fontSize: isA5 ? 6 : 7,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 4,
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
      default: return '#6b7280';
    }
  };

  return (
    <Document>
      <Page size={format} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoice_number}</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {profile.company_name || profile.full_name}
            </Text>
            {profile.company_address && (
              <Text>{profile.company_address}</Text>
            )}
            {profile.phone && <Text>{profile.phone}</Text>}
            <Text>{profile.email}</Text>
          </View>
        </View>

        {/* Bill To & Invoice Details */}
        <View style={styles.billToSection}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>BILL TO:</Text>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{client.name}</Text>
              {client.company && <Text>{client.company}</Text>}
              {client.address && <Text>{client.address}</Text>}
              {client.phone && <Text>{client.phone}</Text>}
              <Text>{client.email}</Text>
            </View>
          </View>
          <View style={styles.invoiceDetails}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Issue Date:</Text>
              <Text style={styles.totalValue}>{formatDate(invoice.issue_date)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Due Date:</Text>
              <Text style={styles.totalValue}>{formatDate(invoice.due_date)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Status:</Text>
              <Text style={[styles.statusBadge, { color: getStatusColor(invoice.status) }]}>
                {invoice.status.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoice Title */}
        <Text style={styles.invoiceTitle}>{invoice.title}</Text>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.descriptionColumn]}>Description</Text>
            <Text style={[styles.tableHeaderCell, styles.quantityColumn]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, styles.rateColumn]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, styles.amountColumn]}>Amount</Text>
          </View>
          {items.map((item) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionColumn]}>{item.description}</Text>
              <Text style={[styles.tableCell, styles.quantityColumn]}>{item.quantity}</Text>
              <Text style={[styles.tableCell, styles.rateColumn]}>${item.rate.toFixed(2)}</Text>
              <Text style={[styles.tableCell, styles.amountColumn]}>${item.amount.toFixed(2)}</Text>
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
            <Text style={styles.notesTitle}>NOTES:</Text>
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
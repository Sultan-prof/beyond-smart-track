import React from 'react';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

    const QuotationPreview = ({ quotation, productTypes, contactPerson }) => {
      if (!quotation) {
        return null;
      }

      const subtotal = quotation.items.reduce((acc, item) => {
          const price = Number(item.price) || 0;
          const quantity = Number(item.quantity) || 0;
          return acc + (quantity * price);
      }, 0);

      const discountAmount = quotation.discountType === 'percentage' ? subtotal * ((Number(quotation.discount) || 0) / 100) : (Number(quotation.discount) || 0);
      const totalAfterDiscount = subtotal - discountAmount;
      const taxAmount = quotation.taxType === 'percentage' ? totalAfterDiscount * ((Number(quotation.tax) || 0) / 100) : (Number(quotation.tax) || 0);
      const grandTotal = totalAfterDiscount + taxAmount;

      return (
        <div className="p-6 bg-white text-gray-800 font-sans text-sm rounded-lg border">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">BEYOND SMART GLASS</h1>
            <p className="text-xl text-gray-600 mt-1">Quotation</p>
          </header>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8">
            <div>
              <h2 className="font-bold text-base mb-2 border-b pb-1">Bill To:</h2>
              <p className="font-semibold">{quotation.clientInfo.name}</p>
              <p>{quotation.clientInfo.address || quotation.clientInfo.city}</p>
              <p>{quotation.clientInfo.phone}</p>
              <p>{quotation.clientInfo.email}</p>
            </div>
            <div className="text-right">
              <p><span className="font-bold">Quotation #:</span> {quotation.id}</p>
              <p><span className="font-bold">Project:</span> {quotation.projectName}</p>
              <p><span className="font-bold">Date:</span> {new Date(quotation.date).toLocaleDateString()}</p>
              <p><span className="font-bold">Daily Visit Rep:</span> {contactPerson}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="font-bold">#</TableHead>
                  <TableHead className="font-bold">Commodity</TableHead>
                  <TableHead className="font-bold text-center">W(m)</TableHead>
                  <TableHead className="font-bold text-center">H(m)</TableHead>
                  <TableHead className="font-bold text-center">Qty</TableHead>
                  <TableHead className="font-bold text-right">Unit Price</TableHead>
                  <TableHead className="font-bold text-right">Sub-Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.items.map((item, index) => {
                  const product = productTypes.find(p => p.id === item.productId);
                  const price = Number(item.price) || 0;
                  const quantity = Number(item.quantity) || 0;
                  const subTotal = price * quantity;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{product ? product.name : 'N/A'}</TableCell>
                      <TableCell className="text-center">{item.width || 'N/A'}</TableCell>
                      <TableCell className="text-center">{item.height || 'N/A'}</TableCell>
                      <TableCell className="text-center">{quantity}</TableCell>
                      <TableCell className="text-right">{price.toFixed(2)} SR</TableCell>
                      <TableCell className="text-right">{subTotal.toFixed(2)} SR</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-6">
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal:</span>
                <span>{subtotal.toFixed(2)} SR</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Discount:</span>
                <span>- {discountAmount.toFixed(2)} SR</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">{quotation.taxType === 'percentage' ? `VAT (${quotation.tax}%)` : 'VAT (Fixed)'}:</span>
                <span>{taxAmount.toFixed(2)} SR</span>
              </div>
              <div className="border-t my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>{grandTotal.toFixed(2)} SR</span>
              </div>
            </div>
          </div>
          
          <footer className="mt-12 pt-4 border-t">
            <h3 className="font-bold mb-2">Terms & Conditions:</h3>
            <p>Lead Time: Within 10 working days.</p>
            <p>Payment: 100% Prepaid.</p>
          </footer>
        </div>
      );
    };

    export default QuotationPreview;
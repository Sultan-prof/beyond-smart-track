import React from 'react';
    import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import QuotationPreview from '@/components/QuotationPreview';

    const QuotationPreviewDialog = ({ open, onOpenChange, quotation, productTypes, contactPerson }) => {
      if (!quotation) return null;

      const handlePrint = () => {
        const printContent = document.getElementById('quotation-preview-content');
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        printWindow.document.write('<html><head><title>Print Quotation</title>');
        printWindow.document.write('<link rel="stylesheet" href="/src/index.css" type="text/css" />');
        printWindow.document.write(`<style>
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        </style>`);
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500);
      };

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-4xl p-0">
            <div className="p-6">
              <DialogHeader>
                <div className="flex justify-between items-center">
                    <DialogTitle>Quotation Preview: {quotation.id}</DialogTitle>
                    <Button onClick={handlePrint} className="no-print">Print</Button>
                </div>
              </DialogHeader>
            </div>
            <div className="max-h-[80vh] overflow-y-auto" id="quotation-preview-wrapper">
              <div id="quotation-preview-content">
                  <QuotationPreview quotation={quotation} productTypes={productTypes} contactPerson={contactPerson} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    export default QuotationPreviewDialog;
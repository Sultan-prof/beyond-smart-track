import jsPDF from 'jspdf';
    import 'jspdf-autotable';
    import * as XLSX from 'xlsx';

    export const exportToPDF = (columns, data, title, fileName) => {
      const doc = new jsPDF();
      doc.text(title, 14, 16);
      doc.autoTable({
        head: [columns.map(c => c.header)],
        body: data.map(row => columns.map(col => col.accessor(row))),
        startY: 20,
      });
      doc.save(`${fileName}.pdf`);
    };

    export const exportToExcel = ({ data, columns, fileName }) => {
        const header = columns.map(c => c.header);
        const body = data.map(row => columns.map(col => {
            let value = col.accessor(row);
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value);
            }
            if (col.formatter) {
                return col.formatter(value);
            }
            return value;
        }));

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...body]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    export const exportQuotationToPDF = (quotation, contactPerson, productTypes) => {
        const doc = new jsPDF('p', 'pt', 'a4');
        const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
        const margin = 40;
        let y = margin;

        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text('BEYOND SMART GLASS', margin, y);
        doc.setFontSize(14);
        doc.setFont(undefined, 'normal');
        doc.text('Quotation', pageWidth - margin, y, { align: 'right' });
        y += 20;
        doc.setLineWidth(1.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 20;

        doc.setFontSize(10);
        const clientInfoY = y;
        doc.setFont(undefined, 'bold');
        doc.text('To:', margin, y);
        doc.setFont(undefined, 'normal');
        doc.text(quotation.clientInfo.name || '', margin + 50, y);
        y += 15;
        doc.setFont(undefined, 'bold');
        doc.text('Project:', margin, y);
        doc.setFont(undefined, 'normal');
        doc.text(quotation.projectName || '', margin + 50, y);
        y += 15;
        doc.setFont(undefined, 'bold');
        doc.text('Contact:', margin, y);
        doc.setFont(undefined, 'normal');
        doc.text(quotation.clientInfo.phone || '', margin + 50, y);
        y += 15;
        doc.setFont(undefined, 'bold');
        doc.text('Address:', margin, y);
        doc.setFont(undefined, 'normal');
        doc.text(quotation.clientInfo.city || '', margin + 50, y);

        const quoteInfoX = pageWidth / 2 + 30;
        y = clientInfoY;
        doc.setFont(undefined, 'bold');
        doc.text('Quotation #:', quoteInfoX, y);
        doc.setFont(undefined, 'normal');
        doc.text(quotation.id, quoteInfoX + 70, y);
        y += 15;
        doc.setFont(undefined, 'bold');
        doc.text('Date:', quoteInfoX, y);
        doc.setFont(undefined, 'normal');
        doc.text(new Date(quotation.date).toLocaleDateString(), quoteInfoX + 70, y);
        y += 15;
        doc.setFont(undefined, 'bold');
        doc.text('Daily Visit Rep:', quoteInfoX, y);
        doc.setFont(undefined, 'normal');
        doc.text(contactPerson, quoteInfoX + 70, y);

        y += 40;

        const head = [['#', 'Commodity', 'Width (m)', 'Height (m)', 'Qty', 'Total Area', 'Unit Price', 'Sub-Total']];
        const body = quotation.items.map((item, index) => {
            const product = productTypes.find(p => p.id === item.productId);
            
            const width = Number(item.width) || 0;
            const height = Number(item.height) || 0;
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;

            const area = (item.width && item.height) ? (width * height * quantity).toFixed(2) : 'N/A';
            const subTotal = quantity * price;

            return [
                index + 1,
                product ? product.name : 'N/A',
                item.width || 'N/A',
                item.height || 'N/A',
                item.quantity,
                area,
                `${price.toFixed(2)} SR`,
                `${subTotal.toFixed(2)} SR`,
            ];
        });

        doc.autoTable({
            head: head,
            body: body,
            startY: y,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: 20, fontStyle: 'bold' },
            styles: { fontSize: 9 },
        });

        y = doc.autoTable.previous.finalY;

        const subtotal = quotation.items.reduce((acc, item) => (acc + (Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
        const discountAmount = quotation.discountType === 'percentage' ? subtotal * (quotation.discount / 100) : quotation.discount;
        const totalAfterDiscount = subtotal - discountAmount;
        const taxAmount = quotation.taxType === 'percentage' ? totalAfterDiscount * (quotation.tax / 100) : quotation.tax;
        const grandTotal = totalAfterDiscount + taxAmount;
        
        y += 20;
        const totalX = pageWidth - margin - 150;
        doc.setFontSize(10);
        doc.text('Subtotal:', totalX, y);
        doc.text(`${subtotal.toFixed(2)} SR`, pageWidth - margin, y, { align: 'right' });
        y += 15;
        doc.text(`Discount:`, totalX, y);
        doc.text(`- ${discountAmount.toFixed(2)} SR`, pageWidth - margin, y, { align: 'right' });
        y += 15;
        doc.text(`VAT (${quotation.taxType === 'percentage' ? `${quotation.tax}%` : 'Fixed'}):`, totalX, y);
        doc.text(`${taxAmount.toFixed(2)} SR`, pageWidth - margin, y, { align: 'right' });
        y+= 5;
        doc.setLineWidth(0.5);
        doc.line(totalX - 10, y, pageWidth - margin, y);
        y+= 10;
        doc.setFont(undefined, 'bold');
        doc.text('Total Amount:', totalX, y);
        doc.text(`${grandTotal.toFixed(2)} SR`, pageWidth - margin, y, { align: 'right' });

        y = pageHeight - margin - 60;
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.text('Terms & Conditions:', margin, y);
        y += 12;
        doc.setFont(undefined, 'normal');
        doc.text('Lead Time: Within 10 working days.', margin, y);
        y += 12;
        doc.text('Payment: 100% Prepaid.', margin, y);
        
        doc.save(`Quotation_${quotation.id}.pdf`);
    };

    export const exportQuotationToExcel = (quotation, contactPerson, productTypes) => {
        const aoa = [];
        
        aoa.push(['BEYOND SMART GLASS']);
        aoa.push(['Quotation']);
        aoa.push([]);

        aoa.push(['To:', quotation.clientInfo.name, '', 'Quotation #:', quotation.id]);
        aoa.push(['Project:', quotation.projectName, '', 'Date:', new Date(quotation.date).toLocaleDateString()]);
        aoa.push(['Contact:', quotation.clientInfo.phone, '', 'Daily Visit Rep:', contactPerson]);
        aoa.push(['Address:', quotation.clientInfo.city]);
        aoa.push([]);

        const tableHeader = ['#', 'Commodity', 'Width (m)', 'Height (m)', 'Qty', 'Total Area (sqm)', 'Unit Price', 'Sub-Total'];
        aoa.push(tableHeader);

        quotation.items.forEach((item, index) => {
            const product = productTypes.find(p => p.id === item.productId);
            const width = Number(item.width) || 0;
            const height = Number(item.height) || 0;
            const quantity = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const area = (product?.unit === 'sqm') ? (width * height * quantity).toFixed(2) : 'N/A';
            const subTotal = quantity * price;
            
            aoa.push([
                index + 1,
                product ? product.name : 'N/A',
                width || 'N/A',
                height || 'N/A',
                quantity,
                area,
                { t: 'n', v: price, f: `${price.toFixed(2)} SR` },
                { t: 'n', v: subTotal, f: `${subTotal.toFixed(2)} SR` }
            ]);
        });
        aoa.push([]);

        const subtotal = quotation.items.reduce((acc, item) => (acc + (Number(item.price) || 0) * (Number(item.quantity) || 0)), 0);
        const discountAmount = quotation.discountType === 'percentage' ? subtotal * (quotation.discount / 100) : quotation.discount;
        const totalAfterDiscount = subtotal - discountAmount;
        const taxAmount = quotation.taxType === 'percentage' ? totalAfterDiscount * (quotation.tax / 100) : quotation.tax;
        const grandTotal = totalAfterDiscount + taxAmount;

        aoa.push(['', '', '', '', '', '', 'Subtotal:', { t: 'n', v: subtotal, f: `${subtotal.toFixed(2)} SR` }]);
        aoa.push(['', '', '', '', '', '', 'Discount:', { t: 'n', v: -discountAmount, f: `-${discountAmount.toFixed(2)} SR` }]);
        const taxLabel = quotation.taxType === 'percentage' ? `VAT (${quotation.tax}%)` : 'VAT (Fixed)';
        aoa.push(['', '', '', '', '', '', taxLabel, { t: 'n', v: taxAmount, f: `${taxAmount.toFixed(2)} SR` }]);
        aoa.push(['', '', '', '', '', '', 'Total Amount:', { t: 'n', v: grandTotal, f: `${grandTotal.toFixed(2)} SR` }]);

        const ws = XLSX.utils.aoa_to_sheet(aoa);

        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
          { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
        ];

        ws['!cols'] = [ {wch:5}, {wch:30}, {wch:12}, {wch:12}, {wch:8}, {wch:15}, {wch:15}, {wch:15} ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Quotation');
        XLSX.writeFile(wb, `Quotation_${quotation.id}.xlsx`);
    };
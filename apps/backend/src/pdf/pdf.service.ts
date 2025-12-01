import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
    async generateInvoice(sale: any): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // Header
            doc.fontSize(20).text('Hi Secure Solutions', { align: 'center' });
            doc.fontSize(12).text('Invoice', { align: 'center' });
            doc.moveDown();

            // Invoice Details
            doc.fontSize(10).text(`Invoice No: ${sale.invoiceNo}`);
            doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`);
            doc.text(`Customer: ${sale.user?.name || 'Walk-in Customer'}`);
            doc.moveDown();

            // Table Header
            const tableTop = 150;
            doc.font('Helvetica-Bold');
            doc.text('Item', 50, tableTop);
            doc.text('Qty', 300, tableTop);
            doc.text('Price', 350, tableTop);
            doc.text('Total', 450, tableTop);
            doc.font('Helvetica');

            // Table Rows
            let y = tableTop + 20;
            sale.items.forEach((item: any) => {
                doc.text(item.product.name, 50, y);
                doc.text(item.quantity.toString(), 300, y);
                doc.text(item.price.toFixed(2), 350, y);
                doc.text((item.quantity * item.price).toFixed(2), 450, y);
                y += 20;
            });

            doc.moveDown();
            doc.fontSize(12).font('Helvetica-Bold').text(`Total Amount: ${Number(sale.totalAmount).toFixed(2)}`, 350, y + 20);

            doc.end();
        });
    }
}

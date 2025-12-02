/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: any;

  constructor() {
    this.createTransporter();
  }

  private async createTransporter() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    const testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    console.log('Ethereal Mail Configured:');
    console.log(`User: ${testAccount.user}`);
    console.log(`Pass: ${testAccount.pass}`);
  }

  async sendInvoice(to: string, invoiceNo: string, amount: number) {
    if (!this.transporter) {
      await this.createTransporter();
    }

    const info = await this.transporter.sendMail({
      from: '"Hi Secure Solutions" <noreply@hisecure.com>',
      to: to,
      subject: `Invoice #${invoiceNo}`,
      text: `Thank you for your purchase. Your invoice #${invoiceNo} for ₹${amount} is ready.`,
      html: `<b>Thank you for your purchase!</b><br>Your invoice <b>#${invoiceNo}</b> for <b>₹${amount}</b> is ready.`,
    });

    console.log('Invoice sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }

  async sendLowStockAlert(
    to: string,
    productName: string,
    currentStock: number,
  ) {
    if (!this.transporter) {
      await this.createTransporter();
    }

    const info = await this.transporter.sendMail({
      from: '"Hi Secure Solutions" <noreply@hisecure.com>',
      to: to,
      subject: `Low Stock Alert: ${productName}`,
      text: `The stock for ${productName} has fallen below the threshold. Current stock: ${currentStock}.`,
      html: `<b>Low Stock Alert</b><br>The stock for <b>${productName}</b> has fallen below the threshold.<br>Current stock: <b>${currentStock}</b>.`,
    });

    console.log('Low stock alert sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }

  async sendDailyReport(
    to: string,
    stats: { date: string; totalSales: number; totalOrders: number },
  ) {
    if (!this.transporter) {
      await this.createTransporter();
    }

    const info = await this.transporter.sendMail({
      from: '"Hi Secure Solutions" <noreply@hisecure.com>',
      to: to,
      subject: `Daily Sales Report - ${stats.date}`,
      text: `Daily Report for ${stats.date}\nTotal Sales: ₹${stats.totalSales}\nTotal Orders: ${stats.totalOrders}`,
      html: `<h2>Daily Sales Report</h2><p>Date: <b>${stats.date}</b></p><p>Total Sales: <b>₹${stats.totalSales}</b></p><p>Total Orders: <b>${stats.totalOrders}</b></p>`,
    });

    console.log('Daily report sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return info;
  }
}

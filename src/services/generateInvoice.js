import PDFDocument from "pdfkit";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import streamBuffers from "stream-buffers";
import { loadConfig } from "../config/loadConfig.js";
import Invoice from "../models/Invoices.model.js";
import fs from "fs";

const config = await loadConfig();

const s3 = new S3Client({ region: config.AWS_REGION });

async function downloadPDF(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadInvoiceToS3(buffer, s3Key) {
  try {

    const uploadCommand = new PutObjectCommand({
      Bucket: config.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: buffer,
      ContentType: "application/pdf",
    });
    await s3.send(uploadCommand);
    return `https://${config.AWS_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
  } catch (error) {
    console.error("Error uploading invoice to S3:", error);
    throw error;
  }
}

async function generateInvoice(invoiceData, s3Key) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    const writeStream = new streamBuffers.WritableStreamBuffer({
      initialSize: 400 * 1024,
      incrementAmount: 100 * 1024,
    });

    doc.pipe(writeStream);

    // for (const invoiceData of invoices) {
    addInvoiceToDocument(doc, invoiceData);
    // doc.addPage();
    // }

    doc.end();

    writeStream.on("finish", async () => {
      const buffer = writeStream.getContents();
      try {
        const uploadCommand = new PutObjectCommand({
          Bucket: config.AWS_BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: "application/pdf",
        });

        await s3.send(uploadCommand);
        resolve(`https://${config.AWS_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`);
      } catch (error) {
        console.log("Error uploading invoice to S3:", error);
        reject(error);
      }
    });
    writeStream.on("error", reject);
  });
}

function addInvoiceToDocument(doc, invoiceData) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;


  // ==================== HEADER SECTION ====================
  // Add colored header bar
  doc.fillColor("#2c3e50").rect(0, 0, pageWidth, 80).fill();

  // Company Logo and Name (left side)
  if (invoiceData.company?.logo) {
    // If logo URL/base64 is provided
    // doc.image(invoiceData.company.logo, margin, 15, { width: 50 });
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text(invoiceData.company.name || "YOUR COMPANY", margin + 60, 25);
  } else {
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text(invoiceData.company?.name || "INVOICE", margin, 25);
  }

  // Company details in header (right side)
  doc
    .fillColor("#ecf0f1")
    .font("Helvetica")
    .fontSize(10)
    .text(
      invoiceData.company?.address || "123 Business Street\nCity, State 12345",
      pageWidth - margin - 250,
      20,
      { width: 250, align: "right" }
    )
    .text(
      `Phone: ${invoiceData.company?.phone || "(123) 456-7890"}`,
      pageWidth - margin - 250,
      45,
      { width: 250, align: "right" }
    )
    .text(
      `Email: ${invoiceData.company?.email || "billing@company.com"}`,
      pageWidth - margin - 250,
      60,
      { width: 250, align: "right" }
    );

  // ==================== INVOICE TITLE ====================
  doc
    .fillColor("#2c3e50")
    .font("Helvetica-Bold")
    .fontSize(28)
    .text("INVOICE", margin, 120, { align: "center" });

  // ==================== INVOICE INFO SECTION ====================
  const infoTop = 160;

  // Left Column: Bill To
  doc
    .fillColor("#34495e")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("BILL TO:", margin, infoTop);

  doc
    .fillColor("#2c3e50")
    .font("Helvetica")
    .fontSize(12)
    .text(invoiceData?.user?.name || "Client Name", margin, infoTop + 20)
    .text(invoiceData?.user?.username || "Username", margin, infoTop + 35)
    .text(
      invoiceData?.user?.address || "Client Address",
      margin,
      infoTop + 50,
      {
        width: 200,
        lineBreak: false,
      }
    )
    .text(invoiceData?.user?.email || "client@email.com", margin, infoTop + 80);

  // Right Column: Invoice Details
  const rightColumnX = pageWidth / 2 + 30;

  doc
    .fillColor("#34495e")
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("INVOICE DETAILS:", rightColumnX, infoTop);

  const date = new Date(invoiceData.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Create a grid for invoice details
  const details = [
    { label: "Invoice #:", value: invoiceData.invoiceNumber },
    { label: "Date:", value: formattedDate },
    { label: "Project:", value: invoiceData.projectName },
  ];

  let detailY = infoTop + 20;
  details.forEach((detail) => {
    doc
      .fillColor("#7f8c8d")
      .font("Helvetica")
      .fontSize(11)
      .text(detail.label, rightColumnX, detailY);

    doc
      .fillColor("#2c3e50")
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(detail.value, rightColumnX + 50, detailY);

    detailY += 20;
  });

  // ==================== ITEMS TABLE ====================
  const tableTop = infoTop + 130;

  // Table Header
  doc.fillColor("#34495e").rect(margin, tableTop, contentWidth, 30).fill();

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("ITEM", margin + 10, tableTop + 10)
    .text("QUANTITY", margin + 250, tableTop + 10)
    .text("UNIT PRICE", margin + 350, tableTop + 10)
    .text("TOTAL", margin + 450, tableTop + 10);

  // Table Rows
  let rowY = tableTop + 30;
  let rowColor = true;

  invoiceData.items.forEach((item) => {
    const total = item.quantity * item.price;

    if (rowY + 25 > pageHeight - margin) {
      doc.addPage();

      // reset rowY for new page
      rowY = margin;

      // OPTIONAL: Table header dobara print karo
      doc.fillColor("#34495e").rect(margin, rowY, contentWidth, 30).fill();

      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(12)
        .text("ITEM", margin + 10, rowY + 10)
        .text("QUANTITY", margin + 250, rowY + 10)
        .text("UNIT PRICE", margin + 350, rowY + 10)
        .text("TOTAL", margin + 450, rowY + 10);

      rowY += 30;
    }

    // Alternating row background
    doc
      .fillColor(rowColor ? "#f8f9fa" : "#ffffff")
      .rect(margin, rowY, contentWidth, 25)
      .fill();

    // Row text
    doc
      .fillColor("#2c3e50")
      .font("Helvetica")
      .fontSize(11)
      .text(item.name, margin + 10, rowY + 8)
      .text(item.quantity.toString(), margin + 250, rowY + 8)
      .text(`$${item.price.toFixed(2)}`, margin + 350, rowY + 8)
      .text(`$${total.toFixed(2)}`, margin + 450, rowY + 8);

    rowY += 25;
    rowColor = !rowColor;
  });

  // ==================== TOTAL SECTION ====================
  const totalAmount = invoiceData.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalY = rowY + 20;
  const totalBoxWidth = 350;

  // Total background
  doc
    .fillColor("#ecf0f1")
    .rect(pageWidth - margin - totalBoxWidth, totalY, totalBoxWidth, 100)
    .fill();

  // Subtotal
  doc
    .fillColor("#7f8c8d")
    .font("Helvetica")
    .fontSize(12)
    .text("Subtotal:", pageWidth - margin - totalBoxWidth + 20, totalY + 20)
    .text(`$${totalAmount.toFixed(2)}`, pageWidth - margin - 200, totalY + 20, {
      align: "right",
    });

  // Grand Total
  const grandTotal = totalAmount;

  doc
    .fillColor("#2c3e50")
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("Grand Total:", pageWidth - margin - totalBoxWidth + 20, totalY + 40)
    .text(`$${grandTotal.toFixed(2)}`, pageWidth - margin - 200, totalY + 40, {
      align: "right",
    });

  
}

export { generateInvoice, uploadInvoiceToS3, downloadPDF };

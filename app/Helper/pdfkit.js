const PDFDocument = require('pdfkit');
const fs = require('fs');

async function downloadTicket(req, res) {
  const ticketInfo = {
    movieName: "Avengers: Endgame",
    showDate: "31-05-2025",
    showTime: "18:30",
    seat: "B12",
    venue: "Cinema Hall 1",
    qrCodeDataUrl: req.body.qrCodeDataUrl, // or generate here again
  };

  // Create a new PDF document
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Set response headers to download PDF
  res.setHeader('Content-Disposition', 'attachment; filename=ticket.pdf');
  res.setHeader('Content-Type', 'application/pdf');

  // Pipe PDF data to response
  doc.pipe(res);

  // Add title
  doc.fontSize(20).text('Movie Ticket', { align: 'center' });

  // Add event details
  doc.moveDown();
  doc.fontSize(14).text(`Movie: ${ticketInfo.movieName}`);
  doc.text(`Date: ${ticketInfo.showDate}`);
  doc.text(`Time: ${ticketInfo.showTime}`);
  doc.text(`Seat: ${ticketInfo.seat}`);
  doc.text(`Venue: ${ticketInfo.venue}`);

  // Add QR code image (convert base64 data url to buffer)
  if (ticketInfo.qrCodeDataUrl) {
    const base64Data = ticketInfo.qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const imgBuffer = Buffer.from(base64Data, 'base64');
    doc.image(imgBuffer, { fit: [150, 150], align: 'center' });
  }

  // Finalize PDF and end the stream
  doc.end();
}

module.exports = { downloadTicket };

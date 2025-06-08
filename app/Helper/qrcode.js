const QRCode = require('qrcode');

 const  generateQRCode = async(ticketInfo)=> {
  // Convert ticket info object to string to encode in QR
  const qrString = JSON.stringify(ticketInfo);

  try {
    // Generate base64 data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrString);
    return qrCodeDataUrl; // This is a string you can embed in <img src="..." />
  } catch (err) {
    console.error('Failed to generate QR code', err);
    return null;
  }
}

module.exports={generateQRCode};
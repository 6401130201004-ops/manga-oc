/**
 * Authentic Thai EMVCo PromptPay QR Code Generator
 * Conforms to Bank of Thailand (BOT) EMVCo QR Payment Standard.
 */

// CRC-16/CCITT-FALSE (Polynomial 0x1021) calculation for EMVCo
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  let hex = (crc & 0xffff).toString(16).toUpperCase();
  while (hex.length < 4) hex = '0' + hex;
  return hex;
}

function formatTag(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

export function generatePromptPayPayload(targetPhoneOrId: string = '0891234567', amount?: number): string {
  // Sanitize phone number (e.g. 0891234567 -> 0066891234567)
  let cleanId = targetPhoneOrId.replace(/[^0-9]/g, '');
  if (cleanId.startsWith('0')) {
    cleanId = '0066' + cleanId.substring(1);
  }

  // Tag 00: Format indicator
  const tag00 = formatTag('00', '01');
  // Tag 01: Point of Initiation Method (12 = Dynamic with Amount, 11 = Static)
  const tag01 = formatTag('01', amount ? '12' : '11');

  // Tag 29: Merchant Account Info for PromptPay
  const aid = formatTag('00', 'A000000677010111');
  const recipient = formatTag('01', cleanId);
  const tag29 = formatTag('29', aid + recipient);

  // Tag 53: Transaction Currency (764 = THB)
  const tag53 = formatTag('53', '764');

  // Tag 54: Transaction Amount
  let tag54 = '';
  if (amount && amount > 0) {
    tag54 = formatTag('54', amount.toFixed(2));
  }

  // Tag 58: Country Code (TH)
  const tag58 = formatTag('58', 'TH');

  // Prepare payload for CRC calculation
  const rawPayload = `${tag00}${tag01}${tag29}${tag53}${tag54}${tag58}6304`;
  const checksum = crc16(rawPayload);

  return `${rawPayload}${checksum}`;
}

"use client"

import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

const QrScanner = ({ onScanSuccess }: QrScannerProps) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'qr-reader', 
      {
        fps: 10,
        qrbox: 250,
      }, 
      /* verbose= */ false
    );

    function success(decodedText: string) {
      scanner.clear();
      onScanSuccess(decodedText);
    }

    function error(err: any) {
      // console.warn(err); // can be verbose
    }
    
    scanner.render(success, error);

    return () => {
      // cleanup function
      if (scanner) {
        scanner.clear().catch(error => {
          console.error("Failed to clear html5QrcodeScanner.", error);
        });
      }
    };
  }, [onScanSuccess]);

  return (
    <div id="qr-reader" style={{ width: '100%' }}></div>
  );
};

export default QrScanner; 
 
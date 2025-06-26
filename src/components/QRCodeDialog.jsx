import React from 'react';
    import {
      Dialog,
      DialogContent,
      DialogHeader,
      DialogTitle,
      DialogDescription,
    } from "@/components/ui/dialog";
    import QRCode from "qrcode.react";

    const QRCodeDialog = ({ open, onOpenChange, value, title }) => {
      if (!value) return null;

      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Scan this QR code to view the quotation details.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg mt-2">
              <QRCode
                value={value}
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                viewBox={`0 0 256 256`}
              />
            </div>
          </DialogContent>
        </Dialog>
      );
    };

    export default QRCodeDialog;
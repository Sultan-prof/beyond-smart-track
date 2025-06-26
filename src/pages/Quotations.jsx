import React, { useState, useMemo } from 'react';
    import { Helmet } from 'react-helmet';
    import { Link, useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
    import { Button } from '@/components/ui/button';
    import { Badge } from '@/components/ui/badge';
    import { useToast } from "@/components/ui/use-toast";
    import { QrCode, FileDown, PlusCircle, Eye } from 'lucide-react';
    import QRCodeDialog from "@/components/QRCodeDialog";
    import QuotationPreviewDialog from '@/components/QuotationPreviewDialog';
    import useLocalStorage from '@/hooks/useLocalStorage';
    import { initialQuotations, initialProductTypes } from '@/lib/data';
    import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
    import { exportQuotationToPDF, exportQuotationToExcel } from '@/lib/export';
    import { useAuth } from '@/contexts/AuthContext';
    import { differenceInDays } from 'date-fns';

    const Quotations = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const [quotations] = useLocalStorage('quotations', initialQuotations);
      const [productTypes] = useLocalStorage('productTypes', initialProductTypes);
      const [qrCodeValue, setQrCodeValue] = useState(null);
      const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
      const [selectedQuote, setSelectedQuote] = useState(null);
      const [isPreviewOpen, setIsPreviewOpen] = useState(false);
      const { user, users } = useAuth();

      const userQuotations = useMemo(() => {
        if (user?.role === 'Admin') {
          return quotations;
        }
        return quotations.filter(q => q.ownerId === user?.id);
      }, [quotations, user]);

      const getStatusBadge = (status, date) => {
        if (status === 'Open') {
            const age = differenceInDays(new Date(), new Date(date));
            if (age > 30) return <Badge variant="destructive">Open ({age}d)</Badge>;
            if (age > 7) return <Badge variant="warning">Open ({age}d)</Badge>;
        }
        
        switch (status) {
          case 'Accepted': return <Badge variant="default" className="bg-green-500">Accepted</Badge>;
          case 'Sent': return <Badge variant="secondary">Sent</Badge>;
          case 'Rejected': return <Badge variant="destructive">Rejected</Badge>
          case 'Open':
          case 'Draft': 
            return <Badge variant="outline">{status}</Badge>;
          case 'Converted to Project':
            return <Badge>Converted</Badge>;
          default: return <Badge variant="outline">{status}</Badge>;
        }
      };

      const showQrCode = (quote) => {
        setQrCodeValue(JSON.stringify({id: quote.id, client: quote.clientName, total: quote.total}));
        setIsQrDialogOpen(true);
      };

      const handlePreview = (quote) => {
        setSelectedQuote(quote);
        setIsPreviewOpen(true);
      };

      const handleExport = (format, quote) => {
        const contactPerson = users.find(u => u.id === quote.ownerId)?.name || 'N/A';
        
        if (format === 'pdf') {
            exportQuotationToPDF(quote, contactPerson, productTypes);
        } else if (format === 'excel') {
            exportQuotationToExcel(quote, contactPerson, productTypes);
        }
        toast({ title: `Exporting ${quote.id} to ${format.toUpperCase()}` });
      };

      return (
        <>
          <Helmet>
            <title>Quotations - Beyond Smart Tech ERP</title>
            <meta name="description" content="Create and manage client quotations." />
          </Helmet>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
                    <p className="text-muted-foreground">A list of all created quotations.</p>
                </div>
                <Button asChild>
                    <Link to="/quotations/new">
                        <PlusCircle className="mr-2 h-4 w-4" /> New Quotation
                    </Link>
                </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Quotations</CardTitle>
                <CardDescription>Review and manage all quotations from here.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userQuotations.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>{q.id}</TableCell>
                        <TableCell className="cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>{q.clientName}</TableCell>
                        <TableCell className="cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>{new Date(q.date).toLocaleDateString()}</TableCell>
                        <TableCell className="cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>${q.total.toFixed(2)}</TableCell>
                        <TableCell className="cursor-pointer" onClick={() => navigate(`/quotations/${q.id}`)}>{getStatusBadge(q.status, q.date)}</TableCell>
                         <TableCell className="text-right space-x-1">
                           <Button variant="ghost" size="icon" onClick={() => handlePreview(q)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => showQrCode(q)}>
                            <QrCode className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <FileDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleExport('pdf', q)}>Export as PDF</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExport('excel', q)}>Export as Excel</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <QRCodeDialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen} value={qrCodeValue} title="Quotation QR Code" />
          <QuotationPreviewDialog
            open={isPreviewOpen}
            onOpenChange={setIsPreviewOpen}
            quotation={selectedQuote}
            productTypes={productTypes}
            contactPerson={selectedQuote ? users.find(u => u.id === selectedQuote.ownerId)?.name : 'N/A'}
          />
        </>
      );
    };

    export default Quotations;
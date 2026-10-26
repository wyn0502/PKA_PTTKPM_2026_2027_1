// Dung Pham Anh: FineDTO: biên lai phạt kèm độc giả và nhan đề liên quan
export const toFineDTO = (row) => ({
  fineId: row.fine_id,
  loanId: row.loan_id,
  readerId: row.reader_id,
  readerName: row.reader_name,
  barcode: row.barcode,
  title: row.title,
  fineType: row.fine_type,
  reason: row.reason,
  amount: Number(row.amount),
  isPaid: row.is_paid,
  createdAt: row.created_at,
  paidAt: row.paid_at,
  collectorName: row.collector_name,
});

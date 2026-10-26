// Dung Pham Anh: LoanDTO: phiếu mượn kèm danh sách bản sao và cờ quá hạn
export const toLoanItemDTO = (row) => ({
  barcode: row.barcode,
  isbn: row.isbn,
  title: row.title,
  author: row.author,
  shelfLocation: row.shelf_location,
  returnedAt: row.returned_at,
  returnCondition: row.return_condition,
});

export const toLoanDTO = (row, today, items) => ({
  loanId: row.loan_id,
  readerId: row.reader_id,
  readerName: row.reader_name,
  studentCode: row.student_code,
  staffId: row.staff_id,
  staffName: row.staff_name,
  createdDate: row.created_date,
  dueDate: row.due_date,
  actualReturnDate: row.actual_return_date,
  renewCount: row.renew_count,
  status: row.status,
  isOverdue: row.status === 'Borrowing' && row.due_date < today,
  itemCount: row.item_count,
  unreturnedCount: row.unreturned_count,
  ...(items ? { items: items.map(toLoanItemDTO) } : {}),
});

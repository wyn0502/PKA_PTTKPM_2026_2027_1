// Dung Pham Anh: LoanHistoryDTO: dòng lịch sử mượn – trả theo từng bản sao, dùng cho cổng độc giả
export const toLoanHistoryDTO = (loan, item, today) => ({
  loanId: loan.loan_id,
  barcode: item.barcode,
  isbn: item.isbn,
  title: item.title,
  author: item.author,
  createdDate: loan.created_date,
  dueDate: loan.due_date,
  renewCount: loan.renew_count,
  returnedAt: item.returned_at,
  returnCondition: item.return_condition,
  status: item.returned_at ? 'Returned' : loan.due_date < today ? 'Overdue' : 'Borrowing',
});

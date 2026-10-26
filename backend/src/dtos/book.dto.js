// Dung Pham Anh: BookDTO: chuyển bản ghi đầu sách và bản sao từ CSDL sang dữ liệu trả về cho client
export const toBookTitleDTO = (row) => ({
  isbn: row.isbn,
  title: row.title,
  author: row.author,
  publishYear: row.publish_year,
  description: row.description,
  categoryId: row.category_id,
  categoryName: row.category_name,
  publisherId: row.publisher_id,
  publisherName: row.publisher_name,
  totalCopies: row.total_copies ?? 0,
  availableCopies: row.available_copies ?? 0,
  pendingReservations: row.pending_reservations ?? 0,
});

export const toBookCopyDTO = (row) => ({
  barcode: row.barcode,
  isbn: row.isbn,
  title: row.title,
  loanStatus: row.loan_status,
  physicalCondition: row.physical_condition,
  shelfLocation: row.shelf_location,
  createdAt: row.created_at,
  borrower: row.reader_id ? { readerId: row.reader_id, fullName: row.reader_name, dueDate: row.due_date } : null,
});

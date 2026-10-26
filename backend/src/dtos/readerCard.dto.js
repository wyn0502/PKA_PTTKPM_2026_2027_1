// Dung Pham Anh: ReaderCardDTO: hồ sơ độc giả kèm trạng thái thẻ, hạn mức và nợ phạt
export function cardStatusOf(row, today) {
  if (!row.account_status) return 'Locked';
  if (row.card_expiry_date < today) return 'Expired';
  return 'Active';
}

export const toReaderCardDTO = (row, today) => ({
  readerId: row.reader_id,
  accountId: row.account_id,
  username: row.username,
  fullName: row.full_name,
  email: row.email,
  phone: row.phone,
  studentCode: row.student_code,
  identityNumber: row.identity_number,
  readerType: row.reader_type,
  maxBorrowLimit: row.max_borrow_limit,
  cardIssuedDate: row.card_issued_date,
  cardExpiryDate: row.card_expiry_date,
  cardStatus: cardStatusOf(row, today),
  borrowingCount: row.borrowing_count ?? 0,
  unpaidFineTotal: Number(row.unpaid_fine_total ?? 0),
});

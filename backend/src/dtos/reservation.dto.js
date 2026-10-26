// Dung Pham Anh: ReservationDTO: yêu cầu đặt trước kèm vị trí trong hàng đợi
export const toReservationDTO = (row) => ({
  reserveId: row.reserve_id,
  readerId: row.reader_id,
  readerName: row.reader_name,
  isbn: row.isbn,
  title: row.title,
  author: row.author,
  reserveDate: row.reserve_date,
  expireDate: row.expire_date,
  status: row.status,
  barcode: row.barcode,
  queuePosition: row.queue_position,
});

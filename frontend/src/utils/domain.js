// Dung Pham Anh: Hàm suy luận trạng thái nghiệp vụ dùng chung giữa các màn hình (phiếu quá hạn, đặt trước còn hiệu lực)
export const loanStatusOf = (loan) => (loan.isOverdue ? 'Overdue' : loan.status);

export const isActiveReservation = (reservation) => reservation.status === 'Pending' || reservation.status === 'Ready';

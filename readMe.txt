
=================== Link Heroku Test ===========
https://nodejsass2.herokuapp.com/
=================== Account Test ===============
------Admin
    + Email: lam.truong1996@gmail.com
    + Password: 12345

------Employee
    + lam.truong19961@gmail.com - 12345
    + lam.truong19963@gmail.com - 12345
    + lam.truong19964@gmail.com - 12345
    + lam.truong19965@gmail.com - 12345
===================Yêu cầu dự án================

Chức năng và yêu cầu cơ bản

1. Sử dụng Express.js framework.

2. Thiết kế giao diện

Thiết kế giao diện tự do, nhưng hãy cố gắng đảm bảo các quy tắc UI, UX: https://bizflycloud.vn/tin-tuc/khai-niem-co-ban-ve-ui-va-ux-20180406104615273.htm
Nâng cao: Responsive trên 3 loại thiết bị: Mobile, tablet, Desktop.
3. Thiết kế cơ sở dữ liệu

Tham khảo, không bắt buộc phải làm: Cập nhật lại ERD vì yêu cầu phần mềm đã có thay đổi.
4. Yêu cầu:

a. Màn hình “Điểm danh bắt đầu/kết thúc làm”  (MH-1)

- Nếu chưa đăng nhập thì chuyển qua màn hình đăng nhập.

- Chọn “Điểm danh”, hiện bảng để chọn thông tin bắt đầu điểm danh bao gồm:

Hiển thị (không thể chỉnh sửa) tên nhân viên.
Hiển thị lựa chọn nơi làm việc (Nhà, Công ty, khách hàng), mặc định là công ty.
Sau khi bấm submit, server sẽ trả về kết quả bắt đầu làm việc bao gồm: Tên nhân viên, nơi làm việc, thời gian bắt đầu (giờ lấy từ server).
Chuyển trạng thái sang đang làm việc.
Cho phép bắt đầu làm nhiều lần trong ngày.
- Chọn “Kết thúc làm”, hiển thị thông tin:

Số giờ đã làm hôm nay.
Danh sách các lượt bắt đầu, kết thúc trong ngày kèm thông tin nơi làm việc.
Chuyển sang trạng thái không làm việc.
Cho phép kết thúc làm nhiều lần trong ngày.
- Đăng ký nghỉ phép:

Chọn ngày (chọn được cả ngày trong quá khứ, cho phép chọn nhiều ngày).
Lý do.
Hiển thị thông tin số ngày còn lại (không thể chỉnh sửa).
Nếu số ngày annualLeave còn lại là 0 thì thông báo và không cho phép đăng ký.
Chọn số giờ sẽ nghỉ (tối đa 8h cho mỗi ngày), số giờ sẽ nghỉ phải nhỏ hơn số ngày annualLeave còn lại (mỗi ngày annualLeave = 8h). Lúc nhập xong hệ thống sẽ hiển thị quy đổi ra là bao nhiêu ngày, ví dụ 4h thì hiện là 0.5 ngày.
Đăng ký xong thì trừ vào vào số ngày annualLeave còn lại. Số ngày annualLeave này không bao giờ mất đi nếu không dùng đến, mỗi năm admin sẽ tiến hành add thêm annualLeave bằng một hệ thống khác.
b. Màn hình “Xem/sửa thông tin cá nhân” (MH-2)

- Nếu chưa đăng nhập thì chuyển qua màn hình đăng nhập.

- Cho phép xem thông tin

id (không thể chỉnh sửa)
name (không thể chỉnh sửa)
doB (không thể chỉnh sửa)
salaryScale (không thể chỉnh sửa)
startDate (không thể chỉnh sửa)
department (không thể chỉnh sửa)
annualLeave (không thể chỉnh sửa)
Image (có thể chỉnh sửa bằng cách upload file)
c. Màn hình Tra cứu thông tin giờ làm (của toàn bộ quá trình làm ở công ty, không theo tháng), lương tháng (MH-3)

- Nếu chưa đăng nhập thì chuyển qua màn hình đăng nhập.

- Hiển thị danh sách giờ đã làm:

Ngày.
Giờ bắt đầu.
Giờ kết thúc.
Nơi làm việc.
Số giờ được tính là làm thêm. Giờ làm thêm là giờ làm sau 8 tiếng.
annualLeave đã đăng ký.
Tổng số giờ đã làm của lần bắt đầu/kết thúc này.
Nếu là lần cuối cùng của ngày thì hiện tổng số giờ làm theo ngày  (số giờ đã làm của cả ngày + giờ đã đăng ký annualLeave).
- Hiển thị thông tin chi tiết lương tháng (chọn được tháng muốn xem). Lương = salaryScale * 3000000 + (overTime - số giờ làm thiếu) * 200000). Số giờ làm còn thiếu là khi chưa đủ 8h/ngày kể cả đã cộng annualLeave của ngày đó. Hiển thị chi tiết thông tin trong công thức trên.

- Hiển thị thông tin id, tên của quản lý.

- Danh sách được phân trang, có thể chọn số dòng hiển thị (20, 30, 40).

- Nâng cao: cho phép sắp xếp thông tin theo ngày, nơi làm việc.

- Nâng cao: Wildcard search (cho phép chọn trường thông tin muốn tìm).

d. Màn hình thông tin Covid cá nhân (MH-4)

- Nếu chưa đăng nhập thì chuyển qua màn hình đăng nhập.

- Nếu là quản lý thì cho phép xem thông tin covid của những nhân viên mình quản lý.

- Cho phép quản lý xuất danh sách thông tin covid cá nhân ra PDF.

- Đăng ký thông tin thân nhiệt (kèm ngày, giờ đăng ký).

- Đăng ký thông tin tiêm vaccine (mũi 1 loại gì ngày nào, mũi 2 loại gì ngày nào).

- Đăng ký thông tin dương tính với covid.

e. Màn hình Xác nhận dữ liệu giờ làm đã đúng của tháng (MH-5)

- Nếu chưa đăng nhập thì chuyển qua màn hình đăng nhập.

- Chỉ hiển thị chức năng này nếu là quản lý.

- Cho phép chọn nhân viên để hiển thị danh sách giờ làm (trong danh sách nhân viên chỉ hiển thị những nhân viên mình quản lý).

- Cho phép xoá dữ liệu giờ làm đã kết thúc của nhân viên.

- Có nút xác nhận, bấm xác nhận thì chuyển trạng thái của nhân viên đó, tháng đó sang không thể thêm/sửa/xoá giờ làm, kể cả annualLeave .

- Hiển thị danh sách giờ đã làm:

Ngày.
Giờ bắt đầu.
Giờ kết thúc.
Nơi làm việc.
Số giờ được tính là làm thêm. Giờ làm thêm là giờ làm sau 8 tiếng.
Tổng số giờ đã làm của lần bắt đầu/kết thúc này.
Nếu là lần cuối cùng của ngày thì hiện giờ annualLeave đã đăng ký, tổng số giờ làm theo ngày  (số giờ đã làm của cả ngày + giờ đã đăng ký annualLeave).
- Có thể chọn tháng. 

f. Màn hình đăng nhập (MH-6)

- Chỉ có đăng nhập, không có đăng ký, thông tin về người dùng được nhập trực tiếp vào database (trên thực tế sẽ do người quản trị hệ thống sử dụng một ứng dụng khác rồi đăng ký).

- Đăng nhập xong thì quay lại trang trước đó, nếu không có trang trước đó thì quay về trang chủ.

- Hiện nút cho phép đăng xuất sau khi đăng nhập thành công.

5. Nâng cao: Publish website lên https://www.heroku.com và cập nhật link website vào github.


6. Nâng cao: Tạo database và kết nối ứng dụng đã publish ở Heroku tới database đó.


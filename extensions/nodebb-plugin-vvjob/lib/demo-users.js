'use strict';
// Fictional profiles only. The seed never writes evidence/email verification.
const surnames = ['Nguyễn','Trần','Lê','Phạm','Hoàng','Huỳnh','Phan','Vũ','Võ','Đặng','Bùi','Đỗ','Hồ','Ngô','Dương','Đinh','Đoàn','Trịnh','Mai','Lâm'];
const male = ['Minh Anh','Quang Huy','Đức Anh','Hoàng Nam','Tuấn Kiệt','Gia Hưng','Minh Khang','Nhật Minh','Đăng Khoa','Bảo Long','Anh Tuấn','Quốc Bảo','Thanh Sơn','Trung Hiếu','Hữu Phúc','Duy Khánh','Hải Đăng','Việt Hoàng','Chí Thành','Xuân Trường','Công Minh','Thành Đạt','Đình Phong','Huy Hoàng','Tiến Dũng'];
const female = ['Ngọc Anh','Thảo Linh','Phương Anh','Khánh Linh','Minh Châu','Bảo Ngọc','Hà My','Thu Trang','Diệu Linh','Quỳnh Anh','Thanh Hà','Ngọc Mai','Hương Giang','Lan Anh','Tú Anh','Yến Nhi','Hải Yến','Phương Thảo','Thu Hà','Kim Ngân','Hoài An','Mai Chi','Khánh Vy','Thanh Trúc','Như Quỳnh'];
const roles = ['Kỹ sư phần mềm','Chuyên viên nhân sự','Chuyên viên marketing','Chuyên viên tài chính','Thiết kế sản phẩm','Chuyên viên kinh doanh','Phân tích dữ liệu','Quản lý dự án','Chuyên viên vận hành','Chăm sóc khách hàng'];
const companies = ['fpt','vng','momo','vietcombank','vnpt','acb','hoa-phat','masan'];
const cities = ['Hà Nội','Thành phố Hồ Chí Minh','Đà Nẵng','Hải Phòng','Cần Thơ'];
const BATCH = 'vvjob-demo-20261019';
function record(index) {
  if (!Number.isInteger(index) || index < 1 || index > 500) throw Error('Invalid demo index');
  // Permutation gives varied names and alternating genders/verification at every page.
  const n = ((index - 1) * 137) % 500, woman = index % 2 === 0;
  const name = `${surnames[Math.floor(n / 25)]} ${(woman ? female : male)[n % 25]}`;
  return { index, username: `${name} Demo${String(index).padStart(3,'0')}`, fullname: name,
    gender: woman ? 'female' : 'male', simulatedVerified: index % 4 < 2,
    position: roles[Math.floor(n / 5) % roles.length], companyId: companies[n % companies.length], city: cities[n % cities.length], batch: BATCH };
}
function avatar(index) {
  const person = record(index), n = index * 2654435761 >>> 0;
  const backgrounds = ['#dce8f5','#f1e3d7','#e0eae2','#e6e1ef','#e9e6db','#dce9eb'];
  const skin = ['#e4b799','#d4a080','#edc6aa','#c98f6c'][n % 4], hair = ['#24242d','#382c29','#292932','#46332c'][n % 4];
  const coat = ['#314a69','#555e70','#b77b67','#526b62','#68789b','#89758a'][Math.floor(n / 7) % 6];
  const woman = person.gender === 'female', dx = n % 7 - 3;
  const longHair = woman ? `<path d="M57 90Q54 34 100 32Q149 35 146 98L154 171H48Z" fill="${hair}"/>` : '';
  const glasses = n % 5 === 0 ? '<g fill="none" stroke="#42414b" stroke-width="2"><rect x="68" y="86" width="27" height="18" rx="6"/><rect x="105" y="86" width="27" height="18" rx="6"/><path d="M95 92h10"/></g>' : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" role="img" aria-label="Ảnh minh họa nhân vật hư cấu"><defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="${backgrounds[n % 6]}"/><stop offset="1" stop-color="#f7f7f4"/></linearGradient></defs><rect width="200" height="200" fill="url(#bg)"/><circle cx="158" cy="32" r="72" fill="#fff" opacity=".25"/><g transform="translate(${dx} 0)">${longHair}<path d="M27 200q2-55 52-60h42q49 5 52 60" fill="${coat}"/><path d="m79 139 21 26 21-26-2-18H81Z" fill="${skin}"/><path d="m79 141 21 24-17 35H65l-7-44Z" fill="#fff" opacity=".9"/><path d="m121 141-21 24 17 35h18l7-44Z" fill="#fff" opacity=".9"/><ellipse cx="65" cy="97" rx="7" ry="12" fill="${skin}"/><ellipse cx="135" cy="97" rx="7" ry="12" fill="${skin}"/><path d="M65 75q0-35 35-35t35 35v26q-3 38-35 39-32-1-35-39Z" fill="${skin}"/><path d="M63 83Q52 35 98 32q49-1 40 53l-12-18q-12 5-29-13-8 22-34 29Z" fill="${hair}"/><path d="M76 83q7-4 14-1m21 0q7-3 14 1" fill="none" stroke="${hair}" stroke-width="3" stroke-linecap="round"/><g fill="#343039"><ellipse cx="84" cy="94" rx="2.7" ry="3"/><ellipse cx="116" cy="94" rx="2.7" ry="3"/></g><path d="m101 97-3 12h5" fill="none" stroke="#b67c63" stroke-width="1.7" stroke-linecap="round"/><path d="M88 119q12 10 24 0" fill="${woman ? '#bb6c6c' : '#ad705f'}"/><path d="M91 119h18" stroke="#fff" stroke-width="2" stroke-linecap="round"/>${glasses}${woman ? '<g fill="#d6ab64"><circle cx="63" cy="110" r="3"/><circle cx="137" cy="110" r="3"/></g>' : ''}</g><rect x="9" y="176" width="68" height="17" rx="8" fill="#fff" opacity=".9"/><text x="43" y="188" font-size="9" font-family="sans-serif" text-anchor="middle" fill="#71839a">DEMO ${String(index).padStart(3,'0')}</text></svg>`;
}
module.exports = { record, avatar, BATCH };

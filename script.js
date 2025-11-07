// 이미지가 HTML에 직접 있으므로 JS 필수 아님.
// 필요한 인터랙션만 유지.
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector(".search input");
  if (!searchInput) return;
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const keyword = searchInput.value.trim();
      if (keyword) alert(`'${keyword}' 검색을 준비 중입니다!`);
    }
  });
});

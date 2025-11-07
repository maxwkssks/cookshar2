// 스크롤/검색 인터랙션
document.addEventListener("DOMContentLoaded", () => {
  // 검색 엔터 시 안내
  const searchInput = document.querySelector(".search input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const keyword = searchInput.value.trim();
        if (keyword) alert(`'${keyword}' 검색을 준비 중입니다!`);
      }
    });
  }

  // 내비게이션 링크: 같은 페이지 앵커는 스무스 스크롤 (CSS로도 처리되지만 호환용)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
      }
    });
  });
});
// === Slider ===
document.querySelectorAll('[data-slider]').forEach((slider) => {
  const track = slider.querySelector('[data-track]');
  const btnPrev = slider.querySelector('[data-prev]');
  const btnNext = slider.querySelector('[data-next]');
  const dotsWrap = slider.querySelector('[data-dots]');

  // 가시 슬라이드 수 추정 후 페이지 수 계산
  const getPageSize = () => {
    const slide = track.querySelector('.slide');
    if (!slide) return 1;
    const vw = slider.querySelector('.slider-viewport').clientWidth;
    const sw = slide.clientWidth + parseFloat(getComputedStyle(track).gap || 0);
    return Math.max(1, Math.floor(vw / sw));
  };

  const pages = () => {
    const total = track.children.length;
    return Math.max(1, Math.ceil(total / getPageSize()));
  };

  // 도트 생성
  const makeDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < pages(); i++) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `${i+1}번째 페이지로 이동`);
      if (i === 0) b.setAttribute('aria-current', 'true');
      b.addEventListener('click', () => {
        const slideW = track.querySelector('.slide').clientWidth + parseFloat(getComputedStyle(track).gap || 0);
        track.scrollTo({ left: i * slideW * getPageSize(), behavior: 'smooth' });
      });
      dotsWrap.appendChild(b);
    }
  };
  makeDots();

  // 현재 페이지 계산 & 도트 업데이트
  const updateDots = () => {
    const slideW = track.querySelector('.slide').clientWidth + parseFloat(getComputedStyle(track).gap || 0);
    const current = Math.round(track.scrollLeft / (slideW * getPageSize()));
    dotsWrap.querySelectorAll('button').forEach((d, i) => {
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  };

  // 버튼 이동
  const scrollByPage = (dir) => {
    const viewport = slider.querySelector('.slider-viewport');
    const delta = dir * viewport.clientWidth * 0.95;
    track.scrollBy({ left: delta, behavior: 'smooth' });
  };
  btnPrev.addEventListener('click', () => scrollByPage(-1));
  btnNext.addEventListener('click', () => scrollByPage(1));

  // 휠(Shift 없이 가로로만)
  track.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      // 가로 스크롤 중심
    } else {
      // 세로 휠은 가로로 변환
      track.scrollBy({ left: e.deltaY, behavior: 'auto' });
      e.preventDefault();
    }
  }, { passive: false });

  // 드래그/스와이프
  let isDown = false, startX = 0, startLeft = 0;
  track.addEventListener('pointerdown', (e) => {
    isDown = true;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener('pointermove', (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    track.scrollLeft = startLeft - dx;
  });
  track.addEventListener('pointerup', (e) => {
    isDown = false;
    track.releasePointerCapture(e.pointerId);
  });
  track.addEventListener('pointercancel', () => { isDown = false; });

  // 키보드 (뷰포트 포커스 시 좌우/홈/엔드)
  slider.querySelector('.slider-viewport').addEventListener('keydown', (e) => {
    if (['ArrowRight','ArrowLeft','Home','End','PageUp','PageDown'].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') scrollByPage(1);
    if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   scrollByPage(-1);
    if (e.key === 'Home') track.scrollTo({ left: 0, behavior: 'smooth' });
    if (e.key === 'End')  track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
  });

  // 리사이즈 시 도트/페이지 재계산
  const ro = new ResizeObserver(() => { makeDots(); updateDots(); });
  ro.observe(slider.querySelector('.slider-viewport'));

  // 스크롤 이벤트로 도트 갱신
  track.addEventListener('scroll', () => { updateDots(); }, { passive: true });
});

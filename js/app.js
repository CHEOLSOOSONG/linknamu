/**
 * 링크나무 — 앱 로직 및 렌더링
 *
 * data.js 와 storage.js 에 의존합니다.
 * 클래식 스크립트이므로 이들이 먼저 로드되어야 합니다.
 */

(function () {
  "use strict";

  var DATA = window.LinkNamu.data;
  var STORAGE = window.LinkNamu.storage;

  // DOM 원소들
  var profilePhoto = document.getElementById("profile-photo");
  var profileName = document.getElementById("profile-name");
  var profileBio = document.getElementById("profile-bio");
  var linkList = document.getElementById("link-list");
  var emptyState = document.getElementById("empty-state");
  var shareButton = document.getElementById("share-button");
  var toast = document.getElementById("toast");

  /**
   * 프로필 사진이 없으면 이니셜 기반 아바타를 생성합니다.
   * 예: "송철수" → "송"
   */
  function createAvatarCanvas() {
    // 원본 사진 비율과 같은 1:1.33 비율로 만듭니다.
    var canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 400;

    var ctx = canvas.getContext("2d");
    var colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
    var hash = 0;

    // 이름으로 해시 생성
    for (var i = 0; i < DATA.profile.name.length; i++) {
      hash = (hash << 5) - hash + DATA.profile.name.charCodeAt(i);
      hash = hash & hash;
    }

    var color = colors[Math.abs(hash) % colors.length];

    // 배경
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 글자
    ctx.fillStyle = "#fff";
    ctx.font = "bold 150px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(DATA.profile.name.charAt(0), canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL();
  }

  /**
   * 프로필 렌더링
   */
  function renderProfile() {
    profileName.textContent = DATA.profile.name;
    profileBio.textContent = DATA.profile.bio;

    // 사진이 있으면 사용, 없으면 아바타 생성
    if (DATA.profile.photo) {
      profilePhoto.src = DATA.profile.photo;
    } else {
      profilePhoto.src = createAvatarCanvas();
    }
  }

  /**
   * 링크 카드 하나를 생성합니다.
   * XSS 방지를 위해 createElement 로만 조립합니다.
   */
  function createLinkCard(link) {
    var li = document.createElement("li");
    li.className = "link-item";

    var a = document.createElement("a");
    a.href = link.url;
    a.className = "link-card";
    a.rel = "noopener noreferrer";

    // 외부 링크인 경우 새 창에서 열기
    if (link.url.startsWith("http")) {
      a.target = "_blank";
    }

    // 클릭 핸들러: 클릭수 증가
    a.addEventListener("click", function () {
      STORAGE.increment(link.id);
    });

    // 아이콘
    var emoji = document.createElement("span");
    emoji.className = "link-card__emoji";
    emoji.textContent = link.emoji || "🔗";

    // 텍스트
    var label = document.createElement("span");
    label.className = "link-card__label";
    label.textContent = link.label;

    a.appendChild(emoji);
    a.appendChild(label);
    li.appendChild(a);

    return li;
  }

  /**
   * 링크 목록 렌더링
   */
  function renderLinks() {
    // 기존 항목 제거
    linkList.innerHTML = "";

    if (!DATA.links || DATA.links.length === 0) {
      emptyState.removeAttribute("hidden");
      return;
    }

    emptyState.setAttribute("hidden", "");

    DATA.links.forEach(function (link) {
      linkList.appendChild(createLinkCard(link));
    });
  }

  /**
   * 토스트 메시지 표시 (3초 자동 닫힘)
   */
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("visible");

    setTimeout(function () {
      toast.classList.remove("visible");
    }, 3000);
  }

  /**
   * 페이지 공유
   *
   * 1) Web Share API (모바일) → 2) 클립보드 복사 → 3) 수동 복사 안내
   * 순서로 시도합니다. 사용자가 공유를 취소해도 오류로 취급하지 않습니다.
   */
  function handleShare() {
    var url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: DATA.profile.name,
          text: DATA.profile.bio,
          url: url,
        })
        .catch(function (err) {
          // 사용자가 공유 시트를 닫은 경우이므로 조용히 무시합니다.
          if (err && err.name === "AbortError") return;
          copyToClipboard(url);
        });
      return;
    }

    copyToClipboard(url);
  }

  function copyToClipboard(url) {
    // file:// 또는 http:// 등 보안 컨텍스트가 아니면 clipboard 가 없을 수 있습니다.
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      showToast("주소표시줄의 URL을 복사해 공유해 주세요.");
      return;
    }

    navigator.clipboard.writeText(url).then(
      function () {
        showToast("URL이 복사되었습니다!");
      },
      function () {
        showToast("복사에 실패했습니다. 주소표시줄을 이용해 주세요.");
      }
    );
  }

  /**
   * 초기화
   */
  function init() {
    renderProfile();
    renderLinks();

    shareButton.addEventListener("click", handleShare);

    // 개발 편의: 콘솔에서 LinkNamu.storage.reset() 으로 클릭수 초기화 가능
    console.log("[링크나무] 준비 완료. 콘솔에서 LinkNamu.storage.reset() 으로 통계를 초기화할 수 있습니다.");
  }

  // DOM 로드 완료 후 실행
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

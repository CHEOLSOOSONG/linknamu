/**
 * 링크나무 — 콘텐츠 데이터
 *
 * 이 파일만 고치면 페이지 내용이 바뀝니다.
 * 나중에 Next.js + MongoDB 로 옮길 때, 이 구조가 그대로 API 응답 형태가 됩니다.
 */
window.LinkNamu = window.LinkNamu || {};

window.LinkNamu.data = {
  profile: {
    name: "송철수",
    bio: "프론트엔드 개발자 · 기록하는 사람",
    // 실제 사진을 쓰려면 이 폴더에 파일을 넣고 "profile.jpg" 처럼 경로만 바꾸세요.
    // 비워두면 아래 이니셜 아바타가 자동 생성됩니다.
    photo: "0192.jpeg",
  },

  /**
   * 링크 카드 목록. 위에서부터 화면에 표시되는 순서입니다.
   * - label : 카드에 보이는 이름
   * - url   : 이동할 주소
   * - emoji : 왼쪽 아이콘 (생략 가능)
   */
  links: [
    { id: "github", label: "GitHub", url: "https://github.com", emoji: "💻" },
    { id: "blog", label: "블로그", url: "https://velog.io", emoji: "✍️" },
    { id: "instagram", label: "Instagram", url: "https://instagram.com", emoji: "📷" },
    { id: "email", label: "이메일 보내기", url: "mailto:hello@example.com", emoji: "✉️" },
  ],
};

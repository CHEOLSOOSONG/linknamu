/**
 * 링크나무 — 클릭수 저장 계층
 *
 * PRD 의 "클릭수 집계" 를 담당합니다.
 * 지금은 localStorage 에 저장하지만, 나중에 MongoDB Atlas 로 옮길 때
 * 이 파일의 get/increment 두 함수만 API 호출로 바꾸면 됩니다.
 */
window.LinkNamu = window.LinkNamu || {};

window.LinkNamu.storage = (function () {
  "use strict";

  var STORAGE_KEY = "linknamu:clicks:v1";

  /**
   * 저장된 값을 읽습니다.
   * localStorage 는 사파리 프라이빗 모드 등에서 접근 자체가 막힐 수 있으므로
   * 어떤 경우에도 예외를 밖으로 던지지 않고 빈 객체를 돌려줍니다.
   */
  function readAll() {
    var raw;
    try {
      raw = window.localStorage.getItem(STORAGE_KEY);
    } catch (err) {
      console.warn("[링크나무] 클릭수를 읽을 수 없습니다.", err);
      return {};
    }

    if (!raw) return {};

    try {
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

      // devtools 로 값이 조작됐을 수 있으므로 숫자만 남깁니다.
      var clean = {};
      Object.keys(parsed).forEach(function (id) {
        var count = parsed[id];
        if (typeof count === "number" && Number.isFinite(count) && count >= 0) {
          clean[id] = Math.floor(count);
        }
      });
      return clean;
    } catch (err) {
      console.warn("[링크나무] 저장된 클릭수를 해석할 수 없어 초기화합니다.", err);
      return {};
    }
  }

  function writeAll(counts) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
      return true;
    } catch (err) {
      console.warn("[링크나무] 클릭수를 저장하지 못했습니다.", err);
      return false;
    }
  }

  /** 링크 하나의 클릭수 */
  function get(linkId) {
    return readAll()[linkId] || 0;
  }

  /** 클릭수를 1 올리고, 올라간 값을 돌려줍니다. */
  function increment(linkId) {
    var counts = readAll();
    counts[linkId] = (counts[linkId] || 0) + 1;
    writeAll(counts);
    return counts[linkId];
  }

  /** 전체 클릭수 초기화 (콘솔에서 LinkNamu.storage.reset() 으로 사용) */
  function reset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (err) {
      console.warn("[링크나무] 초기화에 실패했습니다.", err);
      return false;
    }
  }

  return {
    STORAGE_KEY: STORAGE_KEY,
    readAll: readAll,
    get: get,
    increment: increment,
    reset: reset,
  };
})();

export function safeToString(x) {
  switch (typeof x) {
    case "object":
      return "[object] " + JSON.stringify(x);
    case "function":
      return "function";
    default:
      return x + "";
  }
}

/**
 * Update map with k and value using the setter, removes the key if the value is null
 * @param {map} oldMap
 * @param {hook setter function} setValue
 * @param {*} k
 * @param {*} v
 */
export const updateMap = (oldMap, setValue, k, v) => {
  let m = new Map(oldMap.set(k, v));
  if (v == null) m.delete(k);
  setValue(m);
};

export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function randomMediumColour() {
  // return [randInt(50, 180), randInt(50, 180), randInt(50, 180)]
  return (
    "#" +
    randInt(50, 180).toString(16) +
    randInt(50, 200).toString(16) +
    randInt(50, 250).toString(16)
  );
}

// From https://stackoverflow.com/questions/27406607/javascript-get-url-parameter-with-hash
export function getUrlParam(name) {
  name = name.replace(/[[]/, "[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&]*)"),
    results = regex.exec(window.location.search + window.location.hash);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// From https://stackoverflow.com/questions/24816/escaping-html-strings-with-jquery
var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

export function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=/]/g, function (s) {
    return entityMap[s];
  });
}

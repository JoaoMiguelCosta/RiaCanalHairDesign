// src/app/seo/syncHead.js
import { getHeadTags } from "./routeMeta.js";

/**
 * Sincroniza o <head> com os metadados da rota ativa.
 *
 * O HTML inicial de cada rota já traz estas tags (geradas no build); aqui só
 * se atualizam/criam/removem as mesmas tags, nunca se acrescentam cópias.
 * É a única estratégia de atualização do <head> (sem tags içadas pelo React),
 * o que evita duplicados entre o HTML inicial e a navegação SPA.
 */
export function syncRouteHead(route, doc = document) {
  if (doc.title !== route.title) doc.title = route.title;

  for (const { tag, key, attr, value } of getHeadTags(route)) {
    const [keyAttr, keyValue] = key;
    const [el, ...duplicates] = doc.head.querySelectorAll(
      `${tag}[${keyAttr}="${keyValue}"]`
    );
    duplicates.forEach((dup) => dup.remove());

    if (value == null) {
      el?.remove();
      continue;
    }

    let target = el;
    if (!target) {
      target = doc.createElement(tag);
      target.setAttribute(keyAttr, keyValue);
      doc.head.appendChild(target);
    }
    if (target.getAttribute(attr) !== value) target.setAttribute(attr, value);
  }
}

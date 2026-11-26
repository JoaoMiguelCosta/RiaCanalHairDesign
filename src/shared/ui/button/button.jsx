import { forwardRef } from "react";

/**
 * Botão ou link com a mesma API de apresentação.
 * - Com `href` (string): navegação → renderiza <a>. Atributos exclusivos de
 *   botão (`type`, `disabled`) não chegam ao link; com target="_blank" o `rel`
 *   assume "noopener noreferrer" se não for indicado.
 * - Sem `href`: ação → renderiza <button type="button"> (não submete
 *   formulários por acidente; `type` pode ser sobreposto).
 * - `className` é a classe do elemento; atributos HTML/ARIA nativos
 *   (`aria-label`, `aria-pressed`, `onClick`, …) são encaminhados.
 */
const Button = forwardRef(function Button(
  { children, href, target, rel, type = "button", disabled = false, ...props },
  ref
) {
  if (typeof href === "string") {
    const safeRel = target === "_blank" ? rel || "noopener noreferrer" : rel;

    return (
      <a ref={ref} href={href} target={target} rel={safeRel} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button ref={ref} type={type} disabled={disabled} {...props}>
      {children}
    </button>
  );
});

export default Button;

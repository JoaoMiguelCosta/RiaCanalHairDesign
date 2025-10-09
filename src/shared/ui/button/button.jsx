import { forwardRef } from "react";

const Button = forwardRef(function Button(
  {
    button, // classe (mantido)
    children,
    href, // opcional: se existir, renderiza <a>
    target,
    rel,
    loading = false, // opcional: estado de loading
    disabled = false, // opcional
    ariaLabel, // opcional: acessibilidade
    ...props
  },
  ref
) {
  const isLink = typeof href === "string";

  // se for link externo e tiver target=_blank, reforça segurança
  const safeRel =
    isLink && target === "_blank" ? rel || "noopener noreferrer" : rel;

  if (isLink) {
    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel={safeRel}
        className={button}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        role="button"
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type="button"
      className={button}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;

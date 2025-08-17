export default function Button({ button, children, ...props }) {
  return (
    <button type="button" className={button} {...props}>
      {children}
    </button>
  );
}

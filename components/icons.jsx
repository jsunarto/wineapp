function Icon({ children, className = "" }) {
  return <span className={`inline-flex h-5 w-5 items-center justify-center ${className}`}>{children}</span>;
}

export const Icons = {
  search: <Icon>⌕</Icon>,
  wine: <Icon>🍷</Icon>,
  clipboard: <Icon>📋</Icon>,
  save: <Icon>💾</Icon>,
  reset: <Icon>↺</Icon>,
  star: <Icon>★</Icon>,
  book: <Icon>📘</Icon>,
  check: <Icon>✓</Icon>,
};

import { useTheme } from '../../context/ThemeContext';

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  icon = null,
  type = 'button'
}) {
  const { isDark } = useTheme();

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantStyles = {
    primary: isDark
      ? 'bg-white text-navy-900 hover:bg-cream'
      : 'bg-teal-600 text-white hover:bg-teal-700',
    secondary: isDark
      ? 'bg-navy-700 text-gold-400 hover:bg-navy-600 border border-navy-600'
      : 'bg-white text-teal-600 hover:bg-gray-50 border border-light-border',
    ghost: isDark
      ? 'text-cream/60 hover:text-cream hover:bg-navy-800/50'
      : 'text-light-muted hover:text-light-text hover:bg-light-border/50',
    danger: isDark
      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        rounded-xl font-medium transition-all
        flex items-center justify-center gap-2
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {icon && <span className="w-5 h-5">{icon}</span>}
      {children}
    </button>
  );
}

export default Button;

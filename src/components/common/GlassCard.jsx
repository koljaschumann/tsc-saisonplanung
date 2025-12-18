import { useTheme } from '../../context/ThemeContext';

export function GlassCard({
  children,
  className = '',
  onClick,
  shimmer = false,
  glow = false,
  hoverLift = false,
  gradientBorder = false,
  animate = false
}) {
  const { isDark } = useTheme();

  const baseStyles = isDark
    ? 'bg-gradient-to-br from-navy-800/80 to-navy-900/95 border-gold-400/15'
    : 'bg-white border-light-border';

  const shadowStyles = isDark
    ? 'shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
    : 'shadow-[0_4px_24px_rgba(0,0,0,0.08)]';

  return (
    <div
      className={`
        rounded-2xl border p-6
        ${baseStyles}
        ${shadowStyles}
        ${shimmer ? 'shimmer' : ''}
        ${glow ? 'glow-pulse' : ''}
        ${hoverLift ? 'hover-lift' : ''}
        ${gradientBorder ? 'gradient-border' : ''}
        ${animate ? 'fade-slide-in' : ''}
        ${onClick ? 'cursor-pointer hover:scale-[1.01] transition-transform' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default GlassCard;

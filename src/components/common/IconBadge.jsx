import { useTheme } from '../../context/ThemeContext';

export function IconBadge({ icon, color = 'gold', size = 'md', className = '' }) {
  const { isDark } = useTheme();

  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorStyles = {
    gold: isDark
      ? 'bg-gold-400/10 text-gold-400 border-gold-400/20'
      : 'bg-teal-100 text-teal-600 border-teal-200',
    purple: isDark
      ? 'bg-purple-400/10 text-purple-400 border-purple-400/20'
      : 'bg-purple-100 text-purple-600 border-purple-200',
    cyan: isDark
      ? 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20'
      : 'bg-cyan-100 text-cyan-600 border-cyan-200',
    amber: isDark
      ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
      : 'bg-amber-100 text-amber-600 border-amber-200',
    emerald: isDark
      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
      : 'bg-emerald-100 text-emerald-600 border-emerald-200',
    red: isDark
      ? 'bg-red-400/10 text-red-400 border-red-400/20'
      : 'bg-red-100 text-red-600 border-red-200',
    slate: isDark
      ? 'bg-slate-400/10 text-slate-400 border-slate-400/20'
      : 'bg-slate-100 text-slate-600 border-slate-200'
  };

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-xl border
        flex items-center justify-center
        ${colorStyles[color] || colorStyles.gold}
        ${className}
      `}
    >
      <span className={iconSizeStyles[size]}>{icon}</span>
    </div>
  );
}

export default IconBadge;

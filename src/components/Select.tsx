import type { SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, options, id, ...rest }: Props) {
  const selectId = id ?? label.replace(/\s+/g, '-').toLowerCase()
  return (
    <label className="block" htmlFor={selectId}>
      <span className="mb-1.5 block font-medium text-navy">{label}</span>
      <select
        id={selectId}
        className="w-full rounded-2xl border border-line bg-white px-4 py-3 text-base text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        {...rest}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

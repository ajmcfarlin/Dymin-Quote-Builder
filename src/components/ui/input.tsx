import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ className, label, type, ...props }: InputProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // For number inputs, clear if the value is "0"
    if (type === 'number' && e.target.value === '0') {
      e.target.select()
    }
    // Call original onFocus if provided
    if (props.onFocus) {
      props.onFocus(e)
    }
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none text-gray-500">
          {label}
        </label>
      )}
      <input
        className={cn(
          'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        type={type}
        onFocus={handleFocus}
        {...props}
      />
    </div>
  )
}
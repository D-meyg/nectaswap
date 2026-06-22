import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props   { children: ReactNode; fallback?: ReactNode }
interface State   { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex min-h-[12.5rem]  flex-col items-center justify-center gap-3 rounded-(--radius-md) border border-(--color-danger-muted) bg-(--color-danger-subtle) p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-(--color-danger)" />
          <div>
            <p className="text-sm font-semibold text-(--color-text-primary)">Something went wrong</p>
            <p className="mt-0.5 text-xs text-(--color-text-tertiary)">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}

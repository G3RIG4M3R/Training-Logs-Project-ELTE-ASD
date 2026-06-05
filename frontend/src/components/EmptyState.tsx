interface EmptyStateProps {
  message: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="empty">
      <p>{message}</p>
      {action && (
        <button className="btn btn--secondary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}

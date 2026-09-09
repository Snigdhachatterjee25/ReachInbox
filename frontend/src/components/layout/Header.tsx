import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border px-6 py-4">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-9 w-9 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-mint text-sm font-semibold text-brand-mint-foreground">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      )}
    </header>
  );
}

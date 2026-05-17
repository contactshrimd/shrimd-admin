import { useMutation } from '@tanstack/react-query';
import { auth } from '../../firebase';
import { env } from '../../env';

async function downloadAuditExport(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  const token = await user.getIdToken();
  const response = await fetch(`${env.API_BASE_URL}/admin/audit-logs/export`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Export failed (${response.status})`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function useAuditExport() {
  return useMutation({ mutationFn: downloadAuditExport });
}

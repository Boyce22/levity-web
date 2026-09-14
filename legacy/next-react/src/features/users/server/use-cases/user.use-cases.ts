import { requireSession } from '@/infra/auth/session';
import { userRepository } from '../repositories/user-repository';
import { UpdateUserProfileDTOSchema } from '@/contracts/User';
import { DomainError } from '@/infra/http/errors';

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export async function getUserProfileUseCase() {
  await requireSession();
  return userRepository.getMe();
}

export async function getAllUsersUseCase(workspaceId: string) {
  await requireSession();
  if (!workspaceId) throw new DomainError('INVALID_INPUT', 'workspaceId is required.');
  const users = await userRepository.getAllUsers(workspaceId);
  return users.sort((a, b) =>
    (a.displayName || a.username).localeCompare(b.displayName || b.username),
  );
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

export async function updateUserProfileUseCase(payload: unknown) {
  await requireSession();
  const data = UpdateUserProfileDTOSchema.parse(payload);
  return userRepository.updateMe(data);
}

export async function uploadAvatarUseCase(base64: string): Promise<string> {
  await requireSession();
  const commaIdx = base64.indexOf(',');
  const meta = base64.slice(0, commaIdx);
  const b64 = base64.slice(commaIdx + 1);
  const mimeMatch = meta.match(/data:(.*?);/);
  const mime = mimeMatch?.[1] ?? 'image/png';
  const buffer = Buffer.from(b64, 'base64');
  const blob = new Blob([buffer], { type: mime });
  const formData = new FormData();
  formData.append('file', blob, 'avatar.png');
  const { avatarUrl } = await userRepository.uploadAvatar(formData);
  return avatarUrl;
}

<script lang="ts">
  import { X, Camera, Loader2, Check, AlertCircle } from 'lucide-svelte';
  import Button from '$lib/ui/Button.svelte';
  import Input from '$lib/ui/Input.svelte';
  import type { UserModel } from '$lib/contracts/models';

  interface Props {
    isOpen?: boolean;
    profile?: UserModel;
    workspaceId?: string;
    workspaceName?: string;
    workspaceAvatarUrl?: string;
    onClose?: () => void;
    onProfileUpdated?: (updated: UserModel) => void;
    onWorkspaceAvatarUpdated?: (avatarUrl: string) => void;
  }

  let {
    isOpen = false,
    profile = { id: '', username: 'User' },
    workspaceId,
    workspaceName = 'este workspace',
    workspaceAvatarUrl,
    onClose,
    onProfileUpdated,
    onWorkspaceAvatarUpdated,
  }: Props = $props();

  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let bio = $state('');
  let avatarPreview = $state('');
  let workspaceAvatarPreview = $state('');
  let workspaceAvatarInput = $state<HTMLInputElement | undefined>(undefined);
  let workspaceAvatarUpdated = $state(false);

  let uploadingAvatar = $state(false);
  let uploadingWorkspaceAvatar = $state(false);
  let saving = $state(false);
  let saved = $state(false);
  let error = $state('');

  function isRenderableImageUrl(url?: string) {
    return Boolean(url && /^(https?:|blob:|data:)/i.test(url));
  }

  $effect(() => {
    if (profile) {
      firstName = profile.firstName || '';
      lastName = profile.lastName || '';
      email = profile.email || '';
      bio = profile.bio || '';
      const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;
      avatarPreview = isRenderableImageUrl(profile.avatarUrl)
        ? profile.avatarUrl ?? fallbackAvatar
        : fallbackAvatar;
      workspaceAvatarPreview = isRenderableImageUrl(workspaceAvatarUrl)
        ? workspaceAvatarUrl ?? avatarPreview
        : avatarPreview;
      workspaceAvatarUpdated = false;
    }
  });

  async function handleAvatarSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      error = 'Please select a valid image file (JPEG, PNG, WebP, GIF).';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      error = 'Image must be smaller than 10 MiB.';
      return;
    }

    uploadingAvatar = true;
    error = '';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/files/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to upload avatar.');
      }

      if (avatarPreview.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      avatarPreview = URL.createObjectURL(file);
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Error uploading avatar.';
    } finally {
      uploadingAvatar = false;
    }
  }

  async function handleWorkspaceAvatarSelect(e: Event) {
    if (!workspaceId) return;

    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      error = 'Please select a valid image file (JPEG, PNG, WebP, GIF).';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      error = 'Image must be smaller than 10 MiB.';
      return;
    }

    uploadingWorkspaceAvatar = true;
    error = '';

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/files/workspaces/${workspaceId}/avatar`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to upload workspace photo.');
      }

      workspaceAvatarPreview = URL.createObjectURL(file);
      workspaceAvatarUpdated = true;
      onWorkspaceAvatarUpdated?.(workspaceAvatarPreview);
      input.value = '';
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Error uploading workspace photo.';
    } finally {
      uploadingWorkspaceAvatar = false;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    saving = true;
    saved = false;
    error = '';

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName.trim() || undefined,
          last_name: lastName.trim() || undefined,
          email: email.trim() || undefined,
          bio: bio.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update profile.');
      }

      const updated = await res.json();
      saved = true;
      onProfileUpdated?.(updated);
      setTimeout(() => {
        saved = false;
        onClose?.();
      }, 1000);
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Failed to update profile.';
    } finally {
      saving = false;
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') onClose?.();
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if isOpen}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="profile-modal-title"
  >
    <div
      class="bg-app-bg border-app-border flex w-full max-w-[460px] flex-col overflow-hidden rounded-sm border shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
    >
      <div class="border-app-border-faint flex items-center justify-between border-b px-6 pt-6 pb-5">
        <h2 id="profile-modal-title" class="text-app-text text-base font-bold tracking-tight">
          Edit Profile
        </h2>
        <button
          type="button"
          onclick={onClose}
          aria-label="Close modal"
          class="text-app-text-muted hover:text-app-text hover:bg-app-panel rounded-sm p-1.5 transition-colors"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <form onsubmit={handleSubmit} class="space-y-5 px-6 pt-5 pb-6">
        {#if error}
          <div class="flex items-start gap-2 rounded-sm border border-red-500/20 bg-red-500/10 p-3.5 text-[13px] font-medium text-red-400">
            <AlertCircle class="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        {/if}

        <!-- Avatar upload section -->
        <div class="flex items-center gap-4">
          <label class="group relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/10 transition-transform hover:scale-105">
            <img
              src={avatarPreview}
              alt="Avatar preview"
              class="h-full w-full object-cover"
            />
            <div class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {#if uploadingAvatar}
                <Loader2 class="h-5 w-5 animate-spin text-white" />
              {:else}
                <Camera class="h-5 w-5 text-white" />
              {/if}
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onchange={handleAvatarSelect}
              disabled={uploadingAvatar}
              class="hidden"
            />
          </label>
          <div>
            <p class="text-app-text text-sm font-semibold">Profile Photo</p>
            <p class="text-app-text-muted text-xs">JPEG, PNG, WebP or GIF up to 10 MiB</p>
          </div>
        </div>

        {#if workspaceId}
          <div class="border-app-border-faint bg-app-panel/50 rounded-sm border p-3.5">
            <div class="flex items-center gap-3">
              <div class="border-app-border-faint bg-app-bg flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-sm border">
                <img
                  src={workspaceAvatarPreview || avatarPreview}
                  alt=""
                  class="h-full w-full object-cover"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-app-text text-sm font-semibold">Foto deste workspace</p>
                <p class="text-app-text-muted truncate text-xs">Visível somente em {workspaceName}.</p>
                {#if workspaceAvatarUpdated}
                  <p class="mt-1 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <Check class="h-3 w-3" /> Foto atualizada
                  </p>
                {/if}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={uploadingWorkspaceAvatar}
                disabled={uploadingAvatar || uploadingWorkspaceAvatar}
                onclick={() => workspaceAvatarInput?.click()}
              >
                <Camera class="h-3.5 w-3.5" />
                {workspaceAvatarUpdated ? 'Trocar' : 'Adicionar'}
              </Button>
            </div>
            <input
              bind:this={workspaceAvatarInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onchange={handleWorkspaceAvatarSelect}
              disabled={uploadingAvatar || uploadingWorkspaceAvatar}
              class="hidden"
            />
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            bind:value={firstName}
            placeholder="John"
          />
          <Input
            label="Last Name"
            bind:value={lastName}
            placeholder="Doe"
          />
        </div>

        <Input
          label="Username"
          value={profile.username}
          disabled
          hint="Username cannot be changed."
        />

        <Input
          label="Email"
          type="email"
          bind:value={email}
          placeholder="you@example.com"
          autocomplete="email"
        />

        <div class="flex flex-col space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="profile-bio-input" class="text-app-text text-xs font-semibold">Bio</label>
            <span class="text-app-text-muted text-[11px]">{bio.length}/200</span>
          </div>
          <textarea
            id="profile-bio-input"
            bind:value={bio}
            maxlength={200}
            rows={3}
            placeholder="Tell us about yourself..."
            class="bg-app-bg border-app-border text-app-text focus:border-app-primary w-full resize-none rounded-sm border p-2.5 text-sm transition-colors focus:outline-none"
          ></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onclick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving}
            disabled={saving || uploadingAvatar}
          >
            {#if saved}
              <Check class="mr-1 h-4 w-4" /> Saved!
            {:else}
              Save Changes
            {/if}
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}

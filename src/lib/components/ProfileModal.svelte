<script lang="ts">
  import { X, Camera, Loader2, Check, AlertCircle } from 'lucide-svelte';
  import Button from '$lib/ui/Button.svelte';
  import Input from '$lib/ui/Input.svelte';
  import type { UserModel } from '$lib/contracts/models';

  interface Props {
    isOpen?: boolean;
    profile?: UserModel;
    onClose?: () => void;
    onProfileUpdated?: (updated: UserModel) => void;
  }

  let {
    isOpen = false,
    profile = { id: '', username: 'User' },
    onClose,
    onProfileUpdated,
  }: Props = $props();

  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let bio = $state('');
  let avatarUrl = $state('');
  let avatarPreview = $state('');

  let uploadingAvatar = $state(false);
  let saving = $state(false);
  let saved = $state(false);
  let error = $state('');

  $effect(() => {
    if (profile) {
      firstName = profile.firstName || '';
      lastName = profile.lastName || '';
      email = profile.email || '';
      bio = profile.bio || '';
      avatarUrl = profile.avatarUrl || '';
      avatarPreview = profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;
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

      const data = await res.json();
      avatarUrl = data.url;
      avatarPreview = data.url;
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Error uploading avatar.';
    } finally {
      uploadingAvatar = false;
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
          avatar_url: avatarUrl || undefined,
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

'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { initialEditorState, updateDraftSite } from './actions';

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Saving...' : 'Save'}
    </button>
  );
}

export function EditorForm({
  slug,
  initialTitle,
  initialAboutText,
}: {
  slug: string;
  initialTitle: string;
  initialAboutText: string;
}) {
  const action = updateDraftSite.bind(null, slug);
  const [state, formAction] = useActionState(action, initialEditorState);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="title" className="block text-sm font-medium text-gray-900">
          Site title
        </label>
        <input
          id="title"
          name="title"
          defaultValue={initialTitle}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="aboutText" className="block text-sm font-medium text-gray-900">
          About text
        </label>
        <textarea
          id="aboutText"
          name="aboutText"
          defaultValue={initialAboutText}
          rows={8}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <SaveButton />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state.success && <p className="text-sm text-green-600">{state.success}</p>}
      </div>
    </form>
  );
}

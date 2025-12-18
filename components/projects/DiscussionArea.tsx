import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store';
import { UserRole, FileData, ProjectUpdate } from '../../types';
import { Avatar } from '../ui/Avatar';
import { API_BASE_URL } from '../../api/config';
import { Upload, Send, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DiscussionAreaProps {
  projectId: string;
  embedded?: boolean; // when true, render without outer card so it can live in a tab
}

type DiscussionItem =
  | {
      kind: 'comment';
      createdAt: string;
      id: string;
      userId: string;
      userName: string;
      text: string;
    }
  | {
      kind: 'update';
      createdAt: string;
      id: string;
      text: string;
      files: FileData[];
      senderRole?: UserRole;
    };

export const DiscussionArea: React.FC<DiscussionAreaProps> = ({ projectId, embedded = false }) => {
  const {
    projects,
    user,
    addComment,
    addProjectUpdate,
    loadProjects,
  } = useAppStore();

  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const project = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (!project && user) {
      // Ensure project is in store
      loadProjects();
    }
  }, [project, user, loadProjects]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [project?.comments.length, project?.updates.length]);

  if (!project || !user) {
    return null;
  }

  // Build unified discussion timeline from comments + updates
  const discussionItems: DiscussionItem[] = [
    ...project.comments.map((c) => ({
      kind: 'comment' as const,
      id: c.id,
      createdAt: c.createdAt,
      userId: c.userId,
      userName: c.userName,
      text: c.text,
    })),
    ...project.updates.map((u: ProjectUpdate) => ({
      kind: 'update' as const,
      id: u.id,
      createdAt: u.createdAt,
      text: u.text,
      files: u.files || [],
      senderRole: u.senderRole,
    })),
  ].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;

    setSending(true);
    try {
      // Always add text as a comment
      if (text.trim()) {
        await addComment(projectId, text.trim());
      }

      // If any files, also create an update carrying those files
      if (files.length > 0) {
        await addProjectUpdate(projectId, text.trim(), files);
      }

      // Reload project data to refresh comments/updates
      await loadProjects();

      setText('');
      setFiles([]);
    } catch (err) {
      console.error('Failed to send discussion message', err);
    } finally {
      setSending(false);
    }
  };

  const isOwnComment = (userId: string) => userId === user.id;

  const isOwnUpdate = (senderRole?: UserRole) => {
    if (!senderRole) return false;
    return senderRole === user.role;
  };

  const containerClass = embedded
    ? 'flex flex-col h-[420px]'
    : 'mt-8 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col h-[480px]';

  const headerClass = embedded
    ? 'pb-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between'
    : 'px-5 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between';

  const bodyClass = embedded
    ? 'flex-1 overflow-y-auto py-3 space-y-4'
    : 'flex-1 overflow-y-auto px-4 py-3 space-y-4';

  const formClass = embedded
    ? 'pt-2 border-t border-gray-200 dark:border-gray-700'
    : 'p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 rounded-b-3xl';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className={headerClass}>
        <div className="flex items-center gap-2">
          <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Discussion
          </h3>
        </div>
        <span className="text-xs text-gray-400">
          {discussionItems.length} message{discussionItems.length !== 1 && 's'}
        </span>
      </div>

      {/* Messages */}
      <div className={bodyClass}>
        {discussionItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <MessageSquare size={32} className="mb-2 opacity-40" />
            <span>No messages yet. Start the conversation.</span>
          </div>
        ) : (
          discussionItems.map((item) => {
            if (item.kind === 'comment') {
              const own = isOwnComment(item.userId);
              return (
                <div
                  key={`comment-${item.id}`}
                  className={`flex space-x-3 ${
                    own ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <Avatar name={item.userName} size="sm" />
                  <div
                    className={`flex flex-col ${
                      own ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-md px-4 py-3 rounded-2xl text-sm ${
                        own
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
                      }`}
                    >
                      <div className="text-[11px] font-semibold mb-1 opacity-80">
                        {own ? 'You' : item.userName}
                      </div>
                      <div className="whitespace-pre-wrap">{item.text}</div>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              );
            }

            const ownUpdate = isOwnUpdate(item.senderRole);
            if (!item.files || item.files.length === 0) {
              // Pure text update (rare) – render like a system/info message
              return (
                <div key={`update-${item.id}`} className="flex justify-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {item.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`update-${item.id}`}
                className={`flex space-x-3 ${
                  ownUpdate ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <Avatar
                  name={item.senderRole === UserRole.ADMIN ? 'Admin' : 'Client'}
                  size="sm"
                />
                <div className="flex flex-col items-start">
                  <div className="max-w-md px-4 py-3 rounded-2xl text-sm bg-indigo-50 dark:bg-indigo-900/20 text-gray-800 dark:text-gray-100 border border-indigo-100 dark:border-indigo-800">
                    <div className="text-[11px] font-semibold mb-1 text-indigo-700 dark:text-indigo-300">
                      {item.senderRole === UserRole.ADMIN ? 'Admin' : 'Client'}{' '}
                      attachment
                    </div>
                    {item.text && (
                      <p className="mb-2 whitespace-pre-wrap">{item.text}</p>
                    )}
                    <div className="space-y-1">
                      {item.files.map((f) => (
                        <a
                          key={f.id}
                          href={`${API_BASE_URL}${f.url}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs underline break-all"
                        >
                          {f.name} ({f.size})
                        </a>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(item.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className={formClass}
      >
        <div className="flex items-center gap-2">
          <label className="flex items-center justify-center w-9 h-9 rounded-full border border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/70 transition-colors">
            <Upload size={16} className="text-gray-500" />
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
          <button
            type="submit"
            disabled={sending || (!text.trim() && files.length === 0)}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
          >
            <Send size={16} className="mr-1" />
            Send
          </button>
        </div>
        {files.length > 0 && (
          <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            {files.length} file{files.length > 1 ? 's' : ''} attached
          </div>
        )}
      </form>
    </div>
  );
}



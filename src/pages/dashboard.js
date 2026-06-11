import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@theme/Layout';
import { useTranslation } from '@site/src/context/LanguageContext';
import { fetchMessages, postMessage, deleteMessage, getFingerprint } from '@site/src/lib/supabase';
import styles from './dashboard.module.css';

/* ── helpers ── */

const MAX_CHARS = 500;

const AUTHOR_COLORS = [
  '#aab8fc', '#34d399', '#fbbf24', '#f472b6',
  '#a78bfa', '#38bdf8', '#fb923c', '#f87171',
];

function colorFor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AUTHOR_COLORS[Math.abs(hash) % AUTHOR_COLORS.length];
}

function initials(name) {
  return name.trim().slice(0, 1).toUpperCase();
}

function relativeTime(dateStr) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  if (diff < 172800) return 'yesterday';
  return new Date(dateStr).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── Toast ── */

function Toast({ message, visible }) {
  return <div className={`${styles.toast} ${visible ? styles.toastShow : ''}`}>{message}</div>;
}

/* ── MessageCard ── */

function MessageCard({ msg, fingerprint, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const isOwn = msg.fingerprint === fingerprint;

  return (
    <div className={styles.message}>
      <div className={styles.messageTop}>
        <div className={styles.authorBlock}>
          <div className={styles.avatar} style={{ background: colorFor(msg.author) }}>
            {initials(msg.author)}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.messageAuthor}>{msg.author}</span>
            <span className={styles.messageTime}>{relativeTime(msg.created_at)}</span>
          </div>
        </div>
        {isOwn && (
          <button
            className={`${styles.deleteBtn} ${confirming ? styles.deleteConfirm : ''}`}
            onClick={() => { if (confirming) onDelete(msg.id); else setConfirming(true); }}
            onBlur={() => setConfirming(false)}
            title={confirming ? 'Confirm delete' : 'Delete'}
          >
            {confirming ? 'Sure?' : '✕'}
          </button>
        )}
      </div>
      <p className={styles.messageText}>{msg.text}</p>
    </div>
  );
}

/* ── Page ── */

export default function Dashboard() {
  const t = useTranslation();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nickname, setNickname] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ msg: '', visible: false });
  const [fingerprint] = useState(() => getFingerprint());
  const toastTimer = useRef(null);

  /* ── fetch with 30 s in-memory cache ── */
  const CACHE_TTL = 30_000;
  const cacheRef = useRef(null);

  /* load messages from Supabase on mount */
  useEffect(() => {
    let cancelled = false;
    const cached = cacheRef.current;
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setMessages(cached.data);
      setLoading(false);
      return;
    }
    fetchMessages()
      .then(data => {
        cacheRef.current = { data, ts: Date.now() };
        if (!cancelled) { setMessages(data); setLoading(false); }
      })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  /* toast helper */
  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ msg, visible: false }), 2200);
  }, []);

  /* submit */
  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedNick = nickname.trim();
    const trimmedText = text.trim();
    if (!trimmedNick || !trimmedText || submitting) return;

    setSubmitting(true);
    try {
      const [newMsg] = await postMessage({ author: trimmedNick, text: trimmedText, fingerprint });
      cacheRef.current = null;
      setMessages(prev => [newMsg, ...prev]);
      setNickname(''); setText('');
      showToast(t('dashboard.toast.posted'));
    } catch (err) {
      showToast(t('dashboard.toast.postError'));
    } finally {
      setSubmitting(false);
    }
  }

  /* delete */
  async function handleDelete(id) {
    try {
      await deleteMessage(id);
      cacheRef.current = null;
      setMessages(prev => prev.filter(m => m.id !== id));
      showToast(t('dashboard.toast.deleted'));
    } catch (err) {
      showToast(t('dashboard.toast.deleteError'));
    }
  }

  /* ── render ── */

  return (
    <Layout title={t('dashboard.title')} description={t('dashboard.subtitle.empty')}>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('dashboard.title')}</h1>
          <p className={styles.subtitle}>
            {messages.length > 0
              ? t('dashboard.subtitle.count', { count: messages.length })
              : t('dashboard.subtitle.empty')}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputRow}>
            <input
              className={styles.input} type="text"
              placeholder={t('dashboard.form.nickname')}
              value={nickname} onChange={e => setNickname(e.target.value)}
              maxLength={20} autoComplete="off" disabled={submitting}
            />
            <span className={styles.charCount}>{text.length}/{MAX_CHARS}</span>
          </div>
          <textarea
            className={styles.textarea}
            placeholder={t('dashboard.form.text')}
            value={text} onChange={e => setText(e.target.value)}
            maxLength={MAX_CHARS} rows={3} disabled={submitting}
          />
          <div className={styles.formFooter}>
            <span className={styles.hint}>{t('dashboard.form.hint')}</span>
            <button
              className={styles.submitBtn} type="submit"
              disabled={!nickname.trim() || !text.trim() || submitting}
            >
              {submitting ? '…' : t('dashboard.form.submit')}
            </button>
          </div>
        </form>

        <div className={styles.messageList}>
          {loading ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>◌</div>
              <p className={styles.emptyText}>加载中...</p>
            </div>
          ) : error ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⚠</div>
              <p className={styles.emptyText}>加载失败</p>
              <p className={styles.emptyHint}>{error}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✧</div>
              <p className={styles.emptyText}>{t('dashboard.empty.title')}</p>
              <p className={styles.emptyHint}>{t('dashboard.empty.hint')}</p>
            </div>
          ) : (
            messages.map(m => (
              <MessageCard key={m.id} msg={m} fingerprint={fingerprint} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>

      <Toast message={toast.msg} visible={toast.visible} />
    </Layout>
  );
}

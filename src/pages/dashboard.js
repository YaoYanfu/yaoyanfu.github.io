import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '@theme/Layout';
import styles from './dashboard.module.css';

/* ── helpers ── */

const STORAGE_KEY = 'dashboard_messages';
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
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 172800) return '昨天';
  return new Date(dateStr).toLocaleString('zh-CN', {
    month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function loadMessages() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/* ── Toast ── */

function Toast({ message, visible }) {
  return (
    <div className={`${styles.toast} ${visible ? styles.toastShow : ''}`}>
      {message}
    </div>
  );
}

/* ── Message component ── */

function MessageCard({ msg, onDelete }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={styles.message}>
      <div className={styles.messageTop}>
        <div className={styles.authorBlock}>
          <div
            className={styles.avatar}
            style={{ background: colorFor(msg.author) }}
          >
            {initials(msg.author)}
          </div>
          <div className={styles.authorInfo}>
            <span className={styles.messageAuthor}>{msg.author}</span>
            <span className={styles.messageTime}>{relativeTime(msg.time)}</span>
          </div>
        </div>
        <button
          className={`${styles.deleteBtn} ${confirming ? styles.deleteConfirm : ''}`}
          onClick={() => {
            if (confirming) onDelete(msg.id);
            else setConfirming(true);
          }}
          onBlur={() => setConfirming(false)}
          title={confirming ? '确认删除' : '删除'}
        >
          {confirming ? '确认?' : '✕'}
        </button>
      </div>
      <p className={styles.messageText}>{msg.text}</p>
    </div>
  );
}

/* ── Page ── */

export default function Dashboard() {
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState('');
  const [text, setText] = useState('');
  const [toast, setToast] = useState({ msg: '', visible: false });
  const textareaRef = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  const showToast = useCallback((msg) => {
    setToast({ msg, visible: true });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ msg, visible: false }), 2200);
  }, []);

  function persist(msgs) {
    setMessages(msgs);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmedNick = nickname.trim();
    const trimmedText = text.trim();
    if (!trimmedNick || !trimmedText) return;

    const newMsg = {
      id: Date.now(),
      author: trimmedNick,
      text: trimmedText,
      time: new Date().toISOString(),
    };

    persist([newMsg, ...messages]);
    setNickname('');
    setText('');
    showToast('留言已发布 ✨');
  }

  function handleDelete(id) {
    persist(messages.filter((m) => m.id !== id));
    showToast('留言已删除');
  }

  return (
    <Layout title="Dashboard" description="留言板">
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Message Board</h1>
          <p className={styles.subtitle}>
            {messages.length > 0
              ? `共 ${messages.length} 条留言`
              : '留个脚印，说点什么吧'}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="你的昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              autoComplete="off"
            />
            <span className={styles.charCount}>{text.length}/{MAX_CHARS}</span>
          </div>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="写下你想说的话..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_CHARS}
            rows={3}
          />
          <div className={styles.formFooter}>
            <span className={styles.hint}>支持纯文本，文明留言 ✦</span>
            <button className={styles.submitBtn} type="submit" disabled={!nickname.trim() || !text.trim()}>
              发布留言
            </button>
          </div>
        </form>

        <div className={styles.messageList}>
          {messages.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>✧</div>
              <p className={styles.emptyText}>还没有留言，来做第一个！</p>
              <p className={styles.emptyHint}>
                输入昵称和想说的话，点击发布即可 ✦
              </p>
            </div>
          ) : (
            messages.map((m) => (
              <MessageCard key={m.id} msg={m} onDelete={handleDelete} />
            ))
          )}
        </div>
      </main>

      <Toast message={toast.msg} visible={toast.visible} />
    </Layout>
  );
}

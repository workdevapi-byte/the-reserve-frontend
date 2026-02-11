import { useState, useRef, useEffect } from 'react';
import { insightsApi } from '../services/api';
import styles from './InsightsChat.module.css';

function formatMoney(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
}

const QUESTION_PATTERNS = [
  { pattern: /how much (?:did i )?spend on (.+?)\??$/i, type: 'category-spending', extract: (m) => m[1].trim() },
  { pattern: /spending on (.+?)\??$/i, type: 'category-spending', extract: (m) => m[1].trim() },
  { pattern: /which category (?:has |has the )?(?:highest|most) (?:expense|spending)\??$/i, type: 'top-category' },
  { pattern: /highest (?:spending |expense )?category\??$/i, type: 'top-category' },
  { pattern: /(?:all )?categories?(?: total)?\??$/i, type: 'category-totals' },
  { pattern: /(?:expense|spending) by category\??$/i, type: 'category-totals' },
];

function parseQuestion(text) {
  const t = text.trim();
  if (!t) return null;
  for (const { pattern, type, extract } of QUESTION_PATTERNS) {
    const m = t.match(pattern);
    if (m) return { type, category: extract ? extract(m) : null };
  }
  return null;
}

function InsightsChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    const parsed = parseQuestion(q);
    let reply = '';

    try {
      if (!parsed) {
        reply = 'I can answer questions like: "How much did I spend on Diet Food?", "Which category has highest expense?", or "Show expense by category".';
      } else if (parsed.type === 'category-spending') {
        const { data } = await insightsApi.spendingByCategory(parsed.category);
        reply = data.total >= 0
          ? `You spent ${formatMoney(data.total)} on "${data.category}".`
          : `No expenses found for "${parsed.category}".`;
      } else if (parsed.type === 'top-category') {
        const { data } = await insightsApi.topCategory();
        if (data.message) {
          reply = data.message;
        } else {
          reply = `Highest spending category is "${data.category}" with ${formatMoney(data.total)}.`;
        }
      } else if (parsed.type === 'category-totals') {
        const { data } = await insightsApi.categoryTotals();
        if (!data.length) {
          reply = 'No expenses yet, so there are no category totals.';
        } else {
          const lines = data.map((x) => `• ${x.category}: ${formatMoney(x.total)}`);
          reply = 'Expenses by category:\n' + lines.join('\n');
        }
      }
    } catch (e) {
      reply = 'Something went wrong. Please try again.';
    }

    setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.placeholder}>
            Ask: &ldquo;How much did I spend on Diet Food?&rdquo; or &ldquo;Which category has highest expense?&rdquo;
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === 'user' ? styles.userMsg : styles.botMsg}>
            {msg.text.split('\n').map((line, j) => (
              <span key={j}>{line}<br /></span>
            ))}
          </div>
        ))}
        {loading && <div className={styles.botMsg}>...</div>}
        <div ref={bottomRef} />
      </div>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          type="text"
          placeholder="Ask about spending by category..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={styles.input}
          disabled={loading}
        />
        <button type="submit" className={styles.btn} disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

export default InsightsChat;

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import { authAtom } from '../atoms/authAtom';
import api from '../apiClient';

// floating helper for customers, answers come from our help texts + their deliveries (RAG)
function AskSwift() {
    const auth = useAtomValue(authAtom);
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([
        { from: 'bot', text: 'Hi! How can I help you today?' },
    ]);
    const [loading, setLoading] = useState(false);

    if (!auth || auth.user.role !== 'customer') return null; // customers only

    async function handleSend(e) {
        e.preventDefault();
        const q = question.trim();
        if (!q) return;

        setMessages((m) => [...m, { from: 'me', text: q }]);
        setQuestion('');
        setLoading(true);
        try {
            const res = await api.post('/assistant/ask', { question: q });
            setMessages((m) => [...m, { from: 'bot', text: res.data.answer }]);
        } catch (err) {
            const text = err.response?.data?.error || 'Cannot reach Ask Swift';
            setMessages((m) => [...m, { from: 'bot', text }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000 }}>
            {open && (
                <div className="card shadow mb-2" style={{ width: 320, maxWidth: 'calc(100vw - 32px)' }}>
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <strong>Ask Swift</strong>
                        <button className="btn-close" onClick={() => setOpen(false)} />
                    </div>
                    <div className="card-body" style={{ height: 300, overflowY: 'auto' }}>
                        {messages.map((m, i) => (
                            <div key={i} className={`mb-2 d-flex ${m.from === 'me' ? 'justify-content-end' : ''}`}>
                                <span className={`p-2 rounded ${m.from === 'me' ? 'bg-primary text-white' : 'bg-light'}`}
                                    style={{ maxWidth: '85%' }}>
                                    {m.text}
                                </span>
                            </div>
                        ))}
                        {loading && <p className="small text-muted">Thinking...</p>}
                    </div>
                    <form className="card-footer d-flex gap-2" onSubmit={handleSend}>
                        <input
                            className="form-control form-control-sm"
                            placeholder="Type a question"
                            maxLength={300}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                        <button className="btn btn-primary btn-sm" disabled={loading}>Send</button>
                    </form>
                </div>
            )}
            {!open && (
                <button
                    className="btn rounded-circle shadow d-flex align-items-center justify-content-center"
                    style={{ width: 76, height: 76, fontSize: 16, fontWeight: 'bold', lineHeight: 1.1, backgroundColor: '#ff6b00', color: 'white' }}
                    title="Ask Swift"
                    aria-label="Ask Swift"
                    onClick={() => setOpen(true)}
                >
                    Ask<br />Swift
                </button>
            )}
        </div>
    );
}

export default AskSwift;
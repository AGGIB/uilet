import React, { useState } from 'react';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

const AITesting = () => {
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Добавляем сообщение пользователя в историю
        setConversation(prev => [...prev, { type: 'user', text: message }]);
        setLoading(true);

        try {
            // Изменяем URL с учетом того, что бэкенд работает на порту 8080
            const response = await fetch('http://localhost:8080/api/whatsapp/ai/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ message })
            });

            const data = await response.json();
            
            if (response.ok) {
                setConversation(prev => [...prev, { type: 'ai', text: data.response }]);
            } else {
                throw new Error(data.error || 'Ошибка при получении ответа');
            }
        } catch (error) {
            console.error('Error testing AI:', error);
            setConversation(prev => [...prev, { 
                type: 'error', 
                text: 'Ошибка при получении ответа от ИИ' 
            }]);
        } finally {
            setLoading(false);
            setMessage('');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
                <FaRobot className="text-2xl text-blue-600" />
                <h2 className="text-xl font-semibold">Тестирование ИИ-ассистента</h2>
            </div>

            <div className="h-[400px] border rounded-lg mb-4 p-4 overflow-y-auto">
                {conversation.map((msg, idx) => (
                    <div key={idx} className={`mb-4 ${
                        msg.type === 'user' ? 'text-right' : 'text-left'
                    }`}>
                        <div className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                            msg.type === 'user' 
                                ? 'bg-blue-600 text-white' 
                                : msg.type === 'error'
                                    ? 'bg-red-100 text-red-600'
                                    : 'bg-gray-100 text-gray-800'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="text-center text-gray-500">
                        ИИ печатает...
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
};

export default AITesting; 
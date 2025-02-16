import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WhatsAppQRModal = ({ isOpen, onClose }) => {
    const [qrCode, setQrCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchQRCode();
        }
    }, [isOpen]);

    const fetchQRCode = async () => {
        try {
            const response = await fetch('/api/whatsapp/login', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                setQrCode(data.qr);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Error fetching QR code:', error);
            setError('Ошибка при получении QR-кода');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <FaWhatsapp className="text-2xl text-green-500" />
                        <h2 className="text-xl font-semibold">Подключение WhatsApp</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="text-center">
                    {loading ? (
                        <div className="py-8">Загрузка QR-кода...</div>
                    ) : error ? (
                        <div className="py-8 text-red-600">{error}</div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <QRCodeSVG value={qrCode} size={256} />
                            </div>
                            <p className="text-gray-600">
                                Отсканируйте этот QR-код в приложении WhatsApp Business
                                для подключения бота к вашему аккаунту
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WhatsAppQRModal; 
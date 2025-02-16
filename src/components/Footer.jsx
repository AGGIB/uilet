import React from 'react';
import { FaInstagram, FaWhatsapp, FaTelegram } from 'react-icons/fa';
import Logo from '../assets/logo';

const Copyright = () => (
  <div className="border-t">
    <div className="max-w-6xl mx-auto px-4 py-4">
      <p className="text-sm text-gray-500 text-center">
        © 2025 Uilet.kz. Все права защищены.
      </p>
    </div>
  </div>
);

const Footer = () => {
  const links = {
    company: [
      { name: 'Блог', href: '/blog' },
      { name: 'Консультация', href: '/consultation' },
      { name: 'Стоимость', href: '/pricing' }
    ],
    legal: [
      { name: 'Политика конфиденциальности', href: '/privacy' },
      { name: 'Пользовательское соглашение', href: '/terms' },
      { name: 'Договор оферты', href: '/offer' },
      { name: 'Описание процедуры оплаты', href: '/payment-info' }
    ],
    social: [
      { name: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/uilet.kz' },
      { name: 'WhatsApp', icon: FaWhatsapp, href: 'https://wa.me/77077822150' },
      { name: 'Telegram', icon: FaTelegram, href: 'https://t.me/uilet' }
    ]
  };

  return (
    <footer className="bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Логотип и описание */}
          <div className="space-y-4">
            <Logo />
            <p className="text-gray-600 text-sm">
              Сервис для арендодателей и арендаторов
            </p>
          </div>

          {/* Компания */}
          <div>
            <h3 className="font-medium mb-4">Компания</h3>
            <ul className="space-y-2">
              {links.company.map(link => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Документы */}
          <div>
            <h3 className="font-medium mb-4">Документы</h3>
            <ul className="space-y-2">
              {links.legal.map(link => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="font-medium mb-4">Контакты</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                {links.social.map(({ name, icon: Icon, href }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Icon className="text-xl" />
                  </a>
                ))}
              </div>
              <a 
                href="mailto:contact@uilet.app"
                className="block text-gray-600 hover:text-gray-900"
              >
                contact@uilet.app
              </a>
              <a 
                href="tel:+77077822150"
                className="block text-gray-600 hover:text-gray-900"
              >
                +7 (707) 782 2150
              </a>
            </div>
          </div>
        </div>
      </div>
      <Copyright />
    </footer>
  );
};

export default Footer; 
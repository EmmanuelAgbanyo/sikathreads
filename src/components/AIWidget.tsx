import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MessageCircle,
  X,
  Send,
  ExternalLink,
  Bot,
  Scissors,
  CheckCircle,
  PhoneCall,
  RotateCcw,
  Minus,
  ArrowRight,
} from 'lucide-react';
import { AIChatService, AIMessage, cleanAIText } from '../services/aiChatService';
import { Product } from '../types';

export const AIWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      timestamp: 'Just now',
      text: `Akwaaba! I am your Sika AI Fabric Stylist.

I can help you with:
• Finding authentic fabrics for weddings, church, and ceremonies
• Calculating tailoring yardage (Kaba & Slit, Agbada, Kaftan, Gowns)
• Kente patterns, meanings, and color traditions
• Transparent pricing in GHS with nationwide delivery across Ghana

You can also transfer our conversation directly to WhatsApp (055 771 8472) anytime!`,
      quickReplies: [
        'Yardage for Kaba & Slit',
        'Traditional Wedding Kente',
        'Bridal Lace under GHS 500',
        'Meaning of Kente colors',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMsg: AIMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Simulate realistic natural typing delay (400ms - 800ms)
      const [aiResponse] = await Promise.all([
        AIChatService.respondToUser(text, messages),
        new Promise((resolve) => setTimeout(resolve, 550)),
      ]);

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      console.error('Error generating AI response:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'assistant',
          timestamp: 'Just now',
          text: `I apologize, I experienced a brief connection hiccup. You can chat with our human styling concierge directly on WhatsApp at 055 771 8472 for immediate fabric advice.`,
          whatsappPrompt: `Hello Sika Threads, I was on your website and would like assistance with: "${text}".`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'reset-' + Date.now(),
        sender: 'assistant',
        timestamp: 'Just now',
        text: `Chat refreshed! What occasion, fabric type, or tailoring yardage can I assist you with today?`,
        quickReplies: [
          'Yardage for Kaba & Slit',
          'Traditional Wedding Kente',
          'GTP Wax Prints',
          'Chat on WhatsApp (055 771 8472)',
        ],
      },
    ]);
  };

  const renderCleanMessage = (rawText: string, isUser: boolean) => {
    const cleaned = cleanAIText(rawText);
    const lines = cleaned.split('\n');

    if (isUser) {
      return <div className="leading-relaxed whitespace-pre-wrap">{cleaned}</div>;
    }

    return (
      <div className="space-y-1.5 text-charcoal">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet point lines
          if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
            const bulletContent = trimmed.replace(/^[•-]\s*/, '');
            const colonIndex = bulletContent.indexOf(':');

            if (colonIndex > 0) {
              const label = bulletContent.slice(0, colonIndex + 1);
              const value = bulletContent.slice(colonIndex + 1);
              return (
                <div key={idx} className="flex items-start gap-1.5 pl-1">
                  <span className="text-gold-700 font-bold select-none">•</span>
                  <span>
                    <strong className="font-semibold text-charcoal">{label}</strong>
                    {value}
                  </span>
                </div>
              );
            }

            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-gold-700 font-bold select-none">•</span>
                <span>{bulletContent}</span>
              </div>
            );
          }

          // Section header line (e.g. ends with colon)
          if (trimmed.endsWith(':') && trimmed.length < 80) {
            return (
              <div key={idx} className="font-semibold text-charcoal pt-0.5">
                {trimmed}
              </div>
            );
          }

          // Numbered list item (e.g. 1. Step)
          if (/^\d+\.\s/.test(trimmed)) {
            const dotIndex = trimmed.indexOf('.');
            const num = trimmed.slice(0, dotIndex + 1);
            const rest = trimmed.slice(dotIndex + 1);
            const colonIndex = rest.indexOf(':');

            if (colonIndex > 0) {
              const label = rest.slice(0, colonIndex + 1);
              const value = rest.slice(colonIndex + 1);
              return (
                <div key={idx} className="flex items-start gap-1.5 pl-1">
                  <span className="font-bold text-gold-800 text-[10px] select-none">{num}</span>
                  <span>
                    <strong className="font-semibold text-charcoal">{label}</strong>
                    {value}
                  </span>
                </div>
              );
            }

            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="font-bold text-gold-800 text-[10px] select-none">{num}</span>
                <span>{rest}</span>
              </div>
            );
          }

          return (
            <div key={idx} className="leading-relaxed">
              {trimmed}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* 1. Floating Launcher Pill / Button */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group animate-fade-in">
          {/* Quick WhatsApp Concierge Direct Icon */}
          <a
            href={AIChatService.buildWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            title="Chat directly on WhatsApp (055 771 8472)"
            className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Direct WhatsApp Contact"
          >
            <MessageCircle className="w-5 h-5" />
          </a>

          {/* AI Stylist Launcher Button */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2.5 px-4 py-3 bg-charcoal hover:bg-charcoal-800 text-white rounded-full shadow-2xl border border-gold/40 transition-all transform hover:scale-105 active:scale-95"
            aria-label="Open Sika AI Fabric Stylist"
          >
            <div className="relative">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5" />
              <div className="w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold tracking-wide flex items-center gap-1">
                <span>Sika AI Stylist</span>
                <span className="text-[10px] bg-gold/30 text-gold-200 px-1.5 py-0.2 rounded-full font-sans uppercase font-semibold">
                  Online
                </span>
              </div>
              <div className="text-[10px] text-ivory-300">Fabric advice &amp; WhatsApp</div>
            </div>
            <span className="sm:hidden text-xs font-bold text-gold">AI Stylist</span>
          </button>
        </div>
      )}

      {/* 2. Expanded Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[420px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-charcoal/15 flex flex-col overflow-hidden animate-scale-up">
          {/* Header */}
          <div className="bg-charcoal text-white p-3.5 px-4 border-b border-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gold/20 text-gold border border-gold/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-charcoal absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm tracking-wide text-ivory">
                    Sika AI Stylist
                  </h3>
                  <span className="text-[9px] uppercase tracking-wider bg-gold/20 text-gold px-1.5 py-0.5 rounded font-mono">
                    Smart Concierge
                  </span>
                </div>
                <p className="text-[10px] text-ivory-400">
                  Cultural advice, yardage &amp; Ghanaian stock
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-ivory-300">
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* WhatsApp Direct Header Callout */}
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-medium text-[11px]">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Connect on WhatsApp: <strong>055 771 8472</strong></span>
            </div>
            <a
              href={AIChatService.buildWhatsAppUrl()}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-0.5"
            >
              <span>Chat Live</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-ivory-50/50 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-xs whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-charcoal text-white rounded-br-xs'
                      : 'bg-white text-charcoal border border-charcoal/10 rounded-bl-xs'
                  }`}
                >
                  {/* Assistant Icon Header if Assistant */}
                  {msg.sender === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-charcoal/5 text-[11px] font-bold text-gold-800">
                      <Sparkles className="w-3 h-3 text-gold-600" />
                      <span>Sika Textile Stylist</span>
                    </div>
                  )}

                  <div className="text-[11px] sm:text-xs leading-relaxed">
                    {renderCleanMessage(msg.text, msg.sender === 'user')}
                  </div>

                  {/* Suggested Products Cards if any */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-charcoal/10 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-muted">
                        Verified In-Stock Matches
                      </div>
                      <div className="space-y-2">
                        {msg.suggestedProducts.map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2.5 bg-ivory rounded-xl border border-charcoal/10 flex items-center justify-between gap-2.5 hover:border-gold/60 transition-colors"
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <img
                                src={prod.images[0] || '/kente-weave.jpg'}
                                alt={prod.name}
                                className="w-11 h-11 rounded-lg object-cover flex-shrink-0 border border-charcoal/10"
                              />
                              <div className="truncate">
                                <p className="font-bold text-charcoal text-xs truncate">
                                  {prod.name}
                                </p>
                                <p className="text-[10px] text-gold-800 font-semibold">
                                  GHS {prod.price.toLocaleString()} / {prod.sellingUnit}
                                </p>
                                <p className="text-[9px] text-emerald-700 flex items-center gap-0.5">
                                  <CheckCircle className="w-2.5 h-2.5" /> In Stock ({prod.stockQty} {prod.sellingUnit})
                                </p>
                              </div>
                            </div>

                            <Link
                              to={`/product/${prod.slug}`}
                              onClick={() => setIsOpen(false)}
                              className="px-2.5 py-1.5 bg-charcoal hover:bg-gold text-white rounded text-[10px] font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Direct WhatsApp Callout for this response */}
                  {msg.whatsappPrompt && (
                    <div className="mt-3 pt-2.5 border-t border-charcoal/10">
                      <a
                        href={AIChatService.buildWhatsAppUrl(msg.whatsappPrompt)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-all shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Continue this chat on WhatsApp</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-charcoal-400 mt-1 px-1">
                  {msg.timestamp}
                </span>

                {/* Quick Reply Pills */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[95%]">
                    {msg.quickReplies.map((reply, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(reply)}
                        className="px-2.5 py-1 bg-white hover:bg-gold-50 text-charcoal hover:text-gold-900 border border-charcoal/15 hover:border-gold rounded-full text-[10px] font-medium transition-all shadow-2xs"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-charcoal-500 bg-white p-3 rounded-2xl rounded-bl-xs border border-charcoal/10 w-fit">
                <Sparkles className="w-3.5 h-3.5 text-gold animate-spin" />
                <span className="text-[11px] italic">Stylist is reviewing fabrics...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="p-3 bg-white border-t border-charcoal/10 space-y-2">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about fabrics, yardage, Kente colors..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3.5 py-2.5 text-xs bg-ivory-50 border border-charcoal/20 rounded-xl focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="w-9 h-9 rounded-xl bg-charcoal hover:bg-gold disabled:opacity-40 text-white flex items-center justify-center transition-colors flex-shrink-0"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>

              <a
                href={AIChatService.buildWhatsAppUrl(inputText ? `Hello Sika Threads, I'm inquiring about: ${inputText}` : undefined)}
                target="_blank"
                rel="noreferrer"
                title="Send inquiry directly to WhatsApp (055 771 8472)"
                className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            <div className="flex items-center justify-between text-[10px] text-charcoal-muted px-1">
              <span>Sika AI Concierge &bull; Powered by cultural intelligence</span>
              <a
                href={AIChatService.buildWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 hover:underline font-medium"
              >
                WhatsApp: 055 771 8472
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

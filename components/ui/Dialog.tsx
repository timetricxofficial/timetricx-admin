'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface DialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type?: 'info' | 'error' | 'success' | 'warning';
    onConfirm?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
}

export default function Dialog({
    isOpen,
    onClose,
    title,
    message,
    type = 'info',
    onConfirm,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
}: DialogProps) {

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const icons = {
        info: <Info className="w-10 h-10 text-blue-500 mb-2" />,
        error: <X className="w-10 h-10 text-red-500 mb-2" />,
        success: <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />,
        warning: <AlertTriangle className="w-10 h-10 text-amber-500 mb-2" />,
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Dialog Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md bg-white dark:bg-[#0f172a] rounded-[2rem] overflow-hidden shadow-2xl border border-gray-200 dark:border-blue-500/20"
                    >
                        <div className="p-8 text-center flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                            >
                                {icons[type]}
                            </motion.div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                                {message}
                            </p>
                        </div>

                        <div className="flex border-t border-gray-100 dark:border-gray-800/50 bg-gray-50/50 dark:bg-black/20">
                            {onConfirm ? (
                                <>
                                    <button
                                        onClick={onClose}
                                        className="flex-1 px-6 py-5 text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        {cancelLabel}
                                    </button>
                                    <button
                                        onClick={() => {
                                            onConfirm();
                                            onClose();
                                        }}
                                        className={`flex-1 px-6 py-5 text-sm font-black uppercase tracking-widest text-white transition-all transform hover:scale-[1.02] active:scale-[0.98]
                                            ${type === 'error' || type === 'warning' ? 'bg-red-600 hover:bg-red-700 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(37,99,235,0.4)]'}
                                        `}
                                    >
                                        {confirmLabel}
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={onClose}
                                    className="w-full px-6 py-5 text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                >
                                    OK
                                </button>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

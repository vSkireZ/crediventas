'use client';
import { useLanguage } from '../context/LanguageContext';
import { Globe, User, Moon, Sun, Clock } from 'lucide-react';

export default function Configuracion() {
    const { language, setSpanish, setEnglish, t } = useLanguage();

    return (
        <div className="animate-fadeInUp space-y-8">
            <div className="mb-10">
                <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mb-3">
                    {t.settings.title}
                </h1>
                <p className="text-gray-600">
                    {t.settings.subtitle}
                </p>
            </div>

            {/* Language Switcher */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                        <Globe className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{t.settings.language}</h2>
                        <p className="text-gray-500">{t.settings.languageDesc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Español */}
                    <button
                        onClick={setSpanish}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${language === 'es'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">🇪🇸</span>
                            {language === 'es' && (
                                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm" />
                            )}
                        </div>
                        <p className={`font-semibold ${language === 'es' ? 'text-blue-900' : 'text-gray-900'}`}>
                            {t.settings.spanish}
                        </p>
                    </button>

                    {/* Inglés */}
                    <button
                        onClick={setEnglish}
                        className={`relative p-6 rounded-xl border-2 transition-all duration-200 text-left ${language === 'en'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">🇺🇸</span>
                            {language === 'en' && (
                                <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm" />
                            )}
                        </div>
                        <p className={`font-semibold ${language === 'en' ? 'text-blue-900' : 'text-gray-900'}`}>
                            {t.settings.english}
                        </p>
                    </button>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                        {t.settings.currentLanguage}:{' '}
                        <span className="font-semibold">
                            {language === 'es' ? t.settings.spanish : t.settings.english}
                        </span>
                    </p>
                </div>
            </div>

            {/* Coming Soon Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 opacity-75">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{t.settings.comingSoon}</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Change Admin Account */}
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center justify-between cursor-not-allowed">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-500">{t.settings.changeAdmin}</span>
                        </div>
                        <div className="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-500">
                            {t.settings.comingSoon}
                        </div>
                    </div>

                    {/* Theme Settings */}
                    <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                <Moon className="w-5 h-5" />
                            </div>
                            <span className="font-medium text-gray-500">{t.settings.theme}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-center gap-2 text-gray-400">
                                <Sun className="w-4 h-4" />
                                <span className="text-sm">{t.settings.lightMode}</span>
                            </div>
                            <div className="p-3 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center gap-2 text-gray-500">
                                <Moon className="w-4 h-4" />
                                <span className="text-sm">{t.settings.darkMode}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

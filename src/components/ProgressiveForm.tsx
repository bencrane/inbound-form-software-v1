'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, ArrowRight, Building, User, Mail } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FormData {
    email: string;
    firstName: string;
    lastName: string;
    companyName: string;
    companySize: string;
    message: string;
}

const STEPS = {
    EMAIL: 0,
    CHECKING: 1,
    DETAILS: 2,
    SUCCESS: 3,
};

export default function ProgressiveForm() {
    const [step, setStep] = useState(STEPS.EMAIL);
    const [formData, setFormData] = useState<FormData>({
        email: '',
        firstName: '',
        lastName: '',
        companyName: '',
        companySize: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isCompanyFound, setIsCompanyFound] = useState(false);

    // Ref for auto-focusing
    const firstNameRef = useRef<HTMLInputElement>(null);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email || !formData.email.includes('@')) return;

        setIsLoading(true);
        setStep(STEPS.CHECKING);

        try {
            const lookupPromise = fetch('/api/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email }),
            }).then(res => res.json());

            const timeoutPromise = new Promise((resolve) => {
                setTimeout(() => resolve({ found: false }), 300);
            });

            // Race: If lookup takes > 300ms, we assume no match (timeout wins)
            const data: any = await Promise.race([lookupPromise, timeoutPromise]);

            if (data.found && data.company) {
                setIsCompanyFound(true);

                // Map min/max size to dropdown values
                let mappedSize = "";
                const { min_size, max_size } = data.company;

                if (min_size >= 1000) mappedSize = "1000+";
                else if (max_size <= 10) mappedSize = "1-10";
                else if (max_size <= 50) mappedSize = "11-50";
                else if (max_size <= 200) mappedSize = "51-200";
                else if (max_size <= 1000) mappedSize = "201-1000";
                else mappedSize = "1000+"; // Default fallback for large companies

                setFormData((prev) => ({
                    ...prev,
                    companyName: data.company.name || '',
                    companySize: mappedSize,
                }));
            } else {
                setIsCompanyFound(false);
            }

        } catch (error) {
            console.error('Lookup failed', error);
            // Non-blocking error handling
        } finally {
            setIsLoading(false);
            setStep(STEPS.DETAILS);
        }
    };

    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate submission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep(STEPS.SUCCESS);
    };

    // Focus first name input when entering details step
    useEffect(() => {
        if (step === STEPS.DETAILS) {
            // Small timeout to allow animation to start rendering
            setTimeout(() => firstNameRef.current?.focus(), 300);
        }
    }, [step]);

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <AnimatePresence mode="wait">

                {/* Step 1: Email Entry */}
                {step === STEPS.EMAIL && (
                    <motion.div
                        key="step-email"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold tracking-tight text-black">
                                    Get started
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Enter your work email to continue.
                                </p>
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    placeholder="name@company.com"
                                    className={cn(
                                        "input-premium pl-10",
                                        "focus:ring-2 focus:ring-black/10 focus:border-black"
                                    )}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!formData.email}
                                className="w-full flex items-center justify-center h-10 rounded-md bg-black text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Continue <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Step 2: Checking Animation */}
                {step === STEPS.CHECKING && (
                    <motion.div
                        key="step-checking"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-12 space-y-4"
                    >
                        <Loader2 className="h-8 w-8 animate-spin text-black" />
                        <p className="text-sm text-gray-500">Checking details...</p>
                    </motion.div>
                )}

                {/* Step 3: Details Form */}
                {step === STEPS.DETAILS && (
                    <motion.div
                        key="step-details"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                    >
                        <form onSubmit={handleFinalSubmit} className="space-y-5">
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2 text-sm text-black bg-gray-100 w-fit px-2 py-1 rounded-md mb-2">
                                    <Mail className="h-3 w-3" />
                                    <span>{formData.email}</span>
                                </div>
                                <h2 className="text-xl font-semibold text-black">
                                    Almost there
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {isCompanyFound
                                        ? `We found ${formData.companyName}. Please confirm your details.`
                                        : "Please complete your profile."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700">First Name</label>
                                    <input
                                        ref={firstNameRef}
                                        type="text"
                                        required
                                        className="input-premium"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-premium"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-gray-700">Company Name</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        className="input-premium pl-9"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Only show Company Size if not found or if we want to confirm */}
                            {!isCompanyFound && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-700">Company Size</label>
                                    <select
                                        className="input-premium"
                                        value={formData.companySize}
                                        onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                        required
                                    >
                                        <option value="">Select size...</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-1000">201-1000 employees</option>
                                        <option value="1000+">1000+ employees</option>
                                    </select>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center h-10 rounded-md bg-black text-white font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Complete Request"}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Step 4: Success */}
                {step === STEPS.SUCCESS && (
                    <motion.div
                        key="step-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="text-center py-10 space-y-4"
                    >
                        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Check className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-black">Request Received</h2>
                        <p className="text-gray-600 max-w-xs mx-auto">
                            Thanks for getting in touch. We've sent a confirmation to <b>{formData.email}</b>.
                        </p>
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}

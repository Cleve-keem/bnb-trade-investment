"use client";

import { faqs } from "@/libs/bnb/demo-data";
import {
  ChevronDown,
  ChevronRight,
  Clock3,
  Headphones,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SupportCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#090a0d] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm text-[#f0b90b]">
            <Headphones size={17} />
            Support Center
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            How can we help?
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
            Get assistance with your account, deposits, withdrawals, trading and
            other BNB services.
          </p>
        </div>

        {/* Contact hero */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-white/8 bg-linear-to-br from-blue-500/1.2 via-white/3 to-purple-500/8 p-6 md:p-8">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#f0b90b]/10 blur-3xl" />

          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0b90b]/10 text-[#f0b90b]">
                <MessageCircle size={23} />
              </div>

              <h2 className="text-xl font-semibold">Chat with BNB Support</h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Need help with your account or transaction? Chat with our
                customer support team and we'll help you resolve your issue.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/help/chat"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#f0b90b] px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                >
                  <MessageCircle size={17} />
                  Start live chat
                </Link>
                <a
                  href="sms:+19039174548"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/8 bg-white/4 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  {/* <Phone size={16} /> */}
                  <MessageCircle size={23} />
                  +1 (903) 917-4548
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/20 p-5 md:min-w-55">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                Support available
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-500">
                Monday – Sunday
                <br />
                24 hours
              </p>
            </div>
          </div>
        </div>

        {/* Support cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SupportCard
            icon={<MessageCircle size={20} />}
            title="Live Support"
            description="Chat directly with the BNB support team."
          />

          <SupportCard
            icon={<ShieldCheck size={20} />}
            title="Account Security"
            description="Get help with account and security concerns."
          />

          <SupportCard
            icon={<Clock3 size={20} />}
            title="Transaction Help"
            description="Get assistance with deposits and withdrawals."
          />
        </div>

        {/* FAQ */}
        <section>
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Frequently Asked Questions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Quick answers to common questions.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/2">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={faq.question}
                  className="border-b border-white/6 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/2.5"
                  >
                    <span className="text-sm font-medium text-gray-200">
                      {faq.question}
                    </span>

                    {isOpen ? (
                      <ChevronDown
                        size={17}
                        className="shrink-0 text-gray-500"
                      />
                    ) : (
                      <ChevronRight
                        size={17}
                        className="shrink-0 text-gray-500"
                      />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <p className="max-w-3xl text-sm leading-6 text-gray-500">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-600">
          <Sparkles size={13} />
          BNB Support Center
        </div>
      </div>
    </div>
  );
}

function SupportCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/2 p-5 transition hover:border-white/1.2 hover:bg-white/[0.035]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#f0b90b]">
        {icon}
      </div>

      <h3 className="text-sm font-semibold text-white">{title}</h3>

      <p className="mt-2 text-xs leading-5 text-gray-500">{description}</p>
    </div>
  );
}

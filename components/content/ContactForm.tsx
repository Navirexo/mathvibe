"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { contactEmail } from "@/lib/site";
import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = `MathVibe message from ${name || "a visitor"}`;
    const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");
    const href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Input
        label="Name"
        name="name"
        autoComplete="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-message" className="text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-midnight px-3.5 py-3 text-base text-ink placeholder:text-muted hover:border-white/20 focus-visible:border-cyan"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto">
        Send message
      </Button>
      <p className="text-sm text-muted">
        Send opens your email app with this message addressed to {contactEmail}.
      </p>
    </form>
  );
}

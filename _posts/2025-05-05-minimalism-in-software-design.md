---
layout: post
title: "Minimalism in Software Design"
date: 2025-05-05
tags: [design, architecture, philosophy]
categories: [technology]
---

## Less is More (Usually)

There's a quote attributed to Antoine de Saint-Exupéry that I think about often:

> Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.

This applies to software perhaps more than any other creative discipline.

## Signs of Over-Engineering

How do you know you've gone too far?

- Your abstraction has only **one implementation**
- You're writing code "for the future" that may never come
- New team members need a week to understand the architecture
- The config file is longer than the actual logic
- You have a `FactoryFactoryProvider`

## The Unix Philosophy Still Works

The best software I've used follows these principles:

1. **Do one thing well** — `grep` searches text, `sort` sorts lines, `wc` counts words
2. **Compose through simple interfaces** — stdin/stdout, HTTP, files
3. **Fail loudly** — don't silently swallow errors

## A Practical Example

Instead of this:

```typescript
// Over-engineered
class NotificationServiceFactory {
  private strategyMap: Map<string, NotificationStrategy>;
  private configProvider: ConfigurationProvider;
  private middlewarePipeline: MiddlewarePipeline;
  // ... 200 more lines
}
```

Consider this:

```typescript
// Minimal and clear
async function notify(user: User, message: string): Promise<void> {
  const channel = user.preferredChannel;
  
  if (channel === 'email') return sendEmail(user.email, message);
  if (channel === 'sms') return sendSMS(user.phone, message);
  
  throw new Error(`Unknown channel: ${channel}`);
}
```

You can always add complexity later. You can rarely remove it.

## The Discipline

Minimalism in code isn't about writing less — it's about **deciding what matters**. Every line of code is a liability. Every abstraction is a bet on the future.

Choose your bets wisely.

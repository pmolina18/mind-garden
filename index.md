---
layout: default
title: Home
---

<h1 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.5rem;">Mind Garden</h1>
<p style="color: var(--text-secondary); margin-bottom: 2.5rem; font-size: 1.0625rem;">Thoughts on software, learning, and everything in between.</p>

<ul class="post-list">
{% assign recent_posts = site.posts | slice: 0, 10 %}
{% for post in recent_posts %}
<li>
  <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
  <br>
  <small style="color: var(--text-tertiary);">{{ post.date | date: "%B %d, %Y" }}</small>
</li>
{% endfor %}
</ul>

---
layout: default
title: Home
---

{% assign recent_posts = site.posts | slice: 0, 10 %}
{% for post in recent_posts %}
- [{{ post.title }}]({{ post.url | relative_url }}) — {{ post.date | date: "%B %d, %Y" }}
{% endfor %}

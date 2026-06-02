---
layout: default
title: "Tags"
permalink: /tags/
---

{% assign sorted_tags = site.tags | sort %}
{% for tag in sorted_tags %}
  {% assign tag_name = tag[0] %}
  {% assign posts = tag[1] %}
  {% if posts.size > 0 %}
  <h2 id="{{ tag_name | slugify }}">{{ tag_name }} ({{ posts.size }})</h2>
  <ul>
  {% assign sorted_posts = posts | sort: "date" | reverse %}
  {% for post in sorted_posts %}
    <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> — {{ post.date | date: "%Y-%m-%d" }}</li>
  {% endfor %}
  </ul>
  {% endif %}
{% endfor %}

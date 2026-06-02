---
layout: default
title: "Categories"
permalink: /categories/
---

{% assign sorted_categories = site.categories | sort %}
{% for category in sorted_categories %}
  {% assign category_name = category[0] %}
  {% assign posts = category[1] %}
  {% if posts.size > 0 %}
  <h2 id="{{ category_name | slugify }}">{{ category_name }} ({{ posts.size }})</h2>
  <ul>
  {% assign sorted_posts = posts | sort: "date" | reverse %}
  {% for post in sorted_posts %}
    <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> — {{ post.date | date: "%Y-%m-%d" }}</li>
  {% endfor %}
  </ul>
  {% endif %}
{% endfor %}

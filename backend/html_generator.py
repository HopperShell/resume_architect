# backend/html_generator.py

from typing import Dict, Any, Union
from jinja2 import Template
import re
import json

class HTMLGenerator:
    """Generates fully modern, design‑focused HTML for resumes."""

    def __init__(self):
        self.default_css = self._get_default_css()

    def generate_html(self, resume_data: Dict[str, Any]) -> str:
        """
        Generate HTML from a structured resume dictionary
        
        Args:
            resume_data: A dictionary containing resume information
        
        Returns:
            Fully formatted HTML resume
        """
        # Validate input is a dictionary
        if not isinstance(resume_data, dict):
            raise ValueError("Input must be a dictionary")
        
        # Use the existing template rendering
        template = self._get_resume_template()
        inner_html = template.render(resume=resume_data)
        
        # Get title (fallback to "Resume")
        title = resume_data.get("name", "Resume")
        
        # Wrap in a modern shell
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{title} - Professional Resume</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>{self.default_css}</style>
</head>
<body>
    <div class="resume">
        {inner_html}
    </div>
    {self._get_page_break_script()}
</body>
</html>"""

    def _get_resume_template(self) -> Template:
        tpl = """
<header class="resume-header">
  <div class="left">
    <h1 class="name">{{ resume.name }}</h1>
    <p class="title">{{ resume.title }}</p>
  </div>
  <div class="right">
    <p><span class="contact-label">Email:</span> <span class="contact-value">{{ resume.contact.email }}</span></p>
    <p><span class="contact-label">Phone:</span> <span class="contact-value">{{ resume.contact.phone }}</span></p>
    <p><span class="contact-label">Location:</span> <span class="contact-value">{{ resume.contact.location }}</span></p>
    {% if resume.contact.linkedin %}
    <p><span class="contact-label">LinkedIn:</span>
       <a href="{{ resume.contact.linkedin }}" class="contact-value">{{ resume.contact.linkedin }}</a>
    </p>
    {% endif %}
    {% if resume.contact.github %}
    <p><span class="contact-label">GitHub:</span>
       <a href="{{ resume.contact.github }}" class="contact-value">{{ resume.contact.github }}</a>
    </p>
    {% endif %}
    {% if resume.contact.portfolio %}
    <p><span class="contact-label">Portfolio:</span>
       <a href="{{ resume.contact.portfolio }}" class="contact-value">{{ resume.contact.portfolio }}</a>
    </p>
    {% endif %}
  </div>
</header>

{% if resume.summary %}
<section class="resume-section">
  <h2 class="section-title">Professional Summary</h2>
  <p class="summary-text">{{ resume.summary }}</p>
</section>
{% endif %}

{% if resume.skills %}
<section class="resume-section">
  <h2 class="section-title">Skills & Expertise</h2>
  <div class="skills">
    {% for cat, skills in resume.skills.items() %}
    <div class="skill-block">
      <p class="skill-category">{{ cat }}</p>
      <div class="skill-tags">
        {% for skill in skills %}<span class="tag">{{ skill }}</span>{% endfor %}
      </div>
    </div>
    {% endfor %}
  </div>
</section>
{% endif %}

{% if resume.experience %}
<section class="resume-section">
  <h2 class="section-title">Professional Experience</h2>
  {% for job in resume.experience %}
  {% set bullet_count = job.description|length %}
  {% set content_length = (job.description|join('')|length) %}
  {% set avg_bullet_length = content_length / bullet_count if bullet_count > 0 else 0 %}
  {% if bullet_count > 8 or content_length > 1200 %}
    {% set card_class = "card ultra-compact keep-together" %}
  {% elif bullet_count > 6 or content_length > 800 %}
    {% set card_class = "card very-compact" %}
  {% elif bullet_count > 4 or content_length > 500 or avg_bullet_length > 100 %}
    {% set card_class = "card compact" %}
  {% else %}
    {% set card_class = "card" %}
  {% endif %}
  <div class="{{ card_class }}">
    <div class="card-header">
      <div>
        <h3 class="position">{{ job.position }}</h3>
        <p class="company">{{ job.company }}</p>
      </div>
      <p class="date">{{ job.period }}</p>
    </div>
    <ul class="card-list">
      {% for line in job.description %}<li>{{ line }}</li>{% endfor %}
    </ul>
  </div>
  {% endfor %}
</section>
{% endif %}

{% if resume.education %}
<section class="resume-section">
  <h2 class="section-title">Education</h2>
  {% for edu in resume.education %}
  <div class="card">
    <div class="card-header">
      <div>
        <h3 class="position">{{ edu.degree }}</h3>
        <p class="company">{{ edu.institution }}</p>
      </div>
      <p class="date">{{ edu.period }}</p>
    </div>
    {% if edu.details and edu.details|length > 0 %}
    <ul class="card-list">
      {% for line in edu.details %}<li>{{ line }}</li>{% endfor %}
    </ul>
    {% endif %}
  </div>
  {% endfor %}
</section>
{% endif %}

{% if resume.certifications %}
<section class="resume-section">
  <h2 class="section-title">Certifications</h2>
  <div class="cert-grid">
    {% for cert in resume.certifications %}
    <div class="cert-card">
      <strong>{{ cert.certification }}</strong><br>
      <small>{{ cert.provider }}</small>
    </div>
    {% endfor %}
  </div>
</section>
{% endif %}

{% if resume.honors_awards %}
<section class="resume-section">
  <h2 class="section-title">Awards & Honors</h2>
  <div class="cert-grid">
    {% for award in resume.honors_awards %}
    <div class="cert-card award-card">
      <strong>{{ award.award }}</strong><br>
      <small>{{ award.organization }}</small>
    </div>
    {% endfor %}
  </div>
</section>
{% endif %}

{% if resume.projects %}
<section class="resume-section">
  <h2 class="section-title">Key Projects</h2>
  {% for project in resume.projects %}
  <div class="card project-card">
    <div class="card-header">
      <div>
        <h3 class="position">{{ project.name }}</h3>
        {% if project.link %}
        <p class="company"><a href="{{ project.link }}" target="_blank">View Project</a></p>
        {% endif %}
      </div>
      {% if project.period %}
      <p class="date">{{ project.period }}</p>
      {% endif %}
    </div>
    {% if project.description %}
    <ul class="card-list">
      {% for line in project.description %}<li>{{ line }}</li>{% endfor %}
    </ul>
    {% endif %}
  </div>
  {% endfor %}
</section>
{% endif %}
"""
        return Template(tpl)

    def _get_default_css(self) -> str:
        return """
/* Modern Resume CSS - PDF Optimized */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  background: #fff;
  color: #1f2937;
  font-size: 11pt;
  line-height: 1.5;
}

.resume {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  background: #fff;
}

.resume-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 1rem;
  margin-bottom: 1.25rem;
  align-items: flex-start;
}

.resume-header .left {
  flex: 1;
}

.resume-header .right {
  text-align: right;
  font-size: 0.9rem;
}

.resume-header .right p {
  margin: 0.2rem 0;
}

.resume-header .name {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
  color: #1e3a8a;
  letter-spacing: -0.02em;
}

.resume-header .title {
  font-size: 1rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.contact-label {
  font-weight: 600;
  color: #4b5563;
}

.contact-value {
  color: #6b7280;
}

.resume-section {
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  page-break-after: avoid;
  break-after: avoid;
}

.section-title::before {
  content: "";
  display: inline-block;
  width: 18px;
  height: 3px;
  background: #3b82f6;
  margin-right: 0.6rem;
  border-radius: 2px;
}

.summary-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #4b5563;
  margin: 0;
}

/* Skills */
.skills {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skill-block {
  background: #f8fafc;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
  page-break-inside: avoid;
  break-inside: avoid;
}

.skill-category {
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 0.4rem 0;
  font-size: 0.9rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

/* Experience/Education Cards */
.card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid #e5e7eb;
  /* Allow page breaks inside cards - content flows naturally */
  page-break-inside: auto;
  break-inside: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  /* Keep header with at least some content */
  page-break-after: avoid;
  break-after: avoid;
}

.position {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #1e3a8a;
}

.company {
  font-size: 0.9rem;
  color: #6b7280;
  margin: 0.15rem 0 0 0;
}

.date {
  font-size: 0.8rem;
  color: #6b7280;
  background: #e5e7eb;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
}

.card-list {
  padding-left: 1.1rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #4b5563;
  margin: 0.5rem 0 0 0;
}

.card-list li {
  margin-bottom: 0.35rem;
}

.card-list li::marker {
  color: #3b82f6;
}

/* Certifications Grid */
.cert-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.cert-card {
  background: #f0f9ff;
  padding: 0.75rem;
  border-radius: 6px;
  border-top: 3px solid #0ea5e9;
  text-align: center;
  font-size: 0.85rem;
  page-break-inside: avoid;
  break-inside: avoid;
}

.cert-card strong {
  display: block;
  margin-bottom: 0.2rem;
}

.cert-card small {
  color: #6b7280;
}

.award-card {
  border-top-color: #8b5cf6;
  background: #f5f3ff;
}

.project-card {
  border-left-color: #10b981;
}

/* Links */
a {
  color: #2563eb;
  text-decoration: none;
}

/* Compact variants for dense content */
.card.compact {
  padding: 0.75rem;
}

.card.compact .card-list {
  font-size: 0.85rem;
  line-height: 1.45;
}

.card.compact .card-list li {
  margin-bottom: 0.25rem;
}

.card.very-compact {
  padding: 0.6rem;
}

.card.very-compact .card-list {
  font-size: 0.8rem;
  line-height: 1.4;
}

.card.very-compact .card-list li {
  margin-bottom: 0.2rem;
}

.card.ultra-compact {
  padding: 0.5rem;
}

.card.ultra-compact .card-list {
  font-size: 0.75rem;
  line-height: 1.35;
}

.card.ultra-compact .card-list li {
  margin-bottom: 0.15rem;
}

/* Print styles */
@media print {
  body {
    -webkit-print-color-adjust: exact !important;
    color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .resume {
    padding: 0;
  }
}
"""

    def _get_page_break_script(self) -> str:
        """Minimal script - CSS handles page breaks"""
        return ""
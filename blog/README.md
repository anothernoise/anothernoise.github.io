# Blog Posting Guide

This folder contains blog articles for the anothernoise.github.io site.

## How Blog Posting Works (Current)

The blog is currently a **static HTML-based system**:

1. Each blog post is a standalone HTML file in the `/blog` directory
2. The `/blog/index.html` file serves as the blog landing page listing all posts
3. Posts are written in HTML and can use the site's shared styles and theme system

## Adding a New Blog Post

### Quick Steps:

1. **Create a new HTML file** in `/blog/` with a descriptive name (e.g., `my-post-title.html`)

2. **Use the template structure** from `ms-fabric-internals.html`:
   - Import the theme toggle and stylesheets from the parent directory (`../`)
   - Use `<link rel="stylesheet" href="../stylesheets/styles.css?v=2.1.0">`
   - Include theme toggle script: `<script type="module" src="../javascripts/theme.js"></script>`
   - Add back-link: `<a href="../" class="back-link">← Back to Home</a>`

3. **Update `/blog/index.html`** with a new list item pointing to your post:
   ```html
   <li class="post-item">
     <a href="your-post-filename.html">
       <h2 class="post-title">Your Post Title</h2>
       <div class="post-date">June 9, 2026</div>
       <p class="post-excerpt">Brief excerpt about the post...</p>
       <div class="post-meta">
         <span>📖 N min read</span>
         <span>🏷️ Topic</span>
       </div>
     </a>
   </li>
   ```

4. **Commit and push** to GitHub:
   ```bash
   git add blog/
   git commit -m "Add blog post: your post title"
   git push
   ```

## Current Blog Posts

- **Understanding MS Fabric Internals** (`ms-fabric-internals.html`)
  - Deep dive into Fabric's architecture, OneLake, compute, and best practices
  - 8 min read

## Future Enhancements

Consider these upgrades when you're ready to scale:

### Option 1: Markdown + Static Generator
- Use a tool like **Jekyll** (natively supported by GitHub Pages)
- Write posts in Markdown with frontmatter
- Automatically builds HTML on each push
- Enables better versioning and easier content management

### Option 2: JavaScript-based Blog System
- Add a simple build script that converts Markdown to HTML
- Use `marked.js` or `markdown-it` for client-side rendering
- Include date-based indexing and tagging

### Option 3: Headless CMS Integration
- Connect to a service like **Contentful** or **Sanity**
- Manage posts via a web interface
- Fetch and render posts dynamically

## Styling Reference

The blog posts inherit styles from `../stylesheets/styles.css`. Key CSS classes available:

- `.article-content` - Main content wrapper
- `.post-title` - Article title
- `.post-meta` - Metadata (date, read time, tags)
- `.callout` - Highlighted info box
- Theme variables:
  - `var(--text-primary)` - Main text color
  - `var(--accent-primary)` - Link/accent color
  - `var(--bg-card)` - Card background

## Tips for Better Blog Posts

1. **Use semantic HTML**: Use `<h2>` for sections, `<h3>` for subsections
2. **Add metadata**: Include read time estimate and topic tags
3. **Include code blocks**: Use `<pre><code>` for syntax-highlighted code
4. **Link back**: Always include a back link to the homepage
5. **Mobile-friendly**: Test posts on mobile devices
6. **Accessibility**: Use descriptive alt text for images, proper heading hierarchy

---

Happy blogging! 📝

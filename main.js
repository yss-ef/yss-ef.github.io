/* =========================================
   PORTFOLIO — Youssef Fellah
   main.js
   ========================================= */

/* =========================================
   CUSTOM CURSOR
   ========================================= */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

function animateCursor() {
  cursor.style.left = mx + 'px';
  cursor.style.top = my + 'px';
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx + 'px';
  ring.style.top = ry + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .skill-cat, .project-card, .cert-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(2)';
    ring.style.width = '56px';
    ring.style.height = '56px';
    ring.style.borderColor = 'rgba(124,92,252,0.6)';
  });
  el.addEventListener('mouseleave', () => {
    cursor.style.transform = 'translate(-50%,-50%) scale(1)';
    ring.style.width = '36px';
    ring.style.height = '36px';
    ring.style.borderColor = 'rgba(124,92,252,0.4)';
  });
});

/* =========================================
   SCROLL REVEAL
   ========================================= */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* =========================================
   PROJECTS — DATA & CONFIG
   ========================================= */

const GITHUB_USER = 'yss-ef';

/* Language → GitHub color map */
const langColors = {
  'JavaScript': '#f1e05a',
  'TypeScript': '#3178c6',
  'Java':       '#b07219',
  'PHP':        '#4F5D95',
  'Python':     '#3572A5',
  'Solidity':   '#AA6746',
  'HTML':       '#e34c26',
  'CSS':        '#563d7c',
  'SCSS':       '#c6538c',
  'Dart':       '#00B4AB',
  'Shell':      '#89e051',
  'Vue':        '#41b883',
  'Kotlin':     '#A97BFF',
};

/*
 * Manually featured projects — add/edit here to showcase
 * projects that are not (yet) public on GitHub.
 */
const manualProjects = [
  {
    name: "Smart Digital Banking System",
    description: "Full-stack banking platform with RESTful API (Spring Boot), layered architecture, JWT/RBAC auth, an AI-powered RAG assistant for customer support, and Angular dashboard with ChartJS visualizations.",
    languages: ["Java", "Angular", "TypeScript", "Python"],
    tags: ["Spring Boot", "JWT", "RAG", "AI", "ChartJS"],
    source: "manual",
    stars: null,
    html_url: null,   // add GitHub URL if available
    homepage: null,   // add live URL if deployed
  },
  {
    name: "Decentralized E-Learning Platform",
    description: "Web 3.0 e-learning platform with Smart Contracts in Solidity deployed on Ethereum, React.js frontend, and Web3.js integration. PFE project at FST Errachidia.",
    languages: ["Solidity", "JavaScript"],
    tags: ["Blockchain", "Web3", "IPFS", "Ethereum"],
    source: "manual",
    stars: null,
    html_url: null,
    homepage: null,
  },
  {
    name: "Dolibarr ERP Custom Modules",
    description: "4 custom modules for the Dolibarr ERP covering Treasury & Tax management. Built with PHP/SQL, with workflow automation, PDF generation, and performance optimization.",
    languages: ["PHP", "SQL"],
    tags: ["ERP", "Dolibarr", "PDF", "Business Logic"],
    source: "manual",
    stars: null,
    html_url: null,
    homepage: null,
  },
];

/* =========================================
   PROJECTS — GITHUB API
   ========================================= */
let allProjects = [];
let activeFilter = 'all';

async function fetchGitHubRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=20`
    );
    if (!res.ok) throw new Error('GitHub API error');
    const repos = await res.json();

    return repos
      .filter(r => !r.fork && r.name !== GITHUB_USER)
      .map(r => ({
        name:        r.name.replace(/-/g, ' ').replace(/_/g, ' '),
        description: r.description || 'No description provided.',
        languages:   r.language ? [r.language] : [],
        stars:       r.stargazers_count,
        forks:       r.forks_count,
        html_url:    r.html_url,
        homepage:    r.homepage || null,
        source:      'github',
        updated:     r.updated_at,
        tags:        [],
      }));
  } catch (e) {
    console.warn('GitHub API unavailable:', e.message);
    return [];
  }
}

async function fetchRepoLanguages(htmlUrl) {
  try {
    const repoName = htmlUrl.replace('https://github.com/', '');
    const res = await fetch(`https://api.github.com/repos/${repoName}/languages`);
    if (!res.ok) return [];
    const langs = await res.json();
    return Object.keys(langs).slice(0, 4);
  } catch {
    return [];
  }
}

/* =========================================
   PROJECTS — RENDER
   ========================================= */
function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');

  const filtered = activeFilter === 'all'
    ? projects
    : projects.filter(p =>
        p.languages.some(l => l.toLowerCase().includes(activeFilter.toLowerCase()))
      );

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="projects-loading" style="grid-column:1/-1">No projects found for this filter.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {
    /* Language badges */
    const langBadges = p.languages.map(l => {
      const color = langColors[l] || '#888';
      return `<span class="lang-badge">
        <span class="lang-dot" style="background:${color};"></span>${l}
      </span>`;
    }).join('');

    /* Source badge */
    const sourceBadge = p.source === 'github'
      ? `<span class="source-badge source-gh">GitHub</span>`
      : `<span class="source-badge source-manual">Featured</span>`;

    /* Links */
    const links = [];
    if (p.html_url) {
      links.push(`
        <a href="${p.html_url}" target="_blank" class="proj-link proj-link-gh">
          <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
              0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
              -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
              .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
              -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27
              .68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
              .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
              0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg> Code
        </a>`);
    }
    if (p.homepage) {
      links.push(`<a href="${p.homepage}" target="_blank" class="proj-link proj-link-live">↗ Live</a>`);
    }

    const starsHtml = p.stars !== null ? `<span class="project-stat">★ ${p.stars}</span>` : '';
    const forksHtml = p.forks       ? `<span class="project-stat">⑂ ${p.forks}</span>`  : '';

    return `
      <div class="project-card" data-langs="${p.languages.join(',')}">
        <div class="project-header">
          <div class="project-name">${p.name}</div>
          ${sourceBadge}
        </div>
        <div class="project-meta">${starsHtml}${forksHtml}</div>
        <div class="project-desc">${p.description}</div>
        <div class="project-langs">${langBadges}</div>
        <div class="project-links">${links.join('')}</div>
      </div>`;
  }).join('');
}

/* =========================================
   PROJECTS — LOAD
   ========================================= */
async function loadProjects() {
  const ghProjects = await fetchGitHubRepos();

  /* Enrich language data for top repos */
  const withLangs = await Promise.all(
    ghProjects.slice(0, 8).map(async p => {
      if (p.html_url && p.languages.length <= 1) {
        const langs = await fetchRepoLanguages(p.html_url);
        if (langs.length) p.languages = langs;
      }
      return p;
    })
  );

  allProjects = [...manualProjects, ...withLangs];
  renderProjects(allProjects);
}

loadProjects();

/* =========================================
   PROJECTS — FILTER
   ========================================= */
document.getElementById('filterBar').addEventListener('click', e => {
  if (!e.target.classList.contains('filter-btn')) return;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  activeFilter = e.target.dataset.filter;
  renderProjects(allProjects);
});

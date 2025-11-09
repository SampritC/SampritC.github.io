// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').substring(1);
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", "#" + targetId);
    }
  });
});

// Year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Dark mode toggle
const root = document.documentElement;
const toggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  root.setAttribute("data-theme", "dark");
}

if (toggle) {
  toggle.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    if (next === "dark") {
      root.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  });
}

// Load GitHub projects
async function loadProjects() {
  const container = document.getElementById("projects-list");
  if (!container) return;

  try {
    const res = await fetch("https://api.github.com/users/sampritC/repos?per_page=100&sort=updated");
    if (!res.ok) throw new Error("GitHub API error");
    const repos = await res.json();

    // Filter:
    // - not forks
    // - has topic "portfolio" (you can set this in repo settings)
    const featured = repos
      .filter(r => !r.fork)
      .filter(r => (r.topics || []).includes("portfolio"))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    // If no repos tagged, fall back to first few non-forks
    const list = (featured.length > 0 ? featured : repos.filter(r => !r.fork)).slice(0, 12);

    container.innerHTML = "";

    list.forEach(repo => {
      const card = document.createElement("div");
      card.className = "project-card";

      const name = document.createElement("div");
      name.className = "project-name";
      name.textContent = repo.name;

      const desc = document.createElement("div");
      desc.className = "project-desc";
      desc.textContent = repo.description || "No description provided.";

      const meta = document.createElement("div");
      meta.className = "project-meta";
      const lang = document.createElement("span");
      lang.textContent = repo.language ? repo.language : "";
      const stars = document.createElement("span");
      stars.textContent = repo.stargazers_count
        ? `★ ${repo.stargazers_count}`
        : "";

      meta.appendChild(lang);
      meta.appendChild(stars);

      const link = document.createElement("a");
      link.className = "project-link";
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "View on GitHub";

      card.appendChild(name);
      card.appendChild(desc);
      card.appendChild(meta);
      card.appendChild(link);
      container.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='project-desc'>Unable to load projects from GitHub right now.</p>";
  }
}

loadProjects();

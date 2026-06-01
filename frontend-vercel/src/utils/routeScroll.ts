const scrollToHashTarget = (hash: string, behavior: ScrollBehavior = "smooth") => {
  const targetId = decodeURIComponent(hash.replace(/^#/, ""));
  if (!targetId) {
    return false;
  }

  const target = document.getElementById(targetId);
  if (!target) {
    return false;
  }

  target.scrollIntoView({ behavior, block: "start" });
  return true;
};

export const handleInternalScroll = (href: string, behavior: ScrollBehavior = "smooth") => {
  const url = new URL(href, window.location.origin);
  const currentPath = `${window.location.pathname}${window.location.search}`;
  const targetPath = `${url.pathname}${url.search}`;

  if (currentPath !== targetPath) {
    return false;
  }

  if (url.hash) {
    return scrollToHashTarget(url.hash, behavior);
  }

  window.scrollTo({ top: 0, behavior });
  return true;
};

export const scrollRouteLocation = (hash: string) => {
  let attempts = 0;

  const run = () => {
    if (hash) {
      const found = scrollToHashTarget(hash, attempts === 0 ? "auto" : "smooth");
      if (!found && attempts < 10) {
        attempts += 1;
        window.setTimeout(run, 50);
        return;
      }
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  run();
};

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (attempt === retries) throw error;
      console.warn(`Retrying fetch... (${attempt}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

module.exports = {
  fetchWithRetry
}

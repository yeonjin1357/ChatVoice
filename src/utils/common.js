export const scrollToElement = (selector, behavior = "smooth", block = "center") => {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior, block });
  }
};

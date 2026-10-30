export function scrollToPageTop(behavior: ScrollBehavior = "auto") {
  const scroller = document.querySelector<HTMLElement>("[data-generated-space-root]");
  if (scroller) {
    scroller.scrollTo({ top: 0, behavior });
    if (behavior === "auto") scroller.scrollTop = 0;
  }
  window.scrollTo({ top: 0, behavior });
  if (behavior === "auto") {
    document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }
}


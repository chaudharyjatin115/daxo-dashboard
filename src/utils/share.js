function canShareFiles() {
  return (
    navigator.canShare &&
    navigator.canShare({ files: [] }) &&
    typeof navigator.share === "function"
  );
}
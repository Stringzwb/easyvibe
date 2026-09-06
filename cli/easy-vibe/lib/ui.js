const COLORS = {
  cyan: 36,
  blue: 34,
  magenta: 35,
  green: 32,
  red: 31,
  yellow: 33,
  gray: 90,
  white: 97
};

export function createUi(output) {
  const colorEnabled = Boolean(output?.isTTY) && !process.env.NO_COLOR;
  const paint = (color, value, bold = false) => {
    if (!colorEnabled) return value;
    const prefix = bold ? `\u001b[1;${COLORS[color]}m` : `\u001b[${COLORS[color]}m`;
    return `${prefix}${value}\u001b[0m`;
  };
  const write = (value = "") => output.write(`${value}\n`);

  return {
    banner() {
      write();
      write(`${paint("cyan", "◆", true)} ${paint("white", "EASY VIBE", true)}`);
      write(paint("gray", "  PROJECT WORKSPACE  ·  SAFE CONTEXT  ·  READ-ONLY FACTS"));
      write();
    },
    section(title, subtitle) {
      write(paint("cyan", `╭─ ${title}`, true));
      if (subtitle) write(paint("gray", `│  ${subtitle}`));
    },
    item(label, value) {
      write(`${paint("gray", "│")}  ${paint("white", `${label}:`, true)} ${value}`);
    },
    close(message) {
      write(paint("cyan", `╰─ ${message}`));
    },
    success(message) {
      write(`${paint("green", "◆", true)} ${paint("green", message, true)}`);
    },
    warning(message) {
      write(`${paint("yellow", "▲", true)} ${paint("yellow", message)}`);
    },
    error(message) {
      write(`${paint("red", "×", true)} ${paint("red", message, true)}`);
    },
    prompt(message) {
      return `${paint("magenta", "◆", true)} ${paint("white", message, true)} `;
    },
    paint,
    write
  };
}

export function renderBanner({ color = false } = {}) {
  const output = { isTTY: color, write() {} };
  const parts = [];
  output.write = (value) => parts.push(String(value));
  createUi(output).banner();
  return parts.join("");
}

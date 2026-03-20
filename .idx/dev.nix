# Google Antigravity / Project IDX — Ortam Yapılandırması
# Oogmatik EdTech Platformu: React 18 + TypeScript + Vite + Node.js 20
{ pkgs, ... }: {
  channel = "stable-24.05";

  packages = [
    pkgs.nodejs_20
  ];

  idx.extensions = [
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
    "bradlc.vscode-tailwindcss"
    "ms-vscode.vscode-typescript-next"
    "formulahendry.auto-rename-tag"
  ];

  idx.previews = {
    enable = true;
    previews = {
      web = {
        command = [
          "npm" "run" "dev" "--"
          "--port" "$PORT"
          "--host" "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}

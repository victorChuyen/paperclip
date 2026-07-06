# Kiến Trúc Dự Án Paperclip (Architecture Tree)

Tài liệu này cung cấp cái nhìn tổng quan về cấu trúc thư mục của dự án Paperclip. Tài liệu giúp các developer mới tiếp cận có thể dễ dàng định hướng, nắm bắt luồng dữ liệu và tìm kiếm code chuẩn xác.

## Sơ đồ thư mục (Root)

```text
paperclip/
├── .github/                    # CI/CD Workflows (Github Actions) cho việc build, test và release
├── cli/                        # Giao diện dòng lệnh (Command-line interface) cho Paperclip
├── doc/                        # Tài liệu dự án (Product specs, implementation specs, guides)
├── docker/                     # Cấu hình deploy (Docker Compose, ECS, VPS env)
├── Dockerfile                  # Định nghĩa Docker image chính của hệ thống Paperclip
├── packages/                   # Monorepo packages (Chứa các thư viện dùng chung)
│   ├── adapter-utils/          # Các tiện ích (utilities) dùng chung cho các adapter
│   ├── adapters/               # Các implementation của agent adapter (Claude, Codex, Cursor,...)
│   ├── db/                     # Drizzle schema, database migrations, DB clients
│   ├── mcp-server/             # Model Context Protocol (MCP) server implementation
│   ├── plugins/                # Hệ thống plugin packages (mở rộng tính năng cho Paperclip)
│   └── shared/                 # Các constants, validator, types dùng chung cho cả frontend và backend
├── scripts/                    # Script tiện ích cho dev (Ví dụ: dev-runner.ts, build scripts)
├── server/                     # Backend API (Express REST API & orchestration services)
│   └── src/
│       ├── adapters/           # Quản lý và load các agent adapter
│       ├── auth/               # Xác thực, phân quyền (Authentication/Authorization)
│       ├── middleware/         # Express middlewares
│       ├── realtime/           # Xử lý Websocket/SSE cho các cập nhật thời gian thực
│       ├── routes/             # Định nghĩa các REST API endpoints
│       ├── secrets/            # Quản lý bảo mật, mã hóa tokens
│       ├── services/           # Business logic (VD: orchestrator, heartbeat.ts, agent lifecycle)
│       └── storage/            # Quản lý lưu trữ file, attachments
└── ui/                         # Frontend Web App (React + Vite)
    └── src/
        ├── adapters/           # Cấu hình UI cho các adapter cụ thể
        ├── api/                # Các API clients để gọi về backend server
        ├── components/         # Reusable React components (Button, Modal, Cards,...)
        ├── context/            # React Context providers (Quản lý State toàn cục)
        ├── hooks/              # Custom React hooks
        ├── lib/                # Frontend utils, helper functions
        ├── pages/              # Các trang chính của UI (Dashboard, Run Detail, Agent Config,...)
        └── plugins/            # UI components cho hệ thống external plugin
```

## Giải thích chi tiết các module chính

### 1. `server/` (Backend Control Plane)
Đóng vai trò là "bộ não" điều phối (orchestration) của hệ thống Paperclip.
- **Nhiệm vụ**: Cung cấp các API REST cho giao diện, quản lý vòng đời của Agent Run, theo dõi ngân sách (budget), quản lý file/storage và đồng bộ logs/trạng thái bằng realtime (Websocket/SSE).
- **Công nghệ cốt lõi**: Node.js, Express, TypeScript.
- **Luồng thực thi tiêu biểu (Execution flow)**: Một yêu cầu tạo Run mới sẽ đi qua `routes/` -> xác thực ở `auth/` -> logic khởi tạo ở `services/heartbeat.ts` -> Nạp Adapter tương ứng thông qua `adapters/plugin-loader.ts` để giao tiếp với AI model.

### 2. `ui/` (Board UI)
Giao diện quản trị viên (Control Board) để tương tác trực quan với Paperclip.
- **Nhiệm vụ**: Cho phép admin quản lý danh sách Agent, giám sát tiến trình của các Run, kiểm tra lịch sử logs/terminal của agent, cấu hình project và duyệt các tác vụ (approval gates).
- **Công nghệ cốt lõi**: React, Vite, TypeScript.
- **Sự gắn kết**: Gọi trực tiếp các API từ thư mục `api/`. Sử dụng các schema từ `packages/shared/` để ép kiểu dữ liệu chặt chẽ.

### 3. `packages/db/` (Database Layer)
Tầng giao tiếp dữ liệu được cô lập để quản lý schema tập trung.
- **Nhiệm vụ**: Định nghĩa Drizzle Schema cho các bảng (companies, agents, runs, tasks,...), tự động sinh mã migrations, và khởi tạo các Database Clients.
- **Công nghệ cốt lõi**: Drizzle ORM, PostgreSQL (sử dụng PGLite tự động nhúng cho môi trường local dev).
- **Quy tắc làm việc**: Mọi thay đổi về mô hình cơ sở dữ liệu đều BẮT BUỘC thực hiện ở file `packages/db/src/schema/*.ts`. Sau đó chạy `pnpm db:generate`.

### 4. `packages/shared/` (Contracts)
Hợp đồng giao tiếp (Contracts) giữa hệ thống.
- **Nhiệm vụ**: Chứa các hằng số, Zod schemas, TypeScript types, và khai báo API endpoints dùng chung cho TOÀN BỘ cả Frontend (ui) lẫn Backend (server).
- **Quy tắc làm việc**: Cấm không được đưa business logic hoặc side-effect vào đây. Module này đóng vai trò sống còn trong việc giữ cho dữ liệu gửi qua lại giữa Server và UI không bị sai lệch kiểu.

### 5. `packages/adapters/` và Hệ thống External Plugins
Kiến trúc cắm rút (Pluggable Architecture) của hệ thống Agent.
- **Nhiệm vụ**: Cầu nối để Paperclip điều khiển các Agent/LLM model khác nhau (VD: Hermes, Claude, Droid).
- **Kiến trúc**: Paperclip hỗ trợ External Adapter Plugin. Một adapter có thể không nằm trong repository này mà được nạp động từ bên ngoài (thông qua file cấu hình `~/.paperclip/adapter-plugins.json`). Hệ thống load plugin nằm ở `server/src/adapters/plugin-loader.ts`.

### 6. Kiến trúc Deployment & CI/CD (`docker/`, `.github/`, `Dockerfile`)
Toàn bộ mã nguồn và cấu hình phục vụ việc vận hành, triển khai (deploy) và tích hợp liên tục.
- **Nhiệm vụ**: Đóng gói hệ thống (Containerization), chuẩn bị môi trường chạy thật cho VPS, AWS ECS, hoặc Docker Compose, và tự động hóa các pipeline kiểm thử mã nguồn.
- **Thành phần chính**:
  - `Dockerfile` (Gốc): Script đóng gói toàn bộ ứng dụng Monorepo (gồm cả UI và Server) vào một Container image duy nhất để dễ dàng deploy.
  - `docker/`: Chứa các kịch bản triển khai như `docker-compose.yml`, các file cấu hình môi trường mẫu cho VPS (`vps.env.example`), cấu hình cho AWS ECS (`ecs-task-definition.json`).
  - `.github/workflows/`: Các kịch bản CI/CD chạy trên Github Actions để tự động hóa việc chạy test, lint, và build mỗi khi có Pull Request hoặc Release version mới.
